"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
];

const scrollItems = [
    { label: "Skills", href: "#features" },
    { label: "Projects", href: "#projects" },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const isHome = pathname === "/";

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleScrollClick = (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-0 left-0 right-0 z-[900] flex items-center justify-center px-6 py-4 transition-all duration-500 ${scrolled
                    ? "bg-black/60 backdrop-blur-xl border-b border-white/5"
                    : "bg-transparent"
                }`}
        >
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl px-2 py-1.5">
                {navItems.map((item, i) => {
                    const active = pathname === item.href;
                    return (
                        <motion.div key={item.label} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}>
                            <Link
                                href={item.href}
                                className={`group relative px-5 py-2 text-sm font-medium transition-colors duration-300 rounded-full inline-block ${active ? "text-white" : "text-zinc-400 hover:text-white"
                                    }`}
                            >
                                {item.label}
                                {active && <span className="absolute inset-0 rounded-full bg-white/10" />}
                                <span className="absolute inset-0 rounded-full bg-white/0 transition-all duration-300 group-hover:bg-white/5" />
                            </Link>
                        </motion.div>
                    );
                })}

                {/* Scroll items only on home page */}
                {isHome && scrollItems.map((item, i) => (
                    <motion.a
                        key={item.label}
                        href={item.href}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                        className="group relative px-5 py-2 text-sm font-medium text-zinc-400 transition-colors duration-300 hover:text-white rounded-full"
                        onClick={(e) => handleScrollClick(e, item.href)}
                    >
                        {item.label}
                        <span className="absolute inset-0 rounded-full bg-white/0 transition-all duration-300 group-hover:bg-white/5" />
                    </motion.a>
                ))}
            </div>
        </motion.nav>
    );
}
