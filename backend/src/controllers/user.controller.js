const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const getUsers = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const { search } = req.query;
        const where = search ? {
            OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } }
            ]
        } : {};

        const users = await prisma.user.findMany({
            where,
            include: {
                workspaces: {
                    include: { workspace: true }
                },
                _count: {
                    select: { aiRequests: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const updateUserRole = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { userId, role } = req.body;

    if (!['ADMIN', 'WORKSPACE_OWNER', 'VIEWER'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { role }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
};

const updateWorkspaceRole = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { userId, workspaceId, role } = req.body;

    if (!['WORKSPACE_OWNER', 'VIEWER'].includes(role)) {
        return res.status(400).json({ message: 'Invalid workspace role. Must be WORKSPACE_OWNER or VIEWER' });
    }

    try {
        const workspaceUser = await prisma.workspaceUser.update({
            where: { userId_workspaceId: { userId, workspaceId } },
            data: { role }
        });
        res.json(workspaceUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating workspace role', error: error.message });
    }
};

const removeUserFromWorkspace = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { userId, workspaceId } = req.body;

    try {
        await prisma.workspaceUser.delete({
            where: { userId_workspaceId: { userId, workspaceId } }
        });
        res.json({ message: 'User removed from workspace' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing user from workspace', error: error.message });
    }
};

const addUserToWorkspace = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { userId, workspaceId, role } = req.body;

    try {
        const existing = await prisma.workspaceUser.findUnique({
            where: { userId_workspaceId: { userId, workspaceId } }
        });

        if (existing) {
            return res.status(400).json({ message: 'User already in workspace' });
        }

        const workspaceUser = await prisma.workspaceUser.create({
            data: {
                userId,
                workspaceId,
                role: role || 'VIEWER',
                status: 'ACCEPTED'
            }
        });

        res.status(201).json(workspaceUser);
    } catch (error) {
        res.status(500).json({ message: 'Error adding user to workspace', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { userId } = req.params;

    if (userId === req.user.id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    try {
        await prisma.user.delete({
            where: { id: userId }
        });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

const createUser = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { email, name, password, role } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Email, name, and password are required' });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: role || 'VIEWER'
            }
        });

        res.status(201).json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

module.exports = {
    getUsers,
    updateUserRole,
    updateWorkspaceRole,
    addUserToWorkspace,
    removeUserFromWorkspace,
    deleteUser,
    createUser
};
