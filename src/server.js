// Load and check environment variables first
const config = require('./config/env');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

async function startServer() {
  try {
    await connectDB(config.mongoUri);

    app.listen(config.port, () => {
      logger.info(`Server started on port ${config.port}`, { environment: config.nodeEnv });
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

startServer();