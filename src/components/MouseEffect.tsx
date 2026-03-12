"use client";

import { useEffect, useRef } from "react";

/*
  A morphing geometric cursor rendered on Canvas.
  
  ─ When still: a small rotating crosshair with 4 tick marks
  ─ When moving: stretches into a directional slash/comet shape
    pointing in the direction of movement, with a particle trail
  ─ On hover (interactive elements): morphs into a targeting reticle
    with rotating concentric arcs
  ─ On click: pulses outward with a shockwave ring
*/

interface TrailParticle {
    x: number;
    y: number;
    life: number;
    maxLife: number;
    angle: number;
    speed: number;
}

export function MouseEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dprRef = useRef(1);
    const stateRef = useRef({
        x: -100,
        y: -100,
        targetX: -100,
        targetY: -100,
        vx: 0,
        vy: 0,
        speed: 0,
        angle: 0,
        hovering: false,
        clicking: false,
        clickPulse: 0,
        rotation: 0,
        trail: [] as TrailParticle[],
    });

    useEffect(() => {
        if (!window.matchMedia("(pointer: fine)").matches) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        let raf = 0;
        const s = stateRef.current;

        const isInteractiveTarget = (target: EventTarget | null) => {
            if (!(target instanceof Element)) return false;
            return !!(
                target.closest("a") ||
                target.closest("button") ||
                target.closest("[role='button']") ||
                target.closest("input") ||
                target.closest("textarea") ||
                target.closest("select") ||
                target.closest("summary")
            );
        };

        const resetCursor = () => {
            s.x = -100;
            s.y = -100;
            s.targetX = -100;
            s.targetY = -100;
            s.vx = 0;
            s.vy = 0;
            s.speed = 0;
            s.hovering = false;
            s.clicking = false;
            s.clickPulse = 0;
            s.trail = [];
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            dprRef.current = dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            canvas.width = Math.round(window.innerWidth * dpr);
            canvas.height = Math.round(window.innerHeight * dpr);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener("resize", resize);

        const onPointerMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
            s.targetX = e.clientX;
            s.targetY = e.clientY;
            s.hovering = isInteractiveTarget(e.target);
        };

        const onPointerOver = (e: PointerEvent) => {
            s.hovering = isInteractiveTarget(e.target);
        };

        const onPointerOut = (e: PointerEvent) => {
            s.hovering = isInteractiveTarget(e.relatedTarget);
        };

        const onPointerDown = () => {
            s.clicking = true;
            s.clickPulse = 1;
        };

        const onPointerUp = () => {
            s.clicking = false;
        };

        window.addEventListener("pointermove", onPointerMove, { passive: true });
        document.addEventListener("pointerover", onPointerOver);
        document.addEventListener("pointerout", onPointerOut);
        window.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointerup", onPointerUp);
        window.addEventListener("blur", resetCursor);
        document.addEventListener("visibilitychange", resetCursor);

        const draw = () => {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);

            // Smooth follow
            const ease = 0.15;
            const prevX = s.x;
            const prevY = s.y;
            s.x += (s.targetX - s.x) * ease;
            s.y += (s.targetY - s.y) * ease;
            s.vx = s.x - prevX;
            s.vy = s.y - prevY;
            s.speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
            if (s.speed > 0.5) {
                s.angle = Math.atan2(s.vy, s.vx);
            }
            s.rotation += 0.02;

            // Click pulse decay
            if (s.clickPulse > 0) s.clickPulse *= 0.92;

            // Trail particles — spawn when moving
            if (s.speed > 1.5) {
                s.trail.push({
                    x: s.x,
                    y: s.y,
                    life: 1,
                    maxLife: 20 + Math.random() * 15,
                    angle: s.angle + (Math.random() - 0.5) * 0.5 + Math.PI,
                    speed: 0.3 + Math.random() * 0.5,
                });
                if (s.trail.length > 40) {
                    s.trail.shift();
                }
            }

            // Update & draw trail
            for (let i = s.trail.length - 1; i >= 0; i--) {
                const p = s.trail[i];
                p.life++;
                p.x += Math.cos(p.angle) * p.speed;
                p.y += Math.sin(p.angle) * p.speed;
                p.speed *= 0.96;

                if (p.life >= p.maxLife) {
                    s.trail.splice(i, 1);
                    continue;
                }

                const t = 1 - p.life / p.maxLife;
                ctx.fillStyle = `rgba(139, 92, 246, ${t * 0.4})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, t * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Click shockwave
            if (s.clickPulse > 0.01) {
                const radius = (1 - s.clickPulse) * 40;
                ctx.strokeStyle = `rgba(139, 92, 246, ${s.clickPulse * 0.6})`;
                ctx.lineWidth = s.clickPulse * 2;
                ctx.beginPath();
                ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.save();
            ctx.translate(s.x, s.y);

            if (s.hovering) {
                // ── RETICLE MODE ──
                const r1 = 16;
                const r2 = 22;
                ctx.strokeStyle = "rgba(139, 92, 246, 0.8)";
                ctx.lineWidth = 1;

                // Rotating arcs
                for (let i = 0; i < 4; i++) {
                    const startAngle = s.rotation * 2 + (i * Math.PI) / 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, r2, startAngle, startAngle + 0.8);
                    ctx.stroke();
                }

                // Inner arcs (counter-rotate)
                ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
                for (let i = 0; i < 4; i++) {
                    const startAngle = -s.rotation * 3 + (i * Math.PI) / 2 + 0.4;
                    ctx.beginPath();
                    ctx.arc(0, 0, r1, startAngle, startAngle + 0.6);
                    ctx.stroke();
                }

                // Center dot
                ctx.fillStyle = "rgba(139, 92, 246, 0.9)";
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, Math.PI * 2);
                ctx.fill();

                // Crosshair ticks
                ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
                ctx.lineWidth = 0.8;
                const tickInner = 6;
                const tickOuter = 10;
                for (let i = 0; i < 4; i++) {
                    const a = (i * Math.PI) / 2;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(a) * tickInner, Math.sin(a) * tickInner);
                    ctx.lineTo(Math.cos(a) * tickOuter, Math.sin(a) * tickOuter);
                    ctx.stroke();
                }
            } else {
                // ── MORPHING CROSSHAIR / DIRECTIONAL MODE ──
                const stretch = Math.min(s.speed / 8, 1);

                if (stretch > 0.15) {
                    // Directional slash — stretches based on velocity
                    ctx.rotate(s.angle);
                    const len = 8 + stretch * 16;
                    const width = 1.5 - stretch * 0.8;

                    // Main line
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 + stretch * 0.3})`;
                    ctx.lineWidth = width;
                    ctx.beginPath();
                    ctx.moveTo(-len * 0.3, 0);
                    ctx.lineTo(len * 0.7, 0);
                    ctx.stroke();

                    // Arrow head
                    const headLen = 4 + stretch * 3;
                    ctx.beginPath();
                    ctx.moveTo(len * 0.7, 0);
                    ctx.lineTo(len * 0.7 - headLen, -headLen * 0.4);
                    ctx.moveTo(len * 0.7, 0);
                    ctx.lineTo(len * 0.7 - headLen, headLen * 0.4);
                    ctx.stroke();

                    // Trailing whiskers
                    ctx.strokeStyle = `rgba(139, 92, 246, ${stretch * 0.4})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(-len * 0.3, 0);
                    ctx.lineTo(-len * 0.3 - 6, -3);
                    ctx.moveTo(-len * 0.3, 0);
                    ctx.lineTo(-len * 0.3 - 6, 3);
                    ctx.stroke();
                } else {
                    // Idle crosshair — slowly rotating
                    ctx.rotate(s.rotation);

                    // Tick marks
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
                    ctx.lineWidth = 1;
                    const inner = 4;
                    const outer = 9;

                    for (let i = 0; i < 4; i++) {
                        const a = (i * Math.PI) / 2;
                        ctx.beginPath();
                        ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
                        ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
                        ctx.stroke();
                    }

                    // Diagonal subtle ticks
                    ctx.strokeStyle = "rgba(139, 92, 246, 0.3)";
                    ctx.lineWidth = 0.5;
                    for (let i = 0; i < 4; i++) {
                        const a = (i * Math.PI) / 2 + Math.PI / 4;
                        ctx.beginPath();
                        ctx.moveTo(Math.cos(a) * 3, Math.sin(a) * 3);
                        ctx.lineTo(Math.cos(a) * 6, Math.sin(a) * 6);
                        ctx.stroke();
                    }

                    // Center dot
                    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
                    ctx.beginPath();
                    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.restore();
            raf = requestAnimationFrame(draw);
        };

        raf = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerover", onPointerOver);
            document.removeEventListener("pointerout", onPointerOut);
            window.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("blur", resetCursor);
            document.removeEventListener("visibilitychange", resetCursor);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-[999]"
        />
    );
}
