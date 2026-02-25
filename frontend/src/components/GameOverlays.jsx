import React from 'react';

const GameOverlays = ({ gameState, stats, currentTheme, onProceed }) => {
    const handleReload = () => window.location.reload();

    if (gameState === 'gameOver') {
        return (
            <div className="game-over animate-fade" style={{ background: 'rgba(255,0,0,0.1)' }}>
                <h2 className="glow-text" style={{ color: 'var(--neon-pink)', fontSize: '3rem' }}>CONNECTION LOST</h2>
                <p style={{ margin: '1rem 0', fontSize: '1.2rem' }}>You were detected by security scans! Mission aborted.</p>
                <p>Final Sync: {Math.floor(stats.score)}</p>
                <button className="primary pulse-animation" onClick={handleReload} style={{ marginTop: '2rem' }}>RE-ENGAGE</button>
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
                    <button className="primary pulse-animation" onClick={handleReload}>RETURN TO DECK</button>
                </div>
            </div>
        );
    }

    if (gameState === 'levelCleared') {
        return (
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
                        <button className="primary" onClick={onProceed}>PROCEED</button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default GameOverlays;
