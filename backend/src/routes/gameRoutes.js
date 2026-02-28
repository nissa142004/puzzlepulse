const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const authController = require('../controllers/authController');
const gameController = require('../controllers/gameController');

// Authentication
router.post('/register', authController.register);
router.post('/login', authController.login);

// Player Profile & Leaderboard
router.get('/player/:username', playerController.getPlayerStats);
router.get('/leaderboard', playerController.getLeaderboard);
router.post('/player/:username', playerController.updateProfile);

// Gameplay
router.get('/maps', gameController.getMaps);
router.get('/puzzle', gameController.getPuzzle);
router.post('/game/update', gameController.updateGameState);
router.post('/game/reset', gameController.resetProgress);

module.exports = router;
