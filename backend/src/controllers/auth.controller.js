const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const register = async (req, res) => {
    const { email, password, name, role } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'VIEWER'
            }
        });

        // Create a default workspace for the user
        const workspace = await prisma.workspace.create({
            data: {
                name: `${name || 'My'} Workspace`,
                slug: `workspace-${Date.now()}`,
                users: {
                    create: { userId: user.id, role: 'WORKSPACE_OWNER' }
                }
            }
        });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role }, workspace });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { workspaces: { include: { workspace: true } } }
        });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role }, workspaces: user.workspaces });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { register, login };
