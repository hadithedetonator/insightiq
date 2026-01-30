const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getWorkspaceAnalytics = async (req, res) => {
    const { workspaceId } = req.params;
    try {
        const datasetsCount = await prisma.dataset.count({ where: { workspaceId } });
        const totalRecords = await prisma.record.count({
            where: { dataset: { workspaceId } }
        });

        const aiRequests = await prisma.aIRequest.findMany({
            where: { dataset: { workspaceId } },
            select: { tokenUsage: true, createdAt: true, executionTime: true }
        });

        const totalTokens = aiRequests.reduce((sum, req) => sum + req.tokenUsage, 0);
        const avgExecutionTime = aiRequests.length > 0
            ? aiRequests.reduce((sum, req) => sum + req.executionTime, 0) / aiRequests.length
            : 0;

        // Daily trends for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trends = await prisma.aIRequest.groupBy({
            by: ['createdAt'],
            where: {
                dataset: { workspaceId },
                createdAt: { gte: sevenDaysAgo }
            },
            _sum: { tokenUsage: true },
            _count: { id: true }
        });

        res.json({
            summary: {
                datasetsCount,
                totalRecords,
                totalTokens,
                avgExecutionTime
            },
            trends: trends.map(t => ({
                date: t.createdAt.toISOString().split('T')[0],
                tokens: t._sum.tokenUsage,
                requests: t._count.id
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics', error: error.message });
    }
};

module.exports = { getWorkspaceAnalytics };
