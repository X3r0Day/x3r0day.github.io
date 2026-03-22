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
            className={`group relative rounded-3xl border overflow-hidden transition-all duration-500 flex flex-col h-full ${isHero
                ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-emerald-500/[0.04] col-span-1 md:col-span-2"
                : "border-white/5 bg-white/[0.02] hover:border-emerald-500/10"
                }`}
        >
            {/* Terminal Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-10 border-b border-white/5 bg-white/5 flex items-center px-6 gap-2 z-10">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                </div>
                <div className="flex-grow flex justify-center">
                    <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
                        {isHero ? "flagship_node.v1" : "module_segment.v1"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-mono text-emerald-500/60 uppercase tracking-tighter">
                        SYS:READY
                    </span>
                </div>
            </div>

            <div className={`absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 pointer-events-none ${isHero
                ? "bg-gradient-to-br from-emerald-500/[0.05] to-transparent"
                : "bg-gradient-to-br from-emerald-500/[0.03] to-transparent"
                }`} />

            <div className={`relative ${isHero ? "px-8 sm:px-10 md:px-12 pb-8 sm:pb-10 md:pb-12" : "px-8 sm:px-10 pb-8 sm:pb-10"} pt-16 h-full flex flex-col`}>
                <div className="mb-6">
                    {isHero && (
                        <span className="inline-block px-3 py-1 text-[10px] font-mono tracking-widest uppercase bg-emerald-500/20 text-emerald-400 rounded-md mb-4 border border-emerald-500/20">
                            [ CORE_BUILD ]
                        </span>
                    )}
                    <h3 className={`font-bold tracking-tight ${isHero ? "text-2xl sm:text-3xl md:text-5xl" : "text-xl sm:text-2xl"}`}>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            <span className="text-emerald-500 font-mono mr-2">&gt;</span>
                            {name}
                        </span>
                    </h3>
                    <p className={`mt-2 text-zinc-500 font-mono text-xs tracking-tighter uppercase ${isHero ? "text-base sm:text-lg" : ""}`}>
                        // {tagline}
                    </p>
                </div>

                <div className="flex-grow">
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
                                    className="relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-emerald-500/20 hover:bg-emerald-500/[0.03] transition-all duration-500"
                                >
                                    <div className="text-[10px] font-mono text-emerald-500/60 mb-2">STAGE_{i + 1}</div>
                                    <p className="text-sm text-zinc-300 leading-relaxed font-mono tracking-tighter">{f.text}</p>
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
                                    className="flex items-start gap-2 text-sm text-zinc-400 font-mono tracking-tighter"
                                >
                                    <span className="text-emerald-500/60 mt-0.5">»</span>
                                    {f.text}
                                </motion.li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex items-end justify-between mt-auto pt-8 border-t border-white/5">
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className={`px-3 py-1 text-[10px] font-mono tracking-widest uppercase rounded-md ${isHero
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-white/5 text-zinc-500 border border-white/5"
                                    }`}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    <motion.a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-md border text-xs font-mono tracking-widest transition-all duration-300 ${isHero
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "border-emerald-500/10 bg-emerald-500/5 text-emerald-500/70 hover:bg-emerald-500/10"
                            }`}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                        [ GITHUB_INDEX ]
                    </motion.a>
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
            <main className="relative isolate w-full min-h-screen pt-28 md:pt-32 pb-16 md:pb-20 px-4">
                {/* Page header */}
                <div className="max-w-6xl mx-auto mb-12 md:mb-16">
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-xs font-mono tracking-[0.3em] uppercase text-emerald-500/60 mb-4 block"
                    >
                        [ ARSENAL_REGISTRY ]
                    </motion.span>
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-bold tracking-tight mb-6">
                        <GlitchText delay={0.2} className="text-white">OPEN SOURCE</GlitchText>{" "}
                        <GlitchText delay={0.5} className="text-emerald-500">TOOLS</GlitchText>
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
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-emerald-500/20 bg-emerald-500/5 text-emerald-500/60 text-xs font-mono tracking-widest transition-all duration-300 hover:bg-emerald-500/10 hover:text-emerald-400"
                    >
                        &lt; RETURN_TO_BASE &gt;
                    </motion.a>
                </motion.div>
            </main>
        </>
    );
}
