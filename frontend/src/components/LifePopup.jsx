import React, { useEffect } from 'react';

function LifePopup({ lives, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="life-popup-overlay">
            <div className="glass-panel life-popup-content">
                <h1>MIS-PULSE DETECTED</h1>
                <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>SECURITY COUNTER-MEASURE ACTIVATED</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '2.5rem' }}>
                    {[...Array(3)].map((_, i) => (
                        <span key={i} style={{ filter: i < lives ? 'none' : 'grayscale(1) opacity(0.3)' }}>
                            ❤️
                        </span>
                    ))}
                </div>

                <p style={{ marginTop: '2rem', color: 'var(--neon-pink)', fontWeight: 'bold', letterSpacing: '2px' }}>
                    {lives} LIVES REMAINING
                </p>

                <p style={{ marginTop: '1rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    Auto-continuing in 2s...
                </p>
            </div>
        </div>
    );
}

export default LifePopup;
