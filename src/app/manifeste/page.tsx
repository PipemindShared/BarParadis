"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const TEAL = "#19978a";
const TEAL_LIGHT = "#7DD4C7";

export default function ManifestePage() {
  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-[#06101e] via-[#101d34] to-[#0a1729]">
      <BackgroundOrbs />
      <FloatingGlyphs />
      <div className="pointer-events-none absolute inset-0 z-[6] opacity-[0.08] mix-blend-overlay grain" />

      <div className="relative z-10 flex h-full w-full flex-col justify-between px-6 py-8 text-white">
        <header>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-mono text-[11px] uppercase tracking-[0.32em] text-white/55"
          >
            ── bienvenue au paradis
          </motion.p>
        </header>

        <main className="flex flex-col gap-10">
          {/* Bad news */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-[clamp(2rem,8.5vw,3rem)] italic leading-[1.05] tracking-tight text-white"
            >
              L’IA vient de tuer{" "}
              <span className="whitespace-nowrap">le code,</span>{" "}
              <br />
              le design,{" "}
              <br />
              <span className="text-white/70">pis le reste avec.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="mt-3 text-sm leading-snug text-white/65"
            >
              (Du moins, tels qu’on les connaissait.)
            </motion.p>
          </div>

          {/* Separator */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-px origin-left"
            style={{
              background: `linear-gradient(to right, ${TEAL_LIGHT}, ${TEAL}, transparent)`,
              boxShadow: `0 0 12px ${TEAL_LIGHT}66`,
            }}
          />

          {/* Good news */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-[clamp(2rem,8.5vw,3rem)] italic leading-[1.05] tracking-tight text-white"
            >
              Ici, on suit la{" "}
              <span
                className="relative"
                style={{
                  color: TEAL_LIGHT,
                  textShadow: `0 0 32px ${TEAL}aa, 0 0 60px ${TEAL}66`,
                }}
              >
                vibe
              </span>
              .
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 3.0 }}
              className="mt-3 text-base leading-snug text-white/80"
            >
              On laisse l’IA faire la job, on réincarne sa carrière.
            </motion.p>
          </div>
        </main>

        <motion.footer
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 3.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-stretch gap-3"
        >
          <Link
            href="/questionnaire"
            className="group relative flex w-full items-center justify-between rounded-full px-6 py-4 text-base font-semibold tracking-wide text-white transition-all active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${TEAL} 0%, #0f7a70 100%)`,
              boxShadow: `0 10px 40px -8px ${TEAL}99, 0 0 0 1px ${TEAL_LIGHT}33 inset`,
            }}
          >
            <span
              className="pointer-events-none absolute inset-0 -m-3 animate-pulse rounded-full opacity-60 blur-2xl"
              style={{
                background: `linear-gradient(90deg, ${TEAL}99, ${TEAL_LIGHT}66, ${TEAL}99)`,
              }}
            />
            <span className="relative flex items-center gap-2">
              <span style={{ color: TEAL_LIGHT }}>✦</span>
              Commencer ma renaissance
            </span>
            <span className="relative text-xl transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          <p className="text-center font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
            6 questions · 2 minutes · 1 élixir
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

function BackgroundOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="orb"
        style={{
          top: "5%",
          left: "-80px",
          width: 300,
          height: 300,
          background: `radial-gradient(circle, ${TEAL_LIGHT}, transparent 70%)`,
          opacity: 0.25,
          animationName: "orb-drift-1",
          animationDuration: "28s",
        }}
      />
      <div
        className="orb"
        style={{
          top: "45%",
          right: "-120px",
          width: 380,
          height: 380,
          background: "radial-gradient(circle, #6366f1, transparent 70%)",
          opacity: 0.22,
          animationName: "orb-drift-2",
          animationDuration: "34s",
          animationDelay: "5s",
        }}
      />
      <div
        className="orb"
        style={{
          bottom: "5%",
          left: "20%",
          width: 320,
          height: 320,
          background: `radial-gradient(circle, ${TEAL}, transparent 70%)`,
          opacity: 0.2,
          animationName: "orb-drift-1",
          animationDuration: "30s",
          animationDelay: "3s",
        }}
      />
    </div>
  );
}

function FloatingGlyphs() {
  const glyphs = [
    { char: "✦", top: "14%", left: "85%", size: "text-xl", delay: "0s", opacity: 0.3 },
    { char: "✧", top: "30%", left: "8%", size: "text-base", delay: "1.5s", opacity: 0.25 },
    { char: "⌘", top: "60%", left: "82%", size: "text-sm", delay: "2.2s", opacity: 0.2 },
    { char: "✦", top: "82%", left: "10%", size: "text-base", delay: "0.8s", opacity: 0.25 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      {glyphs.map((g, i) => (
        <span
          key={i}
          className={`absolute ${g.size} animate-float text-white`}
          style={{
            top: g.top,
            left: g.left,
            opacity: g.opacity,
            animationDelay: g.delay,
          }}
        >
          {g.char}
        </span>
      ))}
    </div>
  );
}
