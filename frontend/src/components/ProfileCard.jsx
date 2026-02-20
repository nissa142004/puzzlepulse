import React, { useState, useRef, useEffect } from 'react';

/**
 * ProfileCard Component.
 * Features a 3D tilt effect and high-tech "Operative" styling.
 * Props:
 * - user: User data object
 * - showUserInfo: (boolean) whether to show detailed stats
 * - enableMobileTilt: (boolean) enabled tilt on mobile (via orientation)
 */
const ProfileCard = ({ user, showUserInfo = true, enableMobileTilt = true }) => {
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate tilt (max 15 degrees)
        const tiltX = (y - centerY) / centerY * -15;
        const tiltY = (x - centerX) / centerX * 15;

        setTilt({ x: tiltX, y: tiltY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
        setIsHovering(false);
        setTilt({ x: 0, y: 0 });
    };

    useEffect(() => {
        // Mobile tilt disabled when not hovering to keep card "normal" by default
        if (enableMobileTilt && isHovering && window.DeviceOrientationEvent) {
            const handleOrientation = (e) => {
                const { beta, gamma } = e;
                setTilt({ x: (beta - 45) * 0.5, y: gamma * 0.5 });
            };
            window.addEventListener('deviceorientation', handleOrientation);
            return () => window.removeEventListener('deviceorientation', handleOrientation);
        }
    }, [enableMobileTilt, isHovering]);

    const cardStyle = {
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovering ? 1.05 : 1})`,
        transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        background: isHovering ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${isHovering ? 'rgba(0, 255, 242, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
        borderRadius: '16px',
        padding: '2rem',
        color: '#fff',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isHovering
            ? '0 30px 60px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 255, 242, 0.3)'
            : '0 10px 30px rgba(0, 0, 0, 0.2)',
    };

    const reflectionStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at ${isHovering ? 'var(--mouse-x)' : '50%'} ${isHovering ? 'var(--mouse-y)' : '50%'}, rgba(255, 255, 255, 0.1) 0%, transparent 80%)`,
        pointerEvents: 'none',
    };

    return (
        <div
            ref={cardRef}
            style={cardStyle}
            onMouseMove={(e) => {
                handleMouseMove(e);
                const rect = cardRef.current.getBoundingClientRect();
                cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div style={reflectionStyle} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, var(--neon-cyan), var(--neon-purple))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        boxShadow: '0 0 15px var(--neon-cyan)'
                    }}>
                        {user.username?.[0].toUpperCase() || 'O'}
                    </div>
                    <div>
                        <h2 className="glow-text" style={{ margin: 0, fontSize: '1.8rem' }}>{user.username}</h2>
                        <p style={{ color: 'var(--text-dim)', margin: 0, fontSize: '0.9rem' }}>STATUS: ACTIVE OPERATIVE</p>
                    </div>
                </div>

                {showUserInfo && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="glass-panel" style={{ padding: '0.8rem', textAlign: 'center' }}>
                            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.7rem' }}>TOTAL SCORE</p>
                            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--neon-cyan)' }}>{user.totalScore || 0}</p>
                        </div>
                        <div className="glass-panel" style={{ padding: '0.8rem', textAlign: 'center' }}>
                            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.7rem' }}>CLEARANCE</p>
                            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--neon-purple)' }}>LVL {user.highestLevel || 1}</p>
                        </div>
                        <div className="glass-panel" style={{ padding: '0.8rem', textAlign: 'center' }}>
                            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.7rem' }}>ACCURACY</p>
                            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--neon-pink)' }}>{Math.round(user.accuracy || 0)}%</p>
                        </div>
                        <div className="glass-panel" style={{ padding: '0.8rem', textAlign: 'center' }}>
                            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.7rem' }}>MISSIONS</p>
                            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{user.totalSolved || 0}</p>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '1.5rem', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span>MAP PROGRESS:</span>
                        <span>{user.maps?.filter(m => m.unlocked)?.length || 0}/4</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                        <div style={{
                            width: `${((user.maps?.filter(m => m.unlocked)?.length || 0) / 4) * 100}%`,
                            height: '100%',
                            background: 'var(--neon-cyan)',
                            boxShadow: '0 0 10px var(--neon-cyan)'
                        }} />
                    </div>
                    <p style={{ marginTop: '1rem', opacity: 0.6 }}>OPERATIVE SINCE: {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
