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
const INK = "#0f172a";
const INK_MID = "#475569";
const INK_MUTED = "#64748b";
const BG = "#f6f7f9";

const SWIPE_CONFIDENCE_THRESHOLD = 8000;
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

  const ordered = useMemo<Formation[]>(() => {
    if (!profile) return FORMATIONS;
    const idx = FORMATIONS.findIndex((f) => f.profile === profile);
    if (idx <= 0) return FORMATIONS;
    return [...FORMATIONS.slice(idx), ...FORMATIONS.slice(0, idx)];
  }, [profile]);

  const [[page, direction], setPage] = useState<[number, 1 | -1]>([0, 1]);
  const index = ((page % ordered.length) + ordered.length) % ordered.length;
  const formation = ordered[index];
  const isRecommended = formation.profile === profile;

  function paginate(dir: 1 | -1) {
    setPage([page + dir, dir]);
  }

  return (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col"
      style={{ backgroundColor: BG, color: INK }}
    >
      {/* Texture grille subtile */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.05) 1px, transparent 0)",
          backgroundSize: "24px 24px",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
        }}
      />

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between border-b bg-white/85 px-5 py-3.5 backdrop-blur-md"
        style={{ borderColor: "rgba(15, 23, 42, 0.06)" }}
      >
        <Link
          href="/file"
          className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em]"
          style={{ color: INK_MUTED }}
        >
          <span>←</span>
          <span className="hidden sm:inline">retour à la file</span>
          <span className="sm:hidden">file</span>
        </Link>
        <Image
          src="/images/pipemindlogo1.png"
          alt="Pipemind"
          width={88}
          height={26}
          className="h-6 w-auto object-contain"
          priority
        />
      </header>

      {/* Title section */}
      <div className="relative z-10 px-5 pt-7 sm:pt-9">
        <p
          className="font-mono text-[11px] font-bold uppercase tracking-[0.24em]"
          style={{ color: TEAL }}
        >
          Formations Pipemind
        </p>
        <h1
          className="mt-2 text-[clamp(1.6rem,6vw,2.1rem)] font-semibold leading-[1.1] tracking-tight"
          style={{ color: INK }}
        >
          Trois spécialisations
          <br />
          <span style={{ color: INK_MID }}>pour ton équipe.</span>
        </h1>

        {profile && (
          <div
            className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
            style={{
              borderColor: `${formation.accentColor}55`,
              backgroundColor: `${formation.accentColor}11`,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: formation.accentColor }}
            />
            <span
              className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: formation.accentColor }}
            >
              Recommandée pour ton profil {profile}
            </span>
          </div>
        )}
      </div>

      {/* Carousel */}
      <div className="relative z-10 mt-6 flex flex-1 flex-col px-2 sm:px-5">
        <div className="relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
              transition={{
                opacity: { duration: 0.25 },
                x: { type: "spring", stiffness: 300, damping: 32 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(_, info) => {
                const swipe = swipePower(info.offset.x, info.velocity.x);
                if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) paginate(1);
                else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) paginate(-1);
              }}
              className="cursor-grab active:cursor-grabbing"
              style={{ touchAction: "pan-y" }}
            >
              <FormationCard
                formation={formation}
                isRecommended={isRecommended}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation: arrows + indicators */}
        <div className="mt-6 flex items-center justify-between gap-4 px-1">
          <button
            onClick={() => paginate(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-sm transition-all hover:shadow-md active:scale-95"
            style={{ borderColor: "rgba(15, 23, 42, 0.12)", color: INK }}
            aria-label="Formation précédente"
          >
            ←
          </button>

          <div className="flex flex-1 items-center justify-center gap-1.5">
            {ordered.map((f, i) => (
              <button
                key={f.profile}
                onClick={() => setPage([i, i > index ? 1 : -1])}
                className="group flex items-center gap-1.5 rounded-full transition-all"
                style={{
                  backgroundColor: i === index ? f.accentColor : "transparent",
                  padding: i === index ? "6px 12px" : "6px 8px",
                  border:
                    i === index
                      ? "none"
                      : "1px solid rgba(15, 23, 42, 0.12)",
                }}
                aria-label={`Formation ${f.profile}`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor:
                      i === index ? "white" : f.accentColor,
                  }}
                />
                {i === index && (
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                    {f.profile}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => paginate(1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-sm transition-all hover:shadow-md active:scale-95"
            style={{ borderColor: "rgba(15, 23, 42, 0.12)", color: INK }}
            aria-label="Formation suivante"
          >
            →
          </button>
        </div>

        <p
          className="mt-3 mb-4 text-center font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: INK_MUTED }}
        >
          Glisse ou utilise les flèches
        </p>
      </div>
    </div>
  );
}

function FormationCard({
  formation,
  isRecommended,
}: {
  formation: Formation;
  isRecommended: boolean;
}) {
  return (
    <article
      className="mx-auto max-w-xl rounded-2xl border bg-white shadow-lg"
      style={{
        borderColor: "rgba(15, 23, 42, 0.08)",
        boxShadow:
          "0 1px 2px rgba(15, 23, 42, 0.05), 0 16px 40px -12px rgba(15, 23, 42, 0.12)",
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-1 rounded-t-2xl"
        style={{ backgroundColor: formation.accentColor }}
      />

      <div className="p-5 sm:p-6">
        {/* Category + recommended */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{
              backgroundColor: `${formation.accentColor}18`,
              color: formation.accentColor,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: formation.accentColor }}
            />
            {formation.category}
          </span>
          {isRecommended && (
            <span
              className="font-mono text-[9px] font-bold uppercase tracking-[0.22em]"
              style={{ color: TEAL }}
            >
              ✓ Recommandée
            </span>
          )}
        </div>

        {/* Title */}
        <h2
          className="mt-3 text-[clamp(1.35rem,5.5vw,1.75rem)] font-bold leading-[1.15] tracking-tight"
          style={{ color: INK }}
        >
          {formation.title}
        </h2>
        <p
          className="mt-2 text-[14px] leading-snug"
          style={{ color: INK_MID }}
        >
          {formation.subtitle}
        </p>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px]">
          <Meta label="Durée" value={formation.duration} />
          <Divider />
          <Meta label="Niveau" value={formation.level} />
          <Divider />
          <Meta
            label="Modules"
            value={`${formation.modules.length} séances`}
          />
        </div>

        {/* Modules */}
        <div className="mt-5">
          <h3
            className="font-mono text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: INK_MUTED }}
          >
            Au programme
          </h3>
          <ul className="mt-3 space-y-2">
            {formation.modules.map((m, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold"
                  style={{
                    backgroundColor: `${formation.accentColor}15`,
                    color: formation.accentColor,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h4
                    className="text-[14px] font-semibold leading-snug"
                    style={{ color: INK }}
                  >
                    {m.title}
                  </h4>
                  <p
                    className="text-[12px] leading-snug"
                    style={{ color: INK_MUTED }}
                  >
                    {m.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div
          className="mt-5 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
          style={{ borderColor: "rgba(15, 23, 42, 0.08)" }}
        >
          <p className="text-[12px]" style={{ color: INK_MID }}>
            Intéressé ? Parle au barman pour les détails et tarifs.
          </p>
        </div>
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span
        className="font-mono text-[9px] font-bold uppercase tracking-[0.18em]"
        style={{ color: INK_MUTED }}
      >
        {label}
      </span>
      <span className="text-[13px] font-medium" style={{ color: INK }}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <span
      className="h-6 w-px"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.1)" }}
    />
  );
}
