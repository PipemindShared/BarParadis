"use client";

import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { favTeamMeta, TEAMS, totalFromPeriods, type FavTeam } from "@/lib/hockey";
import { HOCKEY_BG, TeamLogo, TEAL, TEAL_LIGHT } from "../ui";

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const GREEN = "#34d399";

type TeamCode = "mtl" | "car";
type Score = { mtl: number; car: number };
type Pred = {
  winner: TeamCode | null;
  periodScores: Score[];
  shots: Score[];
  scorers: { team: TeamCode; player: string }[];
  finalMtl: number;
  finalCar: number;
};
type Actual = {
  actualWinner?: TeamCode;
  actualPeriodScores?: Score[];
  actualScorers?: { team: TeamCode; player: string }[];
  actualShots?: Score[];
};
type Row = {
  entryId: string;
  rank: number;
  firstName: string;
  lastName: string;
  favoriteTeam: string;
  score: number;
  hasPrediction: boolean;
  prediction: Pred | null;
};

export default function LeaderboardPage() {
  const board = useQuery(api.hockey.leaderboard, {});
  const [selected, setSelected] = useState<Row | null>(null);

  const phase = board?.phase ?? "pregame";
  const started = phase === "live" || phase === "final";
  const actual = (board?.actual ?? {}) as Actual;
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
          {started && (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
              Touche un joueur pour voir sa prédiction
            </p>
          )}
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
              const clickable = started && !!r.prediction;
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
                  onClick={
                    clickable ? () => setSelected(r as Row) : undefined
                  }
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 sm:px-4 ${
                    clickable ? "cursor-pointer" : ""
                  }`}
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
                    {started ? (
                      r.prediction ? (
                        <PredSummary p={r.prediction} />
                      ) : (
                        <Muted text="pas de prédiction" />
                      )
                    ) : r.hasPrediction ? (
                      <span
                        className="font-mono text-[10px] uppercase tracking-[0.16em]"
                        style={{ color: TEAL_LIGHT }}
                      >
                        ✓ prédiction soumise
                      </span>
                    ) : (
                      <Muted text="pas encore de prédiction" />
                    )}
                  </span>
                  {clickable && (
                    <span className="text-white/30">›</span>
                  )}
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
      </div>

      <AnimatePresence>
        {selected && (
          <PredictionModal
            row={selected}
            actual={actual}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Muted({ text }: { text: string }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
      {text}
    </span>
  );
}

function PredSummary({ p }: { p: Pred }) {
  const names = p.scorers.map((s) => s.player.split(" ").slice(-1)[0]);
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

function TeamScore({ code, value }: { code: TeamCode; value: number }) {
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

// ─────────────────────────────────────────────────────────────
// Fenêtre de détail d'une prédiction (avec comparaison aux résultats)
// ─────────────────────────────────────────────────────────────

function sum(arr?: Score[]): Score {
  if (!arr) return { mtl: 0, car: 0 };
  return arr.reduce(
    (a, p) => ({ mtl: a.mtl + (p.mtl || 0), car: a.car + (p.car || 0) }),
    { mtl: 0, car: 0 }
  );
}

function Chip({
  children,
  state,
}: {
  children: React.ReactNode;
  state: "correct" | "close" | "neutral";
}) {
  const styles =
    state === "correct"
      ? {
          background: "rgba(52,211,153,0.18)",
          color: "#6ee7b7",
          border: `1px solid ${GREEN}80`,
        }
      : state === "close"
        ? {
            background: "rgba(255,200,80,0.14)",
            color: "#fcd34d",
            border: "1px solid rgba(255,200,80,0.45)",
          }
        : {
            background: "rgba(255,255,255,0.06)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.12)",
          };
  return (
    <span
      className="inline-flex min-w-[2.2rem] items-center justify-center rounded-md px-2 py-1 font-mono text-sm font-bold tabular-nums"
      style={styles}
    >
      {children}
    </span>
  );
}

function periodLabel(i: number): string {
  if (i === 0) return "1re";
  if (i === 1) return "2e";
  if (i === 2) return "3e";
  return "Prol.";
}

function PredictionModal({
  row,
  actual,
  onClose,
}: {
  row: Row;
  actual: Actual;
  onClose: () => void;
}) {
  const p = row.prediction!;
  const hasWinner = !!actual.actualWinner;
  const hasScores = !!actual.actualPeriodScores?.length;
  const hasShots = !!actual.actualShots?.length;
  const hasScorers = !!actual.actualScorers?.length;

  const predFinal = sum(p.periodScores);
  const actualFinal = sum(actual.actualPeriodScores);
  const finalState: "correct" | "neutral" =
    hasScores &&
    predFinal.mtl === actualFinal.mtl &&
    predFinal.car === actualFinal.car
      ? "correct"
      : "neutral";

  // Buteurs: intersection multiset
  const remaining = new Map<string, number>();
  (actual.actualScorers ?? []).forEach((s) => {
    const k = `${s.team}:${s.player}`;
    remaining.set(k, (remaining.get(k) ?? 0) + 1);
  });
  const scorerMatched = p.scorers.map((s) => {
    if (!hasScorers) return false;
    const k = `${s.team}:${s.player}`;
    const left = remaining.get(k) ?? 0;
    if (left > 0) {
      remaining.set(k, left - 1);
      return true;
    }
    return false;
  });

  const nPeriods = Math.max(p.periodScores.length, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      style={{ background: "rgba(2,8,18,0.75)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className="teal-scrollbar max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 p-5 text-white sm:rounded-3xl"
        style={{ background: "#0c1726" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
              Prédiction de
            </p>
            <h2 className="font-serif text-2xl italic">
              {row.firstName} {row.lastName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
            style={{ background: "rgba(255,255,255,0.08)", color: "white" }}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span className="font-mono text-sm font-bold" style={{ color: TEAL_LIGHT }}>
            {row.score} pts
          </span>
          <span className="font-mono text-[11px] text-white/40">
            · les bonnes prédictions sont en vert
          </span>
        </div>

        {/* Gagnant */}
        <Section title="Gagnant prédit">
          <Chip state={hasWinner && p.winner === actual.actualWinner ? "correct" : "neutral"}>
            {p.winner ? TEAMS[p.winner].short : "—"}
          </Chip>
          {hasWinner && (
            <span className="ml-2 font-mono text-[11px] text-white/45">
              réel : {actual.actualWinner ? TEAMS[actual.actualWinner].short : "—"}
            </span>
          )}
        </Section>

        {/* Score final */}
        <Section title="Score final">
          <Chip state={finalState}>
            {predFinal.mtl} – {predFinal.car}
          </Chip>
          {hasScores && (
            <span className="ml-2 font-mono text-[11px] text-white/45">
              réel : {actualFinal.mtl} – {actualFinal.car}
            </span>
          )}
        </Section>

        {/* Score par période */}
        <Section title="Score par période">
          <div className="flex flex-col gap-2">
            {Array.from({ length: nPeriods }).map((_, i) => {
              const ps = p.periodScores[i] ?? { mtl: 0, car: 0 };
              const as = actual.actualPeriodScores?.[i];
              const cellState = (team: TeamCode): "correct" | "neutral" =>
                as && ps[team] === as[team] ? "correct" : "neutral";
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-12 font-serif text-sm italic text-white/70">
                    {periodLabel(i)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: TEAMS.mtl.color }}
                    >
                      MTL
                    </span>
                    <Chip state={cellState("mtl")}>{ps.mtl}</Chip>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: TEAMS.car.color }}
                    >
                      CAR
                    </span>
                    <Chip state={cellState("car")}>{ps.car}</Chip>
                  </span>
                  {as && (
                    <span className="font-mono text-[11px] text-white/35">
                      réel {as.mtl}–{as.car}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* Buteurs / scoreurs */}
        <Section title="Scoreurs prédits">
          {p.scorers.length === 0 ? (
            <span className="font-mono text-[12px] text-white/40">Aucun</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {p.scorers.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px]"
                  style={
                    scorerMatched[idx]
                      ? {
                          background: "rgba(52,211,153,0.18)",
                          color: "#6ee7b7",
                          border: `1px solid ${GREEN}80`,
                        }
                      : {
                          background: "rgba(255,255,255,0.05)",
                          color: "white",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }
                  }
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: TEAMS[s.team].color }}
                  />
                  {s.player}
                </span>
              ))}
            </div>
          )}
          {hasScorers && (
            <p className="mt-2 font-mono text-[11px] text-white/40">
              réels :{" "}
              {(actual.actualScorers ?? [])
                .map((s) => s.player)
                .join(", ") || "—"}
            </p>
          )}
        </Section>

        {/* Tirs au but */}
        <Section title="Tirs au but par période">
          <div className="flex flex-col gap-2">
            {p.shots.map((ps, i) => {
              const as = actual.actualShots?.[i];
              const cellState = (team: TeamCode): "correct" | "close" | "neutral" => {
                if (!as) return "neutral";
                const diff = Math.abs((ps[team] || 0) - (as[team] || 0));
                if (diff === 0) return "correct";
                if (diff <= 5) return "close";
                return "neutral";
              };
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-12 font-serif text-sm italic text-white/70">
                    {periodLabel(i)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: TEAMS.mtl.color }}
                    >
                      MTL
                    </span>
                    <Chip state={cellState("mtl")}>{ps.mtl}</Chip>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: TEAMS.car.color }}
                    >
                      CAR
                    </span>
                    <Chip state={cellState("car")}>{ps.car}</Chip>
                  </span>
                  {as && (
                    <span className="font-mono text-[11px] text-white/35">
                      réel {as.mtl}–{as.car}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-2 font-mono text-[10px] text-white/35">
            vert = exact · jaune = à ±5
          </p>
        </Section>
      </motion.div>
    </motion.div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
        {title}
      </h3>
      {children}
    </section>
  );
}
