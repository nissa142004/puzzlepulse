import { useState, useEffect, useRef } from 'react';
import Guard from '../game/Guard';
import { getWallsForLevel, DIFFICULTY_MULTIPLIERS } from '../game/gameConstants';

/**
 * Custom hook for managing the game loop and state.
 */
const useGameLoop = (gameState, isPaused, showLifeLost, stats, map, difficulty, onLevelComplete, onTriggerPuzzle) => {
    const [player, setPlayer] = useState({ x: 50, y: 50, radius: 12, speed: 6.5 });
    const [guards, setGuards] = useState([]);
    const keys = useRef({});
    const requestRef = useRef();

    const currentWalls = getWallsForLevel(stats.level);

    // Initialization: Guards scaling
    useEffect(() => {
        const getSafePoint = (minX = 100, maxX = 750) => {
            let x, y, overlap;
            do {
                overlap = false;
                x = minX + Math.random() * (maxX - minX);
                y = 50 + Math.random() * 400;
                for (const wall of currentWalls) {
                    if (x > wall.x - 20 && x < wall.x + wall.w + 20 && y > wall.y - 20 && y < wall.y + wall.h + 20) {
                        overlap = true;
                    }
                }
            } while (overlap);
            return { x, y };
        };

        const newGuards = [];
        const baseSpeedMod = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
        const numGuards = stats.level === 1 ? 1 : Math.floor((1 + stats.level * 0.4) * (difficulty === 'hard' ? 1.3 : 1));

        for (let i = 0; i < numGuards; i++) {
            // Spawn guards away from the start initially
            const startPoint = getSafePoint(250, 700);
            const path = [
                startPoint,
                getSafePoint(100, 400),
                getSafePoint(400, 750),
                getSafePoint(100, 750),
                getSafePoint(100, 750)
            ];

            const baseLevelSpeed = 1.2 + (stats.level - 1) * 0.4;
            const finalGuardSpeed = baseLevelSpeed * baseSpeedMod;
            newGuards.push(new Guard(startPoint.x, startPoint.y, path, finalGuardSpeed));
        }
        setGuards(newGuards);
    }, [stats.level, map, difficulty, currentWalls]);

    // Key Listeners
    useEffect(() => {
        const handleKeyDown = (e) => {
            keys.current[e.key] = true;
        };
        const handleKeyUp = (e) => {
            keys.current[e.key] = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const update = () => {
        if (gameState !== 'playing' || showLifeLost || isPaused) return;

        // Player movement
        let nextX = player.x;
        let nextY = player.y;
        if (keys.current['ArrowUp'] || keys.current['w']) nextY -= player.speed;
        if (keys.current['ArrowDown'] || keys.current['s']) nextY += player.speed;
        if (keys.current['ArrowLeft'] || keys.current['a']) nextX -= player.speed;
        if (keys.current['ArrowRight'] || keys.current['d']) nextX += player.speed;

        // Wall collision
        let canMoveX = true;
        let canMoveY = true;
        for (const wall of currentWalls) {
            if (nextX + player.radius > wall.x && nextX - player.radius < wall.x + wall.w &&
                player.y + player.radius > wall.y && player.y - player.radius < wall.y + wall.h) {
                canMoveX = false;
            }
            if (player.x + player.radius > wall.x && player.x - player.radius < wall.x + wall.w &&
                nextY + player.radius > wall.y && nextY - player.radius < wall.y + wall.h) {
                canMoveY = false;
            }
        }

        const finalX = canMoveX ? Math.max(player.radius, Math.min(800 - player.radius, nextX)) : player.x;
        const finalY = canMoveY ? Math.max(player.radius, Math.min(500 - player.radius, nextY)) : player.y;

        // Exit condition
        if (finalX > 750) {
            onLevelComplete();
            return;
        }

        setPlayer({ ...player, x: finalX, y: finalY });

        // Guards update and detection
        for (const guard of guards) {
            guard.update(currentWalls);
            if (guard.checkDetection(finalX, finalY)) {
                onTriggerPuzzle();
                return;
            }
        }

        requestRef.current = requestAnimationFrame(update);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState, player, guards, showLifeLost, isPaused]);

    const resetPlayer = (x = 50, y = 50) => {
        setPlayer(prev => ({ ...prev, x, y }));
    };

    const resetGuards = () => {
        guards.forEach(g => g.reset());
    };

    return {
        player,
        guards,
        currentWalls,
        resetPlayer,
        resetGuards,
        keys: keys.current
    };
};

export default useGameLoop;
