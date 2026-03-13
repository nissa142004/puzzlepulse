import React from 'react';

const MissionCompleteOverlay = ({ score }) => {
    return (
        <div className="mission-complete animate-fade" style={{ background: 'rgba(0,255,100,0.1)' }}>
            <div className="glass-panel" style={{ padding: '3rem', borderTop: '4px solid #00ff00', textAlign: 'center', background: 'rgba(0,0,0,0.8)' }}>
                <h2 className="glow-text" style={{ color: '#00ff00', fontSize: '3.5rem', marginBottom: '1rem' }}>GAME COMPLETED</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', marginBottom: '2rem' }}>Congratulations! You've solved all puzzles and completed the game.</p>
                <div className="hud-v2" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
                    <div className="hud-item" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <span className="hud-label">FINAL SCORE</span>
                        <span className="hud-value">{Math.floor(score).toLocaleString()}</span>
                    </div>
                </div>
                <button className="primary pulse-animation" onClick={() => window.location.reload()}>CONTINUE</button>
            </div>
        </div>
    );
};

export default MissionCompleteOverlay;
