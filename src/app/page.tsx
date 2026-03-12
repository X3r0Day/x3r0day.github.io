"use client";

import { Hero } from "@/components/Hero";
import { Ticker } from "@/components/Ticker";
import { Features } from "@/components/Features";
import { Projects } from "@/components/Projects";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen">
      <Navbar />
      <Hero />
      <Ticker />
      <div id="features">
        <Features />
      </div>
      <div id="projects">
        <Projects />
      </div>

      {/* Technical Disclaimer Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full py-32 px-4 border-t border-white/5 bg-gradient-to-b from-transparent to-red-500/[0.02]"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent mb-12"
          />

          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6 text-white/90">
            TECHNICAL DISCLAIMER
          </h2>

          <p className="text-zinc-500 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto italic">
            &ldquo;I am <span className="text-red-400 font-medium">not</span> a Web Developer. This site exists purely to house my research and tools in an aesthetic shell. My true environment is the terminal and the debugger.&rdquo;
          </p>

          <div className="mt-12 flex justify-center gap-4">
            <div className="px-4 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 text-[10px] font-mono tracking-widest uppercase text-red-400/70">
              Low-Level Focus
            </div>
            <div className="px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-[10px] font-mono tracking-widest uppercase text-zinc-500">
              Kernel & Userspace
            </div>
          </div>
        </div>
      </motion.section>

      {/* Animated footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative w-full py-20 flex flex-col items-center justify-center mt-20 border-t border-white/5 overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-indigo-500/[0.03] rounded-full blur-[80px] pointer-events-none" />

        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "60%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10"
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 0.4, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-mono text-sm tracking-[0.4em] uppercase text-zinc-500"
        >
          END OF LINE
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.2 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-4 text-xs text-zinc-600 tracking-widest"
        >
          DESIGNED WITH OBSESSION
        </motion.p>
      </motion.footer>
    </main>
  );
}
