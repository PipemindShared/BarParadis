"use client";

import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { FORMATIONS, type Formation, type Profile } from "@/lib/formations";

const TEAL = "#19978a";
const TEAL_LIGHT = "#7DD4C7";
const INK = "#1d2a3a";
const INK_MUTED = "#7a8a9a";

const SWIPE_CONFIDENCE_THRESHOLD = 10000;
const swipePower = (offset: number, velocity: number) =>
  Math.abs(offset) * velocity;

export default function FormationsPage() {
  const [participantId, setParticipantId] = useState<Id<"participants"> | null>(
    null
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem("paradis_participant_id");
      if (raw) setParticipantId(raw as Id<"participants">);
    } catch {}
  }, []);

  const participant = useQuery(
    api.participants.getById,
    participantId ? { id: participantId } : "skip"
  );

  const profile = participant?.profile as Profile | undefined;

  // Réordonne pour mettre la formation du profil en premier
  const ordered = useMemo<Formation[]>(() => {
    if (!profile) return FORMATIONS;
    const idx = FORMATIONS.findIndex((f) => f.profile === profile);
    if (idx <= 0) return FORMATIONS;
    return [...FORMATIONS.slice(idx), ...FORMATIONS.slice(0, idx)];
  }, [profile]);

  const [[page, direction], setPage] = useState<[number, 1 | -1]>([0, 1]);
  const index = ((page % ordered.length) + ordered.length) % ordered.length;
  const formation = ordered[index];

  function paginate(dir: 1 | -1) {
    setPage([page + dir, dir]);
  }

  return (
    <div
      className="relative flex min-h-[100dvh] w-full overflow-hidden"
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

      <div className="relative z-10 flex w-full flex-col px-5 pt-6 pb-8">
        {/* Header */}
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/file"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 hover:text-zinc-800"
          >
            ← retour à la file
          </Link>
          <div className="flex h-7 items-center gap-2">
            <Image
              src="/images/pipemindlogo1.png"
              alt="Pipemind"
              width={80}
              height={24}
              className="h-6 w-auto object-contain"
            />
          </div>
        </header>

        {/* Title */}
        <div className="mt-6 text-center">
          <p
            className="font-mono text-[11px] uppercase tracking-[0.28em]"
            style={{ color: INK_MUTED }}
          >
            ── formations pipemind
          </p>
          <h1
            className="mt-2 font-serif text-[clamp(1.8rem,7vw,2.4rem)] italic leading-tight"
            style={{ color: INK }}
          >
            Trois voies pour ta renaissance.
          </h1>
          {profile && (
            <p
              className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: TEAL }}
            >
              ✦ recommandée pour toi : {profile}
            </p>
          )}
        </div>

        {/* Carousel */}
        <div className="relative mt-6 flex-1">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -80 : 80 }}
              transition={{
                opacity: { duration: 0.3 },
                x: { type: "spring", stiffness: 260, damping: 28 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                const swipe = swipePower(info.offset.x, info.velocity.x);
                if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) paginate(1);
                else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) paginate(-1);
              }}
              className="cursor-grab active:cursor-grabbing"
              style={{ touchAction: "pan-y" }}
            >
              <FormationCard formation={formation} />
            </motion.div>
          </AnimatePresence>

          {/* Side buttons (desktop) */}
          <button
            onClick={() => paginate(-1)}
            className="absolute -left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white/80 backdrop-blur-md transition-all hover:bg-white sm:flex"
            style={{ borderColor: `${TEAL}33`, color: INK }}
            aria-label="Précédent"
          >
            ←
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute -right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white/80 backdrop-blur-md transition-all hover:bg-white sm:flex"
            style={{ borderColor: `${TEAL}33`, color: INK }}
            aria-label="Suivant"
          >
            →
          </button>
        </div>

        {/* Indicators */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {ordered.map((f, i) => (
            <button
              key={f.profile}
              onClick={() => setPage([i, i > index ? 1 : -1])}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all"
              style={{
                backgroundColor: i === index ? f.accentColor : "rgba(29,42,58,0.08)",
                color: i === index ? "white" : INK_MUTED,
              }}
            >
              <span className="font-mono text-[9px] font-bold">
                {f.emoji}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider">
                {f.profile}
              </span>
            </button>
          ))}
        </div>

        <p
          className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.22em]"
          style={{ color: INK_MUTED }}
        >
          glisse ←/→ ou tape sur un onglet
        </p>
      </div>
    </div>
  );
}

function FormationCard({ formation }: { formation: Formation }) {
  return (
    <article
      className="mx-auto max-w-xl rounded-2xl border bg-white/65 p-5 shadow-xl backdrop-blur-md sm:p-6"
      style={{
        borderColor: `${formation.accentColor}55`,
        boxShadow: `0 16px 48px -16px ${formation.accentColor}55`,
      }}
    >
      {/* Profil tag */}
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{
            backgroundColor: `${formation.accentColor}22`,
            color: formation.accentColor,
            border: `1px solid ${formation.accentColor}55`,
          }}
        >
          <span>{formation.emoji}</span>
          {formation.profile}
        </span>
        <span
          className="font-mono text-[9px] uppercase tracking-[0.22em]"
          style={{ color: INK_MUTED }}
        >
          formation pipemind
        </span>
      </div>

      {/* Title */}
      <h2
        className="mt-3 font-serif text-[clamp(1.7rem,7vw,2.2rem)] italic leading-tight"
        style={{ color: INK }}
      >
        {formation.title}
      </h2>
      <p
        className="mt-2 text-base leading-snug"
        style={{ color: INK }}
      >
        {formation.subtitle}
      </p>

      {/* Intro */}
      <p
        className="mt-3 text-sm leading-snug"
        style={{ color: INK_MUTED }}
      >
        {formation.intro}
      </p>

      {/* Modules */}
      <div className="mt-5">
        <h3
          className="font-mono text-[10px] font-bold uppercase tracking-[0.25em]"
          style={{ color: formation.accentColor }}
        >
          — Modules ({formation.modules.length})
        </h3>
        <ul className="mt-3 space-y-3">
          {formation.modules.map((m, i) => (
            <li
              key={i}
              className="rounded-xl border p-3"
              style={{
                borderColor: `${formation.accentColor}33`,
                backgroundColor: "rgba(255,255,255,0.7)",
              }}
            >
              <div className="flex items-baseline gap-2">
                <span
                  className="font-mono text-[10px] font-bold"
                  style={{ color: formation.accentColor }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4
                  className="font-serif text-base italic leading-tight"
                  style={{ color: INK }}
                >
                  {m.title}
                </h4>
              </div>
              <p
                className="mt-1.5 text-sm leading-snug"
                style={{ color: INK_MUTED }}
              >
                {m.description}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA placeholder */}
      <div
        className="mt-5 rounded-xl border border-dashed p-3 text-center"
        style={{ borderColor: `${formation.accentColor}55` }}
      >
        <p
          className="font-mono text-[9px] uppercase tracking-[0.22em]"
          style={{ color: INK_MUTED }}
        >
          ── inscription au comptoir
        </p>
        <p className="mt-1 text-xs" style={{ color: INK }}>
          Demande au barman pour discuter de cette formation avec un humain.
        </p>
      </div>
    </article>
  );
}
