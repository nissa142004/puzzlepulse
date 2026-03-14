import React, { useRef, useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import PuzzleModal from './PuzzleModal';
import LifePopup from './LifePopup';
import GameOverOverlay from './GameOverOverlay';
import MissionCompleteOverlay from './MissionCompleteOverlay';
import PauseOverlay from './PauseOverlay';
import LevelClearedOverlay from './LevelClearedOverlay';
import { getThemeForMap } from '../game/gameConstants';
import { drawBackground, drawStartPad, drawExitGate, drawWalls, drawPlayer } from '../game/gameRenderer';
import useGameLoop from '../hooks/useGameLoop';

const GameCanvas = ({ user, map, difficulty, onUpdateUser, onBackToHome, onStatsChange }) => {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('playing');
    const [isPaused, setIsPaused] = useState(false);
    const [showLifeLost, setShowLifeLost] = useState(false);

    const [stats, setStats] = useState({
        level: map?.lastStage || 1,
        score: 0,
        lives: difficulty === 'easy' ? 5 : (difficulty === 'hard' ? 1 : 3)
    });

    useEffect(() => {
        onStatsChange?.(stats);
    }, [stats, onStatsChange]);

    const currentTheme = useMemo(() => getThemeForMap(map?.id), [map?.id]);

    const handleLevelExit = () => {
        if (stats.level >= 16) {
            setGameState('missionComplete');
            handleLevelUpdate(true);
        } else {
            setGameState('levelCleared');
        }
    };

    const { player, guards, currentWalls, resetPlayer, resetGuards } = useGameLoop(
        gameState, isPaused, showLifeLost, stats, map, difficulty,
        handleLevelExit,
        () => setGameState('puzzle')
    );

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.key === 'Escape' || e.key === 'p' || e.key === 'P') && gameState === 'playing') {
                setIsPaused(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        drawBackground(ctx, currentTheme);
        drawStartPad(ctx, currentTheme);
        drawExitGate(ctx, currentTheme);
        drawWalls(ctx, currentWalls, currentTheme);
        guards.forEach(g => g.draw(ctx));
        drawPlayer(ctx, player, currentTheme);
    }, [player, guards, currentWalls, currentTheme]);

    const handleLevelUpdate = async (isFinal = false) => {
        const levelScore = 100 * stats.level * (difficulty === 'hard' ? 2 : (difficulty === 'easy' ? 0.5 : 1));
        const nextLevel = stats.level + 1;

        if (!isFinal) {
            setStats(prev => ({ ...prev, level: nextLevel, score: prev.score + levelScore }));
            resetPlayer();
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
            resetPlayer(Math.max(50, player.x - 100));
            resetGuards();
        } else {
            const newLives = stats.lives - 1;
            setShowLifeLost(true);
            if (newLives <= 0) {
                setGameState('gameOver');
            } else {
                setStats(prev => ({ ...prev, lives: newLives }));
                setGameState('playing');
                resetPlayer();
                resetGuards();
            }
        }

        try {
            const resp = await axios.post('/api/game/update', {
                username: user.username, mapId: map?.id, solved: true, correct, score: correct ? 50 : 0
            });
            onUpdateUser(resp.data);
        } catch (e) {
            console.error('Update failed', e);
        }
    };

    if (gameState === 'gameOver') return <GameOverOverlay score={stats.score} />;
    if (gameState === 'missionComplete') return <MissionCompleteOverlay score={stats.score} />;

    return (
        <div className="game-container grid-gaming scanlines" style={{ background: currentTheme.bg, position: 'relative', overflow: 'hidden' }}>
            <canvas ref={canvasRef} width={800} height={500} style={{ display: 'block', borderRadius: '4px' }} />
            {isPaused && <PauseOverlay themeColor={currentTheme.primary} onResume={() => setIsPaused(false)} onBackToHome={onBackToHome} />}
            {gameState === 'puzzle' && <PuzzleModal onSolve={handlePuzzleResult} themeColor={currentTheme.primary} />}
            {showLifeLost && <LifePopup lives={stats.lives} onClose={() => setShowLifeLost(false)} />}
            {gameState === 'levelCleared' && (
                <LevelClearedOverlay
                    themeColor={currentTheme.primary} level={stats.level}
                    onProceed={() => { handleLevelUpdate(); setGameState('playing'); }}
                />
            )}
        </div>
    );
};

export default GameCanvas;
