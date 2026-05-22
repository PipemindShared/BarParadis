"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const TEAL = "#19978a";
const TEAL_LIGHT = "#7DD4C7";
const INK = "#1d2a3a";
const INK_MUTED = "#7a8a9a";

export default function FilePage() {
  return (
    <div
      className="relative flex h-[100dvh] w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #f3f7fb 0%, #e5edf5 50%, #d6e2ec 100%)",
        color: INK,
      }}
    >
      <div className="divine-rays pointer-events-none absolute inset-0" />
      <div
        className="sun-pulse pointer-events-none absolute left-1/2 top-[-160px] h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,210,130,0.75) 0%, rgba(255,200,110,0.55) 20%, rgba(255,220,160,0.32) 45%, rgba(255,235,190,0.16) 65%, transparent 80%)",
          filter: "blur(18px)",
        }}
      />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-4xl"
          style={{ color: TEAL }}
        >
          ✦
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 font-serif text-[clamp(2rem,9vw,3rem)] italic leading-tight"
          style={{ color: INK }}
        >
          Tu es dans la file.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1 }}
          className="mt-4 max-w-sm text-base leading-snug"
          style={{ color: INK_MUTED }}
        >
          L’oracle te fera signe dès que ton élixir est prêt. Reste dans le coin.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="mt-12"
        >
          <Link
            href="/"
            className="font-mono text-[10px] uppercase tracking-[0.22em] underline-offset-4 hover:underline"
            style={{ color: INK_MUTED }}
          >
            ← retour à l’accueil
          </Link>
          <p
            className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ color: TEAL }}
          >
            (page d’attente + contenu formation · à construire)
          </p>
        </motion.div>
      </div>
    </div>
  );
}
