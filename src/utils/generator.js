const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const dataPath = path.join(__dirname, '../assets/data.json');

let names = [];
let cities = [];

try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    names = data.names || [];
    cities = data.cities || [];
    
    if (names.length === 0 || cities.length === 0) {
        throw new Error('Data file missing names or cities arrays');
    }
} catch (parsingError) {
    logger.error(`Generator | Failed to load data from JSON: ${parsingError.message}`, {
        stack: parsingError.stack
    });
    process.exit(1);
}

const generateMessage = () => {
    return {
        name: names[Math.floor(Math.random() * names.length)],
        origin: cities[Math.floor(Math.random() * cities.length)],
        destination: cities[Math.floor(Math.random() * cities.length)]
    };
};

module.exports = { generateMessage };
