const crypto = require('crypto');
const logger = require('./logger');

const createHash = (obj) => {
    try {
        return crypto.createHash('sha256')
            .update(JSON.stringify(obj))
            .digest('hex');
    } catch (err) {
        logger.error(`Crypto | Createhash Function Failure: ${err.message}`, {
            stack: err.stack
        });
        throw new Error(`Hash creation failed: ${err.message}`);
    }
};

const encrypt = (payload, secretKey) => {
    try {
        const dataWithHash = { ...payload, secret_key: createHash(payload) };
        const text = JSON.stringify(dataWithHash);

        const iv = crypto.randomBytes(16);
        const key = crypto.createHash('sha256').update(secretKey).digest();

        const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    } catch (err) {
        logger.error(`Crypto | Encrypt Function Failure: ${err.message}`, {
            stack: err.stack
        });
        throw new Error(`Encryption failed: ${err.message}`);
    }
};

const decrypt = (encryptedText, secretKey) => {
    try {
        const [ivHex, data] = encryptedText.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const key = crypto.createHash('sha256').update(secretKey).digest();

        const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        const parsed = JSON.parse(decrypted);

        const { secret_key, ...originalData } = parsed;
        if (createHash(originalData) !== secret_key) {
            throw new Error('Data integrity compromised!');
        }

        return originalData;
    } catch (err) {
        logger.error(`Crypto | Decrypt Function Failure: ${err.message}`, {
            stack: err.stack
        });
        throw new Error(`Decryption failed: ${err.message}`);
    }
};

module.exports = { encrypt, decrypt, createHash };