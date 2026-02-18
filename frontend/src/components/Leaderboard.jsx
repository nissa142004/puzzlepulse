import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
        <div className="main-content animate-fade">
            <h1 className="glow-text">Global Leaderboard</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Top operatives in the PuzzlePulse network.</p>

            <div className="glass-panel">
                {loading ? (
                    <p>Transmitting data...</p>
                ) : (
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Operative</th>
                                <th>Security Level</th>
                                <th>Total Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaders.map((player, index) => (
                                <tr key={player.username}>
                                    <td className={`rank-${index + 1}`}>{index + 1}</td>
                                    <td style={{ fontWeight: '600' }}>{player.username}</td>
                                    <td>{player.highestLevel}</td>
                                    <td className="glow-text">{player.totalScore}</td>
                                </tr>
                            ))}
                            {leaders.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No operatives found. Initialize the scan!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Leaderboard;
