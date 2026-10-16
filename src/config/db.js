const mongoose = require('mongoose');
const logger = require('../utils/logger');

// The database name as per the ass
const DB_NAME = 'comp3123_assignment1';

async function connectDB(uri) {
  await mongoose.connect(uri, { dbName: DB_NAME });
  logger.info('MongoDB connected', { database: mongoose.connection.name });
}

module.exports = connectDB;