require('dotenv').config();
const io = require('socket.io-client');

const logger = require('./utils/logger');
const { prepareStream } = require('./services/emitter.service');

const PASSKEY = process.env.APP_SECRET;

if (!PASSKEY) {
    logger.error('Emitter | APP_SECRET environment variable is not set');
    process.exit(1);
}

const connectionOptions = {
    reconnection: true,
    reconnectionAttempts: parseInt(process.env.RECONNECTION_ATTEMPTS) || 5,
    reconnectionDelay: parseInt(process.env.RECONNECTION_DELAY) || 3000,
    reconnectionDelayMax: parseInt(process.env.RECONNECTION_DELAY_MAX) || 9000,
    timeout: parseInt(process.env.RECONNECTION_TIMEOUT) || 21000
}

const LISTENER_URL = process.env.LISTENER_URL || 'http://localhost:3000';
const socket = io(LISTENER_URL, connectionOptions);
logger.info(`Emitter | Initializing connection to listener at ${LISTENER_URL}`);

let emitInterval = null;
let isShuttingDown = false;

socket.on('connect', () => {
    logger.info(`Emitter | Connected to Listener Service`);

    emitInterval = setInterval(() => {
        try {
            const stream = prepareStream(PASSKEY);
            if (stream) {
                logger.info(`Emitter | Sending stream with ${stream.split('|').length} messages...`);
                socket.emit('data_stream', stream);
            }
        } catch (err) {
            logger.error('Emitter | Error preparing stream:', err);
        }
    }, 10000);
});

socket.on('reconnect_attempt', (attempt) => {
    logger.info(`Emitter | Reconnection attempt: ${attempt}`);
});

socket.on('reconnect_failed', () => {
    logger.error(`Emitter | Max reconnection attempts reached.`);
    gracefulShutdown('reconnect_failed');
});

socket.on('error', (err) => {
    logger.error('Emitter | Socket error:', err);
});

socket.on('disconnect', () => {
    logger.warn(`Emitter | Lost connection to Listener...`);
    if (emitInterval) {
        clearInterval(emitInterval);
    }
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.warn(`Emitter | Received ${signal}. Starting graceful shutdown...`);
    
    if (emitInterval) clearInterval(emitInterval);
    socket.disconnect();
    
    setTimeout(() => process.exit(0), 2000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
    logger.error('Emitter | Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Emitter | Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});