const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    totalSolved: {
        type: Number,
        default: 0
    },
    correctAnswers: {
        type: Number,
        default: 0
    },
    accuracy: {
        type: Number,
        default: 0
    },
    highestLevel: {
        type: Number,
        default: 1
    },
    totalScore: {
        type: Number,
        default: 0
    },
    maps: [{
        id: String,
        title: String,
        unlocked: { type: Boolean, default: false },
        completed: { type: Boolean, default: false },
        lastSector: { type: Number, default: 1 },
        bestScore: { type: Number, default: 0 }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Player', PlayerSchema);
