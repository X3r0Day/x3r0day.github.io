"use client";

import { motion } from "framer-motion";

export function Ticker() {
    const words = [
        "SECURITY", "RESEARCH", "DEVELOPMENT", "OSINT", "0-DAY", "VAPT", "INTERNET",
        "SYSTEMS", "HACKING", "VULNERABILITY", "CREATIVITY", "REVERSE ENGINEERING", "EXPLOIT"
    ];

    return (
        <div className="w-full relative overflow-hidden py-24 border-y border-white/5 bg-black/40 backdrop-blur-sm -skew-y-2 origin-left my-20">

            {/* Gradients to hide edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <motion.div
                animate={{
                    x: ["0%", "-50%"],
                }}
                transition={{
                    duration: 30,
                    ease: "linear",
                    repeat: Infinity,
                }}
                className="flex whitespace-nowrap w-fit"
            >
                <div className="flex shrink-0">
                    {words.map((word, i) => (
                        <span key={`first-${i}`} className="text-4xl md:text-6xl font-black text-transparent px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}>
                            {word}
                        </span>
                    ))}
                </div>
                <div className="flex shrink-0">
                    {words.map((word, i) => (
                        <span key={`second-${i}`} className="text-4xl md:text-6xl font-black text-transparent px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}>
                            {word}
                        </span>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
