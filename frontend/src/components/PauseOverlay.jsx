import React from 'react';

const PauseOverlay = ({ themeColor, onResume, onBackToHome }) => {
    return (
        <div className="overlay animate-fade" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 100 }}>
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderTop: `4px solid ${themeColor}`, minWidth: '300px' }}>
                <h2 className="glow-text" style={{ color: themeColor, fontSize: '3rem', marginBottom: '2rem' }}>PAUSED</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                    <button className="primary pulse-animation" style={{ width: '200px' }} onClick={onResume}>RESUME</button>
                    <button className="secondary" style={{ width: '200px' }} onClick={onBackToHome}>QUIT TO DASHBOARD</button>
                </div>
            </div>
        </div>
    );
};

export default PauseOverlay;
