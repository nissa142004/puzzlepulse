import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';

/**
 * Main App component.
 * Demonstrates theme: Virtual Identity (Username persistence).
 */
function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('login'); // 'login', 'register', 'dashboard', 'game', 'leaderboard', 'profile'
    const [currentMap, setCurrentMap] = useState(null);
    const [difficulty, setDifficulty] = useState('medium');

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
        <nav className="navbar">
            <div className="glow-text" style={{ fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setView('dashboard')}>
                PuzzlePulse
            </div>
            <div className="nav-links">
                <button className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')} style={{ background: 'none', border: 'none' }}>Dashboard</button>
                <button className={`nav-link ${view === 'game' ? 'active' : ''}`} onClick={() => setView('game')} disabled={!currentMap} style={{ background: 'none', border: 'none', opacity: currentMap ? 1 : 0.4 }}>Active Scan</button>
                <button className={`nav-link ${view === 'leaderboard' ? 'active' : ''}`} onClick={() => setView('leaderboard')} style={{ background: 'none', border: 'none' }}>Ranking</button>
                <button className={`nav-link ${view === 'profile' ? 'active' : ''}`} onClick={() => setView('profile')} style={{ background: 'none', border: 'none' }}>Operative</button>
            </div>
            <button onClick={handleLogout} className="secondary" style={{ padding: '0.4rem 1rem' }}>Exit</button>
        </nav>
    );

    return (
        <div className="app-container">
            {!user ? (
                <div className="main-content">
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
                    {view === 'leaderboard' && <Leaderboard />}
                    {view === 'profile' && <Profile user={user} onUpdateUser={setUser} />}
                    {view === 'game' && (() => {
                        const activeMap = user.maps?.find(m => m.id === currentMap?.id) || currentMap;
                        return (
                            <div className="main-content animate-fade">
                                <div className="glass-panel" style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                        <div>
                                            <h2 className="glow-text">{activeMap?.title || "Active Map"}</h2>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                                {activeMap?.completed ? 'Map Decoded - Deep Scanning Sectors...' : `Sector ${activeMap?.lastSector || 1} | Difficulty: ${difficulty}`}
                                            </p>
                                        </div>
                                        <button className="secondary" onClick={() => setView('dashboard')}>Return to Hub</button>
                                    </div>
                                    <GameCanvas user={user} map={activeMap} difficulty={difficulty} onUpdateUser={(updated) => {
                                        setUser(updated);
                                        localStorage.setItem('puzzlePulseUser', JSON.stringify(updated));
                                    }} />
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
