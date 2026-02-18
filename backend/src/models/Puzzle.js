const mongoose = require('mongoose');

/**
 * Puzzle Model.
 * Stores individual pulse-challenges for infiltration.
 */
const PuzzleSchema = new mongoose.Schema({
    questionImage: {
        type: String,
        required: true
    },
    solution: {
        type: Number,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    category: {
        type: String,
        default: 'logic'
    },
    source: {
        type: String,
        default: 'external'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Puzzle', PuzzleSchema);
