// Game-wide constants and configuration
export const LEVEL_WALLS = {
    1: [{ x: 300, y: 0, w: 20, h: 250 }, { x: 500, y: 250, w: 20, h: 250 }],
    2: [{ x: 200, y: 50, w: 400, h: 20 }, { x: 200, y: 430, w: 400, h: 20 }],
    3: [{ x: 400, y: 50, w: 20, h: 400 }, { x: 100, y: 250, w: 150, h: 20 }, { x: 550, y: 250, w: 150, h: 20 }],
    4: [{ x: 150, y: 150, w: 100, h: 100 }, { x: 550, y: 150, w: 100, h: 100 }, { x: 350, y: 50, w: 100, h: 100 }, { x: 350, y: 350, w: 100, h: 100 }]
};

export const THEMES = {
    map1: { primary: '#00fff2', bg: '#0d1117', grid: 'rgba(0, 255, 242, 0.1)' },
    map2: { primary: '#ff007f', bg: '#1a0510', grid: 'rgba(255, 0, 127, 0.1)' },
    map3: { primary: '#bc8cff', bg: '#0f051a', grid: 'rgba(188, 140, 255, 0.1)' },
    map4: { primary: '#39ff14', bg: '#051a05', grid: 'rgba(57, 255, 20, 0.1)' }
};

export const DIFFICULTY_MULTIPLIERS = {
    easy: 0.4,
    medium: 0.8,
    hard: 1.3
};

export const PLAYER_SPEED = 6.5;
export const PLAYER_RADIUS = 12;
