const fs = require('fs');
const path = require('path');
const winston = require('winston');

// logs are stored locally in the /logs folder 
const logDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // every log entry 
    new winston.transports.File({ filename: path.join(logDir, 'app.log') }),
    // Errors only
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    // print to  terminal
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    })
  ]
});

module.exports = logger;