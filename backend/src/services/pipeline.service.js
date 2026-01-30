const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { analyzeData } = require('./ai.service');

const runIngestionPipeline = async (datasetId, rawData, userId) => {
    const log = async (event, status, details = null) => {
        await prisma.pipelineLog.create({
            data: { datasetId, event, status, details }
        });
        await prisma.dataset.update({
            where: { id: datasetId },
            data: { status }
        });
    };

    try {
        // 1. Ingestion
        await log('Starting Data Ingestion', 'INGESTING');
        const records = rawData.map(item => ({
            datasetId,
            data: item
        }));
        await prisma.record.createMany({ data: records });

        // 2. Validation
        await log('Validating Data Integrity', 'VALIDATING');
        if (rawData.length === 0) throw new Error('Empty dataset received');
        // Simple validation: check if all items are objects
        if (!rawData.every(item => typeof item === 'object')) {
            throw new Error('Invalid data format: expected array of objects');
        }

        // 3. AI Analysis
        await log('Running AI Insights Engine', 'ANALYZING');
        const aiResult = await analyzeData(rawData, "Provide a summary and key highlights of this dataset.");

        await prisma.aIRequest.create({
            data: {
                userId,
                datasetId,
                prompt: "Dataset Summary",
                response: aiResult,
                tokenUsage: aiResult.tokenUsage || 0,
                executionTime: aiResult.executionTime || 0
            }
        });

        // 4. Completion
        await log('Pipeline Execution Successful', 'COMPLETED');

    } catch (error) {
        console.error('Pipeline Error:', error);
        await log('Pipeline Failed', 'FAILED', error.message);
    }
};

module.exports = { runIngestionPipeline };
