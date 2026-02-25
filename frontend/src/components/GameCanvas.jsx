import React, { useRef, useEffect } from 'react';
import PuzzleModal from './PuzzleModal';
import LifePopup from './LifePopup';
import GameHUD from './GameHUD';
import GameOverlays from './GameOverlays';
import { useGameEngine } from '../hooks/useGameEngine';

/**
 * GameCanvas Component.
 * Optimized with custom hooks and modular components.
 */
const GameCanvas = ({ user, map, difficulty, onUpdateUser }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();

    const {
        gameState, setGameState,
        player, setPlayer,
        guards,
        stats,
        showLifeLost, setShowLifeLost,
        currentWalls, currentTheme,
        keys,
        handleLevelComplete,
        handlePuzzleResult
    } = useGameEngine(user, map, difficulty, onUpdateUser);

    const update = () => {
        if (gameState !== 'playing' || showLifeLost) return;

        // Player movement
        let nextX = player.x;
        let nextY = player.y;
        if (keys.current['ArrowUp'] || keys.current['w']) nextY -= player.speed;
        if (keys.current['ArrowDown'] || keys.current['s']) nextY += player.speed;
        if (keys.current['ArrowLeft'] || keys.current['a']) nextX -= player.speed;
        if (keys.current['ArrowRight'] || keys.current['d']) nextX += player.speed;

        // Simple wall collision
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

        if (finalX > 750) {
            if (stats.level >= 16) {
                setGameState('missionComplete');
                handleLevelComplete(true);
            } else {
                setGameState('levelCleared');
            }
            return;
        }

        setPlayer({ ...player, x: finalX, y: finalY });

        for (const guard of guards) {
            guard.update(currentWalls);
            if (guard.checkDetection(finalX, finalY)) {
                setGameState('puzzle');
                return;
            }
        }

        draw();
        requestRef.current = requestAnimationFrame(update);
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = currentTheme.bg;
        ctx.fillRect(0, 0, 800, 500);

        // Grid Background
        ctx.strokeStyle = currentTheme.grid || 'rgba(0, 255, 242, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 800; i += 50) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 500); ctx.stroke();
        }
        for (let j = 0; j < 500; j += 50) {
            ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(800, j); ctx.stroke();
        }

        // Draw Start Pad (Entry Zone)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(0, 0, 100, 500);
        ctx.strokeStyle = currentTheme.primary;
        ctx.lineWidth = 1;
        ctx.strokeRect(5, 5, 90, 490);
        ctx.fillStyle = currentTheme.primary;
        ctx.font = 'bold 10px monospace';
        ctx.fillText("ENTRY ZONE", 15, 20);

        // Draw Exit Warp Gate
        const warpPulse = Math.sin(Date.now() * 0.005) * 5 + 10;
        const gradient = ctx.createLinearGradient(750, 0, 800, 0);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, currentTheme.primary);
        ctx.fillStyle = gradient;
        ctx.fillRect(750, 0, 50, 500);

        ctx.strokeStyle = currentTheme.primary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 500; i += 20) {
            ctx.moveTo(760 + warpPulse, i);
            ctx.lineTo(790, i + 10);
        }
        ctx.stroke();

        ctx.save();
        ctx.translate(785, 250);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = currentTheme.primary;
        ctx.font = 'bold 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("EXIT GATE", 0, 0);
        ctx.restore();

        // Render Walls
        ctx.fillStyle = '#161b22';
        ctx.strokeStyle = currentTheme.primary;
        ctx.lineWidth = 2;
        for (const wall of currentWalls) {
            ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
            ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);

            // Wall Glow Effect
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = currentTheme.primary;
            ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
            ctx.restore();
        }

        // Guards
        guards.forEach(guard => guard.draw(ctx));

        // Player - "Little Man" Sprite
        ctx.save();
        ctx.translate(player.x, player.y);
        const breath = Math.sin(Date.now() * 0.005) * 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = currentTheme.primary;

        // Head
        ctx.beginPath();
        ctx.arc(0, -15 + breath, 8, 0, Math.PI * 2);
        ctx.fillStyle = currentTheme.primary;
        ctx.fill();

        // Body
        ctx.beginPath();
        ctx.roundRect(-8, -7 + breath, 16, 18, 5);
        ctx.fillStyle = currentTheme.primary;
        ctx.fill();

        // Legs
        ctx.lineWidth = 4;
        ctx.strokeStyle = currentTheme.primary;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-4, 11 + breath); ctx.lineTo(-6, 22); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(4, 11 + breath); ctx.lineTo(6, 22); ctx.stroke();

        // Visor/Eyes (Virtual Identity)
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(-5, -17 + breath, 10, 3);
        ctx.restore();
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState, player, guards, showLifeLost, currentTheme]);

    return (
        <div
            className="game-container grid-gaming scanlines"
            style={{
                background: currentTheme.bg,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <GameHUD stats={stats} currentTheme={currentTheme} />
            <canvas ref={canvasRef} width={800} height={500} style={{ display: 'block', borderRadius: '4px' }} />

            {gameState === 'puzzle' && <PuzzleModal onSolve={handlePuzzleResult} themeColor={currentTheme.primary} />}
            {showLifeLost && <LifePopup lives={stats.lives} onClose={() => setShowLifeLost(false)} />}

            <GameOverlays
                gameState={gameState}
                stats={stats}
                currentTheme={currentTheme}
                onProceed={() => {
                    handleLevelComplete();
                    setGameState('playing');
                }}
            />
        </div>
    );
};

export default GameCanvas;
