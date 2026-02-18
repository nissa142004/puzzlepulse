const mongoose = require('mongoose');

/**
 * GameSession Model.
 * Tracks active infiltration attempts and sector state.
 */
const GameSessionSchema = new mongoose.Schema({
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    mapId: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    currentLevel: {
        type: Number,
        default: 1
    },
    currentScore: {
        type: Number,
        default: 0
    },
    livesRemaining: {
        type: Number,
        default: 3
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'completed', 'failed'],
        default: 'active'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    lastPulseAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GameSession', GameSessionSchema);
