import React from 'react';

const GameOverOverlay = ({ score }) => {
    return (
        <div className="game-over animate-fade" style={{ background: 'rgba(255,0,0,0.1)' }}>
            <h2 className="glow-text" style={{ color: 'var(--neon-pink)', fontSize: '3rem' }}>CONNECTION LOST</h2>
            <p style={{ margin: '1rem 0', fontSize: '1.2rem' }}>Game Over!</p>
            <p>Final Sync: {Math.floor(score)}</p>
            <button className="primary pulse-animation" onClick={() => window.location.reload()} style={{ marginTop: '2rem' }}>RE-ENGAGE</button>
        </div>
    );
};

export default GameOverOverlay;
