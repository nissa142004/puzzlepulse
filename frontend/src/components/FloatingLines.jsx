import React, { useRef, useEffect } from 'react';

/**
 * FloatingLines Component.
 * An animated, interactive background with multiple layers of flowing lines.
 */
const FloatingLines = ({
    enabledWaves = ["top", "middle", "bottom"],
    lineCount = 5,
    lineDistance = 5,
    bendRadius = 150,
    bendStrength = -0.5,
    interactive = true,
    parallax = true,
    colors = ["#00fff2", "#ff007f", "#bc8cff"]
}) => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        if (interactive) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        const waves = enabledWaves.map((wave, index) => {
            const counts = Array.isArray(lineCount) ? lineCount[index] : lineCount;
            const distances = Array.isArray(lineDistance) ? lineDistance[index] : lineDistance;
            const color = colors[index % colors.length];

            return {
                type: wave,
                counts,
                distances,
                color,
                offset: Math.random() * 1000,
                yBase: wave === 'top' ? 0.2 : (wave === 'middle' ? 0.5 : 0.8),
                speed: 0.001 + Math.random() * 0.002
            };
        });

        const render = (time) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            waves.forEach((wave) => {
                wave.offset += wave.speed;
                ctx.beginPath();
                ctx.strokeStyle = wave.color;
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.3;

                for (let i = 0; i < wave.counts; i++) {
                    const yPos = canvas.height * wave.yBase + (i - wave.counts / 2) * wave.distances;

                    ctx.beginPath();
                    for (let x = 0; x <= canvas.width; x += 20) {
                        let y = yPos + Math.sin(x * 0.002 + wave.offset + i * 0.1) * 30;

                        if (interactive) {
                            const dx = x - mouseRef.current.x;
                            const dy = y - mouseRef.current.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < bendRadius) {
                                const force = (1 - dist / bendRadius) * bendStrength * 100;
                                y += (dy / dist) * force;
                            }
                        }

                        if (parallax) {
                            const px = (mouseRef.current.x - canvas.width / 2) * (wave.yBase - 0.5) * 0.05;
                            const py = (mouseRef.current.y - canvas.height / 2) * (wave.yBase - 0.5) * 0.05;
                            y += py;
                        }

                        if (x === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render(0);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [enabledWaves, lineCount, lineDistance, bendRadius, bendStrength, interactive, parallax, colors]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: -1
            }}
        />
    );
};

export default FloatingLines;
