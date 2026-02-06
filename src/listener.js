require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { decrypt } = require('./utils/crypto');

const mongoose = require('mongoose');
const TimeSeries = require('./models/TimeSeries');
const { getMinuteStart } = require('./utils/time_helper');
const { deprecate } = require('util');
const { timeStamp } = require('console');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PASSKEY = process.env.APP_SECRET;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/timeseries')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MOngo connection error:', err));


io.on('connection',async (socket) => {
    let validBatch = [];
    console.log('An emitter connected:', socket.id);
    socket.on('data_stream', async (stream) => {
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
                console.log(`Saved ${validBatch.length} points to bucket ${minuteBucket.toISOString()}`);
            } catch (dbErr) {
                console.error('Database error', dbErr);
            }
        }
        console.log(`Received ${encryptedMessages.length} messages. Success: ${successCount}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Listener service running on port ${PORT}`);
});