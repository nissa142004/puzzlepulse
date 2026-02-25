const Player = require('../models/Player');
const Map = require('../models/Map');
const puzzleService = require('../services/puzzleService');
const mongoose = require('mongoose');
const playerDataService = require('../services/playerDataService');

exports.getMaps = async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const maps = await Map.find().sort({ order: 1 });
            res.status(200).json(maps);
        } else {
            res.status(200).json([
                { id: 'map1', title: 'Sector 1: Outer Hull', unlockedByDefault: true, order: 1 },
                { id: 'map2', title: 'Sector 2: Engine Core', unlockedByDefault: false, order: 2 },
                { id: 'map3', title: 'Sector 3: Research Lab', unlockedByDefault: false, order: 3 },
                { id: 'map4', title: 'Sector 4: Command Deck', unlockedByDefault: false, order: 4 }
            ]);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPuzzle = async (req, res) => {
    try {
        const puzzle = await puzzleService.getRandomPuzzle();
        res.status(200).json(puzzle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateGameState = async (req, res) => {
    try {
        const { username, score, level, solved, correct, mapId } = req.body;
        const isDbConnected = mongoose.connection.readyState === 1;
        let player;

        if (isDbConnected) {
            player = await Player.findOne({ username });
            if (!player) {
                const localPlayer = playerDataService.findMemoryPlayer(username);
                if (localPlayer) player = new Player(localPlayer);
            }
        } else {
            player = playerDataService.findMemoryPlayer(username);
        }

        if (!player) return res.status(404).json({ error: 'Player not found' });

        player.totalScore += score || 0;
        player.highestLevel = Math.max(player.highestLevel, level || 1);
        player.totalSolved += solved ? 1 : 0;
        player.correctAnswers += correct ? 1 : 0;

        if (mapId && player.maps) {
            const mIndex = player.maps.findIndex(m => m.id === mapId);
            if (mIndex !== -1) {
                player.maps[mIndex].bestScore = Math.max(player.maps[mIndex].bestScore, score || 0);
                if (level) player.maps[mIndex].lastStage = level;

                const relativeLevel = level - (mIndex * 4);
                if (relativeLevel >= 4 && !player.maps[mIndex].completed) {
                    player.maps[mIndex].completed = true;
                    if (mIndex < player.maps.length - 1) {
                        player.maps[mIndex + 1].unlocked = true;
                    }
                }
            }
        }

        if (player.totalSolved > 0) player.accuracy = (player.correctAnswers / player.totalSolved) * 100;

        if (isDbConnected) await player.save();
        else playerDataService.saveMemoryData();

        res.status(200).json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resetProgress = async (req, res) => {
    try {
        const { username } = req.body;
        const isDbConnected = mongoose.connection.readyState === 1;
        let player;

        if (isDbConnected) player = await Player.findOne({ username });
        else player = playerDataService.findMemoryPlayer(username);

        if (!player) return res.status(404).json({ error: 'Player not found' });

        player.totalScore = 0;
        player.highestLevel = 1;
        player.totalSolved = 0;
        player.correctAnswers = 0;
        player.accuracy = 0;
        player.maps = [
            { id: 'map1', title: 'Sector 1: Outer Hull', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
            { id: 'map2', title: 'Sector 2: Engine Core', unlocked: false, completed: false, lastStage: 5, bestScore: 0 },
            { id: 'map3', title: 'Sector 3: Research Lab', unlocked: false, completed: false, lastStage: 9, bestScore: 0 },
            { id: 'map4', title: 'Sector 4: Command Deck', unlocked: false, completed: false, lastStage: 13, bestScore: 0 }
        ];

        if (isDbConnected) await player.save();
        else playerDataService.saveMemoryData();

        res.status(200).json(player);
    } catch (e) {
        res.status(500).json({ error: 'Failed to reset progress' });
    }
};
