const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ECS Health Check Endpoint
app.get('/ping', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/datasets', require('./routes/dataset.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/workspaces', require('./routes/workspace.routes'));
app.use('/api/users', require('./routes/user.routes'));

app.listen(PORT, () => {
    console.log(`InsightIQ Backend running on port ${PORT}`);
});

module.exports = app;
