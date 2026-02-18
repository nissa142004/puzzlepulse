import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import Guard from '../game/Guard';
import PuzzleModal from './PuzzleModal';
import LifePopup from './LifePopup';

/**
 * GameCanvas Component.
 * Demonstrates theme: Event-driven programming (Movement, Canvas loops).
 */
const GameCanvas = ({ user, map, difficulty, onUpdateUser }) => {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('playing'); // playing, puzzle, gameOver
    const [player, setPlayer] = useState({ x: 50, y: 50, radius: 12, speed: 5 });
    const [guards, setGuards] = useState([]);

    // Initial stats based on difficulty
    const getInitialLives = () => {
        if (difficulty === 'easy') return 5;
        if (difficulty === 'hard') return 1;
        return 3;
    };

    const [stats, setStats] = useState({
        level: map?.lastSector || 1,
        score: 0,
        lives: getInitialLives()
    });
    const [showLifeLost, setShowLifeLost] = useState(false);

    const keys = useRef({});
    const requestRef = useRef();

    // Map Themes
    const themes = {
        map1: { primary: '#00fff2', bg: '#0d1117', grid: 'rgba(0, 255, 242, 0.1)' },
        map2: { primary: '#ff007f', bg: '#1a0510', grid: 'rgba(255, 0, 127, 0.1)' },
        map3: { primary: '#bc8cff', bg: '#0f051a', grid: 'rgba(188, 140, 255, 0.1)' },
        map4: { primary: '#39ff14', bg: '#051a05', grid: 'rgba(57, 255, 20, 0.1)' }
    };

    const currentTheme = themes[map?.id] || themes.map1;

    // Initialization: Setup guards based on level & difficulty
    useEffect(() => {
        const newGuards = [];

        // Difficulty adjustments
        const difficultyMod = difficulty === 'hard' ? 1.5 : (difficulty === 'easy' ? 0.7 : 1);
        const numGuards = Math.floor((1 + stats.level) * (difficulty === 'hard' ? 1.5 : 1));

        for (let i = 0; i < numGuards; i++) {
            const x = 200 + Math.random() * 500;
            const y = 100 + Math.random() * 300;
            const path = [
                { x, y },
                { x: x + 100 + Math.random() * 100, y: y + Math.random() * 50 },
                { x: x + Math.random() * 50, y: y + 100 + Math.random() * 50 }
            ];
            newGuards.push(new Guard(x, y, path, (1.5 + stats.level * 0.2) * difficultyMod));
        }
        setGuards(newGuards);
    }, [stats.level, map, difficulty]);

    // Event Driven: Key listeners
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

    const update = () => {
        if (gameState !== 'playing' || showLifeLost) return;

        // Player movement
        let newX = player.x;
        let newY = player.y;
        if (keys.current['ArrowUp']) newY -= player.speed;
        if (keys.current['ArrowDown']) newY += player.speed;
        if (keys.current['ArrowLeft']) newX -= player.speed;
        if (keys.current['ArrowRight']) newX += player.speed;

        newX = Math.max(player.radius, Math.min(800 - player.radius, newX));
        newY = Math.max(player.radius, Math.min(500 - player.radius, newY));

        if (newX > 750) {
            handleLevelComplete();
            return;
        }

        setPlayer(prev => ({ ...prev, x: newX, y: newY }));

        guards.forEach(guard => {
            guard.update();
            if (guard.checkDetection(newX, newY)) {
                setGameState('puzzle');
            }
        });

        draw();
        requestRef.current = requestAnimationFrame(update);
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Background with Gaming Grid Theme
        ctx.fillStyle = currentTheme.bg;
        ctx.fillRect(0, 0, 800, 500);

        ctx.strokeStyle = currentTheme.grid;
        ctx.lineWidth = 1;
        for (let i = 0; i < 800; i += 40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 500); ctx.stroke();
        }
        for (let j = 0; j < 500; j += 40) {
            ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(800, j); ctx.stroke();
        }

        // Goal area
        const gradient = ctx.createLinearGradient(750, 0, 800, 0);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, `${currentTheme.primary}44`);
        ctx.fillStyle = gradient;
        ctx.fillRect(750, 0, 50, 500);

        ctx.fillStyle = currentTheme.primary;
        ctx.font = 'bold 16px Orbitron, sans-serif';
        ctx.fillText('EXIT', 755, 255);

        // Guards
        guards.forEach(guard => guard.draw(ctx));

        // Player Upgraded Draw
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = currentTheme.primary;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = currentTheme.primary;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        ctx.restore();
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState, player, guards, showLifeLost, currentTheme]);

    const handleLevelComplete = async () => {
        const nextLevel = stats.level + 1;
        const levelScore = 100 * stats.level * (difficulty === 'hard' ? 2 : (difficulty === 'easy' ? 0.5 : 1));
        setStats(prev => ({ ...prev, level: nextLevel, score: prev.score + levelScore }));
        setPlayer(prev => ({ ...prev, x: 50, y: 50 }));

        try {
            const resp = await axios.post('/api/game/update', {
                username: user.username,
                mapId: map?.id,
                score: levelScore,
                level: nextLevel
            });
            onUpdateUser(resp.data);
        } catch (e) {
            console.error('Update failed', e);
        }
    };

    const handlePuzzleResult = async (correct) => {
        if (correct) {
            setGameState('playing');
            setPlayer(prev => ({ ...prev, x: prev.x - 60 }));
        } else {
            const newLives = stats.lives - 1;
            setShowLifeLost(true);
            if (newLives <= 0) {
                setGameState('gameOver');
            } else {
                setStats(prev => ({ ...prev, lives: newLives }));
                setGameState('playing');
                setPlayer(prev => ({ ...prev, x: 50, y: 50 }));
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
                <h2 className="glow-text" style={{ color: 'var(--neon-pink)', fontSize: '3rem' }}>CONNECTION SEVERED</h2>
                <p style={{ margin: '1rem 0', fontSize: '1.2rem' }}>Tactical Error. Session Lost.</p>
                <p>Map Score: {Math.floor(stats.score)}</p>
                <button className="primary pulse-animation" onClick={() => window.location.reload()} style={{ marginTop: '2rem' }}>RE-ESTABLISH</button>
            </div>
        );
    }

    return (
        <div className="game-container grid-gaming" style={{ background: currentTheme.bg }}>
            <div className="hud-v2" style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.8)' }}>
                <div className="hud-item">
                    <span className="hud-label">Sector</span>
                    <span className="hud-value">{stats.level}</span>
                </div>
                <div className="hud-item">
                    <span className="hud-label">Intensity</span>
                    <span className="hud-value" style={{ textTransform: 'uppercase', color: currentTheme.primary }}>{difficulty}</span>
                </div>
                <div className="hud-item">
                    <span className="hud-label">Integrity</span>
                    <span className="hud-value" style={{ color: stats.lives === 1 ? 'var(--neon-pink)' : currentTheme.primary }}>
                        {stats.lives} HP
                    </span>
                </div>
            </div>

            <canvas ref={canvasRef} width={800} height={500} style={{ display: 'block' }} />

            {gameState === 'puzzle' && <PuzzleModal onSolve={handlePuzzleResult} />}
            {showLifeLost && <LifePopup lives={stats.lives} onClose={() => setShowLifeLost(false)} />}
        </div>
    );
};

export default GameCanvas;
