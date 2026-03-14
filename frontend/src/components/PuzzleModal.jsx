import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * PuzzleModal Component.
 * Demonstrates theme: Interoperability (Calling backend that calls Heart API).
 */
function PuzzleModal({ onSolve, themeColor = 'var(--neon-cyan)' }) {
    const [puzzle, setPuzzle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answer, setAnswer] = useState('');
    const [timeLeft, setTimeLeft] = useState(15);

    useEffect(() => {
        fetchPuzzle();
    }, []);

    useEffect(() => {
        if (timeLeft > 0 && puzzle && !loading && !error) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !error && puzzle) {
            onSolve(false);
        }
    }, [timeLeft, puzzle, loading, error]);

    const fetchPuzzle = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await axios.get('/api/puzzle');
            setPuzzle(resp.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching puzzle:', err);
            setError('Neural Link Failure: Could not retrieve pulse pattern.');
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!puzzle) return;
        const isCorrect = parseInt(answer) === puzzle.solution;
        onSolve(isCorrect);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-fade" style={{ border: `1px solid ${themeColor}`, boxShadow: `0 0 20px ${themeColor}44` }}>
                <h3 className="glow-text" style={{ color: themeColor, textShadow: `0 0 10px ${themeColor}` }}>
                    SYSTEM INTRUSION DETECTED
                </h3>

                {error ? (
                    <div style={{ margin: '2rem 0' }}>
                        <p style={{ color: 'var(--neon-pink)', marginBottom: '1rem' }}>{error}</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="primary" onClick={fetchPuzzle} style={{ background: themeColor }}>RETRY LINK</button>
                            <button className="secondary" onClick={() => onSolve(false)}>ABORT MISSION</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p style={{ margin: '1rem 0', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                            Neural handshake required. Decipher pulse pattern.
                        </p>

                        {loading ? (
                            <div className="puzzle-area" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="pulse-animation" style={{ color: themeColor }}>INITIALIZING...</div>
                            </div>
                        ) : (
                            <div className="puzzle-area">
                                <img src={puzzle.questionImage} alt="Puzzle" style={{ width: '100%', borderRadius: '4px', filter: 'contrast(1.1) brightness(0.9)' }} />
                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ color: timeLeft < 5 ? 'var(--neon-pink)' : themeColor, fontWeight: 'bold' }}>
                                        T-MINUS: {timeLeft}s
                                    </div>
                                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="number"
                                            placeholder="?"
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            autoFocus
                                            className="mono-input"
                                            style={{ width: '60px', marginBottom: 0, padding: '0.5rem', textAlign: 'center', borderColor: themeColor }}
                                        />
                                        <button type="submit" className="primary" style={{ background: themeColor, padding: '0.5rem 1rem' }}>RE-SYNC</button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                    STATUS: {error ? 'LINK SEVERED' : (loading ? 'ESTABLISHING...' : 'BIO-AUTHENTICATION PENDING...')}
                </div>
            </div>
        </div>
    );
}

export default PuzzleModal;
