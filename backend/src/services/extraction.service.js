const fs = require('fs');
// Try to import pdf-parse, handle absence gracefully
let pdfParse;
try {
    pdfParse = require('pdf-parse');
} catch (e) {
    console.warn('pdf-parse not found, PDF extraction will return mock data');
}

const extractTextFromFile = async (file) => {
    if (!file) throw new Error('No file provided');

    const mimeType = file.mimetype;

    if (mimeType === 'application/json') {
        const content = file.buffer.toString('utf8');
        return JSON.parse(content);
    }

    if (mimeType === 'text/csv' || mimeType === 'text/plain') {
        return file.buffer.toString('utf8');
    }

    if (mimeType === 'application/pdf') {
        if (!pdfParse) {
            return "Mock PDF content: This is a placeholder because pdf-parse is not installed. Valid data extraction requires the library.";
        }
        try {
            const data = await pdfParse(file.buffer);
            return data.text;
        } catch (error) {
            console.error('PDF parsing error:', error);
            throw new Error('Failed to parse PDF');
        }
    }

    throw new Error('Unsupported file type');
};

module.exports = { extractTextFromFile };
