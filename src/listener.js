require('dotenv').config();
const express = require('express');
const http = require('http');
const zlib = require('zlib');
const { Server } = require('socket.io');
const { decrypt } = require('./utils/crypto');

const mongoose = require('mongoose');
const TimeSeries = require('./models/TimeSeries');
const { getMinuteStart } = require('./utils/time_helper');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
    }
});

const PASSKEY = process.env.APP_SECRET;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/timeseries')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MOngo connection error:', err));


io.on('connection', async (socket) => {
    logger.info(`Listener | An emitter connected: ${socket.id}`);
    socket.on('data_stream', async (stream) => {
        try {
            let validBatch = [];
            const encryptedMessages = stream.split('|');
            const minuteBucket = getMinuteStart(new Date());


            let successCount = 0;

            encryptedMessages.forEach(msg => {
                try {
                    const decrypted = decrypt(msg, PASSKEY);
                    validBatch.push(decrypted);
                    console.log('Decrypted valid data:', decrypted);
                    successCount++;

                    // Later - Save to MongoDB
                } catch (err) {
                    console.error('Data corrupted or invalid key. Skipping message.');
                }
            });


            if (validBatch.length > 0) {
                try {
                    await TimeSeries.findOneAndUpdate(
                        { timestamp: minuteBucket },
                        {
                            $push: { data_points: { $each: validBatch } },
                            $inc: { count: validBatch.length }
                        },
                        { upsert: true, new: true }
                    );
                    // Broadcast to all connected clients (including the Frontend)
                    io.emit('live_data_update', {
                        timestamp: new Date(),
                        count: validBatch.length,
                        sample: validBatch[0],
                        successRate: (validBatch.length / encryptedMessages.length) * 100
                    });
                    console.log(`Saved ${validBatch.length} points to bucket ${minuteBucket.toISOString()}`);
                } catch (dbErr) {
                    console.error('Database error', dbErr);
                }
            }
            logger.info(`Listener | Successfully processed batch of ${validBatch.length} messages.`);
        } catch (err) {
            logger.error(`Listener | Processing Failure: ${err.message}`, {
                socketId: socket.id,
                stack: err.stack
            });
        }
    });
    socket.on('disconnect', () => {
        logger.warn(`Listener | Emitter disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
let isShuttingDown = false;

server.listen(PORT, () => {
    console.log(`Listener service running on port ${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.warn(`Listener | Received ${signal}. Starting graceful shutdown...`);
    
    // Close server
    server.close(async () => {
        logger.info('Listener | Server closed.');
        
        // Disconnect MongoDB
        try {
            await mongoose.connection.close();
            logger.info('Listener | MongoDB connection closed.');
        } catch (err) {
            logger.error('Listener | Error closing MongoDB:', err);
        }
        
        process.exit(0);
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
        logger.error('Listener | Forced shutdown after 10 seconds.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled exceptions and rejections
process.on('uncaughtException', (err) => {
    logger.error('Listener | Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Listener | Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});