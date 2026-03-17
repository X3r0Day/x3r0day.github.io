"use client";

import { motion } from "framer-motion";
import { GlitchText } from "@/components/GlitchText";
import { Navbar } from "@/components/Navbar";

interface ToolFeature {
    text: string;
}

interface ToolCardProps {
    name: string;
    tagline: string;
    description: string;
    features: ToolFeature[];
    tags: string[];
    link: string;
    isHero?: boolean;
    index: number;
}

function ToolCard({ name, tagline, description, features, tags, link, isHero, index }: ToolCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 + index * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={`group relative rounded-3xl border overflow-hidden transition-all duration-500 ${isHero
                    ? "border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.06] via-transparent to-violet-500/[0.04] col-span-1 md:col-span-2"
                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                }`}
        >
            {isHero && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            )}

            <div className={`absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 pointer-events-none ${isHero
                    ? "bg-gradient-to-br from-indigo-500/[0.05] to-violet-500/[0.03]"
                    : "bg-gradient-to-br from-white/[0.03] to-transparent"
                }`} />

            <div className={`relative ${isHero ? "p-6 sm:p-8 md:p-12" : "p-6 sm:p-8"}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                        {isHero && (
                            <span className="inline-block px-3 py-1 text-[10px] font-mono tracking-widest uppercase bg-indigo-500/20 text-indigo-300 rounded-full mb-4 border border-indigo-500/20">
                                ★ Flagship Project
                            </span>
                        )}
                        <h3 className={`font-bold tracking-tight ${isHero ? "text-2xl sm:text-3xl md:text-5xl" : "text-xl sm:text-2xl"}`}>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                                {name}
                            </span>
                        </h3>
                        <p className={`mt-2 text-zinc-500 font-light ${isHero ? "text-base sm:text-lg" : "text-sm"}`}>
                            {tagline}
                        </p>
                    </div>

                    <motion.a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 ${isHero
                                ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                            }`}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                        View on GitHub
                    </motion.a>
                </div>

                <p className={`text-zinc-400 leading-relaxed mb-8 ${isHero ? "text-base sm:text-lg max-w-3xl" : "text-sm"}`}>
                    {description}
                </p>

                {/* Pipeline stages for hero */}
                {isHero && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
                                className="relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-indigo-500/20 hover:bg-indigo-500/[0.03] transition-all duration-500"
                            >
                                <div className="text-xs font-mono text-indigo-400/60 mb-2">STAGE {i + 1}</div>
                                <p className="text-sm text-zinc-300 leading-relaxed">{f.text}</p>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Feature list for non-hero */}
                {!isHero && features.length > 0 && (
                    <ul className="space-y-2 mb-6">
                        {features.map((f, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                                className="flex items-start gap-2 text-sm text-zinc-400"
                            >
                                <span className="text-indigo-400/60 mt-0.5">▸</span>
                                {f.text}
                            </motion.li>
                        ))}
                    </ul>
                )}

                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className={`px-3 py-1 text-[10px] font-semibold tracking-wider uppercase rounded-full ${isHero
                                    ? "bg-indigo-500/10 text-indigo-300/80 border border-indigo-500/10"
                                    : "bg-white/5 text-zinc-500 border border-white/5"
                                }`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

const tools = [
    {
        name: "XeroDay API Sniffer",
        tagline: "Scans public GitHub repos for exposed secrets.",
        description:
            "Scans public GitHub repos for exposed API keys, tokens, webhooks, and credentials. Keeps a local index for triage and supports natural-language queries over findings. Built for security research and responsible disclosure.",
        features: [
            { text: "Discovery - Tracks newly created public repos and deduplicates against scan history." },
            { text: "Scanning - Downloads repo archives and commit patches, then writes findings to structured databases." },
            { text: "Query - Natural-language search over local findings." },
        ],
        tags: ["Python", "AI Workflow", "Security", "OSINT", "GitHub API"],
        link: "https://github.com/X3r0Day/XeroDay-APISniffer",
        isHero: true,
    },
    {
        name: "Information Disclosure",
        tagline: "Archive mining for public, deleted, or hard-to-find data.",
        description:
            "Uses the Internet Archive CDX API to retrieve archived files, then filters and surfaces relevant artifacts for research.",
        features: [
            { text: "Uses the Internet Archive CDX API to retrieve archived files" },
            { text: "Filters and surfaces relevant artifacts for research" },
            { text: "Focus on publicly available, time-shifted data" },
        ],
        tags: ["Python", "Web Archive", "CDX API", "OSINT"],
        link: "https://github.com/X3r0Day/InformationDisclosure",
        isHero: false,
    },
    {
        name: "HashLock",
        tagline: "Offline password manager with encrypted vaults.",
        description:
            "Stores credentials locally; master password hashed with bcrypt; vault encrypted with Fernet. Cross-platform via Tkinter.",
        features: [
            { text: "Cross-platform UI via Tkinter" },
            { text: "Fully offline - no network requests" },
            { text: "Master password hashed with bcrypt" },
            { text: "Vault encrypted with Fernet" },
        ],
        tags: ["Python", "Cryptography", "Tkinter", "Fernet", "bcrypt"],
        link: "https://github.com/X3r0Day/HashLock",
        isHero: false,
    },
];

export default function ToolsPage() {
    return (
        <>
            <Navbar />
            <main className="relative w-full min-h-screen pt-28 md:pt-32 pb-16 md:pb-20 px-4">
                {/* Page header */}
                <div className="max-w-6xl mx-auto mb-12 md:mb-16">
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-xs font-mono tracking-[0.3em] uppercase text-zinc-600 mb-4 block"
                    >
                        Arsenal
                    </motion.span>
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-bold tracking-tight mb-6">
                        <GlitchText delay={0.2} className="text-white">OPEN SOURCE</GlitchText>{" "}
                        <GlitchText delay={0.5} className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">TOOLS</GlitchText>
                    </h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-zinc-400 text-base sm:text-lg max-w-2xl"
                    >
                        Tools I use in my own research, released as open source.
                    </motion.p>
                </div>

                {/* Tools grid */}
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tools.map((tool, i) => (
                        <ToolCard key={tool.name} index={i} {...tool} />
                    ))}
                </div>

                {/* Back link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="max-w-6xl mx-auto mt-20 text-center"
                >
                    <motion.a
                        href="/"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/5 text-zinc-400 text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:text-white"
                    >
                        ← Back to Home
                    </motion.a>
                </motion.div>
            </main>
        </>
    );
}
