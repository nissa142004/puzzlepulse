const fs = require('fs');
const path = require('path');

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
        const initialMaps = [
            { id: 'map1', title: 'Sector 1: Outer Hull', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
            { id: 'map2', title: 'Sector 2: Engine Core', unlocked: false, completed: false, lastStage: 5, bestScore: 0 },
            { id: 'map3', title: 'Sector 3: Research Lab', unlocked: false, completed: false, lastStage: 9, bestScore: 0 },
            { id: 'map4', title: 'Sector 4: Command Deck', unlocked: false, completed: false, lastStage: 13, bestScore: 0 }
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

module.exports = {
    getMemoryPlayers: () => memoryPlayers,
    saveMemoryData,
    findMemoryPlayer: (username) => memoryPlayers.find(p => p.username === username),
    addMemoryPlayer: (player) => {
        memoryPlayers.push(player);
        saveMemoryData();
    }
};
