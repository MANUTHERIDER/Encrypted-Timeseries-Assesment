const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logger = winston.createLogger({
    level:'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports:[
        new winston.transports.File({
            filename: path.join(__dirname,'../../logs/error.log'),
            level: 'error',
            maxsize: 5*1024*1024,
            maxFiles:5
        }),
        new winston.transports.File({
            filename: path.join(__dirname,'../../logs/combined.log'),
            maxsize: 10*1024*1024,
            maxFiles:5
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

module.exports = logger;