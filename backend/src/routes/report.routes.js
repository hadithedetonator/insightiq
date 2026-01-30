const express = require('express');
const { exportCSV, exportPDF } = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(authenticate);

router.get('/csv/:datasetId', exportCSV);
router.get('/pdf/:datasetId', exportPDF);

module.exports = router;
