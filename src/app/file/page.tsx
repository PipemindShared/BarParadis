"use client";

import { useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const TEAL = "#19978a";
const TEAL_LIGHT = "#7DD4C7";
const INK = "#1d2a3a";
const INK_MUTED = "#7a8a9a";

export default function FilePage() {
  const [participantId, setParticipantId] = useState<Id<"participants"> | null>(
    null
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem("paradis_participant_id");
      if (raw) setParticipantId(raw as Id<"participants">);
    } catch {}
  }, []);

  const data = useQuery(
    api.participants.getQueuePosition,
    participantId ? { participantId } : "skip"
  );

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
        {!participantId ? (
          <NoParticipant />
        ) : !data ? (
          <Loading />
        ) : (
          <PositionDisplay data={data} />
        )}
      </div>
    </div>
  );
}

function NoParticipant() {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
        ── aucune inscription
      </p>
      <p className="font-serif text-xl italic" style={{ color: INK }}>
        Tu n'as pas encore réclamé ton élixir.
      </p>
      <Link
        href="/"
        className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] underline-offset-4 hover:underline"
        style={{ color: TEAL }}
      >
        ← retour à l'accueil
      </Link>
    </div>
  );
}

function Loading() {
  return (
    <motion.p
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="font-mono text-[11px] uppercase tracking-[0.28em]"
      style={{ color: INK_MUTED }}
    >
      L'oracle consulte ta position…
    </motion.p>
  );
}

function PositionDisplay({
  data,
}: {
  data: {
    status: string;
    ahead: number;
    me: { firstName: string; elixir?: string; deity?: string };
  };
}) {
  // Statuts terminaux
  if (data.status === "ready") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-5"
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl"
          style={{ color: TEAL, textShadow: `0 0 28px ${TEAL}88` }}
        >
          ✦
        </motion.div>
        <h1
          className="font-serif text-[clamp(2rem,9vw,3rem)] italic leading-tight"
          style={{ color: INK }}
        >
          Ton élixir est prêt.
        </h1>
        <p className="max-w-sm text-base leading-snug" style={{ color: INK_MUTED }}>
          Présente-toi au bar pour le récupérer.
        </p>
      </motion.div>
    );
  }

  if (data.status === "served") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-4"
      >
        <p
          className="font-mono text-[11px] uppercase tracking-[0.28em]"
          style={{ color: INK_MUTED }}
        >
          ── ta renaissance est complète
        </p>
        <h1
          className="font-serif text-[clamp(1.8rem,8vw,2.6rem)] italic leading-tight"
          style={{ color: INK }}
        >
          Bois lentement.
        </h1>
        <p className="mt-2 max-w-sm text-base" style={{ color: INK_MUTED }}>
          Le paradis te remercie d'être passé.
        </p>
      </motion.div>
    );
  }

  if (data.status === "no_show") {
    return (
      <div className="flex flex-col items-center gap-4">
        <p
          className="font-mono text-[11px] uppercase tracking-[0.28em]"
          style={{ color: INK_MUTED }}
        >
          ── tour expiré
        </p>
        <h1
          className="font-serif text-2xl italic"
          style={{ color: INK }}
        >
          Ton élixir a été redistribué.
        </h1>
        <p className="mt-2 max-w-sm text-sm" style={{ color: INK_MUTED }}>
          Reviens parler au barman.
        </p>
      </div>
    );
  }

  // Statuts actifs (waiting / priority / preparing)
  const ahead = data.ahead;
  const inPreparation = data.status === "preparing";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center gap-5"
    >
      <p
        className="font-mono text-[11px] uppercase tracking-[0.28em]"
        style={{ color: INK_MUTED }}
      >
        ── {data.me.firstName}, tu es dans la file
      </p>

      {inPreparation ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="text-5xl"
            style={{ color: TEAL }}
          >
            ✦
          </motion.div>
          <h1
            className="font-serif text-[clamp(1.8rem,8vw,2.8rem)] italic leading-tight"
            style={{ color: INK }}
          >
            Ton élixir prend forme.
          </h1>
          <p className="max-w-sm text-base" style={{ color: INK_MUTED }}>
            Le barman s'en occupe en ce moment.
          </p>
        </>
      ) : (
        <>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.28em]"
            style={{ color: INK_MUTED }}
          >
            élixirs en préparation avant le tien
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={ahead}
              initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(8px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif italic leading-none"
              style={{
                fontSize: "clamp(7rem, 28vw, 12rem)",
                color: TEAL,
                textShadow: `0 4px 24px ${TEAL}55`,
              }}
            >
              {ahead}
            </motion.div>
          </AnimatePresence>

          <h1
            className="font-serif text-[clamp(1.3rem,5.5vw,1.9rem)] italic leading-tight"
            style={{ color: INK }}
          >
            {phraseForAhead(ahead)}
          </h1>

          <p
            className="mt-2 max-w-xs text-sm leading-snug"
            style={{ color: INK_MUTED }}
          >
            {data.status === "priority"
              ? "Tu es prioritaire — ton élixir sera servi plus tôt."
              : "Reste dans le coin, l'oracle te fera signe par SMS quand ton tour vient."}
          </p>
        </>
      )}

      {data.me.elixir && (
        <div
          className="mt-4 flex items-center gap-2 rounded-full border border-white/30 bg-white/40 px-3 py-1.5 backdrop-blur-md"
          style={{ borderColor: `${TEAL}33`, backgroundColor: `${TEAL}11` }}
        >
          <span style={{ color: TEAL }}>✦</span>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ color: INK_MUTED }}
          >
            ton élixir
          </span>
          <span
            className="font-serif text-sm italic"
            style={{ color: INK }}
          >
            {data.me.elixir}
          </span>
        </div>
      )}

      <p
        className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em]"
        style={{ color: INK_MUTED }}
      >
        · mise à jour en temps réel ·
      </p>

      {/* Lien formations */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="mt-8"
      >
        <Link
          href="/formations"
          className="group flex items-center gap-2 rounded-full border px-4 py-2.5 transition-all hover:bg-white/60 active:scale-95"
          style={{
            borderColor: `${TEAL}55`,
            backgroundColor: "rgba(255,255,255,0.5)",
            color: INK,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <span style={{ color: TEAL }}>✦</span>
          <span className="font-serif text-sm italic">
            En attendant ton élixir, prépare ta prochaine vie
          </span>
          <span
            className="text-sm transition-transform group-hover:translate-x-0.5"
            style={{ color: TEAL }}
          >
            →
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

function phraseForAhead(n: number): string {
  if (n === 0) return "Tu es le prochain à renaître.";
  if (n === 1) return "Une âme avant toi dans la file céleste.";
  if (n <= 3) return `${n} âmes te précèdent au portail.`;
  if (n <= 7) return `${n} âmes te précèdent au portail.`;
  return `${n} âmes te précèdent — un peu de patience céleste.`;
}
