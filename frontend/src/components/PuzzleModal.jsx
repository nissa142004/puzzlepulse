import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * PuzzleModal Component.
 * Demonstrates theme: Interoperability (Calling backend that calls Heart API).
 */
function PuzzleModal({ onSolve }) {
    const [puzzle, setPuzzle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answer, setAnswer] = useState('');
    const [timeLeft, setTimeLeft] = useState(10);

    useEffect(() => {
        fetchPuzzle();
    }, []);

    useEffect(() => {
        if (timeLeft > 0 && puzzle) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            onSolve(false); // Time out counts as incorrect
        }
    }, [timeLeft, puzzle]);

    const fetchPuzzle = async () => {
        try {
            const resp = await axios.get('/api/puzzle');
            setPuzzle(resp.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching puzzle:', err);
            onSolve(false);
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
            <div className="modal-content">
                <h3>🚨 DETECTED! 🚨</h3>
                <p>Solve this puzzle to escape! Time: <strong>{timeLeft}s</strong></p>

                {loading ? (
                    <p>Loading puzzle...</p>
                ) : (
                    <div className="puzzle-area">
                        <img src={puzzle.questionImage} alt="Puzzle" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                        <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
                            <input
                                type="number"
                                placeholder="Answer"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                autoFocus
                                style={{ width: '80px', marginRight: '10px' }}
                            />
                            <button type="submit" className="primary">Check</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PuzzleModal;
