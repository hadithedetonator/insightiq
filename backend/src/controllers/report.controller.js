const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

const exportCSV = async (req, res) => {
    const { datasetId } = req.params;
    try {
        const dataset = await prisma.dataset.findUnique({
            where: { id: datasetId },
            include: { records: true }
        });

        if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

        const rawData = dataset.records.map(r => r.data);
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(rawData);

        res.header('Content-Type', 'text/csv');
        res.attachment(`report-${dataset.name}.csv`);
        return res.send(csv);
    } catch (error) {
        res.status(500).json({ message: 'CSV export failed', error: error.message });
    }
};

const exportPDF = async (req, res) => {
    const { datasetId } = req.params;
    try {
        const dataset = await prisma.dataset.findUnique({
            where: { id: datasetId },
            include: { records: true, aiRequests: { take: 1 } }
        });

        if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

        const doc = new PDFDocument();
        res.header('Content-Type', 'application/pdf');
        res.attachment(`report-${dataset.name}.pdf`);
        doc.pipe(res);

        doc.fontSize(25).text(`InsightIQ Report: ${dataset.name}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Description: ${dataset.description || 'N/A'}`);
        doc.text(`Generated At: ${new Date().toLocaleString()}`);
        doc.moveDown();

        if (dataset.aiRequests.length > 0) {
            doc.fontSize(16).text('AI Insights Summary:');
            const insight = dataset.aiRequests[0].response.insight || dataset.aiRequests[0].response.summary || JSON.stringify(dataset.aiRequests[0].response);
            doc.fontSize(10).text(insight);
            doc.moveDown();
        }

        doc.fontSize(16).text('Data Preview (First 10 records):');
        dataset.records.slice(0, 10).forEach((rec, idx) => {
            doc.fontSize(8).text(`${idx + 1}. ${JSON.stringify(rec.data)}`);
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: 'PDF export failed', error: error.message });
    }
};

module.exports = { exportCSV, exportPDF };
