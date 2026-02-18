import React, { useState } from 'react';

function MapCard({ map, onDeploy }) {
    const [difficulty, setDifficulty] = useState('medium');
    const isLocked = !map.unlocked;

    const difficultyColors = {
        easy: '#00ff88',
        medium: '#ffea00',
        hard: '#ff4400'
    };

    return (
        <div className={`glass-panel map-card ${isLocked ? 'locked' : ''} animate-fade`}>
            <div className="map-badge" style={{ color: isLocked ? '#888' : 'var(--neon-cyan)' }}>
                {isLocked ? 'CLASSIFIED' : 'MAP ACTIVE'}
            </div>

            <div>
                <h3 className={!isLocked ? 'glow-text' : ''}>{map.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    {isLocked ? 'Complete previous map to unlock access.' : 'Select tactical difficulty and deploy.'}
                </p>
            </div>

            {!isLocked && (
                <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Difficulty</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['easy', 'medium', 'hard'].map(d => (
                            <button
                                key={d}
                                onClick={() => setDifficulty(d)}
                                style={{
                                    padding: '4px 8px',
                                    fontSize: '0.65rem',
                                    background: difficulty === d ? difficultyColors[d] : 'rgba(255,255,255,0.05)',
                                    color: difficulty === d ? '#000' : '#fff',
                                    border: `1px solid ${difficulty === d ? difficultyColors[d] : 'var(--border)'}`,
                                    borderRadius: '4px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    flex: 1
                                }}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem', color: 'var(--text-dim)' }}>Progress</p>
                    <p className="glow-text" style={{ fontSize: '1rem', color: map.completed ? 'var(--neon-cyan)' : 'white' }}>
                        {map.completed ? 'COMPLETED' : `SECTOR ${map.lastSector || 1}`}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem', color: 'var(--text-dim)' }}>Record</p>
                    <p className="glow-text" style={{ fontSize: '1rem' }}>{map.bestScore || 0}</p>
                </div>
            </div>

            <button
                className={isLocked ? 'secondary' : 'primary pulse-animation'}
                disabled={isLocked}
                onClick={() => onDeploy(map, difficulty)}
                style={{ width: '100%', marginTop: 'auto' }}
            >
                {isLocked ? 'LOCKED' : 'DEPLOY'}
            </button>

            {isLocked && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '2rem' }}>
                    🔒
                </div>
            )}
        </div>
    );
}

export default MapCard;
