const mongoose = require('mongoose');

const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

// GET /health-shows whether the API acc  is running
exports.getHealth = (req, res) => {
  const dbStatus = DB_STATES[mongoose.connection.readyState] || 'unknown';
  const healthy = dbStatus === 'connected';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    service: 'COMP3123 Assignment 1 - Employee Management API',
    uptime_seconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      name: mongoose.connection.name || null
    }
  });
};