const Player = require('../models/Player');
const Map = require('../models/Map');
const puzzleService = require('../services/puzzleService');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// In-memory fallback for demo/testing when MongoDB is not available
const DATA_FILE = path.join(__dirname, '../../data/players.json');
let memoryPlayers = [];

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../../data'))) {
    fs.mkdirSync(path.join(__dirname, '../../data'));
}

// Load initial data
try {
    if (fs.existsSync(DATA_FILE)) {
        memoryPlayers = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } else {
        // Seed some data
        const initialMaps = [
            { id: 'map1', title: 'Stage Alpha', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
            { id: 'map2', title: 'Escape Vault', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
            { id: 'map3', title: 'Complex Delta', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
            { id: 'map4', title: 'Main Core', unlocked: true, completed: false, lastStage: 1, bestScore: 0 }
        ];
        memoryPlayers = [
            { username: 'Ghost', totalScore: 2500, highestLevel: 5, password: 'x', bio: 'Senior stealth operative.', maps: initialMaps.map(m => ({ ...m, unlocked: true })) },
            { username: 'Shadow', totalScore: 1800, highestLevel: 3, password: 'x', bio: 'Infiltration specialist.', maps: initialMaps.map((m, i) => ({ ...m, unlocked: i < 2 })) },
            { username: 'Pulse', totalScore: 1200, highestLevel: 2, password: 'x', bio: 'New recruit.', maps: initialMaps.map((m, i) => ({ ...m, unlocked: i < 1 })) }
        ];
        fs.writeFileSync(DATA_FILE, JSON.stringify(memoryPlayers, null, 2));
    }
} catch (err) {
    console.error('Error loading memory players:', err);
}

const saveMemoryData = () => {
    try {
        const data = JSON.stringify(memoryPlayers, null, 2);
        fs.writeFileSync(DATA_FILE, data);
    } catch (err) {
        console.error('[Data Sync Error] Failed to save memory players:', err);
    }
};

/**
 * Controller for handling player and game logic.
 * Demonstrates theme: Software design principles (Low coupling/High cohesion).
 */

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
                    lastStage: 1,
                    bestScore: 0
                })) : [
                    { id: 'map1', title: 'Stage Alpha', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
                    { id: 'map2', title: 'Escape Vault', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
                    { id: 'map3', title: 'Complex Delta', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
                    { id: 'map4', title: 'Main Core', unlocked: true, completed: false, lastStage: 1, bestScore: 0 }
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
                lastStage: 1,
                bestScore: 0
            })) : [
                { id: 'map1', title: 'Stage Alpha', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
                { id: 'map2', title: 'Escape Vault', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
                { id: 'map3', title: 'Complex Delta', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
                { id: 'map4', title: 'Main Core', unlocked: true, completed: false, lastStage: 1, bestScore: 0 }
            ];
            if (!isDbConnected) saveMemoryData();
            else await player.save();
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

exports.getMaps = async (req, res) => {
    try {
        const isDbConnected = mongoose.connection.readyState === 1;
        if (isDbConnected) {
            const maps = await Map.find().sort({ order: 1 });
            res.status(200).json(maps);
        } else {
            console.log('[Fallback] Serving static map data...');
            const fallbackMaps = [
                { id: 'map1', title: 'Stage Alpha', unlockedByDefault: true, order: 1 },
                { id: 'map2', title: 'Escape Vault', unlockedByDefault: true, order: 2 },
                { id: 'map3', title: 'Complex Delta', unlockedByDefault: true, order: 3 },
                { id: 'map4', title: 'Main Core', unlockedByDefault: true, order: 4 }
            ];
            res.status(200).json(fallbackMaps);
        }
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
        const { username, score, level, solved, correct } = req.body;
        const isDbConnected = mongoose.connection.readyState === 1;
        console.log(`[Persistence Check] Operation: UPDATE_GAME | DB Connected: ${isDbConnected} | ReadyState: ${mongoose.connection.readyState}`);
        let player;

        if (isDbConnected) {
            player = await Player.findOne({ username });

            // Safety Migration: If mid-session and DB came online, migrate now
            if (!player) {
                const localPlayer = memoryPlayers.find(p => p.username === username);
                if (localPlayer) {
                    console.log(`[Safety Sync] Migrating active session for [${username}] to Cloud...`);
                    player = new Player(localPlayer);
                    // We don't save yet, we update below and then save
                }
            }
        } else {
            player = memoryPlayers.find(p => p.username === username);
        }

        if (!player) return res.status(404).json({ error: 'Player not found' });

        player.totalScore += score || 0;
        player.highestLevel = Math.max(player.highestLevel, level || 1);
        player.totalSolved += solved ? 1 : 0;
        player.correctAnswers += correct ? 1 : 0;

        // Handle map specific progress
        const { mapId } = req.body;
        if (mapId && player.maps) {
            const mIndex = player.maps.findIndex(m => m.id === mapId);
            if (mIndex !== -1) {
                player.maps[mIndex].bestScore = Math.max(player.maps[mIndex].bestScore, score || 0);

                // Save stage progress
                if (level) {
                    player.maps[mIndex].lastStage = level;
                }

                // Unlock next map if this one is successfully completed (reaching stage 5)
                if (level >= 5 && !player.maps[mIndex].completed) {
                    player.maps[mIndex].completed = true;
                    if (mIndex < player.maps.length - 1) {
                        player.maps[mIndex + 1].unlocked = true;
                        console.log(`[Progression] Unlocked map: ${player.maps[mIndex + 1].id} for ${username}`);
                    }
                }
            }
        }

        if (player.totalSolved > 0) {
            player.accuracy = (player.correctAnswers / player.totalSolved) * 100;
        }

        if (isDbConnected) {
            await player.save();
        } else {
            saveMemoryData();
        }

        res.status(200).json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
