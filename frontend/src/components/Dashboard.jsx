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
                    setAvailableMaps(dbMaps.map((m, idx) => ({
                        ...m,
                        unlocked: idx === 0,
                        completed: false,
                        lastStage: idx * 5 + 1,
                        bestScore: 0
                    })));
                } else {
                    // Force Sector titles and progression logic even if DB/Local has old data
                    const sectorNames = ['Sector 1: Outer Hull', 'Sector 2: Engine Core', 'Sector 3: Research Lab', 'Sector 4: Command Deck'];
                    const merged = dbMaps.map((dbM, idx) => {
                        const userM = user.maps.find(um => um.id === dbM.id);

                        // Rule: Sector is unlocked if it's the first one OR the previous one is completed
                        const isUnlocked = idx === 0 || (idx > 0 && user.maps[idx - 1] && user.maps[idx - 1].completed);

                        return {
                            ...dbM,
                            title: sectorNames[idx] || dbM.title,
                            unlocked: isUnlocked,
                            completed: userM ? userM.completed : false,
                            lastStage: userM ? Math.max(userM.lastStage, idx * 4 + 1) : idx * 4 + 1,
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
        { id: 'map1', title: 'Sector 1: Outer Hull', unlocked: true, completed: false, lastStage: 1, bestScore: 0 },
        { id: 'map2', title: 'Sector 2: Engine Core', unlocked: false, completed: false, lastStage: 5, bestScore: 0 },
        { id: 'map3', title: 'Sector 3: Research Lab', unlocked: false, completed: false, lastStage: 9, bestScore: 0 },
        { id: 'map4', title: 'Sector 4: Command Deck', unlocked: false, completed: false, lastStage: 13, bestScore: 0 }
    ];

    const unlockedCount = availableMaps.filter(m => m.unlocked).length;
    const completionRate = Math.round((availableMaps.filter(m => m.completed).length / (availableMaps.length || 1)) * 100);

    return (
        <div className="main-content animate-fade">
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div>
                    <h1 className="glow-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Ship Deck Control</h1>
                    <p style={{ color: 'var(--text-dim)', letterSpacing: '1px' }}>
                        OPERATIVE: <strong style={{ color: 'var(--neon-cyan)' }}>{user.username}</strong> |
                        STATUS: <span style={{ color: '#00ff00' }}>CONNECTED</span>
                    </p>
                </div>
                <div className="hud-v2">
                    <div className="hud-item" style={{ borderLeft: '2px solid var(--neon-cyan)', paddingLeft: '1rem' }}>
                        <span className="hud-label">NEURAL SYNC</span>
                        <span className="hud-value">{user.totalScore?.toLocaleString() || 0}</span>
                    </div>
                    <div className="hud-item" style={{ borderLeft: '2px solid var(--neon-pink)', paddingLeft: '1rem' }}>
                        <span className="hud-label">PRECISION</span>
                        <span className="hud-value">{Math.round(user.accuracy || 0)}%</span>
                    </div>
                </div>
            </header>

            <section style={{ marginBottom: '4rem' }}>
                <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.1rem' }}>
                    <Shield size={20} color="var(--neon-cyan)" /> Infiltration Sectors
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
                    <BarChart3 size={20} color="var(--neon-pink)" /> Mission Analytics
                </h2>
                <div className="dashboard-grid" style={{ padding: '0' }}>
                    <AnalyticsWidget
                        title="Neural Pulse"
                        data={[45, 52, 48, 70, 65, 85, 92]}
                        color="var(--neon-cyan)"
                    />
                    <AnalyticsWidget
                        title="Infiltration Efficiency"
                        data={[30, 45, 60, 55, 75, 80, 95]}
                        color="var(--neon-pink)"
                    />
                    <AnalyticsWidget
                        title="Core Stability"
                        data={[80, 75, 82, 78, 85, 88, 90]}
                        color="#bc8cff"
                    />
                </div>
            </section>

            <div className="glass-panel" style={{ marginTop: '2rem', borderLeft: '5px solid var(--neon-cyan)', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 className="glow-text" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>MISSION BRIEFING</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', maxWidth: '800px' }}>
                            Choose an active sector. Complete 5 levels in each sector to unlock the next part of the ship.
                            Your mission is capped at 15 total synchronization levels.
                        </p>
                    </div>
                    <Terminal size={40} color="var(--border)" style={{ opacity: 0.5 }} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
