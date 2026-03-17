"use client";

import { motion } from "framer-motion";

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
            whileHover={{ scale: 1.03 }}
            className="group relative flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-colors duration-500 hover:border-white/15 hover:bg-white/[0.04]"
        >
            {/* Hover glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-violet-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:from-indigo-500/5 group-hover:to-violet-500/5 pointer-events-none" />

            {/* Icon + number */}
            <div className="relative flex items-center gap-4">
                <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] group-hover:border-indigo-500/20 group-hover:bg-indigo-500/[0.05] transition-all duration-500">
                    <Icon className="w-5 h-5 text-indigo-400/70 group-hover:text-indigo-300 transition-colors duration-500" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
                    0{index + 1}
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
                className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
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
            description: "Finds and documents vulnerabilities in real-world software, with a focus on reproducible analysis.",
        },
        {
            title: "Exploit Development",
            description: "Proof-of-concept development focused on reliability, bypasses, and cross-architecture behavior.",
        },
        {
            title: "OSINT & Reconnaissance",
            description: "Pipelines that monitor public repos and archives, then triage into actionable leads.",
        },
        {
            title: "Cryptographic Systems",
            description: "Built HashLock, an offline password manager with encrypted storage.",
        },
        {
            title: "Binary Analysis",
            description: "Static and dynamic analysis to reconstruct control flow and spot flaws.",
        },
        {
            title: "Tool Development",
            description: "Security utilities and research helpers I use daily: API sniffers, archive miners, and exploit scaffolds.",
        },
    ];

    return (
        <section className="relative w-full py-32 px-4">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="mb-20"
                >
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-xs font-mono tracking-[0.3em] uppercase text-zinc-600 mb-4 block"
                    >
                        What I Actually Do
                    </motion.span>
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
                        <motion.span
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="inline-block"
                        >
                            CORE
                        </motion.span>{" "}
                        <motion.span
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600"
                        >
                            WORK & SYSTEMS
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
