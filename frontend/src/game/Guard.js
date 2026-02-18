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
        this.radius = 15;
        this.detectionRadius = 80;
    }

    update() {
        const target = this.path[this.targetIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            this.x = target.x;
            this.y = target.y;
            this.targetIndex = (this.targetIndex + 1) % this.path.length;
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    draw(ctx) {
        // Draw detection radius
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.detectionRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(233, 69, 96, 0.1)';
        ctx.fill();

        // Draw guard
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#e94560';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        // Direction indicator (small eye)
        ctx.beginPath();
        ctx.arc(this.x + 5, this.y - 5, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
    }

    checkDetection(playerX, playerY) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.detectionRadius;
    }
}

export default Guard;
