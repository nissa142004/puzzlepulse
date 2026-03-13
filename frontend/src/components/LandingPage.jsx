import React from 'react';
import { Play, LogIn, UserPlus, Sparkles } from 'lucide-react';

const LandingPage = ({ onPlayNow, onLogin, onRegister }) => {
    return (
        <div className="landing-container animate-fade" style={{
            position: 'relative',
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem'
        }}>

            <div className="glass-panel pulse-animation" style={{
                maxWidth: '800px',
                padding: '4rem',
                zIndex: 1,
                border: '1px solid var(--neon-cyan)',
                background: 'rgba(13, 17, 23, 0.7)',
                backdropFilter: 'blur(20px)'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <Sparkles size={48} color="var(--neon-cyan)" style={{ marginBottom: '1rem' }} />
                    <h1 className="glow-text" style={{ fontSize: '4rem', marginBottom: '1rem', letterSpacing: '2px' }}>
                        PuzzlePulse
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.8' }}>
                        A modern, high-speed puzzle challenge. Test your logic, improve your speed, and climb the global leaderboard.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '3rem' }}>
                    <button className="primary" onClick={onPlayNow} style={{
                        fontSize: '1.2rem',
                        padding: '1rem 2.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <Play size={20} fill="currentColor" /> Play Game
                    </button>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="secondary" onClick={onLogin} style={{
                            padding: '1rem 2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <LogIn size={20} /> Login
                        </button>
                        <button className="secondary" onClick={onRegister} style={{
                            padding: '1rem 2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <UserPlus size={20} /> Sign Up
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '4rem', display: 'flex', gap: '3rem', justifyContent: 'center', opacity: 0.8 }}>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem', margin: '0' }}>16</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Levels</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ color: 'var(--neon-pink)', fontSize: '1.5rem', margin: '0' }}>∞</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Difficulty</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ color: 'var(--neon-purple)', fontSize: '1.5rem', margin: '0' }}>Live</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Leaderboard</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
