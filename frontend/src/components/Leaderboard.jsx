import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Trophy, Award, Target, Zap } from 'lucide-react';

const LeaderboardCard = ({ player, rank }) => {
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
        const rotateX = ((y - centerY) / centerY) * 10;
        const rotateY = ((x - centerX) / centerX) * -10;
        setTilt({ x: rotateX, y: rotateY });
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy size={24} color="var(--neon-cyan)" className="rank-icon platinum" />;
        if (rank === 2) return <Award size={24} color="var(--neon-pink)" className="rank-icon gold" />;
        if (rank === 3) return <Award size={24} color="#bc8cff" className="rank-icon silver" />;
        return <Zap size={20} color="var(--text-dim)" />;
    };

    const cardStyle = {
        transform: isHovering
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: isHovering ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        background: rank <= 3 ? `rgba(var(--neon-rgb), 0.1)` : 'rgba(255, 255, 255, 0.03)',
        borderLeft: `4px solid ${rank === 1 ? 'var(--neon-cyan)' : rank === 2 ? 'var(--neon-pink)' : rank === 3 ? '#bc8cff' : 'transparent'}`,
        boxShadow: isHovering ? `0 15px 35px rgba(0,0,0,0.4), 0 0 15px ${rank <= 3 ? 'var(--neon-cyan)' : 'transparent'}` : 'none'
    };

    const neonRgb = rank === 1 ? '0, 255, 242' : rank === 2 ? '255, 0, 127' : '188, 140, 255';

    return (
        <div
            ref={cardRef}
            className="leaderboard-card glass-panel"
            style={{ ...cardStyle, '--neon-rgb': neonRgb }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => { setIsHovering(false); setTilt({ x: 0, y: 0 }); }}
        >
            <div className="rank-badge">#{rank}</div>
            <div className="card-identity">
                <div className="icon-wrapper">
                    {getRankIcon(rank)}
                </div>
                <div className="operative-info">
                    <span className="operative-label">OPERATIVE</span>
                    <span className="operative-name">{player.username}</span>
                </div>
            </div>

            <div className="card-stats">
                <div className="stat-box">
                    <span className="stat-label">SECURITY LEVEL</span>
                    <span className="stat-value">{player.highestLevel}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">TOTAL SCORE</span>
                    <span className="stat-value highlight">{player.totalScore.toLocaleString()}</span>
                </div>
            </div>

            {isHovering && <div className="card-scanline"></div>}
        </div>
    );
};

function Leaderboard() {
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
                    <h1 className="glow-text">Network Rankings</h1>
                    <p className="subtitle">Real-time sync with operative database</p>
                </div>
                <div className="stats-ping">
                    <div className="ping-dot"></div>
                    <span>LINK ESTABLISHED</span>
                </div>
            </header>

            <div className="leaders-grid">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Scanning sectors for top operatives...</p>
                    </div>
                ) : (
                    <>
                        {leaders.length > 0 ? (
                            leaders.map((player, index) => (
                                <LeaderboardCard
                                    key={player.username}
                                    player={player}
                                    rank={index + 1}
                                />
                            ))
                        ) : (
                            <div className="empty-state glass-panel">
                                <Target size={48} color="var(--text-dim)" />
                                <p>No operatives found. Initialize the scan!</p>
                            </div>
                        )}
                    </>
                )}
            </div>

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
            `}</style>
        </div>
    );
}

export default Leaderboard;
