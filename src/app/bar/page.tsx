"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import {
  getElixirImage,
  getProfileStyle,
  formatDuration,
  maskLastName,
} from "@/lib/bar-utils";

const TEAL = "#19978a";
const TEAL_LIGHT = "#7DD4C7";

type Participant = Doc<"participants">;

export default function BarPage() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [barmanName, setBarmanName] = useState<string>("Barman");
  const [mode, setMode] = useState<"live" | "test">("live");
  const [now, setNow] = useState(Date.now());
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("bar_unlocked") !== "1") {
        router.replace("/bar/login");
        return;
      }
      setBarmanName(localStorage.getItem("bar_barman_name") ?? "Barman");
      const storedMode = localStorage.getItem("bar_mode");
      if (storedMode === "test" || storedMode === "live") {
        setMode(storedMode);
      }
    } catch {}
    setAuthReady(true);
  }, [router]);

  // Tick chaque 10s pour mettre à jour les durées affichées
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(t);
  }, []);

  const data = useQuery(api.bar.listAll, authReady ? { mode } : "skip");
  const pullNext = useMutation(api.bar.pullNext);
  const markReady = useMutation(api.bar.markReady);
  const notifyReady = useAction(api.sms.notifyReady);
  const markServed = useMutation(api.bar.markServed);
  const markNoShow = useMutation(api.bar.markNoShow);
  const togglePriority = useMutation(api.bar.togglePriority);
  const resetTest = useMutation(api.bar.resetTestDrinks);

  const [noShowDialog, setNoShowDialog] = useState<Participant | null>(null);

  function logout() {
    try {
      localStorage.removeItem("bar_unlocked");
      localStorage.removeItem("bar_mode");
    } catch {}
    router.replace("/bar/login");
  }

  async function handleReset() {
    const result = await resetTest({});
    setResetConfirm(false);
    console.log(`[bar] ${result.count} drinks de test remis en attente`);
  }

  async function handlePullNext() {
    await pullNext({ barmanName });
  }

  async function handleMarkReady(p: Participant) {
    await markReady({ participantId: p._id });
    notifyReady({ participantId: p._id }).catch((e) =>
      console.warn("SMS notifyReady failed", e)
    );
  }

  async function handleNoShowConfirm(reassignToId?: Id<"participants">) {
    if (!noShowDialog) return;
    const wasReassigned = !!reassignToId;
    await markNoShow({
      participantId: noShowDialog._id,
      reassignToId,
    });
    if (reassignToId) {
      notifyReady({ participantId: reassignToId, wasReassigned }).catch((e) =>
        console.warn("SMS reassign failed", e)
      );
    }
    setNoShowDialog(null);
  }

  if (!authReady || !data) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#06101e] text-white">
        <p className="font-mono text-sm uppercase tracking-[0.25em] text-white/55">
          Connexion au paradis…
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-gradient-to-b from-[#06101e] via-[#0a1729] to-[#101d34] text-white">
      <BarBg />

      {/* MODE TEST banner */}
      {mode === "test" && (
        <div
          className="relative z-30 flex items-center justify-center gap-2 px-4 py-1.5 text-center font-mono text-[10px] font-bold uppercase tracking-[0.25em]"
          style={{
            background:
              "repeating-linear-gradient(45deg, rgba(245, 158, 11, 0.18) 0 8px, rgba(245, 158, 11, 0.08) 8px 16px)",
            color: "#fcd34d",
            borderBottom: "1px solid rgba(245, 158, 11, 0.4)",
          }}
        >
          ⚠ mode test — seuls les téléphones de test sont visibles
        </div>
      )}

      {/* TOP BAR */}
      <header className="relative z-20 flex items-center justify-between gap-4 border-b border-white/10 bg-black/40 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl italic" style={{ color: TEAL_LIGHT }}>
            ✦
          </span>
          <h1 className="font-serif text-lg italic">Bar du Paradis</h1>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-white/45 sm:inline">
            {barmanName}
          </span>
          {mode === "test" && (
            <span
              className="rounded-md px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.2)",
                color: "#fcd34d",
                border: "1px solid rgba(245, 158, 11, 0.4)",
              }}
            >
              test
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">
          <Counter label="attente" n={data.counts.waiting} />
          <span className="text-white/20">·</span>
          <Counter label="en cours" n={data.counts.preparing} color={TEAL_LIGHT} />
          <span className="text-white/20">·</span>
          <Counter label="prêts" n={data.counts.ready} color="#fbbf24" />
        </div>

        <div className="flex items-center gap-3">
          {mode === "test" && (
            <button
              onClick={() => setResetConfirm(true)}
              className="rounded-md px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95"
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.18)",
                color: "#fcd34d",
                border: "1px solid rgba(245, 158, 11, 0.4)",
              }}
            >
              ↻ reset
            </button>
          )}
          <button
            onClick={logout}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 hover:text-white"
          >
            Quitter
          </button>
        </div>
      </header>

      {/* MAIN: 2-column layout (En cours | Prêts) */}
      <main className="relative z-10 flex flex-1 gap-4 overflow-hidden p-4">
        {/* Column En cours */}
        <section className="flex flex-1 flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/65">
              ── en cours ({data.preparing.length})
            </h2>
            <button
              onClick={handlePullNext}
              disabled={data.waiting.length === 0}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
              style={{
                background:
                  data.waiting.length > 0
                    ? `linear-gradient(135deg, ${TEAL} 0%, #0f7a70 100%)`
                    : "rgba(255,255,255,0.06)",
                color: "white",
                boxShadow:
                  data.waiting.length > 0
                    ? `0 8px 24px -6px ${TEAL}88`
                    : "none",
              }}
            >
              ✦ Préparer le prochain →
            </button>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {data.preparing.map((p) => (
                <DrinkCard
                  key={p._id}
                  participant={p}
                  now={now}
                  mode="preparing"
                  onMarkReady={() => handleMarkReady(p)}
                />
              ))}
            </AnimatePresence>
            {data.preparing.length === 0 && (
              <p className="col-span-full mt-8 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
                aucun drink en préparation
              </p>
            )}
          </div>
        </section>

        {/* Column Prêts */}
        <section className="flex flex-1 flex-col">
          <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.28em] text-white/65">
            ── prêts à distribuer ({data.ready.length})
          </h2>
          <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {data.ready.map((p) => (
                <DrinkCard
                  key={p._id}
                  participant={p}
                  now={now}
                  mode="ready"
                  onMarkServed={() => markServed({ participantId: p._id })}
                  onMarkNoShow={() => setNoShowDialog(p)}
                />
              ))}
            </AnimatePresence>
            {data.ready.length === 0 && (
              <p className="col-span-full mt-8 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
                aucun drink prêt
              </p>
            )}
          </div>
        </section>
      </main>

      {/* No-show dialog */}
      <AnimatePresence>
        {noShowDialog && (
          <NoShowDialog
            participant={noShowDialog}
            onClose={() => setNoShowDialog(null)}
            onConfirm={handleNoShowConfirm}
          />
        )}
      </AnimatePresence>

      {/* Reset confirmation */}
      <AnimatePresence>
        {resetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
            onClick={() => setResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0a1729] p-5 shadow-2xl"
            >
              <p
                className="font-mono text-[10px] uppercase tracking-[0.28em]"
                style={{ color: "#fcd34d" }}
              >
                ── reset mode test
              </p>
              <h3 className="mt-2 font-serif text-2xl italic text-white">
                Remettre tous les drinks de test en attente ?
              </h3>
              <p className="mt-2 text-sm text-white/65">
                Tous les drinks des téléphones de test ({" "}
                <code className="font-mono text-xs">418-262-3688</code>,{" "}
                <code className="font-mono text-xs">418-907-5688</code>,{" "}
                <code className="font-mono text-xs">581-349-4191</code>) seront remis à
                l'état « en attente ». Les drinks live ne sont pas touchés.
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-full px-4 py-3 text-sm font-bold transition-all active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "white",
                    boxShadow: "0 8px 24px -6px rgba(245, 158, 11, 0.55)",
                  }}
                >
                  ↻ Reset
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="rounded-full px-4 py-3 text-sm text-white/70 hover:text-white"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Counter({
  label,
  n,
  color,
}: {
  label: string;
  n: number;
  color?: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="text-sm font-semibold"
        style={{ color: color ?? "white" }}
      >
        {n}
      </span>
      <span>{label}</span>
    </span>
  );
}

