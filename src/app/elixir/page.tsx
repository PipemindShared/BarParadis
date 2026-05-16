"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { computeProfile, type Answer, type Profile } from "@/lib/questionnaire";

const TEAL = "#19978a";
const TEAL_LIGHT = "#7DD4C7";

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem("paradis_answers");
      if (!raw) return;
      const answers: Answer[] = JSON.parse(raw);
      const { primary } = computeProfile(answers);
      setProfile(primary);
    } catch {}
  }, []);

  if (!profile) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-gradient-to-b from-[#0a1729] to-[#06101e] text-white">
        <p className="font-mono text-sm uppercase tracking-[0.25em] text-white/60">
          Préparation de ton élixir…
        </p>
      </div>
    );
  }

  const info = PROFILE_INFO[profile];

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-[#0a1729] via-[#101d34] to-[#06101e] text-white">
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: `radial-gradient(circle, ${TEAL_LIGHT}, transparent 70%)` }}
      />
      <div className="pointer-events-none absolute inset-0 z-[6] opacity-[0.08] mix-blend-overlay grain" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-mono text-[12px] uppercase tracking-[0.3em] text-white/60"
        >
          ── tu es réincarné en
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 font-serif text-[clamp(2.8rem,11vw,4.5rem)] italic leading-[1] tracking-tight"
          style={{ color: TEAL_LIGHT }}
        >
          {info.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-6 max-w-xs text-base leading-snug text-white/85"
        >
          {info.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-12"
        >
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/50 underline-offset-4 hover:underline"
          >
            ← recommencer
          </Link>
          <p className="mt-3 max-w-xs font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
            (page élixir + inscription · à construire)
          </p>
        </motion.div>
      </div>
    </div>
  );
}
