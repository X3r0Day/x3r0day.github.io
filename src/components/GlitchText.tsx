"use client";

import { motion } from "framer-motion";

interface GlitchTextProps {
    children: string;
    className?: string;
    delay?: number;
}

export function GlitchText({ children, className = "", delay = 0 }: GlitchTextProps) {
    return (
        <motion.span
            className={`glitch-wrapper ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay }}
            data-text={children}
        >
            {children}
        </motion.span>
    );
}
