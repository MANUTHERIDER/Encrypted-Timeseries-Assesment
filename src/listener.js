require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { decrypt } = require('./utils/crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PASSKEY = process.env.APP_SECRET;

io.on('connection', (socket) => {
    console.log('An emitter connected:', socket.id);

    socket.on('data_stream', (stream) => {
        const encryptedMessages = stream.split('|');
        let successCount = 0;

        encryptedMessages.forEach(msg => {
            try {
                const decrypted = decrypt(msg, PASSKEY);
                console.log('Decrypted valid data:', decrypted);
                successCount++;
                
                // Later - Save to MongoDB
            } catch (err) {
                console.error('Data corrupted or invalid key. Skipping message.');
            }
        });

        console.log(`Received ${encryptedMessages.length} messages. Success: ${successCount}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Listener service running on port ${PORT}`);
});