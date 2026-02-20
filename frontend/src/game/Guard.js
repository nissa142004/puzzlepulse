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
        this.radius = 12;
        this.detectionRadius = 120; // Reduced for ease
        this.fov = (Math.PI / 180) * 70; // 70 degree field of view (reduced)
        this.angle = 0; // Current rotation angle
        this.state = 'moving'; // moving, waiting
        this.waitTime = 0;
        this.maxWaitTime = 20; // Fast patrolling
    }

    update() {
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
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
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

        // Draw guard body
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Guard Base
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#e94560';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#e94560';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        // High-tech Visor
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(5, -8, 10, 16);
        ctx.fillStyle = '#00fff2';
        ctx.fillRect(12, -4, 4, 8);

        ctx.restore();
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
