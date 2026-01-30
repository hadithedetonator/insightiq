const express = require('express');
const { createDataset, getDatasets, getDatasetDetails } = require('../controllers/dataset.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(authenticate);

router.post('/', createDataset);
router.get('/', getDatasets);
router.get('/:id', getDatasetDetails);

module.exports = router;
