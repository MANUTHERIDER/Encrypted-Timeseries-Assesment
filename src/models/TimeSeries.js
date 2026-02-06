const mongoose = require('mongoose');

const timeSeriesSchema = new mongoose.Schema({
    timestamp: { type: Date, required: true, index: true },
    metadata: {
        source: { type: String, default: 'socket_emitter' }
    },
    data_points: [{
        name: String,
        origin: String,
        destination: String,
        received_at: { type: Date, default: Date.now }
    }, { _id: false }],
    count: { type: Number, default: 0 }
});

module.exports = mongoose.model('TimeSeries', timeSeriesSchema);