const { encrypt } = require('../utils/crypto');
const { generateMessage } = require('../utils/generator');
const logger = require('../utils/logger');

const prepareStream = (passkey) => {
    try {
        if (!passkey) {
            throw new Error('Passkey is required for encryption');
        }
        
        const count = Math.floor(Math.random() * (499 - 49 + 1)) + 49;
        const encryptedMessages = [];

        for (let i = 0; i < count; i++) {
            const message = generateMessage();
            const encrypted = encrypt(message, passkey);
            encryptedMessages.push(encrypted);
        }
        
        return encryptedMessages.join('|');
    } catch (err) {
        logger.error(`Emitter Service | Preparation Failure: ${err.message}`, {
            stack: err.stack
        });
        throw err;
    }
};

module.exports = { prepareStream };