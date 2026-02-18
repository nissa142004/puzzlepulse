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
                    <h1 className="glow-text">Map Selection</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Operative: <strong>{user.username}</strong> | Readiness: 100%</p>
                </div>
                <div className="hud-v2">
                    <div className="hud-item">
                        <span className="hud-label">Global Score</span>
                        <span className="hud-value">{user.totalScore || 0}</span>
                    </div>
                    <div className="hud-item">
                        <span className="hud-label">Sync Accuracy</span>
                        <span className="hud-value">{Math.round(user.accuracy || 0)}%</span>
                    </div>
                </div>
            </header>

            <section>
                <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--neon-cyan)' }}>▶</span> AVAILABLE MAPS
                </h2>
                <div className="map-selection">
                    {mapsToDisplay.map(m => (
                        <MapCard
                            key={m.id}
                            map={m}
                            onDeploy={(map, difficulty) => onStartGame(map, difficulty)}
                        />
                    ))}
                </div>
            </section>

            <section style={{ marginTop: '3rem' }}>
                <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--neon-pink)' }}>▶</span> TACTICAL ANALYTICS
                </h2>
                <div className="dashboard-grid">
                    <AnalyticsWidget
                        title="Neural Sync Integrity"
                        data={[45, 52, 48, 70, 65, 85, 92]}
                        color="var(--neon-cyan)"
                    />
                    <AnalyticsWidget
                        title="Sector Infiltration Speed"
                        data={[30, 45, 60, 55, 75, 80, 95]}
                        color="var(--neon-pink)"
                    />
                    <AnalyticsWidget
                        title="Pulse Stability Index"
                        data={[80, 75, 82, 78, 85, 88, 90]}
                        color="#bc8cff"
                    />
                </div>
            </section>

            <div className="glass-panel" style={{ marginTop: '3rem', borderLeft: '4px solid var(--neon-cyan)' }}>
                <h3 className="glow-text">System Status</h3>
                <p style={{ marginTop: '0.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    Welcome to the neural mapping interface. Select a sector and choose your tactical difficulty to continue your progress.
                </p>
            </div>
        </div>
    );
}

export default Dashboard;
