"use client";

import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { useRef } from "react";

interface ProjectProps {
    title: string;
    description: string;
    tags: string[];
    href?: string;
}

function ProjectCard({ title, description, tags, href }: ProjectProps) {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mX = e.clientX - rect.left;
        const mY = e.clientY - rect.top;

        const xPct = mX / width - 0.5;
        const yPct = mY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
        mouseX.set(mX);
        mouseY.set(mY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className="group relative flex flex-col justify-between h-[320px] sm:h-[360px] md:h-[400px] w-full max-w-[500px] rounded-3xl "
        >
            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden" style={{ transform: "translateZ(0px)" }}>
                {/* Spotlight effect */}
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                400px circle at ${mouseX}px ${mouseY}px,
                                rgba(0, 255, 0, 0.1),
                                transparent 80%
                            )
                        `,
                    }}
                />

                {/* Terminal Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-10 border-b border-white/5 bg-white/[0.02] flex items-center px-6 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                    </div>
                    <div className="flex-grow flex justify-center">
                        <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
                            console_session.v1
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-mono text-emerald-500/60 uppercase tracking-tighter">
                            LIVE
                        </span>
                    </div>
                </div>
            </div>

            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent rounded-3xl pointer-events-none" style={{ transform: "translateZ(10px)" }} />

            <div className="relative p-8 pt-16 h-full flex flex-col" style={{ transform: "translateZ(50px)" }}>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-emerald-400 transition-colors duration-300">
                    <span className="text-emerald-500 font-mono mr-2">&gt;</span>
                    {title}
                </h3>
                <p className="text-zinc-500 text-sm sm:text-base leading-relaxed flex-grow">
                    {description}
                </p>

                <div className="flex items-center justify-between mt-6">
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <span key={tag} className="px-3 py-1 text-[10px] font-mono tracking-wider uppercase bg-emerald-500/5 text-emerald-500/70 border border-emerald-500/10 rounded-md">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {href && (
                        <motion.a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-[10px] font-mono tracking-widest text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                        >
                            [ VIEW_LIVE ]
                        </motion.a>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export function Projects() {
    const projects = [
        {
            title: "WebShame",
            description: "Database of compromised web credentials and leaked secrets. Visualizing the scale of web-based information disclosure through real-time telemetry.",
            tags: ["CredentialDB", "OSINT", "Leaks"],
            href: "https://x3r0day.me/WebShame/",
        },
        {
            title: "CamSnipe Hub",
            description: "Operational console for IP-camera discovery and live stream indexing. Uses advanced filtering to monitor public video feeds globally.",
            tags: ["Surveillance", "IoT", "Streaming"],
            href: "https://camsnipe-hub-ipym.onrender.com/",
        },
        {
            title: "XeroDay APISniffer",
            description: "Python tool that scans public GitHub repos for exposed secrets and keeps a local index for querying.",
            tags: ["Python", "Security", "GitHub"],
            href: "https://github.com/X3r0Day/XeroDay-APISniffer",
        },
        {
            title: "HashLock",
            description: "A fully offline GUI password manager for Linux and Windows with encrypted vaults and secure key derivation.",
            tags: ["Python", "Cryptography", "Desktop"],
            href: "https://github.com/X3r0Day/HashLock",
        }
    ];

    return (
        <section className="relative w-full py-24 md:py-32 px-4 flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-7xl mx-auto"
            >
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-12 md:mb-20 text-center">
                    SELECTED <span className="text-emerald-500/80">BUILDS</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 justify-items-center w-full">
                    {projects.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: i * 0.2 }}
                            className="w-full flex justify-center"
                        >
                            <ProjectCard {...p} />
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
