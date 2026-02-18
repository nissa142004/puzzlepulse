import React, { useState } from 'react';
import axios from 'axios';

/**
 * Register Component.
 * Allows new players to create an account.
 */
function Register({ onRegister, onSwitchToLogin }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Username and password are required');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post('/api/auth/register', { username, password, email });
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to register. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container animate-fade">
            <div className="glass-panel">
                <h1 className="glow-text">Recruitment</h1>
                <p style={{ marginBottom: '2rem', color: 'var(--text-dim)' }}>Enter the shadows. Join the PuzzlePulse collective.</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Operative Name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        autoFocus
                    />
                    <input
                        type="email"
                        placeholder="Secure Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="Encryption Key"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Initializing...' : 'Join Collective'}
                    </button>
                </form>

                {error && <p style={{ color: 'var(--neon-pink)', marginTop: '1rem' }}>{error}</p>}
                {success && <p style={{ color: 'var(--neon-cyan)', marginTop: '1rem' }}>{success}</p>}

                <div style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
                    <p>Known operative? <span onClick={onSwitchToLogin} style={{ color: 'var(--neon-cyan)', cursor: 'pointer', textDecoration: 'underline' }}>Return to terminal</span></p>
                </div>
            </div>
        </div>
    );
}

export default Register;
