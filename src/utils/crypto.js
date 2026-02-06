const crypto = require('crypto');

const createHash = (obj) => {
    return crypto.createHash('sha256')
        .update(JSON.stringify(obj))
        .digest('hex');
};

const encrypt = (payload, secretKey) => {
    const dataWithHash = { ...payload, secret_key: createHash(payload) };
    const text = JSON.stringify(dataWithHash);

    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(secretKey).digest(); 

    const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (encryptedText, secretKey) => {
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
};

module.exports = { encrypt, decrypt, createHash };