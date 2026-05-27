"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import {
  emptyPeriods,
  NUM_PERIODS,
  ROSTERS,
  TEAMS,
  totalFromPeriods,
  type PeriodScore,
  type TeamCode,
} from "@/lib/hockey";
import {
  NumberStepper,
  SectionTitle,
  TEAL,
  TEAL_DEEP,
  TEAL_LIGHT,
} from "./ui";
import type { Id } from "../../../convex/_generated/dataModel";

function resize(arr: string[], len: number): string[] {
  if (arr.length === len) return arr;
  if (arr.length > len) return arr.slice(0, len);
  return [...arr, ...Array(len - arr.length).fill("")];
}

// En-tête de colonne d'équipe — pastille colorée + abréviation en blanc
function ColHeader({ code }: { code: TeamCode }) {
  const t = TEAMS[code];
  return (
    <span className="flex items-center justify-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }}
      />
      <span className="text-[12px] font-bold tracking-wide text-white">
        {t.abbr}
      </span>
    </span>
  );
}

export default function HockeyPredict({
  entryId,
  onDone,
}: {
  entryId: string;
  onDone: () => void;
}) {
  const entry = useQuery(api.hockey.getEntry, {
    entryId: entryId as Id<"hockeyEntries">,
  });
  const savePrediction = useMutation(api.hockey.savePrediction);
  const sendConfirmation = useAction(api.hockeySms.sendPredictionConfirmation);

  const [periods, setPeriods] = useState<PeriodScore[]>(emptyPeriods());
  const [shots, setShots] = useState<PeriodScore[]>(emptyPeriods());
  const [otWinner, setOtWinner] = useState<TeamCode | null>(null);
  const [scorersMtl, setScorersMtl] = useState<string[]>([]);
  const [scorersCar, setScorersCar] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefilled = useRef(false);

  // Préremplir si l'inscription a déjà une prédiction
  useEffect(() => {
    if (!entry || prefilled.current) return;
    prefilled.current = true;
    if (entry.periodScores && entry.periodScores.length >= NUM_PERIODS) {
      setPeriods(entry.periodScores.slice(0, NUM_PERIODS));
      // 4e entrée = prolongation
      if (entry.periodScores.length >= NUM_PERIODS + 1) {
        const ot = entry.periodScores[NUM_PERIODS];
        setOtWinner(ot.mtl > 0 ? "mtl" : ot.car > 0 ? "car" : null);
      }
    }
    if (entry.shots && entry.shots.length === NUM_PERIODS) {
      setShots(entry.shots);
    }
    if (entry.scorers) {
      setScorersMtl(
        entry.scorers.filter((s) => s.team === "mtl").map((s) => s.player)
      );
      setScorersCar(
        entry.scorers.filter((s) => s.team === "car").map((s) => s.player)
      );
    }
  }, [entry]);

  const reg = useMemo(() => totalFromPeriods(periods), [periods]);
  const isTied = reg.mtl === reg.car;

  // Score final = régulation + but de prolongation éventuel
  const final = useMemo(
    () => ({
      mtl: reg.mtl + (otWinner === "mtl" ? 1 : 0),
      car: reg.car + (otWinner === "car" ? 1 : 0),
    }),
    [reg, otWinner]
  );

  // Le gagnant prédit est déterminé par le score (prolongation incluse)
  const derivedWinner: TeamCode | null =
    final.mtl > final.car ? "mtl" : final.car > final.mtl ? "car" : null;

  // Si plus d'égalité, on annule la prolongation
  useEffect(() => {
    if (!isTied && otWinner !== null) setOtWinner(null);
  }, [isTied, otWinner]);

  // Aligner le nombre de scoreurs à choisir sur le nombre de buts prévus
  // (prolongation incluse)
  useEffect(() => {
    setScorersMtl((prev) => resize(prev, final.mtl));
  }, [final.mtl]);
  useEffect(() => {
    setScorersCar((prev) => resize(prev, final.car));
  }, [final.car]);

  function setPeriod(i: number, team: TeamCode, value: number) {
    setPeriods((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [team]: value } : p))
    );
  }
  function setShot(i: number, team: TeamCode, value: number) {
    setShots((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [team]: value } : p))
    );
  }

  const allScorersChosen =
    scorersMtl.every((s) => s !== "") && scorersCar.every((s) => s !== "");
  const otOk = !isTied || otWinner !== null;
  const canSubmit = otOk && !!derivedWinner && allScorersChosen && !submitting;

  async function submit() {
    if (!canSubmit || !derivedWinner) return;
    setSubmitting(true);
    setError(null);
    try {
      // periodScores = 3 périodes (+ une 4e pour la prolongation si égalité)
      const periodScores: PeriodScore[] = otWinner
        ? [
            ...periods,
            otWinner === "mtl" ? { mtl: 1, car: 0 } : { mtl: 0, car: 1 },
          ]
        : periods;
      const scorers = [
        ...scorersMtl.map((player) => ({ team: "mtl" as const, player })),
        ...scorersCar.map((player) => ({ team: "car" as const, player })),
      ];
      await savePrediction({
        entryId: entryId as Id<"hockeyEntries">,
        winner: derivedWinner,
        periodScores,
        scorers,
        shots,
      });
      sendConfirmation({ entryId: entryId as Id<"hockeyEntries"> }).catch(
        () => {}
      );
      onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("PREDICTIONS_CLOSED")) {
        setError("Les prédictions sont fermées — le match a commencé.");
      } else {
        setError("Échec de l'enregistrement. Réessaie.");
      }
      setSubmitting(false);
    }
  }

  const submitHint =
    isTied && !otWinner
      ? "Égalité après 3 périodes — choisis qui marque en prolongation"
      : !allScorersChosen
        ? "Choisis un scoreur pour chaque but prévu"
        : null;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-y-auto px-5 pb-32 pt-6 teal-scrollbar">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/55">
          ── tes prédictions
        </p>
        <h1 className="mt-2 font-serif text-[clamp(1.7rem,7vw,2.4rem)] italic leading-tight text-white">
          {TEAMS.mtl.short} <span className="text-white/40">vs</span>{" "}
          {TEAMS.car.short}
        </h1>
      </header>

      {/* 1 — Score par période (détermine le gagnant) */}
      <section className="mt-7">
        <SectionTitle
          index={1}
          title="Score par période"
          hint="Le gagnant est déterminé par ton pointage"
        />
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div
            className="grid grid-cols-3 px-4 py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-white/50"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <span className="text-left">Période</span>
            <ColHeader code="mtl" />
            <ColHeader code="car" />
          </div>
          {periods.map((p, i) => (
            <div
              key={i}
              className="grid grid-cols-3 items-center border-t border-white/10 px-4 py-3"
            >
              <span className="text-left font-serif text-lg italic text-white">
                {i + 1}
                <sup className="text-xs">{i === 0 ? "re" : "e"}</sup>
              </span>
              <div className="flex justify-center">
                <NumberStepper
                  value={p.mtl}
                  onChange={(v) => setPeriod(i, "mtl", v)}
                  max={15}
                />
              </div>
              <div className="flex justify-center">
                <NumberStepper
                  value={p.car}
                  onChange={(v) => setPeriod(i, "car", v)}
                  max={15}
                />
              </div>
            </div>
          ))}

          {/* Prolongation — apparaît si égalité après 3 périodes */}
          {isTied && (
            <div
              className="grid grid-cols-3 items-center border-t px-4 py-3"
              style={{
                borderColor: "rgba(255,200,80,0.3)",
                background: "rgba(255,200,80,0.08)",
              }}
            >
              <span className="text-left font-serif text-base italic leading-tight text-amber-200">
                Prolon-<br />gation
              </span>
              <div className="flex justify-center">
                <OtCell
                  active={otWinner === "mtl"}
                  color={TEAMS.mtl.color}
                  onClick={() => setOtWinner(otWinner === "mtl" ? null : "mtl")}
                />
              </div>
              <div className="flex justify-center">
                <OtCell
                  active={otWinner === "car"}
                  color={TEAMS.car.color}
                  onClick={() => setOtWinner(otWinner === "car" ? null : "car")}
                />
              </div>
            </div>
          )}

          <div
            className="grid grid-cols-3 items-center border-t border-white/15 px-4 py-3"
            style={{ background: `${TEAL}18` }}
          >
            <span className="text-left font-mono text-[11px] uppercase tracking-[0.16em] text-white/70">
              Final
            </span>
            <span
              className="text-center font-mono text-2xl font-bold"
              style={{ color: TEAL_LIGHT }}
            >
              {final.mtl}
            </span>
            <span
              className="text-center font-mono text-2xl font-bold"
              style={{ color: TEAL_LIGHT }}
            >
              {final.car}
            </span>
          </div>
        </div>
        {isTied && !otWinner && (
          <p className="mt-2 text-[13px] leading-snug text-amber-200/80">
            Égalité après 3 périodes&nbsp;: choisis l&apos;équipe qui marque le
            but gagnant en prolongation (mort subite).
          </p>
        )}
        {derivedWinner && (
          <p className="mt-2 text-center text-[13px] text-white/60">
            🏆 Tu prédis une victoire des{" "}
            <span className="font-semibold" style={{ color: TEAL_LIGHT }}>
              {TEAMS[derivedWinner].short}
            </span>
          </p>
        )}
      </section>

      {/* 2 — Scoreurs */}
      <section className="mt-9">
        <SectionTitle
          index={2}
          title="Les scoreurs"
          hint="Un joueur par but prévu"
        />
        {final.mtl === 0 && final.car === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50">
            Entre d&apos;abord un score plus haut pour choisir des scoreurs.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            <ScorerGroup
              team="mtl"
              picks={scorersMtl}
              onChange={(idx, v) =>
                setScorersMtl((prev) =>
                  prev.map((x, i) => (i === idx ? v : x))
                )
              }
            />
            <ScorerGroup
              team="car"
              picks={scorersCar}
              onChange={(idx, v) =>
                setScorersCar((prev) =>
                  prev.map((x, i) => (i === idx ? v : x))
                )
              }
            />
          </div>
        )}
      </section>

      {/* 3 — Tirs au but */}
      <section className="mt-9">
        <SectionTitle index={3} title="Tirs au but par période" />
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div
            className="grid grid-cols-3 px-4 py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-white/50"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <span className="text-left">Période</span>
            <ColHeader code="mtl" />
            <ColHeader code="car" />
          </div>
          {shots.map((p, i) => (
            <div
              key={i}
              className="grid grid-cols-3 items-center border-t border-white/10 px-4 py-3"
            >
              <span className="text-left font-serif text-lg italic text-white">
                {i + 1}
                <sup className="text-xs">{i === 0 ? "re" : "e"}</sup>
              </span>
              <div className="flex justify-center">
                <NumberStepper
                  value={p.mtl}
                  onChange={(v) => setShot(i, "mtl", v)}
                  max={40}
                />
              </div>
              <div className="flex justify-center">
                <NumberStepper
                  value={p.car}
                  onChange={(v) => setShot(i, "car", v)}
                  max={40}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Barre de soumission fixe */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#08111f]/90 px-5 py-4 backdrop-blur-md">
        {error && (
          <p className="mb-2 text-center text-sm" style={{ color: "#fca5a5" }}>
            {error}
          </p>
        )}
        {submitHint && !error && (
          <p
            className="mb-2.5 text-center text-base font-bold leading-snug"
            style={{ color: "#ff5d5d" }}
          >
            ⚠ {submitHint}
          </p>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed"
          style={
            canSubmit
              ? {
                  background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)`,
                  color: "white",
                  boxShadow: `0 10px 40px -8px ${TEAL}99`,
                }
              : {
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.4)",
                }
          }
        >
          {submitting ? "Enregistrement…" : "Soumettre ma prédiction"}
        </button>
      </div>
    </div>
  );
}

// Cellule de prolongation: 0 ou 1 but pour une équipe (mutuellement exclusif)
function OtCell({
  active,
  color,
  onClick,
}: {
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-14 items-center justify-center rounded-lg font-mono text-xl font-bold transition active:scale-90"
      style={{
        background: active ? color : "rgba(255,255,255,0.06)",
        color: active ? "white" : "rgba(255,255,255,0.5)",
        boxShadow: active ? `0 0 16px -4px ${color}` : "none",
      }}
    >
      {active ? 1 : 0}
    </button>
  );
}

function ScorerGroup({
  team,
  picks,
  onChange,
}: {
  team: TeamCode;
  picks: string[];
  onChange: (idx: number, value: string) => void;
}) {
  const t = TEAMS[team];
  if (picks.length === 0) return null;
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full" style={{ background: t.color }} />
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/70">
          {t.short} · {picks.length} but{picks.length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {picks.map((pick, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-6 text-center font-mono text-sm text-white/40">
              {idx + 1}
            </span>
            <select
              value={pick}
              onChange={(e) => onChange(idx, e.target.value)}
              className="flex-1 rounded-xl border px-3 py-2.5 text-[15px] text-white outline-none"
              style={{
                borderColor:
                  pick === ""
                    ? "rgba(248,113,113,0.4)"
                    : "rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <option value="" style={{ color: "black" }}>
                — choisir un joueur —
              </option>
              {ROSTERS[team].map((player) => (
                <option key={player} value={player} style={{ color: "black" }}>
                  {player}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
