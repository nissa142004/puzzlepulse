const Player = require('../models/Player');
const mongoose = require('mongoose');
const { memoryPlayers, saveMemoryData } = require('../utils/memoryStore');

exports.getPlayerStats = async (req, res) => {
    try {
        const isDbConnected = mongoose.connection.readyState === 1;
        let player;

        if (isDbConnected) {
            player = await Player.findOne({ username: req.params.username });
        } else {
            player = memoryPlayers.find(p => p.username === req.params.username);
        }

        if (!player) return res.status(404).json({ error: 'Player not found' });
        res.status(200).json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const isDbConnected = mongoose.connection.readyState === 1;
        let leaderboard;

        if (isDbConnected) {
            leaderboard = await Player.find()
                .sort({ totalScore: -1 })
                .select('username totalScore highestLevel');
        } else {
            leaderboard = [...memoryPlayers]
                .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
                .map(p => ({
                    username: p.username,
                    totalScore: p.totalScore,
                    highestLevel: p.highestLevel
                }));
        }

        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const { bio, email } = req.body;
        const isDbConnected = mongoose.connection.readyState === 1;
        let player;

        if (isDbConnected) {
            player = await Player.findOne({ username });
            if (!player) return res.status(404).json({ error: 'Player not found' });

            if (bio !== undefined) player.bio = bio;
            if (email !== undefined) player.email = email;

            await player.save();
        } else {
            player = memoryPlayers.find(p => p.username === username);
            if (!player) return res.status(404).json({ error: 'Player not found' });

            if (bio !== undefined) player.bio = bio;
            if (email !== undefined) player.email = email;
            saveMemoryData();
        }

        res.status(200).json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

