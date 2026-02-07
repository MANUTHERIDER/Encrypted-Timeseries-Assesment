const { prepareStream } = require('../src/services/emitter.service');

describe('Emitter Stream Logic', () => {
    test('should generate a string with 49 to 499 encrypted messages', () => {
        const passkey = 'my-secrrret-key';
        const stream = prepareStream(passkey);
        
        const messages = stream.split('|');
        
        expect(messages.length).toBeGreaterThanOrEqual(49);
        expect(messages.length).toBeLessThanOrEqual(499);
    });

    test('each message in the stream should be a valid encrypted string', () => {
        const passkey = 'my-secret-key-2';
        const stream = prepareStream(passkey);
        const firstMessage = stream.split('|')[0];
        
        // it should contain a colon
        expect(firstMessage).toContain(':');
    });
});