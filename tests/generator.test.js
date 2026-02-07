const { generateMessage } = require('../src/utils/generator');

describe('Data Generator Tests', () => {
    test('should return an object with name, origin, and destination', () => {
        const message = generateMessage();
        expect(message).toHaveProperty('name');
        expect(message).toHaveProperty('origin');
        expect(message).toHaveProperty('destination');
    });

    test('origin and destination should be from the cities list', () => {
        const message = generateMessage();
        expect(typeof message.origin).toBe('string');
        expect(message.origin.length).toBeGreaterThan(0);
    });
});