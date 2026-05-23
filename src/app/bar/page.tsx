"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import {
  getElixirImage,
  getProfileStyle,
  formatDuration,
  maskLastName,
  isAdminPhone,
} from "@/lib/bar-utils";
import { AdvancedView } from "./AdvancedView";
import { RecipeDialog } from "./RecipeDialog";

const TEAL = "#19978a";
const TEAL_LIGHT = "#7DD4C7";

type Participant = Doc<"participants">;

export default function BarPage() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [barmanName, setBarmanName] = useState<string>("Barman");
  const [mode, setMode] = useState<"live" | "test">("live");
  const [view, setView] = useState<"simple" | "advanced">("simple");
  const [now, setNow] = useState(Date.now());

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
      const storedView = localStorage.getItem("bar_view");
      if (storedView === "simple" || storedView === "advanced") {
        setView(storedView);
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
  const [noShowDialog, setNoShowDialog] = useState<Participant | null>(null);
  const [recipeDialog, setRecipeDialog] = useState<Participant | null>(null);

  function logout() {
    try {
      localStorage.removeItem("bar_unlocked");
      localStorage.removeItem("bar_mode");
    } catch {}
    router.replace("/bar/login");
  }


  async function handlePullNext() {
    await pullNext({ barmanName });
  }

  function switchView(v: "simple" | "advanced") {
    setView(v);
    try {
      localStorage.setItem("bar_view", v);
    } catch {}
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
          ⚠ mode test — données générées (15 drinks fictifs)
        </div>
      )}

      {/* TOP BAR */}
      <header className="relative z-20 flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-black/40 px-3 py-2.5 backdrop-blur-md sm:gap-4 sm:px-5 sm:py-3">
        {/* Left: brand */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span
            className="shrink-0 font-serif text-xl italic"
            style={{ color: TEAL_LIGHT }}
          >
            ✦
          </span>
          <h1 className="truncate font-serif text-base italic sm:text-lg">
            Bar du Paradis
          </h1>
          <span className="hidden truncate font-mono text-[10px] uppercase tracking-[0.25em] text-white/45 md:inline">
            {barmanName}
          </span>
          {mode === "test" && (
            <span
              className="shrink-0 rounded-md px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em]"
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

        {/* Middle: counters — visible only on larger screens */}
        <div className="hidden items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70 lg:flex">
          <Counter label="attente" n={data.counts.waiting} />
          <span className="text-white/20">·</span>
          <Counter
            label="en cours"
            n={data.counts.preparing}
            color={TEAL_LIGHT}
          />
          <span className="text-white/20">·</span>
          <Counter label="prêts" n={data.counts.ready} color="#fbbf24" />
        </div>

        {/* Right: controls */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {/* Toggle Simple/Avancé */}
          <div
            className="flex shrink-0 rounded-full border border-white/15 p-0.5"
            style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
          >
            <button
              onClick={() => switchView("simple")}
              className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-all sm:px-3 sm:tracking-[0.18em]"
              style={{
                backgroundColor: view === "simple" ? TEAL : "transparent",
                color:
                  view === "simple" ? "white" : "rgba(255,255,255,0.55)",
              }}
            >
              Simple
            </button>
            <button
              onClick={() => switchView("advanced")}
              className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-all sm:px-3 sm:tracking-[0.18em]"
              style={{
                backgroundColor:
                  view === "advanced" ? TEAL : "transparent",
                color:
                  view === "advanced" ? "white" : "rgba(255,255,255,0.55)",
              }}
            >
              Avancé
            </button>
          </div>
          <button
            onClick={logout}
            className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 hover:text-white"
            title="Quitter"
          >
            <span className="hidden sm:inline">Quitter</span>
            <span className="sm:hidden text-base">↩</span>
          </button>
        </div>
      </header>

      {/* Compteurs mobile — sous le header en bandeau plein largeur */}
      <div className="flex shrink-0 items-center justify-around gap-2 border-b border-white/10 bg-black/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70 lg:hidden">
        <Counter label="attente" n={data.counts.waiting} />
        <span className="text-white/15">·</span>
        <Counter
          label="en cours"
          n={data.counts.preparing}
          color={TEAL_LIGHT}
        />
        <span className="text-white/15">·</span>
        <Counter label="prêts" n={data.counts.ready} color="#fbbf24" />
      </div>

      {view === "advanced" ? (
        <AdvancedView
          data={data}
          now={now}
          mode={mode}
          onMarkReady={handleMarkReady}
          onMarkServed={(p) => markServed({ participantId: p._id })}
          onMarkNoShow={(p) => setNoShowDialog(p)}
          onPullNext={handlePullNext}
          onShowRecipe={(p) => setRecipeDialog(p)}
        />
      ) : (
      <main className="relative z-10 flex flex-1 flex-col gap-5 overflow-y-auto p-5 lg:flex-row lg:overflow-hidden">
        {/* Column En cours */}
        <section className="flex flex-1 flex-col">
          <div className="mb-4 flex items-baseline gap-3">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
              ── en cours
            </h2>
            <span
              className="font-serif text-3xl italic"
              style={{ color: TEAL_LIGHT }}
            >
              {data.preparing.length}
            </span>
          </div>

          <ColumnGrid
            preCard={
              <ActionCard
                onClick={handlePullNext}
                disabled={data.waiting.length === 0}
                queueCount={data.waiting.length}
              />
            }
            items={data.preparing}
            renderCard={(p) => (
              <DrinkCard
                key={p._id}
                participant={p}
                now={now}
                mode="preparing"
                onMarkReady={() => handleMarkReady(p)}
                onShowRecipe={() => setRecipeDialog(p)}
              />
            )}
            maxVisible={8}
            keyFn={(p) => p._id}
          />
        </section>

        {/* Divider */}
        <div
          className="hidden w-px shrink-0 lg:block"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(125, 212, 199, 0.18), transparent)",
          }}
        />

        {/* Column Prêts */}
        <section className="flex flex-1 flex-col">
          <div className="mb-4 flex items-baseline gap-3">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
              ── prêts à distribuer
            </h2>
            <span
              className="font-serif text-3xl italic"
              style={{ color: "#fbbf24" }}
            >
              {data.ready.length}
            </span>
          </div>

          <ColumnGrid
            items={data.ready}
            renderCard={(p) => (
              <DrinkCard
                key={p._id}
                participant={p}
                now={now}
                mode="ready"
                onMarkServed={() => markServed({ participantId: p._id })}
                onMarkNoShow={() => setNoShowDialog(p)}
                onShowRecipe={() => setRecipeDialog(p)}
              />
            )}
            maxVisible={9}
            keyFn={(p) => p._id}
            emptyState={
              <EmptyState
                title="Aucun élixir prêt"
                hint="Termine ceux en cours pour libérer la file"
              />
            }
          />
        </section>
      </main>
      )}

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

      {/* Recipe dialog */}
      {recipeDialog && (
        <RecipeDialog
          elixir={recipeDialog.elixir}
          drinkName={recipeDialog.drinkName}
          withAlcohol={recipeDialog.withAlcohol !== false}
          firstName={recipeDialog.firstName}
          onClose={() => setRecipeDialog(null)}
        />
      )}

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
  onShowRecipe,
}: {
  participant: Participant;
  now: number;
  mode: "preparing" | "ready";
  onMarkReady?: () => void;
  onMarkServed?: () => void;
  onMarkNoShow?: () => void;
  onShowRecipe?: () => void;
}) {
  const image = getElixirImage(participant.elixir);
  const profile = getProfileStyle(participant.profile);
  const withAlcohol = participant.withAlcohol !== false;
  const isAdmin = isAdminPhone(participant.phone);

  const startedAt =
    mode === "preparing" ? participant.preparingAt : participant.readyAt;
  const elapsed = startedAt ? now - startedAt : 0;
  const isOld = mode === "ready" && elapsed > 10 * 60 * 1000;

  // Bordure: rouge si trop vieux (priorité), sinon teal si mocktail, sinon shadow normale.
  // Le mocktail reste identifiable via le bandeau et l'image désaturée même en rouge.
  const cardBoxShadow = isOld
    ? "0 0 0 3px #f87171, 0 0 32px -4px rgba(248, 113, 113, 0.6), 0 8px 24px -8px rgba(0,0,0,0.6)"
    : !withAlcohol
      ? `0 0 0 3px ${TEAL_LIGHT}, 0 0 32px -4px ${TEAL_LIGHT}88, 0 8px 24px -8px rgba(0,0,0,0.6)`
      : "0 8px 24px -8px rgba(0,0,0,0.6)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl transition-transform hover:scale-[1.015]"
      style={{
        boxShadow: cardBoxShadow,
        touchAction: "manipulation",
      }}
      onDoubleClick={onShowRecipe}
      title="Double-cliquer pour voir la recette"
    >
      {/* Background image (desaturated if mocktail) */}
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-all"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

      {/* MOCKTAIL banner pleine largeur en haut */}
      {!withAlcohol && (
        <div
          className="absolute inset-x-0 top-0 z-20 flex items-center justify-center gap-2 py-1.5"
          style={{
            background: `linear-gradient(90deg, ${TEAL_LIGHT} 0%, ${TEAL} 50%, ${TEAL_LIGHT} 100%)`,
            boxShadow: `0 4px 16px ${TEAL}66`,
          }}
        >
          <span className="text-base">⊘</span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-white">
            Sans alcool
          </span>
          <span className="text-base">⊘</span>
        </div>
      )}

      {/* Top-right badges (shifted down if mocktail banner present) */}
      <div
        className="absolute right-2 z-10 flex flex-col items-end gap-1.5"
        style={{ top: !withAlcohol ? 44 : 8 }}
      >
        {isAdmin && (
          <div
            className="rounded-md px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.95)",
              color: "#1a0c00",
              boxShadow: "0 0 12px rgba(245, 158, 11, 0.55)",
            }}
          >
            ⚙ Admin
          </div>
        )}
      </div>

      {/* Top-left chips */}
      <div
        className="absolute left-2 z-10 flex flex-col items-start gap-1.5"
        style={{ top: !withAlcohol ? 44 : 8 }}
      >
        {participant.queueStatus === "priority" && (
          <div
            className="rounded-md px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              color: "#1a0c00",
              boxShadow: "0 0 12px rgba(251, 191, 36, 0.6)",
            }}
          >
            ★ Prioritaire
          </div>
        )}
        {profile && (
          <div
            className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] backdrop-blur-md"
            style={{
              backgroundColor: profile.bg,
              color: profile.color,
              border: `1px solid ${profile.color}88`,
            }}
          >
            <span>{profile.icon}</span>
            {profile.label}
          </div>
        )}
      </div>

      {/* Content bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1.5 p-4">
        <p
          className="font-serif text-2xl italic leading-[1.05] text-white"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.95)" }}
        >
          {participant.drinkName ?? participant.elixir ?? "Élixir mystère"}
        </p>
        {participant.drinkName && participant.elixir && (
          <p
            className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/65"
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
          >
            type : {participant.elixir}
          </p>
        )}
        <p
          className="text-base font-semibold leading-tight text-white/95"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
        >
          {participant.firstName} {maskLastName(participant.lastName)}
        </p>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{
            color: isOld ? "#fca5a5" : "rgba(255,255,255,0.65)",
          }}
        >
          {mode === "preparing" ? "Préparé" : "Prêt"} depuis{" "}
          {formatDuration(elapsed)}
          {isOld && " ⚠"}
        </p>

        {/* Actions */}
        {mode === "preparing" && onMarkReady && (
          <button
            onClick={onMarkReady}
            className="mt-3 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold uppercase tracking-[0.1em] transition-all active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${TEAL} 0%, #0f7a70 100%)`,
              color: "white",
              boxShadow: `0 8px 20px -4px ${TEAL}99`,
            }}
          >
            ✓ Marquer prêt
          </button>
        )}

        {mode === "ready" && onMarkServed && onMarkNoShow && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={onMarkServed}
              className="flex-1 rounded-full py-3 text-sm font-bold uppercase tracking-[0.1em] transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${TEAL} 0%, #0f7a70 100%)`,
                color: "white",
                boxShadow: `0 8px 20px -4px ${TEAL}99`,
              }}
            >
              ✓ Servi
            </button>
            <button
              onClick={onMarkNoShow}
              className="rounded-full px-3 py-3 text-xs uppercase tracking-[0.1em] transition-all active:scale-95"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.2)",
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

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 py-16">
      <div
        className="text-4xl"
        style={{ color: "rgba(125, 212, 199, 0.35)" }}
      >
        ✦
      </div>
      <p className="font-serif text-xl italic text-white/55">{title}</p>
      <p className="max-w-xs text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
        {hint}
      </p>
    </div>
  );
}

