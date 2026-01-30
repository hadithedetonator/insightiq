const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createWorkspace = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: 'Workspace name must be at least 2 characters' });
    }

    try {
        const workspace = await prisma.workspace.create({
            data: {
                name: name.trim(),
                slug: `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
                users: {
                    create: {
                        userId,
                        role: 'WORKSPACE_OWNER',
                        status: 'ACCEPTED'
                    }
                }
            },
            include: { users: true }
        });

        res.status(201).json(workspace);
    } catch (error) {
        res.status(500).json({ message: 'Error creating workspace', error: error.message });
    }
};

const getUserWorkspaces = async (req, res) => {
    const userId = req.user.id;
    try {
        // Platform Admins can see all workspaces for monitoring
        if (req.user.role === 'ADMIN') {
            const allWorkspaces = await prisma.workspace.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return res.json(allWorkspaces.map(w => ({ ...w, role: 'ADMIN' })));
        }

        const memberships = await prisma.workspaceUser.findMany({
            where: { userId, status: 'ACCEPTED' },
            include: { workspace: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(memberships.map(m => ({ ...m.workspace, role: m.role })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching workspaces', error: error.message });
    }
};

const getAllWorkspaces = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const workspaces = await prisma.workspace.findMany({
            include: {
                _count: {
                    select: { users: true, datasets: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(workspaces);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all workspaces', error: error.message });
    }
};

const discoverWorkspaces = async (req, res) => {
    const userId = req.user.id;
    const { search } = req.query;

    try {
        const where = search ? {
            name: { contains: search, mode: 'insensitive' }
        } : {};

        const workspaces = await prisma.workspace.findMany({
            where,
            include: {
                _count: { select: { users: true, datasets: true } },
                users: {
                    where: { userId },
                    select: { status: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // Format response with membership status
        const formatted = workspaces.map(ws => ({
            id: ws.id,
            name: ws.name,
            slug: ws.slug,
            memberCount: ws._count.users,
            datasetCount: ws._count.datasets,
            membershipStatus: ws.users[0]?.status || null,
            membershipRole: ws.users[0]?.role || null
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Error discovering workspaces', error: error.message });
    }
};

const requestJoinWorkspace = async (req, res) => {
    const { workspaceId } = req.body;
    const userId = req.user.id;

    try {
        // Check if already a member
        const existing = await prisma.workspaceUser.findUnique({
            where: { userId_workspaceId: { userId, workspaceId } }
        });

        if (existing) {
            return res.status(400).json({
                message: existing.status === 'PENDING'
                    ? 'Join request already pending'
                    : 'Already a member of this workspace'
            });
        }

        const request = await prisma.workspaceUser.create({
            data: {
                userId,
                workspaceId,
                role: 'VIEWER',
                status: 'PENDING'
            }
        });

        res.status(201).json({ message: 'Join request sent', request });
    } catch (error) {
        res.status(500).json({ message: 'Error sending join request', error: error.message });
    }
};

const inviteUser = async (req, res) => {
    const { workspaceId, email, role } = req.body;
    const invitingUser = req.user;

    try {
        const membership = await prisma.workspaceUser.findUnique({
            where: {
                userId_workspaceId: { userId: invitingUser.id, workspaceId }
            }
        });

        if (!membership || (membership.role !== 'WORKSPACE_OWNER' && invitingUser.role !== 'ADMIN')) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        const userToInvite = await prisma.user.findUnique({ where: { email } });
        if (!userToInvite) return res.status(404).json({ message: 'User not found' });

        const existing = await prisma.workspaceUser.findUnique({
            where: { userId_workspaceId: { userId: userToInvite.id, workspaceId } }
        });
        if (existing) return res.status(400).json({ message: 'User already in workspace' });

        const invitation = await prisma.workspaceUser.create({
            data: {
                userId: userToInvite.id,
                workspaceId,
                role: role || 'VIEWER',
                status: 'PENDING'
            }
        });

        res.status(201).json({ message: 'Invitation sent', invitation });
    } catch (error) {
        res.status(500).json({ message: 'Error sending invitation', error: error.message });
    }
};

const getUserInvitations = async (req, res) => {
    const userId = req.user.id;
    try {
        const invitations = await prisma.workspaceUser.findMany({
            where: { userId, status: 'PENDING' },
            include: { workspace: true }
        });
        res.json(invitations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invitations', error: error.message });
    }
};

const getPendingRequests = async (req, res) => {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    try {
        // Check if user is owner/admin
        const membership = await prisma.workspaceUser.findUnique({
            where: { userId_workspaceId: { userId, workspaceId } }
        });

        if (!membership || (membership.role !== 'WORKSPACE_OWNER' && req.user.role !== 'ADMIN')) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        const requests = await prisma.workspaceUser.findMany({
            where: { workspaceId, status: 'PENDING' },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests', error: error.message });
    }
};

const acceptInvitation = async (req, res) => {
    const { workspaceId } = req.body;
    const userId = req.user.id;

    try {
        const invitation = await prisma.workspaceUser.update({
            where: { userId_workspaceId: { userId, workspaceId } },
            data: { status: 'ACCEPTED' }
        });
        res.json({ message: 'Invitation accepted', invitation });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting invitation', error: error.message });
    }
};

const approveJoinRequest = async (req, res) => {
    const { workspaceId, userId: requestUserId } = req.body;
    const approvingUserId = req.user.id;

    try {
        // Check if approving user is owner/admin
        const membership = await prisma.workspaceUser.findUnique({
            where: { userId_workspaceId: { userId: approvingUserId, workspaceId } }
        });

        if (!membership || (membership.role !== 'WORKSPACE_OWNER' && req.user.role !== 'ADMIN')) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        const approved = await prisma.workspaceUser.update({
            where: { userId_workspaceId: { userId: requestUserId, workspaceId } },
            data: { status: 'ACCEPTED' }
        });

        res.json({ message: 'Join request approved', approved });
    } catch (error) {
        res.status(500).json({ message: 'Error approving request', error: error.message });
    }
};

const rejectJoinRequest = async (req, res) => {
    const { workspaceId, userId: requestUserId } = req.body;
    const rejectingUserId = req.user.id;

    try {
        // Check if rejecting user is owner/admin
        const membership = await prisma.workspaceUser.findUnique({
            where: { userId_workspaceId: { userId: rejectingUserId, workspaceId } }
        });

        if (!membership || (membership.role !== 'WORKSPACE_OWNER' && req.user.role !== 'ADMIN')) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        await prisma.workspaceUser.delete({
            where: { userId_workspaceId: { userId: requestUserId, workspaceId } }
        });

        res.json({ message: 'Join request rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting request', error: error.message });
    }
};

const getWorkspaceMembers = async (req, res) => {
    const { workspaceId } = req.params;
    try {
        const members = await prisma.workspaceUser.findMany({
            where: { workspaceId },
            include: { user: { select: { id: true, name: true, email: true } } }
        });
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching members', error: error.message });
    }
};

const getGlobalPendingRequests = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const requests = await prisma.workspaceUser.findMany({
            where: { status: 'PENDING' },
            include: {
                user: { select: { id: true, name: true, email: true } },
                workspace: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching global requests', error: error.message });
    }
};

const deleteWorkspace = async (req, res) => {
    const { id } = req.params;
    try {
        if (req.user.role !== 'ADMIN') {
            // Check if owner
            const membership = await prisma.workspaceUser.findUnique({
                where: { userId_workspaceId: { userId: req.user.id, workspaceId: id } }
            });
            if (!membership || membership.role !== 'WORKSPACE_OWNER') {
                return res.status(403).json({ message: 'Forbidden' });
            }
        }

        await prisma.workspace.delete({ where: { id } });
        res.json({ message: 'Workspace deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting workspace', error: error.message });
    }
};

module.exports = {
    createWorkspace,
    getUserWorkspaces,
    getAllWorkspaces,
    discoverWorkspaces,
    requestJoinWorkspace,
    inviteUser,
    getUserInvitations,
    getPendingRequests,
    getGlobalPendingRequests,
    acceptInvitation,
    approveJoinRequest,
    rejectJoinRequest,
    getWorkspaceMembers,
    deleteWorkspace
};
