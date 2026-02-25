const Player = require('../models/Player');
const Map = require('../models/Map');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const playerDataService = require('../services/playerDataService');

exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const isDbConnected = mongoose.connection.readyState === 1;
        const memoryPlayers = playerDataService.getMemoryPlayers();

        if (isDbConnected) {
            const existingPlayer = await Player.findOne({ username });
            const existingMemory = memoryPlayers.find(p => p.username === username);

            if (existingPlayer || existingMemory) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const player = new Player({ username, password: hashedPassword, email });
            await player.save();
        } else {
            if (playerDataService.findMemoryPlayer(username)) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            playerDataService.addMemoryPlayer({
                username,
                password: hashedPassword,
                email,
                totalSolved: 0,
                correctAnswers: 0,
                accuracy: 0,
                highestLevel: 1,
                totalScore: 0,
                maps: [
                    { id: 'map1', title: 'Sector 1: Outer Hull', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
                    { id: 'map2', title: 'Sector 2: Engine Core', unlocked: false, completed: false, lastStage: 5, bestScore: 0 },
                    { id: 'map3', title: 'Sector 3: Research Lab', unlocked: false, completed: false, lastStage: 9, bestScore: 0 },
                    { id: 'map4', title: 'Sector 4: Command Deck', unlocked: false, completed: false, lastStage: 13, bestScore: 0 }
                ],
                createdAt: new Date()
            });
        }

        res.status(201).json({ message: 'Player registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const isDbConnected = mongoose.connection.readyState === 1;
        let player;

        if (isDbConnected) {
            player = await Player.findOne({ username });
            if (!player) {
                const localPlayer = playerDataService.findMemoryPlayer(username);
                if (localPlayer) {
                    player = new Player(localPlayer);
                    await player.save();
                }
            }
        } else {
            player = playerDataService.findMemoryPlayer(username);
        }

        if (!player) return res.status(401).json({ error: 'Invalid username or password' });

        const sectorNames = ['Sector 1: Outer Hull', 'Sector 2: Engine Core', 'Sector 3: Research Lab', 'Sector 4: Command Deck'];
        let needsSave = false;

        if (!player.maps || player.maps.length === 0) {
            player.maps = [
                { id: 'map1', title: 'Sector 1: Outer Hull', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
                { id: 'map2', title: 'Sector 2: Engine Core', unlocked: false, completed: false, lastStage: 5, bestScore: 0 },
                { id: 'map3', title: 'Sector 3: Research Lab', unlocked: false, completed: false, lastStage: 9, bestScore: 0 },
                { id: 'map4', title: 'Sector 4: Command Deck', unlocked: false, completed: false, lastStage: 13, bestScore: 0 }
            ];
            needsSave = true;
        } else {
            player.maps.forEach((m, idx) => {
                if (m.title !== sectorNames[idx]) { m.title = sectorNames[idx]; needsSave = true; }
                if (idx > 0 && !player.maps[idx - 1].completed && m.unlocked === true) { m.unlocked = false; needsSave = true; }
                const expectedLastStage = idx * 4 + 1;
                if (m.lastStage < expectedLastStage) { m.lastStage = expectedLastStage; needsSave = true; }
            });
        }

        if (needsSave) {
            if (isDbConnected) await player.save();
            else playerDataService.saveMemoryData();
        }

        const isMatch = await bcrypt.compare(password, player.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid username or password' });

        res.status(200).json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
