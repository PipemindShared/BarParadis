"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import {
  FAV_TEAMS,
  NUM_PERIODS,
  ROSTERS,
  TEAMS,
  TEAM_CODES,
  totalFromPeriods,
  emptyPeriods,
  type FavTeam,
  type PeriodScore,
  type TeamCode,
} from "@/lib/hockey";
import {
  HOCKEY_BG,
  NumberStepper,
  TEAL,
  TEAL_DEEP,
  TEAL_LIGHT,
} from "../ui";

type Phase = "pregame" | "live" | "final";

export default function HockeyAdminPage() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("hockey_admin_unlocked") === "1") {
        setUnlocked(true);
      }
    } catch {}
  }, []);

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;
  return <AdminConsole />;
}

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const verifyPin = useAction(api.bar.verifyPin);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (checking) return;
    setChecking(true);
    setError(null);
    try {
      const { ok } = await verifyPin({ pin });
      if (!ok) {
        setError("PIN incorrect");
        setChecking(false);
        return;
      }
      try {
        localStorage.setItem("hockey_admin_unlocked", "1");
      } catch {}
      onUnlock();
    } catch {
      setError("Erreur de vérification");
      setChecking(false);
    }
  }

  return (
    <div
      className="flex min-h-[100dvh] w-full items-center justify-center px-6 text-white"
      style={{ background: HOCKEY_BG }}
    >
      <form onSubmit={submit} className="w-full max-w-sm text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/55">
          ── Habsterface · admin
        </p>
        <h1 className="mt-3 font-serif text-3xl italic" style={{ color: TEAL_LIGHT }}>
          Console du match
        </h1>
        <input
          type="password"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError(null);
          }}
          placeholder="PIN"
          inputMode="numeric"
          autoFocus
          className="mt-8 w-full rounded-xl border px-4 py-3 text-center text-lg tracking-[0.4em] text-white outline-none"
          style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)" }}
        />
        {error && (
          <p className="mt-3 text-sm" style={{ color: "#fca5a5" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={checking || pin.length === 0}
          className="mt-5 w-full rounded-full px-6 py-3.5 font-semibold text-white transition active:scale-[0.98] disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)` }}
        >
          {checking ? "Vérification…" : "Déverrouiller"}
        </button>
      </form>
    </div>
  );
}

function AdminConsole() {
  const config = useQuery(api.hockey.getConfig);
  const stats = useQuery(api.hockey.adminStats);
  const board = useQuery(api.hockey.leaderboard, {});
  const setPhase = useMutation(api.hockey.setPhase);
  const setActuals = useMutation(api.hockey.setActuals);
  const clearEntries = useMutation(api.hockey.clearEntries);
  const resetMatch = useMutation(api.hockey.resetMatch);
  const deleteEntry = useMutation(api.hockey.deleteEntry);
  const bulkCreateTestEntries = useMutation(api.hockey.bulkCreateTestEntries);
  const [seeding, setSeeding] = useState(false);

  async function createTestParticipants() {
    if (seeding) return;
    setSeeding(true);
    try {
      const PRENOMS = [
        "Marc", "Julie", "Pierre", "Sophie", "Alexandre", "Catherine",
        "Maxime", "Émilie", "Hugo", "Léa", "Antoine", "Camille",
        "Vincent", "Sarah", "Olivier", "Marie", "Samuel", "Audrey",
        "Félix", "Gabrielle",
      ];
      const NOMS = [
        "Tremblay", "Gagnon", "Roy", "Côté", "Bouchard", "Gauthier",
        "Morin", "Lavoie", "Fortin", "Bélanger", "Pelletier", "Lévesque",
        "Bergeron", "Girard", "Caron", "Cloutier", "Dubé", "Poirier",
        "Fournier", "Lapointe",
      ];
      const favs = FAV_TEAMS.map((t) => t.code as FavTeam);
      const rint = (max: number) => Math.floor(Math.random() * (max + 1));
      const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

      const entries = Array.from({ length: 20 }, (_, i) => {
        const ps: PeriodScore[] = Array.from({ length: NUM_PERIODS }, () => ({
          mtl: rint(2),
          car: rint(2),
        }));
        let tot = ps.reduce(
          (a, p) => ({ mtl: a.mtl + p.mtl, car: a.car + p.car }),
          { mtl: 0, car: 0 }
        );
        // Égalité → but de prolongation pour une équipe au hasard
        if (tot.mtl === tot.car) {
          const ot: PeriodScore =
            Math.random() < 0.5 ? { mtl: 1, car: 0 } : { mtl: 0, car: 1 };
          ps.push(ot);
          tot = { mtl: tot.mtl + ot.mtl, car: tot.car + ot.car };
        }
        const winner: TeamCode = tot.mtl > tot.car ? "mtl" : "car";
        const scorers = [
          ...Array.from({ length: tot.mtl }, () => ({
            team: "mtl" as const,
            player: pick(ROSTERS.mtl),
          })),
          ...Array.from({ length: tot.car }, () => ({
            team: "car" as const,
            player: pick(ROSTERS.car),
          })),
        ];
        const shots: PeriodScore[] = Array.from({ length: NUM_PERIODS }, () => ({
          mtl: 5 + rint(10),
          car: 5 + rint(10),
        }));
        return {
          firstName: PRENOMS[i % PRENOMS.length],
          lastName: NOMS[i % NOMS.length],
          phone: `+1555000${String(1000 + i)}`,
          favoriteTeam: favs[i % favs.length],
          winner,
          periodScores: ps,
          scorers,
          shots,
        };
      });

      await bulkCreateTestEntries({ entries });
    } finally {
      setSeeding(false);
    }
  }

  const [periods, setPeriods] = useState<PeriodScore[]>(emptyPeriods());
  const [shots, setShots] = useState<PeriodScore[]>(emptyPeriods());
  const [scorers, setScorers] = useState<{ team: TeamCode; player: string }[]>(
    []
  );
  const [otWinner, setOtWinner] = useState<TeamCode | null>(null);
  const [saved, setSaved] = useState(false);
  const loaded = useRef(false);

  // Préremplir depuis la config existante (une fois)
  useEffect(() => {
    if (!config || loaded.current) return;
    loaded.current = true;
    if (config.actualPeriodScores && config.actualPeriodScores.length >= NUM_PERIODS) {
      setPeriods(config.actualPeriodScores.slice(0, NUM_PERIODS));
      if (config.actualPeriodScores.length >= NUM_PERIODS + 1) {
        const ot = config.actualPeriodScores[NUM_PERIODS];
        setOtWinner(ot.mtl > 0 ? "mtl" : ot.car > 0 ? "car" : null);
      }
    }
    if (config.actualShots?.length === NUM_PERIODS)
      setShots(config.actualShots);
    if (config.actualScorers) setScorers(config.actualScorers);
  }, [config]);

  const reg = totalFromPeriods(periods);
  const isTied = reg.mtl === reg.car;
  const final = {
    mtl: reg.mtl + (otWinner === "mtl" ? 1 : 0),
    car: reg.car + (otWinner === "car" ? 1 : 0),
  };
  // Le gagnant réel est déterminé par le pointage (prolongation incluse)
  const derivedWinner: TeamCode | undefined =
    final.mtl > final.car ? "mtl" : final.car > final.mtl ? "car" : undefined;
  const phase: Phase = (config?.phase ?? "pregame") as Phase;

  // Annule la prolongation si plus d'égalité
  useEffect(() => {
    if (!isTied && otWinner !== null) setOtWinner(null);
  }, [isTied, otWinner]);

  const [saving, setSaving] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // N'enregistre les résultats qu'après une vraie modification de l'admin
  // (évite d'écrire des "0" au chargement → pas de points fantômes).
  const dirty = useRef(false);
  const markDirty = () => {
    dirty.current = true;
  };

  async function pushActuals() {
    const actualPeriodScores: PeriodScore[] = otWinner
      ? [
          ...periods,
          otWinner === "mtl" ? { mtl: 1, car: 0 } : { mtl: 0, car: 1 },
        ]
      : periods;
    setSaving(true);
    try {
      await setActuals({
        actualWinner: derivedWinner,
        actualPeriodScores,
        actualScorers: scorers.filter((s) => s.player !== ""),
        actualShots: shots,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  // Sauvegarde automatique (temps réel pendant le match): à chaque
  // changement, on pousse les résultats vers Convex après un court délai.
  // Le classement de tout le monde se met à jour en direct.
  useEffect(() => {
    if (!loaded.current || !dirty.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      void pushActuals();
    }, 350);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periods, shots, scorers, otWinner]);

  return (
    <div
      className="min-h-[100dvh] w-full px-6 py-8 text-white teal-scrollbar"
      style={{ background: HOCKEY_BG }}
    >
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/55">
              ── Habsterface · console admin
            </p>
            <h1 className="mt-1 font-serif text-4xl italic text-white">
              {TEAMS.mtl.short} <span className="text-white/40">vs</span>{" "}
              {TEAMS.car.short}
            </h1>
          </div>
          <div className="flex gap-6 font-mono text-sm">
            <Stat label="Inscrits" value={stats?.total ?? "—"} />
            <Stat label="Prédictions" value={stats?.withPrediction ?? "—"} />
          </div>
        </header>

        {/* Phase */}
        <Card title="Phase du match">
          <div className="flex flex-wrap gap-3">
            {(
              [
                ["pregame", "Pré-match (prédictions ouvertes)"],
                ["live", "En direct (prédictions fermées)"],
                ["final", "Terminé"],
              ] as [Phase, string][]
            ).map(([value, label]) => {
              const active = phase === value;
              return (
                <button
                  key={value}
                  onClick={() => setPhase({ phase: value })}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-95"
                  style={
                    active
                      ? {
                          background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DEEP})`,
                          color: "white",
                          boxShadow: `0 0 22px -6px ${TEAL}`,
                        }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.7)",
                        }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Résultats réels */}
          <div className="flex flex-col gap-6">
            <Card
              title="Score réel par période"
              subtitle={
                derivedWinner
                  ? `Final: ${final.mtl} – ${final.car} · 🏆 ${TEAMS[derivedWinner].short}`
                  : `Final: ${final.mtl} – ${final.car}`
              }
            >
              <ScoreGrid
                periods={periods}
                onChange={(p) => {
                  markDirty();
                  setPeriods(p);
                }}
                max={15}
              />
              {isTied && (
                <div
                  className="mt-3 flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5"
                  style={{
                    borderColor: "rgba(255,200,80,0.3)",
                    background: "rgba(255,200,80,0.08)",
                  }}
                >
                  <span className="text-sm text-amber-200">
                    Prolongation — qui a marqué?
                  </span>
                  <div className="flex gap-2">
                    {TEAM_CODES.map((code) => {
                      const t = TEAMS[code];
                      const active = otWinner === code;
                      return (
                        <button
                          key={code}
                          onClick={() => {
                            markDirty();
                            setOtWinner(active ? null : code);
                          }}
                          className="rounded-lg px-3 py-1.5 text-sm font-bold transition active:scale-95"
                          style={{
                            background: active
                              ? t.color
                              : "rgba(255,255,255,0.06)",
                            color: active ? "white" : "rgba(255,255,255,0.6)",
                          }}
                        >
                          {t.abbr}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            <Card title="Tirs au but réels par période">
              <ScoreGrid
                periods={shots}
                onChange={(p) => {
                  markDirty();
                  setShots(p);
                }}
                max={50}
              />
            </Card>

            <Card title="Scoreurs réels">
              <ScorerEditor
                scorers={scorers}
                onChange={(s) => {
                  markDirty();
                  setScorers(s);
                }}
              />
            </Card>

            {/* Sauvegarde automatique — pas de bouton: le classement se met
                à jour en direct à chaque changement */}
            <div
              className="flex items-center gap-3 rounded-2xl border px-5 py-4"
              style={{
                borderColor: `${TEAL_LIGHT}33`,
                background: `${TEAL}14`,
              }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ backgroundColor: TEAL_LIGHT }}
                />
                <span
                  className="relative inline-flex h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: TEAL_LIGHT }}
                />
              </span>
              <span className="text-sm font-semibold text-white">
                {saving
                  ? "Synchronisation…"
                  : saved
                    ? "✓ Classement à jour"
                    : "Mises à jour en direct"}
              </span>
              <span className="font-mono text-[11px] text-white/45">
                chaque changement s&apos;applique automatiquement
              </span>
            </div>
          </div>

          {/* Aperçu leaderboard */}
          <div>
            <Card title="Classement (live) · gestion des participants">
              {board && board.rows.length > 0 ? (
                <ol className="flex max-h-[55vh] flex-col gap-1.5 overflow-y-auto teal-scrollbar pr-1">
                  {board.rows.map((r) => (
                    <li
                      key={r.entryId}
                      className="flex items-center justify-between gap-2 rounded-lg px-3 py-2"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="w-6 shrink-0 font-mono text-white/50">
                          {r.rank}
                        </span>
                        <span className="truncate text-sm">
                          {r.firstName} {r.lastName}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span
                          className="font-mono text-sm font-bold"
                          style={{ color: TEAL_LIGHT }}
                        >
                          {r.score} pts
                        </span>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Supprimer ${r.firstName} ${r.lastName}? Cette inscription et sa prédiction seront effacées définitivement.`
                              )
                            ) {
                              deleteEntry({ entryId: r.entryId });
                            }
                          }}
                          title="Supprimer cette personne"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-base transition active:scale-90"
                          style={{
                            background: "rgba(248,113,113,0.12)",
                            color: "#fca5a5",
                          }}
                          aria-label={`Supprimer ${r.firstName} ${r.lastName}`}
                        >
                          ✕
                        </button>
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-white/50">Aucune inscription.</p>
              )}
            </Card>

            <Card title="Outils de test">
              <button
                onClick={createTestParticipants}
                disabled={seeding}
                className="rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-95 disabled:opacity-50"
                style={{
                  border: `1px solid ${TEAL_LIGHT}66`,
                  background: `${TEAL}1f`,
                  color: TEAL_LIGHT,
                }}
              >
                {seeding ? "Création…" : "Créer 20 participants de test"}
              </button>
              <p className="mt-2 font-mono text-[11px] text-white/40">
                Ajoute 20 faux joueurs avec prédictions pour tester le
                classement. Utilise « Effacer toutes les inscriptions » pour les
                retirer.
              </p>
            </Card>

            <Card title="Zone dangereuse">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Réinitialiser le match? Les résultats réels sont effacés et la phase repasse en pré-match. Les inscriptions sont conservées."
                      )
                    ) {
                      resetMatch({});
                      setPeriods(emptyPeriods());
                      setShots(emptyPeriods());
                      setScorers([]);
                      setOtWinner(null);
                      dirty.current = false;
                    }
                  }}
                  className="rounded-full border px-5 py-2.5 text-sm font-semibold transition active:scale-95"
                  style={{
                    borderColor: `${TEAL_LIGHT}66`,
                    color: TEAL_LIGHT,
                  }}
                >
                  Réinitialiser le match
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Supprimer TOUTES les inscriptions hockey? Action irréversible."
                      )
                    ) {
                      clearEntries({});
                    }
                  }}
                  className="rounded-full border px-5 py-2.5 text-sm font-semibold transition active:scale-95"
                  style={{
                    borderColor: "rgba(248,113,113,0.5)",
                    color: "#fca5a5",
                  }}
                >
                  Effacer toutes les inscriptions
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-right">
      <div className="text-2xl font-bold" style={{ color: TEAL_LIGHT }}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
        {label}
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/4 p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
          {title}
        </h2>
        {subtitle && (
          <span className="font-mono text-sm" style={{ color: TEAL_LIGHT }}>
            {subtitle}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function ScoreGrid({
  periods,
  onChange,
  max,
}: {
  periods: PeriodScore[];
  onChange: (p: PeriodScore[]) => void;
  max: number;
}) {
  function set(i: number, team: TeamCode, value: number) {
    onChange(periods.map((p, idx) => (idx === i ? { ...p, [team]: value } : p)));
  }
  return (
    <div className="flex flex-col gap-3">
      {periods.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <span className="font-serif text-lg italic text-white/80">
            {i + 1}
            <sup className="text-xs">{i === 0 ? "re" : "e"}</sup> période
          </span>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-[11px]"
                style={{ color: TEAMS.mtl.color }}
              >
                {TEAMS.mtl.abbr}
              </span>
              <NumberStepper
                value={p.mtl}
                onChange={(v) => set(i, "mtl", v)}
                max={max}
              />
            </div>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-[11px]"
                style={{ color: TEAMS.car.color }}
              >
                {TEAMS.car.abbr}
              </span>
              <NumberStepper
                value={p.car}
                onChange={(v) => set(i, "car", v)}
                max={max}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScorerEditor({
  scorers,
  onChange,
}: {
  scorers: { team: TeamCode; player: string }[];
  onChange: (s: { team: TeamCode; player: string }[]) => void;
}) {
  function add() {
    onChange([...scorers, { team: "mtl", player: "" }]);
  }
  function update(idx: number, patch: Partial<{ team: TeamCode; player: string }>) {
    onChange(
      scorers.map((s, i) => {
        if (i !== idx) return s;
        const next = { ...s, ...patch };
        // Si on change d'équipe, on réinitialise le joueur
        if (patch.team && patch.team !== s.team) next.player = "";
        return next;
      })
    );
  }
  function remove(idx: number) {
    onChange(scorers.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-2">
      {scorers.map((s, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <select
            value={s.team}
            onChange={(e) => update(idx, { team: e.target.value as TeamCode })}
            className="rounded-lg border px-2 py-2 text-sm text-white outline-none"
            style={{ borderColor: "rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.05)" }}
          >
            {TEAM_CODES.map((c) => (
              <option key={c} value={c} style={{ color: "black" }}>
                {TEAMS[c].abbr}
              </option>
            ))}
          </select>
          <select
            value={s.player}
            onChange={(e) => update(idx, { player: e.target.value })}
            className="flex-1 rounded-lg border px-2 py-2 text-sm text-white outline-none"
            style={{
              borderColor: s.player === "" ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <option value="" style={{ color: "black" }}>
              — joueur —
            </option>
            {ROSTERS[s.team].map((p) => (
              <option key={p} value={p} style={{ color: "black" }}>
                {p}
              </option>
            ))}
          </select>
          <button
            onClick={() => remove(idx)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg transition active:scale-90"
            style={{ background: "rgba(255,255,255,0.06)", color: "#fca5a5" }}
            aria-label="retirer"
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="mt-1 self-start rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95"
        style={{ borderColor: `${TEAL_LIGHT}55`, color: TEAL_LIGHT }}
      >
        + Ajouter un scoreur
      </button>
    </div>
  );
}
