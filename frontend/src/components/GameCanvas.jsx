import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import Guard from '../game/Guard';
import PuzzleModal from './PuzzleModal';
import LifePopup from './LifePopup';

/**
 * GameCanvas Component.
 * Demonstrates theme: Event-driven programming (Movement, Canvas loops).
 */
const GameCanvas = ({ user, map, difficulty, onUpdateUser, onBackToHome }) => {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('playing'); // playing, puzzle, gameOver, levelCleared, missionComplete
    const [isPaused, setIsPaused] = useState(false);
    const [player, setPlayer] = useState({ x: 50, y: 50, radius: 12, speed: 6.5 });
    const [guards, setGuards] = useState([]);

    // Initial stats based on difficulty
    const getInitialLives = () => {
        if (difficulty === 'easy') return 5;
        if (difficulty === 'hard') return 1;
        return 3;
    };

    const [stats, setStats] = useState({
        level: map?.lastStage || 1,
        score: 0,
        lives: getInitialLives()
    });
    const [showLifeLost, setShowLifeLost] = useState(false);

    const keys = useRef({});
    const requestRef = useRef();

    // Level Walls (Refined for space and exit clarity)
    const levelWalls = {
        1: [{ x: 300, y: 0, w: 20, h: 250 }, { x: 500, y: 250, w: 20, h: 250 }],
        2: [{ x: 200, y: 50, w: 400, h: 20 }, { x: 200, y: 430, w: 400, h: 20 }],
        3: [{ x: 400, y: 50, w: 20, h: 400 }, { x: 100, y: 250, w: 150, h: 20 }, { x: 550, y: 250, w: 150, h: 20 }],
        4: [{ x: 150, y: 150, w: 100, h: 100 }, { x: 550, y: 150, w: 100, h: 100 }, { x: 350, y: 50, w: 100, h: 100 }, { x: 350, y: 350, w: 100, h: 100 }]
    };

    const currentWalls = levelWalls[((stats.level - 1) % 4) + 1] || levelWalls[1];

    // Map Themes
    const themes = {
        map1: { primary: '#00fff2', bg: '#0d1117', grid: 'rgba(0, 255, 242, 0.1)' },
        map2: { primary: '#ff007f', bg: '#1a0510', grid: 'rgba(255, 0, 127, 0.1)' },
        map3: { primary: '#bc8cff', bg: '#0f051a', grid: 'rgba(188, 140, 255, 0.1)' },
        map4: { primary: '#39ff14', bg: '#051a05', grid: 'rgba(57, 255, 20, 0.1)' }
    };

    const currentTheme = themes[map?.id] || themes.map1;

    // Initialization: Balanced Difficulty Scaling
    useEffect(() => {
        const newGuards = [];

        // Difficulty Level Multipliers (Eased significantly)
        const diffMultipliers = {
            easy: 0.4,
            medium: 0.8,
            hard: 1.3
        };
        const baseSpeedMod = diffMultipliers[difficulty] || 1.0;

        // Fewer guards
        const numGuards = stats.level === 1 ? 1 : Math.floor((1 + stats.level * 0.4) * (difficulty === 'hard' ? 1.3 : 1));

        for (let i = 0; i < numGuards; i++) {
            let x, y, overlap;
            do {
                overlap = false;
                x = 150 + Math.random() * 550;
                y = 50 + Math.random() * 400;
                for (const wall of currentWalls) {
                    if (x > wall.x - 20 && x < wall.x + wall.w + 20 && y > wall.y - 20 && y < wall.y + wall.h + 20) {
                        overlap = true;
                    }
                }
            } while (overlap);

            const path = [
                { x, y },
                { x: 100 + Math.random() * 600, y: 50 + Math.random() * 400 },
                { x: 100 + Math.random() * 600, y: 50 + Math.random() * 400 }
            ];

            // Speed scales: Level 1 on Easy will be ~0.5 speed, very slow
            const baseLevelSpeed = 1.2 + (stats.level - 1) * 0.4;
            const finalGuardSpeed = baseLevelSpeed * baseSpeedMod;

            newGuards.push(new Guard(x, y, path, finalGuardSpeed));
        }
        setGuards(newGuards);
    }, [stats.level, map, difficulty]);

    // Restore Key Listeners
    useEffect(() => {
        const handleKeyDown = (e) => {
            keys.current[e.key] = true;
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                if (gameState === 'playing') {
                    setIsPaused(prev => !prev);
                }
            }
        };
        const handleKeyUp = (e) => keys.current[e.key] = false;
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
                console.log("[Game] Player DETECTED by guard.");
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

        // Dynamic Breathing/Idle effect
        const breath = Math.sin(Date.now() * 0.005) * 2;

        // Glow
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

        // Left Leg
        ctx.beginPath();
        ctx.moveTo(-4, 11 + breath);
        ctx.lineTo(-6, 22);
        ctx.stroke();

        // Right Leg
        ctx.beginPath();
        ctx.moveTo(4, 11 + breath);
        ctx.lineTo(6, 22);
        ctx.stroke();

        // Visor/Eyes (Virtual Identity)
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(-5, -17 + breath, 10, 3);

        ctx.restore();
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState, player, guards, showLifeLost, currentTheme]);

    const handleLevelComplete = async (isFinal = false) => {
        const nextLevel = stats.level + 1;
        const levelScore = 100 * stats.level * (difficulty === 'hard' ? 2 : (difficulty === 'easy' ? 0.5 : 1));

        if (!isFinal) {
            setStats(prev => ({ ...prev, level: nextLevel, score: prev.score + levelScore }));
            setPlayer({ ...player, x: 50, y: 50 });
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
            // Reset guards to give player space after winning a puzzle
            guards.forEach(g => g.reset());
        } else {
            const newLives = stats.lives - 1;
            setShowLifeLost(true);
            if (newLives <= 0) {
                setGameState('gameOver');
            } else {
                setStats(prev => ({ ...prev, lives: newLives }));
                setGameState('playing');
                setPlayer({ ...player, x: 50, y: 50 });
                // Reset guards when life is lost
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

    if (gameState === 'gameOver') {
        return (
            <div className="game-over animate-fade" style={{ background: 'rgba(255,0,0,0.1)' }}>
                <h2 className="glow-text" style={{ color: 'var(--neon-pink)', fontSize: '3rem' }}>CONNECTION LOST</h2>
                <p style={{ margin: '1rem 0', fontSize: '1.2rem' }}>You were detected by security scans! Mission aborted.</p>
                <p>Final Sync: {Math.floor(stats.score)}</p>
                <button className="primary pulse-animation" onClick={() => window.location.reload()} style={{ marginTop: '2rem' }}>RE-ENGAGE</button>
            </div>
        );
    }

    if (gameState === 'missionComplete') {
        return (
            <div className="mission-complete animate-fade" style={{ background: 'rgba(0,255,100,0.1)' }}>
                <div className="glass-panel" style={{ padding: '3rem', borderTop: '4px solid #00ff00', textAlign: 'center', background: 'rgba(0,0,0,0.8)' }}>
                    <h2 className="glow-text" style={{ color: '#00ff00', fontSize: '3.5rem', marginBottom: '1rem' }}>MISSION COMPLETE</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', marginBottom: '2rem' }}>All sectors synchronized. Ship control established.</p>
                    <div className="hud-v2" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
                        <div className="hud-item" style={{ background: 'rgba(0,0,0,0.5)' }}>
                            <span className="hud-label">FINAL SYNC</span>
                            <span className="hud-value">{Math.floor(stats.score).toLocaleString()}</span>
                        </div>
                    </div>
                    <button className="primary pulse-animation" onClick={() => window.location.reload()}>RETURN TO DECK</button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="game-container grid-gaming scanlines"
            style={{
                background: currentTheme.bg,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* HUD and Canvas... */}
            <div className="hud-v2" style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
                <div className="hud-item">
                    <span className="hud-label">FLOOR</span>
                    <span className="hud-value">{((stats.level - 1) % 4) + 1} / 4</span>
                </div>
                <div className="hud-item">
                    <span className="hud-label">MISSION</span>
                    <span className="hud-value" style={{ color: currentTheme.primary }}>LV {stats.level}</span>
                </div>
                <div className="hud-item">
                    <span className="hud-label">HULL SYNC</span>
                    <span className="hud-value" style={{ color: stats.lives === 1 ? 'var(--neon-pink)' : currentTheme.primary }}>
                        {stats.lives}
                    </span>
                </div>
                <div className="hud-item">
                    <span className="hud-label">SYNC SCORE</span>
                    <span className="hud-value">{Math.floor(stats.score)}</span>
                </div>
                <div className="hud-item" style={{ marginLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                    <button
                        className="secondary"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', minWidth: 'auto' }}
                        onClick={() => setIsPaused(true)}
                    >
                        PAUSE
                    </button>
                </div>
            </div>

            <canvas ref={canvasRef} width={800} height={500} style={{ display: 'block', borderRadius: '4px' }} />

            {isPaused && (
                <div className="overlay animate-fade" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 100 }}>
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderTop: `4px solid ${currentTheme.primary}`, minWidth: '300px' }}>
                        <h2 className="glow-text" style={{ color: currentTheme.primary, fontSize: '3rem', marginBottom: '2rem' }}>PAUSED</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                            <button className="primary pulse-animation" style={{ width: '200px' }} onClick={() => setIsPaused(false)}>RESUME</button>
                            <button className="secondary" style={{ width: '200px' }} onClick={() => onBackToHome()}>BACK TO HUB</button>
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'puzzle' && <PuzzleModal onSolve={handlePuzzleResult} themeColor={currentTheme.primary} />}
            {showLifeLost && <LifePopup lives={stats.lives} onClose={() => setShowLifeLost(false)} />}

            {gameState === 'levelCleared' && (
                <div className="overlay animate-fade" style={{ background: 'rgba(0,0,0,0.85)' }}>
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderTop: `4px solid ${currentTheme.primary}` }}>
                        <h2 className="glow-text" style={{ color: currentTheme.primary, fontSize: '2.5rem' }}>
                            {(stats.level % 4 === 0) ? "SECTOR SYNCHRONIZED" : "SYNC SUCCESSFUL"}
                        </h2>
                        <p style={{ margin: '1rem 0', color: 'var(--text-dim)' }}>
                            {(stats.level % 4 === 0)
                                ? "Current ship sector fully encrypted. Moving to deeper systems."
                                : "Floor data encrypted. Initializing next node."}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                            <button className="primary" onClick={() => {
                                handleLevelComplete();
                                setGameState('playing');
                            }}>PROCEED</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameCanvas;
