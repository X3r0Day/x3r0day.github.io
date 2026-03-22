"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";

/* ── SVG Icon Components ── */

function IconMicroscope({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18h8" /><path d="M3 22h18" /><path d="M14 22a7 7 0 1 0 0-14h-1" />
            <path d="M9 14h2" /><path d="M8 6h4" /><path d="M13 10V6.5a.5.5 0 0 0-.5-.5.5.5 0 0 1-.5-.5V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2.5a.5.5 0 0 1-.5.5.5.5 0 0 0-.5.5V10c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2Z" />
        </svg>
    );
}

function IconBolt({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
        </svg>
    );
}

function IconRadar({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" /><path d="M4 6h.01" />
            <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" /><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" />
            <path d="M12 18h.01" /><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" />
            <circle cx="12" cy="12" r="2" /><path d="m13.41 10.59 5.66-5.66" />
        </svg>
    );
}

function IconShield({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

function IconWand({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 4-7.68 7.68a2 2 0 0 0 0 2.83l1.17 1.17a2 2 0 0 0 2.83 0L19 8" />
            <path d="m18 3 3 3" /><path d="m2 22 3-3" /><path d="M8 2v2" /><path d="M2 8h2" />
            <path d="M22 16h-2" /><path d="M16 22v-2" />
        </svg>
    );
}

function IconTerminal({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 17 10 11 4 5" /><line x1="12" x2="20" y1="19" y2="19" />
        </svg>
    );
}

const ICONS = [IconMicroscope, IconBolt, IconRadar, IconShield, IconWand, IconTerminal];

/* ── Feature Item ── */

interface FeatureItemProps {
    index: number;
    title: string;
    description: string;
}

function FeatureItem({ index, title, description }: FeatureItemProps) {
    const Icon = ICONS[index % ICONS.length];

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
            }}
            onMouseMove={handleMouseMove}
            whileHover={{ scale: 1.03 }}
            className="group relative flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 transition-colors duration-500 hover:border-white/15 hover:bg-white/[0.04] overflow-hidden"
        >
            {/* Spotlight hover glow */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            350px circle at ${mouseX}px ${mouseY}px,
                            rgba(0, 255, 0, 0.08),
                            transparent 80%
                        )
                    `,
                }}
            />



            {/* Icon + number */}
            <div className="relative flex items-center gap-4">
                <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] group-hover:border-emerald-500/20 group-hover:bg-emerald-500/[0.05] transition-all duration-500">
                    <Icon className="w-5 h-5 text-emerald-400/70 group-hover:text-emerald-400 transition-colors duration-500" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
                    MOD_{index + 1}
                </span>
            </div>

            <h3 className="relative text-xl font-semibold text-white/90 transition-colors duration-300 group-hover:text-white">
                {title}
            </h3>
            <p className="relative text-sm leading-relaxed text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400">
                {description}
            </p>

            {/* Bottom line reveal */}
            <motion.div
                className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            />
        </motion.div>
    );
}

/* ── Features Section ── */

export function Features() {
    const features = [
        {
            title: "Vulnerability Research",
            description: "I hunt for bugs in production software — web apps, APIs, embedded systems. Every finding gets a clean writeup with steps to reproduce.",
        },
        {
            title: "Exploit Development",
            description: "I turn CVEs into working proof-of-concepts. I care about reliability, clean shellcode, and understanding why something breaks.",
        },
        {
            title: "OSINT & Recon",
            description: "I build automated pipelines that scrape public repos, archived pages, and leaked databases to surface actionable intel.",
        },
        {
            title: "Cryptography",
            description: "Fascinated by how encryption works — and how it fails. I've built my own password manager from scratch to learn by doing.",
        },
        {
            title: "Reverse Engineering",
            description: "I spend time in disassemblers and debuggers, tracing execution paths and understanding binaries at the instruction level.",
        },
        {
            title: "Open Source Tooling",
            description: "Everything I build for research gets released publicly. I believe good security tools should be accessible to everyone.",
        },
    ];

    return (
        <section className="relative w-full py-24 md:py-32 px-4">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="mb-12 md:mb-20"
                >
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-xs font-mono tracking-[0.3em] uppercase text-zinc-600 mb-4 block"
                    >
                        About Me
                    </motion.span>
                    <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight">
                        <motion.span
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="inline-block"
                        >
                            WHAT I
                        </motion.span>{" "}
                        <motion.span
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="inline-block text-emerald-500/80"
                        >
                            DO
                        </motion.span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <FeatureItem key={i} index={i} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
}
