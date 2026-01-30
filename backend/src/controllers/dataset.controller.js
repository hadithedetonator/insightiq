const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { runIngestionPipeline } = require('../services/pipeline.service');

const createDataset = async (req, res) => {
    const { name, description, workspaceId, data } = req.body;
    try {
        const dataset = await prisma.dataset.create({
            data: {
                name,
                description,
                workspaceId,
            }
        });

        // Fire and forget pipeline (asynchronous)
        runIngestionPipeline(dataset.id, data, req.user.id);

        res.status(202).json({
            message: 'Dataset creation initiated and pipeline queued',
            datasetId: dataset.id
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating dataset', error: error.message });
    }
};

const getDatasets = async (req, res) => {
    const { workspaceId } = req.query;
    try {
        const datasets = await prisma.dataset.findMany({
            where: { workspaceId },
            include: {
                aiRequests: { orderBy: { createdAt: 'desc' }, take: 1 },
                logs: { orderBy: { createdAt: 'desc' }, take: 5 }
            }
        });
        res.json(datasets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching datasets', error: error.message });
    }
};

const getDatasetDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const dataset = await prisma.dataset.findUnique({
            where: { id },
            include: {
                records: { take: 100 },
                aiRequests: true,
                logs: true
            }
        });
        if (!dataset) return res.status(404).json({ message: 'Dataset not found' });
        res.json(dataset);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dataset details', error: error.message });
    }
}

module.exports = { createDataset, getDatasets, getDatasetDetails };
