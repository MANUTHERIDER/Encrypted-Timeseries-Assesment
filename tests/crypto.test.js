const { encrypt, decrypt } = require('../src/utils/crypto');
require('dotenv').config();

describe('Cryptography Module', () => {
    const passkey = process.env.APP_SECRET; 
    const originalObject = {
        name: 'Jack Reacher',
        origin: 'Bengaluru',
        destination: 'Mumbai'
    };

    test('should encrypt and then decrypt back to the original object', () => {
        const encrypted = encrypt(originalObject, passkey);
        expect(typeof encrypted).toBe('string');
        
        const decrypted = decrypt(encrypted, passkey);
        expect(decrypted).toEqual(originalObject);
    });

    test('should fail decryption with wrong passkey', () => {
        const encrypted = encrypt(originalObject, passkey);
        expect(() => {
            decrypt(encrypted, 'wrong-key');
        }).toThrow();
    });
});