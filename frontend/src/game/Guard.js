/**
 * Guard class for AI patrolling and detection.
 * Demonstrates theme: Software design principles (High cohesion).
 */
class Guard {
    constructor(x, y, path, speed = 2) {
        this.x = x;
        this.y = y;
        this.path = path; // Array of points [{x, y}]
        this.targetIndex = 0;
        this.speed = speed;
        this.radius = 14; // Slightly larger for sprite
        this.detectionRadius = 80;
        this.fov = (Math.PI / 180) * 45;
        this.angle = 0; // Current rotation angle
        this.state = 'moving'; // moving, waiting
        this.waitTime = 0;
        this.maxWaitTime = 20; // Fast patrolling
        this.stuckFrames = 0;
    }

    update(walls = []) {
        if (this.state === 'waiting') {
            this.waitTime--;
            if (this.waitTime <= 0) {
                this.state = 'moving';
                this.targetIndex = (this.targetIndex + 1) % this.path.length;
            }
            return;
        }

        const target = this.path[this.targetIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate angle based on movement direction
        if (distance > 1) {
            const targetAngle = Math.atan2(dy, dx);
            // Smoothly rotate towards target angle
            let angleDiff = targetAngle - this.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            this.angle += angleDiff * 0.1;
        }

        if (distance < this.speed) {
            this.x = target.x;
            this.y = target.y;
            this.state = 'waiting';
            this.waitTime = this.maxWaitTime;
        } else {
            const nextX = this.x + Math.cos(this.angle) * this.speed;
            const nextY = this.y + Math.sin(this.angle) * this.speed;

            // Simple wall collision for guards
            let canMoveX = true;
            let canMoveY = true;

            for (const wall of walls) {
                if (nextX + this.radius > wall.x && nextX - this.radius < wall.x + wall.w &&
                    this.y + this.radius > wall.y && this.y - this.radius < wall.y + wall.h) {
                    canMoveX = false;
                }
                if (this.x + this.radius > wall.x && this.x - this.radius < wall.x + wall.w &&
                    nextY + this.radius > wall.y && nextY - this.radius < wall.y + wall.h) {
                    canMoveY = false;
                }
            }

            if (canMoveX) this.x = nextX;
            if (canMoveY) this.y = nextY;

            // Stuck detection & Obstacle Avoidance
            if (!canMoveX || !canMoveY) {
                this.stuckFrames++;

                // If stuck for ~1 second (60 frames), skip to next target
                if (this.stuckFrames > 60) {
                    console.log("[Guard AI] Stuck detected. Recalculating path...");
                    this.state = 'waiting';
                    this.waitTime = 10; // Short wait before next target
                    this.stuckFrames = 0;
                }
            } else {
                this.stuckFrames = 0; // Reset if moving
            }

            // Reached point (proximal)
            if (distance < this.speed + 2) {
                this.x = target.x;
                this.y = target.y;
                this.state = 'waiting';
                this.waitTime = this.maxWaitTime;
                this.stuckFrames = 0;
            }
        }
    }

    draw(ctx) {
        // Draw vision cone
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.detectionRadius, this.angle - this.fov / 2, this.angle + this.fov / 2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(233, 69, 96, 0.15)';
        ctx.fill();

        // Glow effect for cone edges
        ctx.strokeStyle = 'rgba(233, 69, 96, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Draw guard body - "Little Man" Variant
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Guard Base (Shadow/Glow)
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#e94560';

        // Head
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2); // Rotated so 0,0 is center of mass/head area
        ctx.fillStyle = '#e94560';
        ctx.fill();

        // High-tech Tactical Visor (Glowing Cyan)
        ctx.fillStyle = '#00fff2';
        ctx.fillRect(5, -3, 5, 6);

        // Armor Shoulders/Body (Top-down perspective but humanoid)
        ctx.beginPath();
        ctx.roundRect(-10, -12, 12, 24, 4);
        ctx.fillStyle = '#e94560';
        ctx.fill();

        // Tactical Backpack/Battery
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-14, -6, 6, 12);

        ctx.restore();
    }

    reset() {
        if (this.path && this.path.length > 0) {
            this.x = this.path[0].x;
            this.y = this.path[0].y;
            this.targetIndex = 0;
            this.state = 'moving';
            this.waitTime = 0;
            this.stuckFrames = 0;
        }
    }

    checkDetection(playerX, playerY) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.detectionRadius) {
            const angleToPlayer = Math.atan2(dy, dx);
            let angleDiff = angleToPlayer - this.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

            // Only detect if within FOV or very close (proximity detection)
            if (Math.abs(angleDiff) < this.fov / 2 || distance < this.radius * 2) {
                return true;
            }
        }
        return false;
    }
}

export default Guard;
