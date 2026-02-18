const mongoose = require('mongoose');

/**
 * Map Model.
 * Defines the static configurations for game sectors.
 */
const MapSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: 'High-clearance security sector.'
    },
    theme: {
        primary: { type: String, default: '#00fff2' },
        bg: { type: String, default: '#0d1117' },
        grid: { type: String, default: 'rgba(0, 255, 242, 0.1)' }
    },
    difficultyMod: {
        type: Number,
        default: 1.0
    },
    unlockedByDefault: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Map', MapSchema);
