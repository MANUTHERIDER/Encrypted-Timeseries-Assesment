const {getMinuteStart} = require('../src/utils/time_helper');

describe('Time Helper Logic',() => {
    test('should floor the time to the nearest minute', () => {
        const date = new Date('2026-02-06T21:22:41');
        const floored = getMinuteStart(date);

        expect(floored.getSeconds()).toBe(0);
        expect(floored.getMinutes()).toBe(22);
    });
});