require('dotenv').config();
const io = require('socket.io-client');
const { prepareStream } = require('./emitter');

const socket = io(process.env.LISTENER_URL || 'http://localhost:3000');
const PASSKEY = process.env.APP_SECRET;

socket.on('connect', () => {
    console.log('Connected to Listener Service!');

    // Every 10 seconds, send the stream
    setInterval(() => {
        const stream = prepareStream(PASSKEY);
        console.log(`Sending stream with ${stream.split('|').length} messages...`);
        socket.emit('data_stream', stream);
    }, 10000);
});

socket.on('disconnect', () => {
    console.log('Lost connection to Listener.');
});