function DrinkCard({
  participant,
  now,
  mode,
  onMarkReady,
  onMarkServed,
  onMarkNoShow,
}: {
  participant: Participant;
  now: number;
  mode: "preparing" | "ready";
  onMarkReady?: () => void;
  onMarkServed?: () => void;
  onMarkNoShow?: () => void;
}) {
  const image = getElixirImage(participant.elixir);
  const profile = getProfileStyle(participant.profile);
  const withAlcohol = participant.withAlcohol !== false;

  const startedAt =
    mode === "preparing" ? participant.preparingAt : participant.readyAt;
  const elapsed = startedAt ? now - startedAt : 0;
  const isOld = mode === "ready" && elapsed > 10 * 60 * 1000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10"
      style={{
        boxShadow: isOld
          ? "0 0 0 2px #f87171, 0 8px 32px -8px rgba(248, 113, 113, 0.5)"
          : "0 8px 24px -8px rgba(0,0,0,0.6)",
      }}
    >
      {/* Background image */}
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30" />

      {/* No-alcohol big badge */}
      {!withAlcohol && (
        <div
          className="absolute right-2 top-2 z-10 rounded-md px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em]"
          style={{
            backgroundColor: TEAL,
            color: "white",
            boxShadow: `0 0 12px ${TEAL}`,
          }}
        >
          🚫 Sans alcool
        </div>
      )}

      {/* Priority star */}
      {participant.queueStatus === "priority" && (
        <div className="absolute left-2 top-2 z-10 text-xl" title="Prioritaire">
          ⭐
        </div>
      )}

      {/* Profile chip */}
      {profile && (
        <div
          className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] backdrop-blur-md"
          style={{
            backgroundColor: profile.bg,
            color: profile.color,
            border: `1px solid ${profile.color}66`,
            ...(participant.queueStatus === "priority"
              ? { left: "auto", right: "auto", top: 32 }
              : {}),
          }}
        >
          <span>{profile.icon}</span>
          {profile.label}
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 p-3">
        <p
          className="font-serif text-lg italic leading-tight text-white"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
        >
          {participant.elixir ?? "Élixir mystère"}
        </p>
        <p
          className="text-sm font-medium text-white/95"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
        >
          {participant.firstName} {maskLastName(participant.lastName)}
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/65">
          {mode === "preparing" ? "Préparé depuis" : "Prêt depuis"} {formatDuration(elapsed)}
          {isOld && " ⚠️"}
        </p>

        {/* Actions */}
        {mode === "preparing" && onMarkReady && (
          <button
            onClick={onMarkReady}
            className="mt-2 rounded-full py-2.5 text-sm font-bold transition-all active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${TEAL} 0%, #0f7a70 100%)`,
              color: "white",
              boxShadow: `0 6px 16px -4px ${TEAL}99`,
            }}
          >
            ✓ Prêt
          </button>
        )}

        {mode === "ready" && onMarkServed && onMarkNoShow && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={onMarkServed}
              className="flex-1 rounded-full py-2.5 text-sm font-bold transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${TEAL} 0%, #0f7a70 100%)`,
                color: "white",
                boxShadow: `0 6px 16px -4px ${TEAL}99`,
              }}
            >
              ✓ Servi
            </button>
            <button
              onClick={onMarkNoShow}
              className="rounded-full px-3 py-2.5 text-xs transition-all active:scale-95"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              No-show
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function NoShowDialog({
  participant,
  onClose,
  onConfirm,
}: {
  participant: Participant;
  onClose: () => void;
  onConfirm: (reassignToId?: Id<"participants">) => void;
}) {
  const candidates = useQuery(
    api.bar.reassignmentCandidates,
    participant.elixir ? { elixir: participant.elixir } : "skip"
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0a1729] shadow-2xl"
      >
        <div className="p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
            ── no-show
          </p>
          <h3 className="mt-2 font-serif text-2xl italic text-white">
            {participant.elixir}
          </h3>
          <p className="mt-1 text-sm text-white/65">
            de {participant.firstName} {maskLastName(participant.lastName)}
          </p>

          <p
            className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: TEAL_LIGHT }}
          >
            Le donner à quelqu'un d'autre ?
          </p>

          <div className="mt-3 flex max-h-64 flex-col gap-2 overflow-y-auto">
            {candidates === undefined && (
              <p className="text-sm text-white/50">Recherche…</p>
            )}
            {candidates && candidates.length === 0 && (
              <p className="text-sm text-white/50">
                Personne d'autre dans la file n'a commandé cet élixir.
              </p>
            )}
            {candidates?.map((c) => (
              <button
                key={c._id}
                onClick={() => onConfirm(c._id)}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                <div>
                  <p className="font-medium text-white">
                    {c.firstName} {maskLastName(c.lastName)}
                    {c.queueStatus === "priority" && (
                      <span className="ml-1.5" title="Prioritaire">⭐</span>
                    )}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                    en file depuis {formatDuration(Date.now() - c.createdAt)}
                  </p>
                </div>
                <span style={{ color: TEAL_LIGHT }}>→</span>
              </button>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <button
              onClick={() => onConfirm()}
              className="flex-1 rounded-full bg-white/5 px-4 py-3 text-sm text-white/85 transition-all hover:bg-white/10"
            >
              Pas de candidat (jeter)
            </button>
            <button
              onClick={onClose}
              className="rounded-full px-4 py-3 text-sm text-white/50 hover:text-white"
            >
              Annuler
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BarBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="orb"
        style={{
          top: "5%",
          left: "-80px",
          width: 300,
          height: 300,
          background: `radial-gradient(circle, ${TEAL_LIGHT}, transparent 70%)`,
          opacity: 0.12,
          animationName: "orb-drift-1",
          animationDuration: "30s",
        }}
      />
      <div
        className="orb"
        style={{
          bottom: "-10%",
          right: "-100px",
          width: 380,
          height: 380,
          background: `radial-gradient(circle, ${TEAL}, transparent 70%)`,
          opacity: 0.1,
          animationName: "orb-drift-2",
          animationDuration: "36s",
        }}
      />
    </div>
  );
}
