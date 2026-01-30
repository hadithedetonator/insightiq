const express = require('express');
const multer = require('multer');
const { createDataset, getDatasets, getDatasetDetails } = require('../controllers/dataset.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.post('/', upload.single('file'), createDataset);
router.get('/', getDatasets);
router.get('/:id', getDatasetDetails);

module.exports = router;
