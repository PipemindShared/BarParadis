"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  computeProfile,
  pickDrinkName,
  type Answer,
  type Profile,
} from "@/lib/questionnaire";

const TEAL = "#19978a";
const TEAL_LIGHT = "#7DD4C7";

type Phase = "creating" | "profile" | "drink" | "cta";

const PROFILE_INFO: Record<Profile, { title: string; subtitle: string }> = {
  Codeur: {
    title: "Codeur céleste",
    subtitle: "Tu automatises avant même de respirer.",
  },
  Designer: {
    title: "Designer des nuages",
    subtitle: "Tu vois les frictions que les autres ne voient pas.",
  },
  Visionnaire: {
    title: "Visionnaire du MVP",
    subtitle: "Tu arrives toujours trois réunions avant tout le monde.",
  },
  Gestionnaire: {
    title: "Gardien de la roadmap",
    subtitle: "Tu sais ce que ton équipe doit faire lundi matin.",
  },
};

export default function ElixirPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [drink, setDrink] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("creating");
  const videoRef = useRef<HTMLVideoElement>(null);
  const fadeOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const overlay = fadeOverlayRef.current;
    if (!video || !overlay) return;

    const FADE_DURATION = 0.7;
    let raf = 0;

    const tick = () => {
      if (video.duration > 0 && !video.paused) {
        const remaining = video.duration - video.currentTime;
        let opacity = 0;
        if (remaining < FADE_DURATION) {
          opacity = 1 - remaining / FADE_DURATION;
        } else if (video.currentTime < FADE_DURATION) {
          opacity = 1 - video.currentTime / FADE_DURATION;
        }
        overlay.style.opacity = String(Math.max(0, Math.min(1, opacity)));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("paradis_answers");
      if (raw) {
        const answers: Answer[] = JSON.parse(raw);
        const { primary } = computeProfile(answers);
        setProfile(primary);
        setDrink(pickDrinkName(primary));
      } else {
        // No answers — pick a random profile for demo
        const profiles: Profile[] = ["Codeur", "Designer", "Visionnaire", "Gestionnaire"];
        const p = profiles[Math.floor(Math.random() * 4)];
        setProfile(p);
        setDrink(pickDrinkName(p));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!profile) return;
    const t1 = setTimeout(() => setPhase("profile"), 3800);
    const t2 = setTimeout(() => setPhase("drink"), 6800);
    const t3 = setTimeout(() => setPhase("cta"), 9000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [profile]);

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          filter: "saturate(0.95)",
        }}
      >
        <source src="/videos/Elixir.mp4" type="video/mp4" />
      </video>

      <div
        ref={fadeOverlayRef}
        className="pointer-events-none absolute inset-0 bg-white"
        style={{ opacity: 0 }}
        aria-hidden
      />

      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "creating" ? 1 : 0.85 }}
        transition={{ duration: 1.5 }}
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 55%, transparent 85%)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-[6] opacity-[0.08] mix-blend-overlay grain" />

      <div className="relative z-10 flex h-full w-full flex-col items-center px-6 pb-10 pt-8 text-center text-white">
        <AnimatePresence mode="wait">
          {phase === "creating" && profile && (
            <motion.div
              key="creating"
              className="flex flex-1 flex-col items-center justify-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="text-4xl"
                style={{ color: TEAL_LIGHT }}
              >
                ✦
              </motion.div>
              <div className="space-y-2">
                <p className="font-mono text-[12px] uppercase tracking-[0.32em] text-white/70">
                  ── ton élixir
                </p>
                <p className="font-serif text-2xl italic text-white">
                  prend forme<DotPulse />
                </p>
              </div>
            </motion.div>
          )}

          {(phase === "profile" || phase === "drink" || phase === "cta") && profile && (
            <motion.div
              key="reveal"
              className="flex flex-1 flex-col items-center justify-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center"
              >
                <p
                  className="font-mono text-[12px] uppercase tracking-[0.3em] text-white"
                  style={{ textShadow: "0 1px 8px rgba(0,0,0,0.85), 0 0 20px rgba(0,0,0,0.6)" }}
                >
                  ── tu es réincarné en
                </p>
                <h1
                  className="mt-3 font-serif text-[clamp(2.4rem,10vw,4rem)] italic leading-[1] tracking-tight"
                  style={{
                    color: TEAL_LIGHT,
                    textShadow: `0 2px 4px rgba(0,0,0,0.85), 0 0 32px rgba(0,0,0,0.7), 0 0 60px ${TEAL}66`,
                  }}
                >
                  {PROFILE_INFO[profile].title}
                </h1>
                <p
                  className="mt-4 max-w-xs text-base leading-snug text-white"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.85), 0 0 20px rgba(0,0,0,0.5)" }}
                >
                  {PROFILE_INFO[profile].subtitle}
                </p>
              </motion.div>

              <AnimatePresence>
                {(phase === "drink" || phase === "cta") && drink && (
                  <motion.div
                    key="drink"
                    initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-px w-8"
                        style={{
                          backgroundColor: TEAL_LIGHT,
                          boxShadow: "0 0 8px rgba(0,0,0,0.6)",
                        }}
                      />
                      <p
                        className="font-mono text-[11px] uppercase tracking-[0.28em]"
                        style={{
                          color: TEAL_LIGHT,
                          textShadow: "0 1px 8px rgba(0,0,0,0.85), 0 0 20px rgba(0,0,0,0.6)",
                        }}
                      >
                        ton élixir
                      </p>
                      <span
                        className="h-px w-8"
                        style={{
                          backgroundColor: TEAL_LIGHT,
                          boxShadow: "0 0 8px rgba(0,0,0,0.6)",
                        }}
                      />
                    </div>
                    <p
                      className="mt-3 font-serif text-[clamp(1.8rem,7vw,2.8rem)] italic leading-tight text-white"
                      style={{
                        textShadow:
                          "0 2px 8px rgba(0,0,0,0.9), 0 0 32px rgba(0,0,0,0.75), 0 0 60px rgba(0,0,0,0.5)",
                      }}
                    >
                      {drink}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === "cta" && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex w-full flex-col items-stretch gap-3"
            >
              <Link
                href="/reclamer"
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
                  Réclame ton élixir
                </span>
                <span className="relative text-xl transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <p
                className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-white/85"
                style={{ textShadow: "0 1px 8px rgba(0,0,0,0.85), 0 0 16px rgba(0,0,0,0.6)" }}
              >
                un petit pas avant que le barman te le prépare
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DotPulse() {
  return (
    <span className="inline-flex">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
          className="mx-[1px]"
        >
          .
        </motion.span>
      ))}
    </span>
  );
}
