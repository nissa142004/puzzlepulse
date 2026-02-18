import React, { useState } from 'react';
import axios from 'axios';

/**
 * Login Component.
 * Demonstrates theme: Virtual Identity.
 */
function Login({ onLogin, onSwitchToRegister }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/auth/login', { username, password });
            onLogin(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid username or password.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container animate-fade">
            <div className="glass-panel">
                <h1 className="glow-text">PuzzlePulse</h1>
                <p style={{ marginBottom: '2rem', color: 'var(--text-dim)' }}>Secure access required for operative deployment.</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        autoFocus
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Authenticating...' : 'Enter Network'}
                    </button>
                </form>

                {error && <p style={{ color: 'var(--neon-pink)', marginTop: '1rem' }}>{error}</p>}

                <div style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
                    <p>New operative? <span onClick={onSwitchToRegister} style={{ color: 'var(--neon-cyan)', cursor: 'pointer', textDecoration: 'underline' }}>Request credentials</span></p>
                </div>
            </div>
        </div>
    );
}

export default Login;
