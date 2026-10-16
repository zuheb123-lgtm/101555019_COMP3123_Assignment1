const express = require('express');
const helmet = require('helmet');

const requestLogger = require('./middleware/requestLogger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Security headers
app.use(helmet());

// Log every request
app.use(requestLogger);

// Parse JSON bodies; wiht a of max 10kb to block oversized payloads
app.use(express.json({ limit: '10kb' }));

// Health check
app.use('/health', healthRoutes);

// Unknown routes -> 404, then centralized error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;