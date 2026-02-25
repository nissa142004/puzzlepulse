import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Terminal, Cpu, Zap, BarChart3, Target, Shield, ChevronRight } from 'lucide-react';
import MapCard from './MapCard';
import AnalyticsWidget from './AnalyticsWidget';

function Dashboard({ user, onStartGame }) {
    const [availableMaps, setAvailableMaps] = useState(user.maps || []);

    useEffect(() => {
        const fetchMaps = async () => {
            try {
                // If user already has map progress, we use that. 
                // However, we want to ensure any NEW global maps are visible.
                const response = await axios.get('/api/maps');
                const dbMaps = response.data;

                if (!user.maps || user.maps.length === 0) {
                    setAvailableMaps(dbMaps.map(m => ({
                        ...m,
                        unlocked: m.unlockedByDefault,
                        completed: false,
                        lastStage: 1,
                        bestScore: 0
                    })));
                } else {
                    // Update user maps with metadata from DB if needed, 
                    // while preserving user progress.
                    const merged = dbMaps.map(dbM => {
                        const userM = user.maps.find(um => um.id === dbM.id);
                        return {
                            ...dbM,
                            unlocked: userM ? userM.unlocked : dbM.unlockedByDefault,
                            completed: userM ? userM.completed : false,
                            lastStage: userM ? userM.lastStage : 1,
                            bestScore: userM ? userM.bestScore : 0
                        };
                    });
                    setAvailableMaps(merged);
                }
            } catch (error) {
                console.error('Error syncing maps with HQ:', error.message);
            }
        };

        fetchMaps();
    }, [user.maps]);

    const mapsToDisplay = availableMaps.length > 0 ? availableMaps : [
        { id: 'map1', title: 'Stage Alpha', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
        { id: 'map2', title: 'Escape Vault', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
        { id: 'map3', title: 'Complex Delta', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
        { id: 'map4', title: 'Main Core', unlocked: true, completed: false, lastStage: 1, bestScore: 0 }
    ];

    const unlockedCount = availableMaps.filter(m => m.unlocked).length;
    const completionRate = Math.round((availableMaps.filter(m => m.completed).length / availableMaps.length) * 100);

    return (
        <div className="main-content animate-fade">
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div>
                    <h1 className="glow-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Player Hub</h1>
                    <p style={{ color: 'var(--text-dim)', letterSpacing: '1px' }}>
                        PLAYER: <strong style={{ color: 'var(--neon-cyan)' }}>{user.username}</strong> |
                        STATUS: <span style={{ color: '#00ff00' }}>ONLINE</span>
                    </p>
                </div>
                <div className="hud-v2">
                    <div className="hud-item" style={{ borderLeft: '2px solid var(--neon-cyan)', paddingLeft: '1rem' }}>
                        <span className="hud-label">TOTAL SYNC</span>
                        <span className="hud-value">{user.totalScore?.toLocaleString() || 0}</span>
                    </div>
                    <div className="hud-item" style={{ borderLeft: '2px solid var(--neon-pink)', paddingLeft: '1rem' }}>
                        <span className="hud-label">ACCURACY</span>
                        <span className="hud-value">{Math.round(user.accuracy || 0)}%</span>
                    </div>
                </div>
            </header>

            <section style={{ marginBottom: '4rem' }}>
                <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.1rem' }}>
                    <Shield size={20} color="var(--neon-cyan)" /> Select Stage
                </h2>
                <div className="map-selection" style={{ padding: '0.5rem 0' }}>
                    {mapsToDisplay.map(m => (
                        <MapCard
                            key={m.id}
                            map={m}
                            onDeploy={(map, difficulty) => onStartGame(map, difficulty)}
                        />
                    ))}
                </div>
            </section>

            <section style={{ marginBottom: '4rem' }}>
                <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.1rem' }}>
                    <BarChart3 size={20} color="var(--neon-pink)" /> Game Analytics
                </h2>
                <div className="dashboard-grid" style={{ padding: '0' }}>
                    <AnalyticsWidget
                        title="Neural Accuracy"
                        data={[45, 52, 48, 70, 65, 85, 92]}
                        color="var(--neon-cyan)"
                    />
                    <AnalyticsWidget
                        title="Infiltration Speed"
                        data={[30, 45, 60, 55, 75, 80, 95]}
                        color="var(--neon-pink)"
                    />
                    <AnalyticsWidget
                        title="Stability Index"
                        data={[80, 75, 82, 78, 85, 88, 90]}
                        color="#bc8cff"
                    />
                </div>
            </section>

            <div className="glass-panel" style={{ marginTop: '2rem', borderLeft: '5px solid var(--neon-cyan)', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 className="glow-text" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>PLAYER BRIEFING</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', maxWidth: '800px' }}>
                            Choose a stage and start playing. Higher difficulties award more points but have stricter rules.
                            Synchronize your score with HQ to see your rank.
                        </p>
                    </div>
                    <Terminal size={40} color="var(--border)" style={{ opacity: 0.5 }} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
