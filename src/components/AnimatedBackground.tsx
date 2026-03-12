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
    const scrollRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = 0;
        let h = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio, 2);
            w = window.innerWidth;
            h = document.documentElement.scrollHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.scale(dpr, dpr);
            initGrid();
            initParticles();
        };

        const GRID_SPACING = 80;
        const PARTICLE_COUNT = 60;
        const CONNECTION_DIST = 150;
        const MOUSE_RADIUS = 200;

        const initGrid = () => {
            gridRef.current = [];
            const cols = Math.ceil(w / GRID_SPACING) + 2;
            const rows = Math.ceil(h / GRID_SPACING) + 2;
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

        const onMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY + window.scrollY };
        };

        const onScroll = () => {
            scrollRef.current = window.scrollY;
            // Update mouse position relative to scroll
            mouseRef.current.y = mouseRef.current.y; // keeps last known
        };

        const drawGrid = (time: number) => {
            const cols = Math.ceil(w / GRID_SPACING) + 2;
            const nodes = gridRef.current;
            const scroll = scrollRef.current;
            const viewTop = scroll - 100;
            const viewBottom = scroll + window.innerHeight + 100;

            // Update node positions with wave
            for (const node of nodes) {
                // Only compute if near viewport
                if (node.baseY < viewTop - GRID_SPACING || node.baseY > viewBottom + GRID_SPACING) continue;

                const wave = Math.sin(time * 0.0005 + node.phase) * node.amplitude;
                const wave2 = Math.cos(time * 0.0003 + node.phase * 0.7) * node.amplitude * 0.5;
                node.x = node.baseX + wave;
                node.y = node.baseY + wave2;

                // Mouse repulsion
                const mx = mouseRef.current.x;
                const my = mouseRef.current.y;
                const dx = node.x - mx;
                const dy = node.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_RADIUS && dist > 0) {
                    const force = (1 - dist / MOUSE_RADIUS) * 15;
                    node.x += (dx / dist) * force;
                    node.y += (dy / dist) * force;
                }
            }

            // Draw grid lines
            ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
            ctx.lineWidth = 0.5;
            ctx.beginPath();

            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node.baseY < viewTop - GRID_SPACING || node.baseY > viewBottom + GRID_SPACING) continue;

                const col = i % cols;
                const row = Math.floor(i / cols);

                // Horizontal line
                if (col < cols - 1) {
                    const right = nodes[i + 1];
                    if (right) {
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(right.x, right.y);
                    }
                }
                // Vertical line
                const below = nodes[i + cols];
                if (below && row < Math.ceil(h / GRID_SPACING) + 1) {
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(below.x, below.y);
                }
            }
            ctx.stroke();

            // Draw intersection dots near mouse
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            for (const node of nodes) {
                if (node.baseY < viewTop || node.baseY > viewBottom) continue;
                const dx = node.x - mx;
                const dy = node.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_RADIUS * 1.5) {
                    const alpha = (1 - dist / (MOUSE_RADIUS * 1.5)) * 0.4;
                    ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        const drawParticles = (time: number) => {
            const particles = particlesRef.current;
            const scroll = scrollRef.current;
            const viewTop = scroll - 50;
            const viewBottom = scroll + window.innerHeight + 50;

            // Update positions
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;
            }

            // Draw connections between nearby particles in viewport
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                if (a.y < viewTop || a.y > viewBottom) continue;

                for (let j = i + 1; j < particles.length; j++) {
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        const alpha = (1 - dist / CONNECTION_DIST) * 0.08;
                        ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            // Draw particles
            for (const p of particles) {
                if (p.y < viewTop || p.y > viewBottom) continue;
                const pulse = 0.5 + 0.5 * Math.sin(time * 0.001 + p.x * 0.01);
                ctx.fillStyle = `rgba(165, 140, 255, ${p.opacity * pulse})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const drawGradientPulses = (time: number) => {
            const scroll = scrollRef.current;
            const viewCenter = scroll + window.innerHeight / 2;

            // Pulsing gradient orbs that slowly drift
            const orbs = [
                { cx: w * 0.2, cy: viewCenter - 200, r: 300, color: [67, 56, 202], speed: 0.0004, phase: 0 },
                { cx: w * 0.8, cy: viewCenter + 100, r: 250, color: [124, 58, 237], speed: 0.0003, phase: 2 },
                { cx: w * 0.5, cy: viewCenter + 300, r: 350, color: [30, 64, 175], speed: 0.0005, phase: 4 },
            ];

            for (const orb of orbs) {
                const pulse = 0.03 + 0.02 * Math.sin(time * orb.speed + orb.phase);
                const grad = ctx.createRadialGradient(orb.cx, orb.cy, 0, orb.cx, orb.cy, orb.r);
                grad.addColorStop(0, `rgba(${orb.color.join(",")}, ${pulse})`);
                grad.addColorStop(1, "transparent");
                ctx.fillStyle = grad;
                ctx.fillRect(orb.cx - orb.r, orb.cy - orb.r, orb.r * 2, orb.r * 2);
            }
        };

        const animate = (time: number) => {
            ctx.clearRect(0, 0, w, h);
            drawGradientPulses(time);
            drawGrid(time);
            drawParticles(time);
            animationRef.current = requestAnimationFrame(animate);
        };

        // Debounced resize
        let resizeTimer: NodeJS.Timeout;
        const debouncedResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 150);
        };

        resize();
        animationRef.current = requestAnimationFrame(animate);

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", debouncedResize);

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", debouncedResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none absolute top-0 left-0 -z-10"
            style={{ width: "100%", height: "100%" }}
        />
    );
}
