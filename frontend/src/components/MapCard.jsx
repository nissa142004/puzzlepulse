import React, { useState, useRef } from 'react';

function MapCard({ map, onDeploy }) {
    const [difficulty, setDifficulty] = useState('medium');
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const cardRef = useRef(null);
    const isLocked = !map.unlocked;

    const difficultyColors = {
        easy: '#00ff88',
        medium: '#ffea00',
        hard: '#ff4400'
    };

    const handleMouseMove = (e) => {
        if (!cardRef.current || isLocked) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const tiltX = (y - centerY) / centerY * -10;
        const tiltY = (x - centerX) / centerX * 10;
        setTilt({ x: tiltX, y: tiltY });
    };

    const cardStyle = {
        transform: isHovering && !isLocked
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.05)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: isHovering ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        boxShadow: isHovering && !isLocked ? '0 20px 40px rgba(0,0,0,0.4), 0 0 15px var(--neon-cyan)' : '0 10px 20px rgba(0,0,0,0.2)',
        borderColor: isHovering && !isLocked ? 'var(--neon-cyan)' : 'var(--border)'
    };

    return (
        <div
            ref={cardRef}
            className={`glass-panel map-card ${isLocked ? 'locked' : ''} animate-fade`}
            style={cardStyle}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => { setIsHovering(false); setTilt({ x: 0, y: 0 }); }}
        >
            <div className="map-badge" style={{ color: isLocked ? '#888' : 'var(--neon-cyan)' }}>
                {isLocked ? 'LOCKED' : 'READY'}
            </div>

            <div>
                <h3 className={!isLocked ? 'glow-text' : ''}>{map.title}</h3>
                <p style={{ fontSize: '0.7rem', color: 'var(--neon-cyan)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    FLOORS {map.id === 'map1' ? '1-4' : map.id === 'map2' ? '5-8' : map.id === 'map3' ? '9-12' : '13-16'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                    {isLocked ? 'Complete previous sector to unlock access.' : 'Select difficulty and begin infiltration.'}
                </p>

                {!isLocked && (
                    <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                            {['easy', 'medium', 'hard'].map(d => (
                                <button
                                    key={d}
                                    onClick={(e) => { e.stopPropagation(); setDifficulty(d); }}
                                    style={{
                                        padding: '4px 6px',
                                        fontSize: '0.6rem',
                                        background: difficulty === d ? difficultyColors[d] : 'rgba(255,255,255,0.05)',
                                        color: difficulty === d ? '#000' : '#fff',
                                        border: `1px solid ${difficulty === d ? difficultyColors[d] : 'var(--border)'}`,
                                        borderRadius: '4px',
                                        textTransform: 'uppercase',
                                        fontWeight: 'bold',
                                        flex: 1
                                    }}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '0.2rem', color: 'var(--text-dim)' }}>Progress</p>
                    <p className="glow-text" style={{ fontSize: '0.9rem', color: map.completed ? 'var(--neon-cyan)' : 'white' }}>
                        {map.completed ? 'COMPLETED' : `STAGE ${map.lastStage || 1}`}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '0.2rem', color: 'var(--text-dim)' }}>Best</p>
                    <p className="glow-text" style={{ fontSize: '0.9rem' }}>{map.bestScore || 0}</p>
                </div>
            </div>

            <button
                className={isLocked ? 'secondary' : 'primary pulse-animation'}
                disabled={isLocked}
                onClick={() => onDeploy(map, difficulty)}
                style={{ width: '100%', marginTop: '1.5rem', py: '0.5rem' }}
            >
                {isLocked ? 'LOCKED' : 'PLAY'}
            </button>

            {isLocked && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '2rem', opacity: 0.3 }}>
                    🔒
                </div>
            )}
        </div>
    );
}

export default MapCard;
