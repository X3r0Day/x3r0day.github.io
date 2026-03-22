"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
}

interface GridNode {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    phase: number;
    amplitude: number;
}

export function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);
    const gridRef = useRef<GridNode[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = 0;
        let h = 0;

        const GRID_SPACING = 120;
        const PARTICLE_COUNT = 30;
        const CONNECTION_DIST = 140;
        const MOUSE_RADIUS = 180;

        const initGrid = () => {
            gridRef.current = [];
            const cols = Math.ceil(w / GRID_SPACING) + 1;
            const rows = Math.ceil(h / GRID_SPACING) + 1;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    gridRef.current.push({
                        x: c * GRID_SPACING,
                        y: r * GRID_SPACING,
                        baseX: c * GRID_SPACING,
                        baseY: r * GRID_SPACING,
                        phase: Math.random() * Math.PI * 2,
                        amplitude: 2 + Math.random() * 4,
                    });
                }
            }
        };

        const initParticles = () => {
            particlesRef.current = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particlesRef.current.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: 1 + Math.random() * 1.5,
                    opacity: 0.1 + Math.random() * 0.3,
                });
            }
        };

        const resize = () => {
            w = window.innerWidth;
            h = window.innerHeight;
            const dpr = Math.min(window.devicePixelRatio, 2);
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            initGrid();
            initParticles();
        };

        const onMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const drawGrid = (time: number) => {
            const cols = Math.ceil(w / GRID_SPACING) + 1;
            const nodes = gridRef.current;
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;

            ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
            ctx.lineWidth = 0.5;
            ctx.beginPath();

            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                const wave = Math.sin(time * 0.0005 + node.phase) * node.amplitude;
                const wave2 = Math.cos(time * 0.0003 + node.phase * 0.7) * node.amplitude * 0.5;
                node.x = node.baseX + wave;
                node.y = node.baseY + wave2;

                const dx = node.x - mx;
                const dy = node.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_RADIUS && dist > 0) {
                    const force = (1 - dist / MOUSE_RADIUS) * 15;
                    node.x += (dx / dist) * force;
                    node.y += (dy / dist) * force;
                }

                const col = i % cols;
                const row = Math.floor(i / cols);

                if (col < cols - 1) {
                    const right = nodes[i + 1];
                    if (right) {
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(right.x, right.y);
                    }
                }
                const below = nodes[i + cols];
                if (below && row < Math.floor(h / GRID_SPACING)) {
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(below.x, below.y);
                }
            }
            ctx.stroke();

            for (const node of nodes) {
                const dx = node.x - mx;
                const dy = node.y - my;
                const distSqr = dx * dx + dy * dy;
                const threshold = MOUSE_RADIUS * 1.5;
                if (distSqr < threshold * threshold) {
                    const dist = Math.sqrt(distSqr);
                    const alpha = (1 - dist / threshold) * 0.4;
                    ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        const drawParticles = (time: number) => {
            const particles = particlesRef.current;
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                const pulse = 0.5 + 0.5 * Math.sin(time * 0.001 + p.x * 0.01);
                ctx.fillStyle = `rgba(165, 140, 255, ${p.opacity * pulse})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const b = particles[j];
                    const dx = p.x - b.x;
                    const dy = p.y - b.y;
                    const distSqr = dx * dx + dy * dy;
                    if (distSqr < CONNECTION_DIST * CONNECTION_DIST) {
                        const dist = Math.sqrt(distSqr);
                        const alpha = (1 - dist / CONNECTION_DIST) * 0.08;
                        ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = (time: number) => {
            ctx.clearRect(0, 0, w, h);
            drawGrid(time);
            drawParticles(time);
            animationRef.current = requestAnimationFrame(animate);
        };

        let resizeTimer: NodeJS.Timeout;
        const debouncedResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 150);
        };

        resize();
        animationRef.current = requestAnimationFrame(animate);

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("resize", debouncedResize);

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("resize", debouncedResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed top-0 left-0 -z-10"
            style={{ width: "100%", height: "100%" }}
        />
    );
}
