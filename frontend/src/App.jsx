import React, { useState, useEffect } from 'react';
import { Shield, Target } from 'lucide-react';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';

import LandingPage from './components/LandingPage';
import NexusBackground from './components/NexusBackground';

/**
 * Main App component.
 * Features: Persistence of user progress and authentication.
 */
function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('landing'); // 'landing', 'login', 'register', 'dashboard', 'game', 'leaderboard', 'profile'
    const [currentMap, setCurrentMap] = useState(null);
    const [difficulty, setDifficulty] = useState('medium');
    const [gameStats, setGameStats] = useState({ level: 1, score: 0, lives: 3 });

    useEffect(() => {
        const savedUser = localStorage.getItem('puzzlePulseUser');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setView('dashboard');
        }
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('puzzlePulseUser', JSON.stringify(userData));
        setView('dashboard');
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('puzzlePulseUser');
        setView('landing');
        setCurrentMap(null);
    };

    const handleStartGame = (map, diff) => {
        setCurrentMap(map);
        setDifficulty(diff);
        setView('game');
    };

    const renderNavbar = () => (
        <nav className="navbar" style={{ zIndex: 1000 }}>
            <div className="glow-text" style={{ fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setView('dashboard')}>
                PuzzlePulse
            </div>
            <div className="nav-links">
                <button className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')} style={{ background: 'none', border: 'none' }}>Dashboard</button>
                <button className={`nav-link ${view === 'game' ? 'active' : ''}`} onClick={() => setView('game')} disabled={!currentMap} style={{ background: 'none', border: 'none', opacity: currentMap ? 1 : 0.4 }}>Play Game</button>
                <button className={`nav-link ${view === 'leaderboard' ? 'active' : ''}`} onClick={() => setView('leaderboard')} style={{ background: 'none', border: 'none' }}>Leaderboard</button>
                <button className={`nav-link ${view === 'profile' ? 'active' : ''}`} onClick={() => setView('profile')} style={{ background: 'none', border: 'none' }}>Profile</button>
            </div>
            <button onClick={handleLogout} className="secondary" style={{ padding: '0.4rem 1rem' }}>Exit</button>
        </nav>
    );

    const GameDetailsPanel = ({ user, map, difficulty, liveStats }) => {
        const sectorDescriptions = {
            map1: "The outermost layer of the station. Security is light. Objective: Gain access to the internal network.",
            map2: "The heart of the ship's propulsion. Conduits and heat make this area a labyrinth of hazards. Objective: Fix the core stabilizers.",
            map3: "Where advanced research takes place. Protocols and sensors are everywhere. Objective: Collect research data.",
            map4: "The main control center. Objective: Take full control of the ship."
        };

        const description = sectorDescriptions[map?.id] || "No map data available.";

        return (
            <aside className="game-side-panel glass-panel animate-fade">
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <h3 className="glow-text" style={{ fontSize: '1.5rem', marginBottom: '0.8rem' }}>{map?.title || "Unknown Map"}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Shield size={16} color="var(--neon-cyan)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Security: {difficulty.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="stat-group">
                    <span className="stat-label-v2">Level Info</span>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.5', marginTop: '0.5rem' }}>{description}</p>
                </div>

                <div className="stat-group">
                    <span className="stat-label-v2">Map Progress</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Current Level</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>
                            {((liveStats.level - 1) % 4) + 1} / 4 (LV {liveStats.level})
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Health</span>
                        <span style={{ fontSize: '0.8rem', color: liveStats.lives === 1 ? 'var(--neon-pink)' : 'var(--neon-cyan)', fontWeight: 'bold' }}>
                            {liveStats.lives}
                        </span>
                    </div>
                    <div className="progress-bar-v2">
                        <div
                            className="progress-fill-v2"
                            style={{ width: `${(((liveStats.level - 1) % 4 + 1) / 4) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="stat-group">
                    <span className="stat-label-v2">Score</span>
                    <p className="glow-text" style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>
                        {Math.floor(liveStats.score).toLocaleString()}
                    </p>
                </div>

                <div className="stat-group" style={{ marginTop: '2rem' }}>
                    <div className="glass-panel" style={{ background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
                            <Target size={20} color="var(--neon-pink)" />
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '1px' }}>Player Rank</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <span className="glow-text" style={{ color: 'var(--neon-pink)', fontSize: '1.4rem' }}>
                                {user.totalScore > 5000 ? "ELITE" : user.totalScore > 2000 ? "VETERAN" : "INITIATE"}
                            </span>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Points</span>
                                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{user.totalScore?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        );
    };

    return (
        <div className="app-container" style={{ position: 'relative' }}>
            <NexusBackground />
            
            {!user ? (
                <div className="main-content auth-view" style={{ zIndex: 1 }}>
                    {view === 'landing' && (
                        <LandingPage 
                            onPlayNow={() => setView('login')} 
                            onLogin={() => setView('login')} 
                            onRegister={() => setView('register')} 
                        />
                    )}
                    {view === 'register' && (
                        <Register
                            onRegister={() => setView('login')}
                            onSwitchToLogin={() => setView('login')}
                        />
                    )}
                    {view === 'login' && (
                        <Login
                            onLogin={handleLogin}
                            onSwitchToRegister={() => setView('register')}
                        />
                    )}
                </div>
            ) : (
                <>
                    {renderNavbar()}
                    {view === 'dashboard' && <Dashboard user={user} onStartGame={handleStartGame} />}
                    {view === 'leaderboard' && <Leaderboard user={user} />}
                    {view === 'profile' && <Profile user={user} onUpdateUser={setUser} />}
                    {view === 'game' && (() => {
                        // Determine the map index based on the player's level
                        // Each world has 4 levels
                        const currentLevel = user.highestLevel || 1;
                        let mapIndex = 0;
                        if (currentLevel > 12) mapIndex = 3;
                        else if (currentLevel > 8) mapIndex = 2;
                        else if (currentLevel > 4) mapIndex = 1;

                        const activeMap = user.maps?.[mapIndex] || (user.maps?.find(m => m.id === currentMap?.id) || currentMap);

                        return (
                            <div className="main-content animate-fade" style={{ maxWidth: '1400px' }}>
                                <div className="game-window-layout">
                                    <div className="game-main-area">
                                        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                                <h2 className="glow-text">{activeMap?.title || "Active Map"}</h2>
                                                <button className="secondary" onClick={() => setView('dashboard')}>Return to Dashboard</button>
                                            </div>
                                            <GameCanvas
                                                user={user}
                                                map={activeMap}
                                                difficulty={difficulty}
                                                onUpdateUser={(updated) => {
                                                    setUser(updated);
                                                    localStorage.setItem('puzzlePulseUser', JSON.stringify(updated));
                                                }}
                                                onBackToHome={() => setView('dashboard')}
                                                onStatsChange={setGameStats}
                                            />
                                        </div>
                                    </div>
                                    <GameDetailsPanel user={user} map={activeMap} difficulty={difficulty} liveStats={gameStats} />
                                </div>
                            </div>
                        );
                    })()}
                </>
            )}
        </div>
    );
}

export default App;
