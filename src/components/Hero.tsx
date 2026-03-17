"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { GlitchText } from "./GlitchText";
import Link from "next/link";

function FloatingShape({ delay, duration, className }: { delay: number; duration: number; className: string }) {
    return (
        <motion.div
            className={`absolute pointer-events-none ${className}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: [0, 0.6, 0.3, 0.6, 0],
                scale: [0.5, 1, 0.8, 1.1, 0.5],
                rotate: [0, 90, 180, 270, 360],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    );
}

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <section
            id="home"
            ref={containerRef}
            className="relative flex flex-col items-center justify-center overflow-hidden"
        >

            <FloatingShape delay={0} duration={18} className="top-[15%] left-[10%] w-16 h-16 border border-white/10 rounded-lg" />
            <FloatingShape delay={2} duration={22} className="top-[25%] right-[15%] w-10 h-10 bg-indigo-500/10 rounded-full" />
            <FloatingShape delay={4} duration={15} className="bottom-[30%] left-[20%] w-6 h-6 bg-violet-500/10 rounded-sm" />
            <FloatingShape delay={1} duration={20} className="top-[60%] right-[10%] w-12 h-12 border border-indigo-500/10 rounded-full" />
            <FloatingShape delay={3} duration={25} className="top-[10%] left-[50%] w-8 h-8 bg-white/5 rounded-md" />
            <FloatingShape delay={5} duration={17} className="bottom-[15%] right-[30%] w-14 h-14 border border-white/5 rounded-xl" />

            {/* Parallax title section — this fades on scroll */}
            <motion.div
                style={{ y, opacity }}
                className="relative z-10 flex flex-col items-center justify-center text-center px-4 min-h-[70vh] pt-24 sm:pt-28 md:pt-32"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
                >
                    <span className="text-sm font-medium tracking-widest text-zinc-400 uppercase">
                        X3r0Day // Security Research
                    </span>
                </motion.div>

                <h1 className="text-5xl sm:text-6xl md:text-[10vw] font-black tracking-tighter leading-none mb-6">
                    <span className="block">
                        <GlitchText
                            delay={0.3}
                            className="block text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-600"
                        >
                            HUNTING
                        </GlitchText>
                    </span>
                    <span className="block">
                        <GlitchText
                            delay={0.6}
                            className="block text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-300 to-zinc-700"
                        >
                            THE UNSEEN
                        </GlitchText>
                    </span>
                </h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
                    className="max-w-2xl text-base sm:text-lg md:text-2xl text-zinc-400 font-light"
                >
                    Reverse engineering, exploit development, and low-level system analysis. I live in debuggers and disassemblers, tracing crashes to root cause and building repeatable proofs of concept.
                </motion.p>
            </motion.div>

            {/* API Sniffer showcase — OUTSIDE parallax so it stays visible */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-3xl mx-auto px-4 pb-12"
            >
                <div className="relative rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.06] via-transparent to-violet-500/[0.04] p-6 sm:p-8 md:p-10 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/20">
                            ★ Flagship
                        </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 mb-3">
                        <GlitchText delay={2}>XeroDay API Sniffer</GlitchText>
                    </h3>
                    <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
                        GitHub-focused secret discovery toolkit that scans public repos for exposed keys, tokens, and credentials. Includes a natural-language query layer for local findings.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {["Python", "AI Workflow", "Security", "OSINT"].map((tag) => (
                            <span key={tag} className="px-3 py-1 text-[10px] font-semibold tracking-wider uppercase bg-indigo-500/10 text-indigo-300/80 rounded-full border border-indigo-500/10">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <motion.a
                            href="https://github.com/X3r0Day/XeroDay-APISniffer"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium transition-all duration-300 hover:bg-indigo-500/20"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            View on GitHub
                        </motion.a>
                        <Link href="/tools">
                            <motion.span
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-zinc-300 text-sm font-medium transition-all duration-300 hover:bg-white/10"
                            >
                                View All Tools →
                            </motion.span>
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 1 }}
                className="relative z-10 pb-10 flex flex-col items-center gap-2"
            >
                <span className="text-xs tracking-[0.3em] uppercase text-zinc-600">Scroll</span>
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-5 h-9 rounded-full border border-white/10 flex justify-center pt-2"
                >
                    <motion.div
                        animate={{ opacity: [1, 0.3, 1], scaleY: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-0.5 h-2 bg-white/40 rounded-full"
                    />
                </motion.div>
            </motion.div>

            {/* Ambient glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute top-[40%] left-[30%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/[0.06] rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute top-[60%] right-[20%] w-[300px] h-[300px] bg-violet-500/[0.04] rounded-full blur-[80px] pointer-events-none -z-10" />
        </section>
    );
}
