import React, { useState, useEffect } from 'react';
import { Shield, Target } from 'lucide-react';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';

import FloatingLines from './components/FloatingLines';
import NexusBackground from './components/NexusBackground';

/**
 * Main App component.
 * Demonstrates theme: Virtual Identity (Username persistence).
 */
function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('login'); // 'login', 'register', 'dashboard', 'game', 'leaderboard', 'profile'
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
        setView('login');
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
                <button className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')} style={{ background: 'none', border: 'none' }}>Deck Hub</button>
                <button className={`nav-link ${view === 'game' ? 'active' : ''}`} onClick={() => setView('game')} disabled={!currentMap} style={{ background: 'none', border: 'none', opacity: currentMap ? 1 : 0.4 }}>Active Mission</button>
                <button className={`nav-link ${view === 'leaderboard' ? 'active' : ''}`} onClick={() => setView('leaderboard')} style={{ background: 'none', border: 'none' }}>Mission Logs</button>
                <button className={`nav-link ${view === 'profile' ? 'active' : ''}`} onClick={() => setView('profile')} style={{ background: 'none', border: 'none' }}>Operative</button>
            </div>
            <button onClick={handleLogout} className="secondary" style={{ padding: '0.4rem 1rem' }}>Exit</button>
        </nav>
    );

    const GameDetailsPanel = ({ user, map, difficulty, liveStats }) => {
        const sectorDescriptions = {
            map1: "The outermost layer of the station. Security is light, but the exposure to vacuum makes every move critical. Objective: Gain initial access to the internal network.",
            map2: "The heart of the ship's propulsion. High-energy conduits and intense heat make this sector a labyrinth of hazards. Objective: Synchronize with the core stabilizers.",
            map3: "Where the forbidden experiments take place. Advanced AI protocols and sensor arrays are everywhere. Objective: Extract encrypted research data.",
            map4: "The brain of the facility. The AI's presence is absolute here. Objective: Establish total ship control and initiate synchronization."
        };

        const description = sectorDescriptions[map?.id] || "No sector data available.";

        return (
            <aside className="game-side-panel glass-panel animate-fade">
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <h3 className="glow-text" style={{ fontSize: '1.5rem', marginBottom: '0.8rem' }}>{map?.title || "Unknown Sector"}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Shield size={16} color="var(--neon-cyan)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Security: {difficulty.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="stat-group">
                    <span className="stat-label-v2">Mission Intel</span>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.5', marginTop: '0.5rem' }}>{description}</p>
                </div>

                <div className="stat-group">
                    <span className="stat-label-v2">Sector Synchronization</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Floor / Mission</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>
                            {((liveStats.level - 1) % 4) + 1} / 4 (LV {liveStats.level})
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Hull Sync</span>
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
                    <span className="stat-label-v2">Sync Score</span>
                    <p className="glow-text" style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>
                        {Math.floor(liveStats.score).toLocaleString()}
                    </p>
                </div>

                <div className="stat-group" style={{ marginTop: '2rem' }}>
                    <div className="glass-panel" style={{ background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
                            <Target size={20} color="var(--neon-pink)" />
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '1px' }}>Operative Rank</span>
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
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, opacity: 0.6 }}>
                <FloatingLines
                    enabledWaves={["top", "middle", "bottom"]}
                    lineCount={12}
                    lineDistance={15}
                    bendRadius={200}
                    bendStrength={-0.4}
                    interactive={true}
                    parallax={true}
                />
            </div>

            {!user ? (
                <div className="main-content" style={{ zIndex: 1 }}>
                    <NexusBackground />
                    {view === 'register' ? (
                        <Register
                            onRegister={() => setView('login')}
                            onSwitchToLogin={() => setView('login')}
                        />
                    ) : (
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
                        // Dynamically determine the map based on the current mission level
                        // This ensures that completing Level 4 automatically shifts to Sector 2 visuals
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
                                                <button className="secondary" onClick={() => setView('dashboard')}>Return to Hub</button>
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
