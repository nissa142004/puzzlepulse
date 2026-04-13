const Player = require('../models/Player');
const Map = require('../models/Map');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { memoryPlayers, saveMemoryData } = require('../utils/memoryStore');

exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Check if database is connected
        const isDbConnected = mongoose.connection.readyState === 1;
        console.log(`[Persistence Check] Operation: REGISTER | DB Connected: ${isDbConnected} | ReadyState: ${mongoose.connection.readyState}`);

        if (isDbConnected) {
            const existingPlayer = await Player.findOne({ username });
            const existingMemory = memoryPlayers.find(p => p.username === username);

            if (existingPlayer || existingMemory) {
                return res.status(400).json({ error: 'Username already exists (Cloud or Local)' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const player = new Player({
                username,
                password: hashedPassword,
                email
            });

            await player.save();
        } else {
            console.log(`Fallback: Registering player [${username}] in-memory...`);
            if (memoryPlayers.find(p => p.username === username)) {
                console.log(`Registration failed: Player [${username}] already exists.`);
                return res.status(400).json({ error: 'Username already exists (In-Memory)' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            memoryPlayers.push({
                username,
                password: hashedPassword,
                email,
                totalSolved: 0,
                correctAnswers: 0,
                accuracy: 0,
                highestLevel: 1,
                totalScore: 0,
                maps: isDbConnected ? (await Map.find().sort({ order: 1 })).map(m => ({
                    id: m.id,
                    title: m.title,
                    unlocked: m.unlockedByDefault,
                    completed: false,
                    lastStage: m.id === 'map1' ? 1 : (m.id === 'map2' ? 6 : (m.id === 'map3' ? 11 : 16)),
                    bestScore: 0
                })) : [
                    { id: 'map1', title: 'Sector 1: Outer Hull', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
                    { id: 'map2', title: 'Sector 2: Engine Core', unlocked: false, completed: false, lastStage: 6, bestScore: 0 },
                    { id: 'map3', title: 'Sector 3: Research Lab', unlocked: false, completed: false, lastStage: 11, bestScore: 0 },
                    { id: 'map4', title: 'Sector 4: Command Deck', unlocked: false, completed: false, lastStage: 16, bestScore: 0 }
                ],
                createdAt: new Date()
            });
            saveMemoryData();
            console.log(`Registration successful: Player [${username}] added to local database.`);
        }

        res.status(201).json({ message: 'Player registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const isDbConnected = mongoose.connection.readyState === 1;
        console.log(`[Persistence Check] Operation: LOGIN | DB Connected: ${isDbConnected} | ReadyState: ${mongoose.connection.readyState}`);
        let player;

        if (isDbConnected) {
            player = await Player.findOne({ username });

            // AUTOMATIC MIGRATION: If found in memory but not DB, migrate to Cloud
            if (!player) {
                const localPlayer = memoryPlayers.find(p => p.username === username);
                if (localPlayer) {
                    console.log(`[Migration] Moving operative [${username}] from local JSON to Cloud Cluster...`);
                    player = new Player(localPlayer);
                    await player.save();
                    // Optional: remove from memoryPlayers or mark as migrated
                    console.log(`[Migration] SUCCESS: Operative [${username}] is now Cloud-native.`);
                }
            }
        } else {
            console.log('MongoDB not connected, using in-memory store for login');
            player = memoryPlayers.find(p => p.username === username);
        }

        if (!player) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Ensure maps are initialized for the player
        if (!player.maps || player.maps.length === 0) {
            player.maps = isDbConnected ? (await Map.find().sort({ order: 1 })).map(m => ({
                id: m.id,
                title: m.title,
                unlocked: m.unlockedByDefault,
                completed: false,
                lastStage: m.id === 'map1' ? 1 : (m.id === 'map2' ? 6 : (m.id === 'map3' ? 11 : 16)),
                bestScore: 0
            })) : [
                { id: 'map1', title: 'Sector 1: Outer Hull', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
                { id: 'map2', title: 'Sector 2: Engine Core', unlocked: false, completed: false, lastStage: 6, bestScore: 0 },
                { id: 'map3', title: 'Sector 3: Research Lab', unlocked: false, completed: false, lastStage: 11, bestScore: 0 },
                { id: 'map4', title: 'Sector 4: Command Deck', unlocked: false, completed: false, lastStage: 16, bestScore: 0 }
            ];
            if (!isDbConnected) saveMemoryData();
            else await player.save();
        }

        // DATA MIGRATION: Ensure existing players get new map titles and proper locking
        const sectorNames = ['Sector 1: Outer Hull', 'Sector 2: Engine Core', 'Sector 3: Research Lab', 'Sector 4: Command Deck'];
        let needsSave = false;

        if (player.maps && player.maps.length > 0) {
            player.maps.forEach((m, idx) => {
                // Update title if old
                if (m.title !== sectorNames[idx]) {
                    m.title = sectorNames[idx];
                    needsSave = true;
                }
                // Fix unlocking for existing players who had everything unlocked
                if (idx > 0 && !player.maps[idx - 1].completed && m.unlocked === true) {
                    m.unlocked = false;
                    needsSave = true;
                }
                // Ensure starting stages are correct
                const expectedLastStage = idx * 4 + 1;
                if (m.lastStage < expectedLastStage) {
                    m.lastStage = expectedLastStage;
                    needsSave = true;
                }
            });
        }

        if (needsSave) {
            console.log(`[Migration] Upgraded operative [${username}] to new spaceship sector standards.`);
            if (isDbConnected) await player.save();
            else saveMemoryData();
        }

        const isMatch = await bcrypt.compare(password, player.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        res.status(200).json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

