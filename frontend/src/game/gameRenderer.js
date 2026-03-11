/**
 * Canvas rendering utilities for PuzzlePulse.
 */

export const drawBackground = (ctx, theme) => {
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, 800, 500);

    // Grid Background
    ctx.strokeStyle = theme.grid || 'rgba(0, 255, 242, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 800; i += 50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 500); ctx.stroke();
    }
    for (let j = 0; j < 500; j += 50) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(800, j); ctx.stroke();
    }
};

export const drawStartPad = (ctx, theme) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 0, 100, 500);
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 5, 90, 490);
    ctx.fillStyle = theme.primary;
    ctx.font = 'bold 10px monospace';
    ctx.fillText("ENTRY ZONE", 15, 20);
};

export const drawExitGate = (ctx, theme) => {
    const warpPulse = Math.sin(Date.now() * 0.005) * 5 + 10;
    const gradient = ctx.createLinearGradient(750, 0, 800, 0);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, theme.primary);
    ctx.fillStyle = gradient;
    ctx.fillRect(750, 0, 50, 500);

    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 500; i += 20) {
        ctx.moveTo(760 + warpPulse, i);
        ctx.lineTo(790, i + 10);
    }
    ctx.stroke();

    ctx.save();
    ctx.translate(785, 250);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = theme.primary;
    ctx.font = 'bold 12px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("EXIT GATE", 0, 0);
    ctx.restore();
};

export const drawWalls = (ctx, walls, theme) => {
    ctx.fillStyle = '#161b22';
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 2;
    for (const wall of walls) {
        ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
        ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);

        // Wall Glow Effect
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = theme.primary;
        ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
        ctx.restore();
    }
};

export const drawPlayer = (ctx, player, theme) => {
    ctx.save();
    ctx.translate(player.x, player.y);

    // Dynamic Breathing/Idle effect
    const breath = Math.sin(Date.now() * 0.005) * 2;

    // Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = theme.primary;

    // Head
    ctx.beginPath();
    ctx.arc(0, -15 + breath, 8, 0, Math.PI * 2);
    ctx.fillStyle = theme.primary;
    ctx.fill();

    // Body
    ctx.beginPath();
    // roundRect is supported in modern browsers, otherwise use arc/lineTo
    if (ctx.roundRect) {
        ctx.roundRect(-8, -7 + breath, 16, 18, 5);
    } else {
        ctx.rect(-8, -7 + breath, 16, 18);
    }
    ctx.fillStyle = theme.primary;
    ctx.fill();

    // Legs
    ctx.lineWidth = 4;
    ctx.strokeStyle = theme.primary;
    ctx.lineCap = 'round';

    // Left Leg
    ctx.beginPath();
    ctx.moveTo(-4, 11 + breath);
    ctx.lineTo(-6, 22);
    ctx.stroke();

    // Right Leg
    ctx.beginPath();
    ctx.moveTo(4, 11 + breath);
    ctx.lineTo(6, 22);
    ctx.stroke();

    // Visor/Eyes (Virtual Identity)
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(-5, -17 + breath, 10, 3);

    ctx.restore();
};