function ColumnGrid<T>({
  preCard,
  items,
  renderCard,
  maxVisible,
  keyFn,
  emptyState,
}: {
  preCard?: React.ReactNode;
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  maxVisible: number;
  keyFn: (item: T) => string;
  emptyState?: React.ReactNode;
}) {
  const reserved = preCard ? 1 : 0;
  const effectiveMax = maxVisible - reserved;
  const visible = items.slice(0, effectiveMax);
  const overflow = items.length - visible.length;

  // Si vraiment vide et qu'on a un emptyState (colonne Prêts), affiche-le
  if (!preCard && items.length === 0 && emptyState) {
    return (
      <div
        className="grid flex-1 auto-rows-max gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}
      >
        {emptyState}
      </div>
    );
  }

  return (
    <div
      className="grid flex-1 auto-rows-max gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}
    >
      {preCard}
      <AnimatePresence mode="popLayout">
        {visible.map((item) => (
          <React.Fragment key={keyFn(item)}>{renderCard(item)}</React.Fragment>
        ))}
      </AnimatePresence>
      {overflow > 0 && <OverflowCard count={overflow} />}
    </div>
  );
}

function ActionCard({
  onClick,
  disabled,
  queueCount,
}: {
  onClick: () => void;
  disabled: boolean;
  queueCount: number;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      disabled={disabled}
      className="group relative aspect-[4/5] overflow-hidden rounded-2xl transition-all active:scale-[0.97] disabled:cursor-not-allowed"
      style={{
        background: disabled
          ? "rgba(255,255,255,0.025)"
          : `linear-gradient(135deg, ${TEAL}26 0%, ${TEAL_LIGHT}14 50%, ${TEAL}26 100%)`,
        border: disabled
          ? "2px dashed rgba(255,255,255,0.10)"
          : `2px solid ${TEAL}77`,
        boxShadow: disabled
          ? "none"
          : `0 0 36px ${TEAL}55, inset 0 0 32px ${TEAL}22`,
      }}
    >
      {/* Halo animé quand actif */}
      {!disabled && (
        <div
          className="pointer-events-none absolute inset-0 animate-pulse"
          style={{
            background: `radial-gradient(circle at center, ${TEAL_LIGHT}22 0%, transparent 70%)`,
          }}
        />
      )}

      <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <div
          className="text-6xl transition-transform group-hover:scale-110"
          style={{
            color: disabled ? "rgba(255,255,255,0.18)" : TEAL_LIGHT,
            textShadow: disabled ? "none" : `0 0 24px ${TEAL_LIGHT}88`,
          }}
        >
          ✦
        </div>

        <div className="space-y-0.5">
          <p
            className="font-serif text-2xl italic leading-tight"
            style={{ color: disabled ? "rgba(255,255,255,0.35)" : "white" }}
          >
            Préparer
          </p>
          <p
            className="font-serif text-2xl italic leading-tight"
            style={{ color: disabled ? "rgba(255,255,255,0.35)" : "white" }}
          >
            le prochain
          </p>
        </div>

        <div className="mt-2 flex items-center gap-2">
          {disabled ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">
              file vide
            </p>
          ) : (
            <>
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold"
                style={{
                  backgroundColor: TEAL,
                  color: "white",
                  boxShadow: `0 0 12px ${TEAL_LIGHT}`,
                }}
              >
                {queueCount}
              </span>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em]"
                style={{ color: TEAL_LIGHT }}
              >
                en file
              </p>
            </>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function OverflowCard({ count }: { count: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/15 p-4"
      style={{
        backgroundColor: "rgba(255,255,255,0.03)",
      }}
    >
      <div
        className="text-3xl"
        style={{ color: "rgba(125, 212, 199, 0.5)" }}
      >
        ⋯
      </div>
      <p
        className="font-serif text-3xl italic"
        style={{ color: TEAL_LIGHT }}
      >
        +{count}
      </p>
      <p className="text-center font-mono text-[9px] uppercase tracking-[0.24em] text-white/45">
        autre{count > 1 ? "s" : ""} drink{count > 1 ? "s" : ""}
        <br />
        en file (mode avancé)
      </p>
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
