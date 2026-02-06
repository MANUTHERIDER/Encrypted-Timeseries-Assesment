const fs = require('fs');
const { encrypt } = require('./utils/crypto');

// Load the data provided in the JD
const rawData = fs.readFileSync('./src/data.json');
const data = JSON.parse(rawData);

const prepareStream = (passkey) => {
    const count = Math.floor(Math.random() * (499 - 49 + 1)) + 49;
    const encryptedMessages = [];

    for (let i = 0; i < count; i++) {
        const originalMessage = {
            name: data.names[Math.floor(Math.random() * data.names.length)],
            origin: data.cities[Math.floor(Math.random() * data.cities.length)],
            destination: data.cities[Math.floor(Math.random() * data.cities.length)]
        };

        const encrypted = encrypt(originalMessage, passkey);
        encryptedMessages.push(encrypted);
    }

    return encryptedMessages.join('|');
};

module.exports = { prepareStream };