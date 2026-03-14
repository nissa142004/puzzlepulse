import React from 'react';

const Landing = ({ onStart }) => {
    return (
        <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '100vw',
                    height: '100vh',
                    objectFit: 'cover',
                    transform: 'translate(-50%, -50%)',
                    zIndex: -2,
                    filter: 'brightness(1.0) contrast(1.5)' // Darken the video so text is readable
                }}
            >
                <source src="/audio/vg1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Overlay Gradient for better text readability */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, rgba(13, 17, 23, 0.4), rgba(13, 17, 23, 0.9))',
                zIndex: -1
            }} />

            {/* Main Content */}
            <div className="landing-container animate-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', zIndex: 10, padding: '0 2rem' }}>
                <div className="glass-panel" style={{ background: 'rgba(13, 17, 23, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 255, 242, 0.2)', padding: '4rem', borderRadius: '24px', maxWidth: '800px', width: '100%', transform: 'translateY(-5%)' }}>
                    <h1 className="glow-text title-large" style={{ fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', marginBottom: '1.5rem', letterSpacing: '4px', lineHeight: '1.1' }}>
                        PuzzlePulse
                    </h1>
                    <p style={{ color: 'var(--text)', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', marginBottom: '3.5rem', lineHeight: '1.6', opacity: 0.9, fontWeight: 300 }}>
                        A beautiful and engaging puzzle experience. Challenge your mind, conquer all levels, and climb the ranks of our global leaderboard.
                    </p>

                    <button
                        className="primary pulse-animation"
                        onClick={onStart}
                        style={{ fontSize: '1.3rem', padding: '1.2rem 4rem', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}
                    >
                        Enter Game
                    </button>
                </div>

                {/* Stats Row */}
                <div className="glass-panel" style={{ marginTop: '3rem', display: 'flex', gap: '4rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.5)', border: 'none', padding: '1.5rem 3rem', borderRadius: '100px', backdropFilter: 'blur(8px)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '2.5rem', color: 'var(--neon-cyan)', marginBottom: '0.2rem', fontWeight: 800 }}>15</span>
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Levels</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '2.5rem', color: 'var(--neon-pink)', marginBottom: '0.2rem', fontWeight: 800 }}>4</span>
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Stages</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '2.5rem', color: '#bc8cff', marginBottom: '0.2rem', fontWeight: 800 }}>1</span>
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Leaderboard</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
