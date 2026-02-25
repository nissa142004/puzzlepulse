import React from 'react';

const GameHUD = ({ stats, currentTheme }) => {
    return (
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
        </div>
    );
};

export default GameHUD;
