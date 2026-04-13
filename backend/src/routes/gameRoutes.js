const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const gameController = require('../controllers/gameController');

// Player endpoints
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/player/:username', profileController.getPlayerStats);
router.put('/player/:username', profileController.updateProfile);
router.get('/leaderboard', profileController.getLeaderboard);

// Game endpoints
router.get('/maps', gameController.getMaps);
router.get('/puzzle', gameController.getPuzzle);
router.post('/game/update', gameController.updateGameState);
router.post('/game/reset', gameController.resetProgress);

module.exports = router;
