"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

interface ProjectProps {
    title: string;
    description: string;
    tags: string[];
}

function ProjectCard({ title, description, tags }: ProjectProps) {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
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
            className="relative flex flex-col justify-between h-[400px] w-full max-w-[500px] rounded-3xl "
        >
            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl" style={{ transform: "translateZ(0px)" }} />

            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent rounded-3xl pointer-events-none" style={{ transform: "translateZ(10px)" }} />

            <div className="relative p-8 h-full flex flex-col" style={{ transform: "translateZ(50px)" }}>
                <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                    {title}
                </h3>
                <p className="text-zinc-400 text-lg leading-relaxed flex-grow">
                    {description}
                </p>

                <div className="flex flex-wrap gap-2 mt-6">
                    {tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-white/10 text-white rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

export function Projects() {
    const projects = [
        {
            title: "XeroDay APISniffer",
            description: "Python tool that scans public GitHub repos for exposed secrets and keeps a local index for querying.",
            tags: ["Python", "Security", "OSINT"],
        },
        {
            title: "HashLock",
            description: "A fully offline GUI password manager for Linux and Windows with encrypted vaults.",
            tags: ["Python", "Cryptography", "Encrypted"],
        },
        {
            title: "Information Disclosure",
            description: "A tool that uses the Internet Archive CDX API to surface deleted or archived files.",
            tags: ["Python", "WebArchive"],
        }
    ];

    return (
        <section className="relative w-full py-32 px-4 flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-7xl mx-auto"
            >
                <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-20 text-center">
                    SELECTED BUILDS
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center w-full">
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
