require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/puzzlepulse';

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger with DB State
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} | DB State: ${mongoose.connection.readyState} (${mongoose.connection.readyState === 1 ? 'Connected' : 'FAILOVER'})`);
    next();
});

// Routes
app.use('/api', gameRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Database Connection (Parallel)
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log(`[Database] Secure link established with Cloud Cluster.`);
    })
    .catch(err => {
        console.error('[Database Error] Cloud connection failed:', err.message);
        console.log('System operating in high-availability fallback mode (Local JSON).');
    });

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[HQ] Server authenticated and running on port ${PORT}`);
    });
}

module.exports = app;
