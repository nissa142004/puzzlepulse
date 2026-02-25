import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Trophy, Award, Target, Zap, Users, Activity, Shield } from 'lucide-react';

const PremiumLeaderboardCard = ({ player, rank, isCurrentUser }) => {
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((e.clientY - rect.top - centerY) / centerY) * 10;
        const rotateY = ((e.clientX - rect.left - centerX) / centerX) * -10;
        setTilt({ x: rotateX, y: rotateY });
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy size={48} color="var(--neon-cyan)" className="pulse-cyan" />;
        if (rank === 2) return <Award size={40} color="var(--neon-pink)" />;
        if (rank === 3) return <Award size={40} color="var(--neon-purple)" />;
        return <Zap size={20} />;
    };

    const cardClass = `premium-rank-card rank-card-${rank} ${isCurrentUser ? 'pulse-cyan' : ''}`;

    return (
        <div
            ref={cardRef}
            className={cardClass}
            style={{
                transform: isHovering ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.05)` : 'scale(1)',
                zIndex: isHovering ? 10 : 1
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => { setIsHovering(false); setTilt({ x: 0, y: 0 }); }}
        >
            <div className="rank-badge">RANK #{rank}</div>
            <div style={{ marginBottom: '1.5rem' }}>
                {getRankIcon(rank)}
            </div>
            <h2 className="player-name" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                {player.username}
            </h2>
            {isCurrentUser && <div className="you-badge" style={{ margin: '0 auto 1rem', width: 'fit-content' }}>YOU</div>}

            <div className="card-stats" style={{ justifyContent: 'center', gap: '20px', marginTop: '1rem' }}>
                <div className="stat-box" style={{ alignItems: 'center' }}>
                    <span className="stat-label">SCORE</span>
                    <span className="stat-value highlight">{player.totalScore.toLocaleString()}</span>
                </div>
                <div className="stat-box" style={{ alignItems: 'center' }}>
                    <span className="stat-label">LEVEL</span>
                    <span className="stat-value">{player.highestLevel}</span>
                </div>
            </div>

            {isHovering && <div className="card-scanline"></div>}
        </div>
    );
};

const CompactLeaderboardItem = ({ player, rank, isCurrentUser }) => {
    return (
        <div className={`compact-leader-item ${isCurrentUser ? 'is-current' : ''}`}>
            <span className="mini-rank">#{rank}</span>
            <span className="mini-name">
                {player.username} {isCurrentUser && <span className="you-badge">YOU</span>}
            </span>
            <span className="mini-stat" style={{ color: 'var(--text-dim)' }}>
                LVL {player.highestLevel}
            </span>
            <span className="mini-stat highlight">
                {player.totalScore.toLocaleString()} XP
            </span>
        </div>
    );
};

function Leaderboard({ user }) {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const res = await axios.get('/api/leaderboard');
                setLeaders(res.data);
            } catch (err) {
                console.error('Failed to fetch leaderboard', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaders();
    }, []);

    return (
        <div className="main-content animate-fade leaderboard-container">
            <header className="leaderboard-header">
                <div>
                    <h1 className="glow-text" style={{ fontSize: '2.5rem' }}>Player Hall of Fame</h1>
                    <p className="subtitle">Real-time sync with player database</p>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div className="stat-box">
                        <span className="stat-label"><Activity size={12} inline /> ACTIVE PLAYERS</span>
                        <span className="stat-value">{leaders.length}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label"><Shield size={12} inline /> GLOBAL ACTIVITY</span>
                        <span className="stat-value" style={{ color: 'var(--neon-pink)' }}>LEVEL 5</span>
                    </div>
                </div>
            </header>

            {
                loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Scanning levels for top players...</p>
                    </div>
                ) : (
                    <>
                        <div className="top-leaders-row">
                            {leaders.slice(0, 3).map((player, index) => (
                                <PremiumLeaderboardCard
                                    key={player.username}
                                    player={player}
                                    rank={index + 1}
                                    isCurrentUser={user && player.username === user.username}
                                />
                            ))}
                        </div>

                        <div className="glass-panel" style={{ padding: '1rem' }}>
                            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                                <span>PLAYER IDENTIFIER</span>
                                <div style={{ display: 'flex', gap: '115px' }}>
                                    <span>PROGRESS</span>
                                    <span>TOTAL SCORE</span>
                                </div>
                            </div>
                            <div className="leaderboard-scroll-area">
                                {leaders.map((player, index) => (
                                    <CompactLeaderboardItem
                                        key={player.username}
                                        player={player}
                                        rank={index + 1}
                                        isCurrentUser={user && player.username === user.username}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )
            }

            <style>{`
                .leaderboard-container {
                    padding: 2rem;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .leaderboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 3rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding-bottom: 1.5rem;
                }
                .subtitle {
                    color: var(--text-dim);
                    font-size: 0.9rem;
                    margin-top: 0.5rem;
                    letter-spacing: 2px;
                }
                .stats-ping {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.7rem;
                    color: var(--neon-cyan);
                    letter-spacing: 1px;
                }
                .ping-dot {
                    width: 6px;
                    height: 6px;
                    background: var(--neon-cyan);
                    border-radius: 50%;
                    box-shadow: 0 0 10px var(--neon-cyan);
                    animation: pulse 1.5s infinite;
                }
                .leaders-grid {
                    display: grid;
                    gap: 1.5rem;
                    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
                }
                .leaderboard-card {
                    position: relative;
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    overflow: hidden;
                }
                .rank-badge {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: rgba(var(--neon-rgb), 0.2);
                    padding: 4px 12px;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.8rem;
                    color: rgba(var(--neon-rgb), 1);
                    border-bottom-left-radius: 8px;
                }
                .card-identity {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .icon-wrapper {
                    width: 50px;
                    height: 50px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .operative-info {
                    display: flex;
                    flex-direction: column;
                }
                .operative-label {
                    font-size: 0.6rem;
                    color: var(--text-dim);
                    letter-spacing: 2px;
                }
                .operative-name {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.2rem;
                    color: #fff;
                    letter-spacing: 1px;
                }
                .card-stats {
                    display: flex;
                    gap: 30px;
                }
                .stat-box {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }
                .stat-label {
                    font-size: 0.6rem;
                    color: var(--text-dim);
                    letter-spacing: 1px;
                }
                .stat-value {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1rem;
                    color: #fff;
                }
                .stat-value.highlight {
                    color: var(--neon-cyan);
                }
                .card-scanline {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(to bottom, transparent 50%, rgba(var(--neon-rgb), 0.05) 50%);
                    background-size: 100% 4px;
                    pointer-events: none;
                    animation: scan 2s linear infinite;
                }
                @keyframes scan {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(100%); }
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.3; }
                    100% { opacity: 1; }
                }
                .loading-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 4rem;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(var(--neon-cyan-rgb), 0.1);
                    border-top-color: var(--neon-cyan);
                    border-radius: 50%;
                    margin: 0 auto 1.5rem;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .you-badge {
                    background: var(--neon-cyan);
                    color: #000;
                    font-size: 0.6rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    vertical-align: middle;
                    margin-left: 10px;
                    font-weight: 800;
                    box-shadow: 0 0 10px var(--neon-cyan);
                }
            `}</style>
        </div >
    );
}

export default Leaderboard;
