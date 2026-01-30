const express = require('express');
const { getWorkspaceAnalytics } = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(authenticate);

router.get('/:workspaceId', getWorkspaceAnalytics);

module.exports = router;
