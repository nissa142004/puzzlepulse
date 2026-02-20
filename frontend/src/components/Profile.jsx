import React, { useState } from 'react';
import axios from 'axios';

import ProfileCard from './ProfileCard';

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
            <h1 className="glow-text">Operative Status</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                {/* Left Side: Premium Card */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <ProfileCard user={user} showUserInfo={true} enableMobileTilt={true} />
                </div>

                {/* Right Side: Bio & Actions */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="glow-text">Mission Logistics</h3>
                        <button className="secondary" onClick={() => setEditing(!editing)}>
                            {editing ? 'Cancel' : 'Update Credentials'}
                        </button>
                    </div>

                    <div>
                        {editing ? (
                            <form onSubmit={handleUpdate} className="animate-fade">
                                <label style={{ color: 'var(--neon-cyan)', fontSize: '0.8rem' }}>ENCRYPTED EMAIL</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="operative@network.com"
                                    className="mono-input"
                                />
                                <label style={{ color: 'var(--neon-cyan)', fontSize: '0.8rem', marginTop: '1rem', display: 'block' }}>OPERATIVE BIO</label>
                                <textarea
                                    className="mono-input"
                                    style={{
                                        width: '100%',
                                        minHeight: '120px',
                                        marginTop: '0.5rem'
                                    }}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about your stealth expertise..."
                                />
                                <button type="submit" className="primary" style={{ width: '100%', marginTop: '1rem' }} disabled={saving}>
                                    {saving ? 'UPLOADING...' : 'COMMIT CHANGES'}
                                </button>
                            </form>
                        ) : (
                            <div className="animate-fade">
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Electronic Address</p>
                                    <p style={{ color: '#fff' }}>{user.email || 'UNSPECIFIED'}</p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Biography</p>
                                    <p style={{ color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                        {user.bio || 'No bio available. Operative chooses to remain mysterious.'}
                                    </p>
                                </div>
                            </div>
                        )}
                        {message && <p style={{ marginTop: '1rem', color: message.includes('success') ? 'var(--neon-cyan)' : 'var(--neon-pink)', fontSize: '0.9rem' }}>{message}</p>}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border)', fontSize: '0.7rem', opacity: 0.5 }}>
                        DANGER: ACCESSING LEVEL 4 CLEARANCE DATA. UNAUTHORIZED VIEWING IS PUNISHABLE BY LAW.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
