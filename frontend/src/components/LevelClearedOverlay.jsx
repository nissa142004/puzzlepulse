import React from 'react';

const LevelClearedOverlay = ({ themeColor, level, onProceed }) => {
    return (
        <div className="overlay animate-fade" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderTop: `4px solid ${themeColor}` }}>
                <h2 className="glow-text" style={{ color: themeColor, fontSize: '2.5rem' }}>
                    {(level % 4 === 0) ? "WORLD COMPLETED" : "LEVEL CLEARED"}
                </h2>
                <p style={{ margin: '1rem 0', color: 'var(--text-dim)' }}>
                    {(level % 4 === 0)
                        ? "You've successfully cleared this world. Get ready for the next challenge!"
                        : "Great job! Level cleared. Transitioning to the next one."}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <button className="primary" onClick={onProceed}>PROCEED</button>
                </div>
            </div>
        </div>
    );
};

export default LevelClearedOverlay;
