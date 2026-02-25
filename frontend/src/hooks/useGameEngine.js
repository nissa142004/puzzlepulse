import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Guard from '../game/Guard';
import { DIFFICULTY_MULTIPLIERS, PLAYER_RADIUS, PLAYER_SPEED } from '../game/gameConstants';

export const useGameEngine = (user, map, difficulty, onUpdateUser) => {
    const [gameState, setGameState] = useState('playing');
    const [player, setPlayer] = useState({ x: 50, y: 50, radius: PLAYER_RADIUS, speed: PLAYER_SPEED });
    const [guards, setGuards] = useState([]);
    const [showLifeLost, setShowLifeLost] = useState(false);

    const getInitialLives = useCallback(() => {
        if (difficulty === 'easy') return 5;
        if (difficulty === 'hard') return 1;
        return 3;
    }, [difficulty]);

    const [stats, setStats] = useState({
        level: map?.lastStage || 1,
        score: 0,
        lives: getInitialLives()
    });

    const keys = useRef({});

    // Initialization: Balanced Difficulty Scaling
    useEffect(() => {
        const baseSpeedMod = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
        const numGuards = stats.level === 1 ? 1 : Math.floor((1 + stats.level * 0.4) * (difficulty === 'hard' ? 1.3 : 1));
        const newGuards = [];

        // Simple wall layout for guard placement safety (can be passed in or imported)
        // For now, using a placeholder check or passing currentWalls in
        for (let i = 0; i < numGuards; i++) {
            let x = 150 + Math.random() * 550;
            let y = 50 + Math.random() * 400;

            const path = [
                { x, y },
                { x: 100 + Math.random() * 600, y: 50 + Math.random() * 400 },
                { x: 100 + Math.random() * 600, y: 50 + Math.random() * 400 }
            ];

            const baseLevelSpeed = 1.2 + (stats.level - 1) * 0.4;
            const finalGuardSpeed = baseLevelSpeed * baseSpeedMod;
            newGuards.push(new Guard(x, y, path, finalGuardSpeed));
        }
        setGuards(newGuards);
    }, [stats.level, map, difficulty]);

    // Key Listeners
    useEffect(() => {
        const handleKeyDown = (e) => keys.current[e.key] = true;
        const handleKeyUp = (e) => keys.current[e.key] = false;
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleLevelComplete = async (isFinal = false) => {
        const nextLevel = stats.level + 1;
        const levelScore = 100 * stats.level * (difficulty === 'hard' ? 2 : (difficulty === 'easy' ? 0.5 : 1));

        if (!isFinal) {
            setStats(prev => ({ ...prev, level: nextLevel, score: prev.score + levelScore }));
            setPlayer(prev => ({ ...prev, x: 50, y: 50 }));
        } else {
            setStats(prev => ({ ...prev, score: prev.score + levelScore }));
        }

        try {
            const resp = await axios.post('/api/game/update', {
                username: user.username,
                mapId: map?.id,
                score: levelScore,
                level: isFinal ? stats.level : nextLevel
            });
            onUpdateUser(resp.data);
        } catch (e) {
            console.error('Update failed', e);
        }
    };

    const handlePuzzleResult = async (correct) => {
        if (correct) {
            setGameState('playing');
            setPlayer(prev => ({ ...prev, x: Math.max(50, prev.x - 100) }));
            guards.forEach(g => g.reset());
        } else {
            const newLives = stats.lives - 1;
            setShowLifeLost(true);
            if (newLives <= 0) {
                setGameState('gameOver');
            } else {
                setStats(prev => ({ ...prev, lives: newLives }));
                setGameState('playing');
                setPlayer(prev => ({ ...prev, x: 50, y: 50 }));
                guards.forEach(g => g.reset());
            }
        }

        try {
            const resp = await axios.post('/api/game/update', {
                username: user.username,
                mapId: map?.id,
                solved: true,
                correct: correct,
                score: correct ? 50 : 0
            });
            onUpdateUser(resp.data);
        } catch (e) {
            console.error('Update failed', e);
        }
    };

    return {
        gameState, setGameState,
        player, setPlayer,
        guards, setGuards,
        stats, setStats,
        showLifeLost, setShowLifeLost,
        keys,
        handleLevelComplete,
        handlePuzzleResult
    };
};
