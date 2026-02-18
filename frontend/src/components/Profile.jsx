import React, { useState } from 'react';
import axios from 'axios';

function Profile({ user, onUpdateUser }) {
    const [bio, setBio] = useState(user.bio || '');
    const [email, setEmail] = useState(user.email || '');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const res = await axios.put(`/api/player/${user.username}`, { bio, email });
            onUpdateUser(res.data);
            localStorage.setItem('puzzlePulseUser', JSON.stringify(res.data));
            setMessage('Profile updated successfully.');
            setEditing(false);
        } catch (err) {
            console.error(err);
            setMessage('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="main-content animate-fade">
            <h1 className="glow-text">Operative Profile</h1>

            <div className="dashboard-grid">
                <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>{user.username}</h2>
                        <button className="secondary" onClick={() => setEditing(!editing)}>
                            {editing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        {editing ? (
                            <form onSubmit={handleUpdate}>
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="operative@network.com"
                                />
                                <label>Mission Bio</label>
                                <textarea
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        minHeight: '100px',
                                        marginBottom: '1rem',
                                        fontFamily: 'inherit'
                                    }}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about your stealth expertise..."
                                />
                                <button type="submit" className="primary" disabled={saving}>
                                    {saving ? 'Syncing...' : 'Save Changes'}
                                </button>
                            </form>
                        ) : (
                            <div>
                                <p style={{ color: 'var(--text-dim)', marginBottom: '1rem' }}>{user.email || 'No email associated.'}</p>
                                <p style={{ color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{user.bio || 'No bio available. Operative chooses to remain mysterious.'}</p>
                            </div>
                        )}
                        {message && <p style={{ marginTop: '1rem', color: message.includes('success') ? '#4caf50' : '#e94560' }}>{message}</p>}
                    </div>
                </div>

                <div className="glass-panel">
                    <h3>Detailed Stats</h3>
                    <ul style={{ listStyle: 'none', marginTop: '1.5rem' }}>
                        <li style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--border)' }}>
                            Total Score: <span className="glow-text" style={{ float: 'right' }}>{user.totalScore}</span>
                        </li>
                        <li style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--border)' }}>
                            Max Level: <span className="glow-text" style={{ float: 'right' }}>{user.highestLevel}</span>
                        </li>
                        <li style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--border)' }}>
                            Puzzles Tried: <span className="glow-text" style={{ float: 'right' }}>{user.totalSolved}</span>
                        </li>
                        <li style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--border)' }}>
                            Success Rate: <span className="glow-text" style={{ float: 'right' }}>{Math.round(user.accuracy)}%</span>
                        </li>
                        <li style={{ padding: '0.8rem 0' }}>
                            Operative Since: <span className="glow-text" style={{ float: 'right' }}>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Profile;
