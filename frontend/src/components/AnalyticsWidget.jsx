import React from 'react';

/**
 * AnalyticsWidget Component.
 * Displays tactical data visualization using animated SVGs.
 */
const AnalyticsWidget = ({ title, data, color = 'var(--neon-cyan)' }) => {
    // Generate SVG path for a pulse wave based on data
    const generatePath = (points) => {
        if (!points || points.length === 0) return '';
        const width = 300;
        const height = 100;
        const spacing = width / (points.length - 1);
        const max = Math.max(...points, 100);

        return points.reduce((path, val, i) => {
            const x = i * spacing;
            const y = height - (val / max) * height;
            return path + `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }, '');
    };

    const pathData = generatePath(data);

    return (
        <div className="glass-panel stat-card animate-fade" style={{ padding: '1rem', textAlign: 'left', minHeight: '200px' }}>
            <h3 className="glow-text" style={{ fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                {title}
            </h3>
            <div style={{ position: 'relative', height: '100px', width: '100%', overflow: 'hidden' }}>
                <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                    {/* Background Grid Lines */}
                    <line x1="0" y1="25" x2="300" y2="25" stroke="rgba(255,255,255,0.05)" />
                    <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.05)" />
                    <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(255,255,255,0.05)" />

                    {/* The Pulse Wave */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        className="pulse-path"
                        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
                    />

                    {/* Area under the curve */}
                    <path
                        d={`${pathData} L 300 100 L 0 100 Z`}
                        fill={`url(#gradient-${title.replace(/\s+/g, '-')})`}
                        style={{ opacity: 0.2 }}
                    />

                    <defs>
                        <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.7rem' }}>
                <div style={{ color: 'var(--text-dim)' }}>PREVIOUS SESSIONS</div>
                <div style={{ color: color, fontWeight: 'bold' }}>{data[data.length - 1]}% UNIT SYNC</div>
            </div>
        </div>
    );
};

export default AnalyticsWidget;
