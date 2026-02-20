import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapCard from './MapCard';
import AnalyticsWidget from './AnalyticsWidget';

function Dashboard({ user, onStartGame }) {
    const [availableMaps, setAvailableMaps] = useState(user.maps || []);

    useEffect(() => {
        const fetchMaps = async () => {
            try {
                // If user already has map progress, we use that. 
                // However, we want to ensure any NEW global maps are visible.
                const response = await axios.get('http://localhost:5000/api/maps');
                const dbMaps = response.data;

                if (!user.maps || user.maps.length === 0) {
                    setAvailableMaps(dbMaps.map(m => ({
                        ...m,
                        unlocked: m.unlockedByDefault,
                        completed: false,
                        lastSector: 1,
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
                            lastSector: userM ? userM.lastSector : 1,
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
        { id: 'map1', title: 'Sector Alpha', unlocked: true, completed: false, lastSector: 1, bestScore: 0 },
        { id: 'map2', title: 'Tactical Vault', unlocked: true, completed: false, lastSector: 1, bestScore: 0 },
        { id: 'map3', title: 'Delta Complex', unlocked: true, completed: false, lastSector: 1, bestScore: 0 },
        { id: 'map4', title: 'Neural Core', unlocked: true, completed: false, lastSector: 1, bestScore: 0 }
    ];

    return (
        <div className="main-content animate-fade">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="glow-text">Campaign Mode</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Player: <strong>{user.username}</strong> | Status: Ready</p>
                </div>
                <div className="hud-v2">
                    <div className="hud-item">
                        <span className="hud-label">Total Score</span>
                        <span className="hud-value">{user.totalScore || 0}</span>
                    </div>
                    <div className="hud-item">
                        <span className="hud-label">Accuracy</span>
                        <span className="hud-value">{Math.round(user.accuracy || 0)}%</span>
                    </div>
                </div>
            </header>

            <section>
                <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ color: 'var(--neon-cyan)', fontSize: '0.8rem' }}>▶</span> SELECT MISSION
                </h2>
                <div style={{ padding: '0 1rem' }}>
                    <div className="map-selection">
                        {mapsToDisplay.map(m => (
                            <MapCard
                                key={m.id}
                                map={m}
                                onDeploy={(map, difficulty) => onStartGame(map, difficulty)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ marginTop: '5rem' }}>
                <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ color: 'var(--neon-pink)', fontSize: '0.8rem' }}>▶</span> PLAYER PERFORMANCE
                </h2>
                <div className="dashboard-grid">
                    <AnalyticsWidget
                        title="Accuracy Level"
                        data={[45, 52, 48, 70, 65, 85, 92]}
                        color="var(--neon-cyan)"
                    />
                    <AnalyticsWidget
                        title="Average Speed"
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

            <div className="glass-panel" style={{ marginTop: '4rem', borderLeft: '4px solid var(--neon-cyan)' }}>
                <h3 className="glow-text">Mission Briefing</h3>
                <p style={{ marginTop: '0.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    Choose a sector and start a mission. Higher difficulties award more points but have stricter detection protocols.
                </p>
            </div>
        </div>
    );
}

export default Dashboard;
