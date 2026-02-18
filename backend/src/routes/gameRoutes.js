const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// Player endpoints
router.post('/auth/register', playerController.register);
router.post('/auth/login', playerController.login);
router.get('/player/:username', playerController.getPlayerStats);
router.put('/player/:username', playerController.updateProfile);
router.get('/leaderboard', playerController.getLeaderboard);

// Game endpoints
router.get('/maps', playerController.getMaps);
router.get('/puzzle', playerController.getPuzzle);
router.post('/game/update', playerController.updateGameState);

module.exports = router;
