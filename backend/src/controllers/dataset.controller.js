const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { runIngestionPipeline } = require('../services/pipeline.service');
const { extractTextFromFile } = require('../services/extraction.service');

const createDataset = async (req, res) => {
    const { name, description, workspaceId } = req.body;
    let data;

    try {
        if (req.file) {
            data = await extractTextFromFile(req.file);
        } else if (req.body.data) {
            // Handle pasted JSON
            try {
                data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
            } catch (e) {
                // Return as text if not valid JSON
                data = req.body.data;
            }
        } else {
            return res.status(400).json({ message: 'No data provided. Upload a file or provide JSON.' });
        }

        const dataset = await prisma.dataset.create({
            data: {
                name,
                description,
                workspaceId,
                status: 'QUEUED' // Explicitly set queued
            }
        });

        // Fire and forget pipeline (asynchronous)
        runIngestionPipeline(dataset.id, data, req.user.id);

        res.status(202).json({
            message: 'Dataset processing started',
            datasetId: dataset.id
        });
    } catch (error) {
        console.error('Dataset creation error:', error);
        res.status(500).json({ message: 'Error processing dataset', error: error.message });
    }
};

const getDatasets = async (req, res) => {
    const { workspaceId } = req.query;
    try {
        // Enforce workspace isolation
        const membership = await prisma.workspaceUser.findUnique({
            where: { userId_workspaceId: { userId: req.user.id, workspaceId } }
        });

        if (!membership && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access to this workspace is denied' });
        }

        const datasets = await prisma.dataset.findMany({
            where: { workspaceId },
            include: {
                _count: { select: { records: true } },
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
