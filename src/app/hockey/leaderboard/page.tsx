"use client";

import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { favTeamMeta, TEAMS, totalFromPeriods, type FavTeam } from "@/lib/hockey";
import { HOCKEY_BG, TeamLogo, TEAL, TEAL_LIGHT } from "../ui";

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function LeaderboardPage() {
  const board = useQuery(api.hockey.leaderboard, {});

  const phase = board?.phase ?? "pregame";
  const live = totalFromPeriods(board?.actual.actualPeriodScores);

  return (
    <div
      className="min-h-[100dvh] w-full px-4 py-6 text-white teal-scrollbar sm:px-6 sm:py-10"
      style={{ background: HOCKEY_BG }}
    >
      <div className="mx-auto max-w-2xl">
        <header className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/55">
            ── Habsterface
          </p>
          <h1 className="mt-2 font-serif text-[clamp(2.2rem,9vw,3.5rem)] italic leading-none">
            Classement
          </h1>

          {/* Tableau de pointage du match */}
          <div
            className="mx-auto mt-6 flex max-w-md items-center justify-center gap-5 rounded-2xl border border-white/10 px-5 py-4"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <TeamScore code="mtl" value={live.mtl} />
            <div className="flex flex-col items-center">
              <PhaseBadge phase={phase} />
              <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                {board?.withPrediction ?? 0} joueurs
              </span>
            </div>
            <TeamScore code="car" value={live.car} />
          </div>
        </header>

        <ol className="mt-8 flex flex-col gap-2">
          {!board && (
            <li className="py-10 text-center text-white/40">Chargement…</li>
          )}
          {board && board.rows.length === 0 && (
            <li className="py-10 text-center text-white/40">
              Aucun joueur pour l&apos;instant.
            </li>
          )}
          <AnimatePresence initial={false}>
            {board?.rows.map((r) => {
              const fav = favTeamMeta(r.favoriteTeam as FavTeam);
              const top3 = r.rank <= 3;
              return (
                <motion.li
                  key={r.entryId}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{
                    layout: { type: "spring", stiffness: 700, damping: 40 },
                    opacity: { duration: 0.25 },
                    scale: { duration: 0.25 },
                  }}
                  className="flex items-center gap-3 rounded-xl border px-3 py-3 sm:px-4"
                  style={{
                    borderColor: top3
                      ? `${TEAL_LIGHT}44`
                      : "rgba(255,255,255,0.08)",
                    background: top3
                      ? `linear-gradient(90deg, ${TEAL}1f, rgba(255,255,255,0.03))`
                      : "rgba(255,255,255,0.03)",
                  }}
                >
                  <motion.span
                    layout
                    className="w-8 text-center font-mono text-lg font-bold text-white/60"
                  >
                    {MEDAL[r.rank] ?? r.rank}
                  </motion.span>
                  <TeamLogo
                    src={fav.logo}
                    alt={fav.name}
                    color={fav.color}
                    abbr={fav.short.slice(0, 3).toUpperCase()}
                    size={34}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {r.firstName} {r.lastName}
                    </span>
                    {r.prediction ? (
                      <PredSummary p={r.prediction} />
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
                        pas encore de prédiction
                      </span>
                    )}
                  </span>
                  <span
                    className="font-mono text-xl font-bold tabular-nums"
                    style={{ color: top3 ? TEAL_LIGHT : "white" }}
                  >
                    {r.score}
                    <span className="ml-1 text-xs font-normal text-white/40">
                      pts
                    </span>
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>

        <div className="mt-10 flex justify-center">
          <Link
            href="/hockey"
            className="rounded-full border border-white/15 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 transition hover:text-white"
          >
            ← Faire une prédiction
          </Link>
        </div>
      </div>
    </div>
  );
}

function PredSummary({
  p,
}: {
  p: {
    winner: "mtl" | "car" | null;
    finalMtl: number;
    finalCar: number;
    scorers: string[];
  };
}) {
  const names = p.scorers.map((full) => full.split(" ").slice(-1)[0]);
  const shown = names.slice(0, 2).join(", ");
  const extra = names.length > 2 ? "…" : "";
  return (
    <span className="mt-0.5 flex items-center gap-1.5 overflow-hidden font-mono text-[11px] text-white/45">
      <span className={p.winner === "mtl" ? "font-bold text-white" : ""}>
        MTL&nbsp;{p.finalMtl}
      </span>
      <span className="text-white/30">–</span>
      <span className={p.winner === "car" ? "font-bold text-white" : ""}>
        {p.finalCar}&nbsp;CAR
      </span>
      {names.length > 0 && (
        <span className="truncate text-white/35">
          &middot; {shown}
          {extra}
        </span>
      )}
    </span>
  );
}

function TeamScore({ code, value }: { code: "mtl" | "car"; value: number }) {
  const t = TEAMS[code];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <TeamLogo src={t.logo} alt={t.name} color={t.color} abbr={t.abbr} size={44} />
      <span className="font-mono text-3xl font-bold tabular-nums">{value}</span>
    </div>
  );
}

function PhaseBadge({ phase }: { phase: string }) {
  if (phase === "live") {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1">
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ backgroundColor: "#f87171" }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: "#f87171" }}
          />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
          En direct
        </span>
      </span>
    );
  }
  if (phase === "final") {
    return (
      <span className="rounded-full border border-white/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em]">
        Final
      </span>
    );
  }
  return (
    <span
      className="rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
      style={{ background: `${TEAL}33`, color: TEAL_LIGHT }}
    >
      Avant-match
    </span>
  );
}
