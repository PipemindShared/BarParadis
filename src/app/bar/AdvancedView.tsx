"use client";

import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import {
  getElixirImage,
  getProfileStyle,
  formatDuration,
  maskLastName,
  isAdminPhone,
} from "@/lib/bar-utils";

const TEAL = "#19978a";
const TEAL_LIGHT = "#7DD4C7";

type Participant = Doc<"participants">;

type Status = "waiting" | "preparing" | "ready" | "served" | "no_show";

const COLUMN_DEFS: Array<{
  key: Status;
  label: string;
  accent: string;
}> = [
  { key: "waiting", label: "Attente", accent: "#94a3b8" },
  { key: "preparing", label: "En cours", accent: TEAL_LIGHT },
  { key: "ready", label: "Prêts", accent: "#fbbf24" },
  { key: "served", label: "Distribués", accent: "#a7f3d0" },
  { key: "no_show", label: "No-show", accent: "#fca5a5" },
];

type Data = {
  waiting: Participant[];
  preparing: Participant[];
  ready: Participant[];
  served: Participant[];
  noShow: Participant[];
};

const ELIXIR_KEYS = [
  { key: "renaissance" as const, label: "L'Élixir de Renaissance", deity: "Iris" },
  { key: "perles" as const, label: "Les Perles du Paradis", deity: "Idun" },
  { key: "cendres" as const, label: "Les Cendres du Phénix", deity: "Mellona" },
  { key: "hotfix" as const, label: "Le Hotfix Royal", deity: "Heimdall" },
];

export function AdvancedView({
  data,
  now,
  onMarkReady,
  onMarkServed,
  onMarkNoShow,
  onPullNext,
}: {
  data: Data;
  now: number;
  onMarkReady: (p: Participant) => void;
  onMarkServed: (p: Participant) => void;
  onMarkNoShow: (p: Participant) => void;
  onPullNext: () => void;
}) {
  const setStatus = useMutation(api.bar.setStatus);
  const togglePriority = useMutation(api.bar.togglePriority);
  const [search, setSearch] = useState("");
  const [inventoryOpen, setInventoryOpen] = useState(false);

  const allByStatus = useMemo<Record<Status, Participant[]>>(
    () => ({
      waiting: data.waiting,
      preparing: data.preparing,
      ready: data.ready,
      served: data.served,
      no_show: data.noShow,
    }),
    [data]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allByStatus;
    const matches = (p: Participant) =>
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      (p.elixir ?? "").toLowerCase().includes(q) ||
      (p.deity ?? "").toLowerCase().includes(q) ||
      (p.profile ?? "").toLowerCase().includes(q);
    return {
      waiting: data.waiting.filter(matches),
      preparing: data.preparing.filter(matches),
      ready: data.ready.filter(matches),
      served: data.served.filter(matches),
      no_show: data.noShow.filter(matches),
    } as Record<Status, Participant[]>;
  }, [search, allByStatus, data]);

  return (
    <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-black/30 px-5 py-3 backdrop-blur-md">
        <div className="relative flex flex-1 max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, élixir, divinité…"
            className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 pl-10 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30"
          />
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
            🔍
          </span>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/45 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        <button
          onClick={() => setInventoryOpen(true)}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition-all hover:bg-white/10"
        >
          ⚗ Inventaire
        </button>

        <button
          onClick={onPullNext}
          disabled={data.waiting.length === 0}
          className="rounded-full px-4 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-30"
          style={{
            background:
              data.waiting.length > 0
                ? `linear-gradient(135deg, ${TEAL} 0%, #0f7a70 100%)`
                : "rgba(255,255,255,0.06)",
            color: "white",
          }}
        >
          ✦ Prochain ({data.waiting.length})
        </button>
      </div>

      {/* Kanban */}
      <div className="flex flex-1 gap-3 overflow-x-auto overflow-y-hidden p-4">
        {COLUMN_DEFS.map((col) => (
          <KanbanColumn
            key={col.key}
            col={col}
            items={filtered[col.key]}
            totalCount={allByStatus[col.key].length}
            now={now}
            onSetStatus={(p, newStatus) =>
              setStatus({ participantId: p._id, status: newStatus })
            }
            onTogglePriority={(p) => togglePriority({ participantId: p._id })}
            onMarkReady={onMarkReady}
            onMarkServed={onMarkServed}
            onMarkNoShow={onMarkNoShow}
          />
        ))}
      </div>

      {inventoryOpen && (
        <InventoryDialog onClose={() => setInventoryOpen(false)} />
      )}
    </div>
  );
}

function KanbanColumn({
  col,
  items,
  totalCount,
  now,
  onSetStatus,
  onTogglePriority,
  onMarkReady,
  onMarkServed,
  onMarkNoShow,
}: {
  col: { key: Status; label: string; accent: string };
  items: Participant[];
  totalCount: number;
  now: number;
  onSetStatus: (p: Participant, status: Status) => void;
  onTogglePriority: (p: Participant) => void;
  onMarkReady: (p: Participant) => void;
  onMarkServed: (p: Participant) => void;
  onMarkNoShow: (p: Participant) => void;
}) {
  return (
    <div
      className="flex w-[260px] shrink-0 flex-col rounded-2xl border border-white/8 bg-white/[0.025] p-3"
      style={{ borderTopWidth: 2, borderTopColor: col.accent }}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/65">
          {col.label}
        </h3>
        <span
          className="font-serif text-lg italic"
          style={{ color: col.accent }}
        >
          {totalCount}
        </span>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="py-8 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">
            vide
          </p>
        ) : (
          items.map((p) => (
            <CompactCard
              key={p._id}
              participant={p}
              now={now}
              status={col.key}
              onSetStatus={(s) => onSetStatus(p, s)}
              onTogglePriority={() => onTogglePriority(p)}
              onMarkReady={() => onMarkReady(p)}
              onMarkServed={() => onMarkServed(p)}
              onMarkNoShow={() => onMarkNoShow(p)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CompactCard({
  participant,
  now,
  status,
  onSetStatus,
  onTogglePriority,
  onMarkReady,
  onMarkServed,
  onMarkNoShow,
}: {
  participant: Participant;
  now: number;
  status: Status;
  onSetStatus: (s: Status) => void;
  onTogglePriority: () => void;
  onMarkReady: () => void;
  onMarkServed: () => void;
  onMarkNoShow: () => void;
}) {
  const image = getElixirImage(participant.elixir);
  const profile = getProfileStyle(participant.profile);
  const withAlcohol = participant.withAlcohol !== false;
  const isAdmin = isAdminPhone(participant.phone);
  const isPriority = participant.queueStatus === "priority";

  const ts =
    status === "preparing"
      ? participant.preparingAt
      : status === "ready"
        ? participant.readyAt
        : status === "served"
          ? participant.servedAt
          : status === "no_show"
            ? participant.noShowAt
            : participant.createdAt;
  const elapsed = ts ? now - ts : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-xl border"
      style={{
        borderColor: isPriority
          ? "rgba(251, 191, 36, 0.55)"
          : !withAlcohol
            ? `${TEAL_LIGHT}88`
            : "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.02)",
        boxShadow: !withAlcohol
          ? `0 0 0 1px ${TEAL_LIGHT}55`
          : isPriority
            ? "0 0 0 1px rgba(251, 191, 36, 0.3)"
            : "none",
      }}
    >
      {/* Image strip à gauche */}
      <div className="flex">
        <div
          className="relative h-[88px] w-[88px] shrink-0"
          style={
            !withAlcohol
              ? { filter: "saturate(0.3) brightness(0.7)" }
              : undefined
          }
        >
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* Contenu droite */}
        <div className="flex flex-1 flex-col justify-between p-2">
          <div>
            <div className="flex items-center gap-1.5">
              {isPriority && (
                <span className="text-xs" title="Prioritaire">
                  ★
                </span>
              )}
              {!withAlcohol && (
                <span
                  className="rounded px-1 py-0.5 font-mono text-[7px] font-bold uppercase tracking-wide"
                  style={{ backgroundColor: TEAL, color: "white" }}
                >
                  ⊘ Sans
                </span>
              )}
              {isAdmin && (
                <span
                  className="rounded px-1 py-0.5 font-mono text-[7px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.85)",
                    color: "#1a0c00",
                  }}
                >
                  ⚙
                </span>
              )}
              {profile && (
                <span
                  className="font-mono text-[8px] font-bold uppercase tracking-wide"
                  style={{ color: profile.color }}
                  title={profile.label}
                >
                  {profile.icon}
                </span>
              )}
            </div>
            <p
              className="font-serif text-[13px] italic leading-tight text-white"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
            >
              {participant.elixir ?? "—"}
            </p>
            <p className="text-[11px] font-medium leading-tight text-white/85">
              {participant.firstName} {maskLastName(participant.lastName)}
            </p>
          </div>
          <p className="font-mono text-[8px] uppercase tracking-wider text-white/45">
            {formatDuration(elapsed)}
          </p>
        </div>
      </div>

      {/* Quick actions selon le statut */}
      <div className="flex gap-1 border-t border-white/8 px-2 py-1.5">
        {status === "waiting" && (
          <>
            <ActionBtn
              onClick={onTogglePriority}
              icon={isPriority ? "★" : "☆"}
              title={isPriority ? "Retirer priorité" : "Prioriser"}
            />
            <ActionBtn
              onClick={() => onSetStatus("preparing")}
              icon="→"
              title="Mettre en préparation"
            />
          </>
        )}
        {status === "preparing" && (
          <>
            <ActionBtn
              onClick={() => onSetStatus("waiting")}
              icon="←"
              title="Renvoyer en file"
            />
            <ActionBtn
              onClick={onMarkReady}
              icon="✓"
              title="Marquer prêt"
              accent={TEAL}
            />
          </>
        )}
        {status === "ready" && (
          <>
            <ActionBtn
              onClick={onMarkServed}
              icon="✓"
              title="Servi"
              accent={TEAL}
            />
            <ActionBtn
              onClick={onMarkNoShow}
              icon="⊘"
              title="No-show"
            />
          </>
        )}
        {status === "served" && (
          <ActionBtn
            onClick={() => onSetStatus("ready")}
            icon="↶"
            title="Annuler service"
          />
        )}
        {status === "no_show" && (
          <ActionBtn
            onClick={() => onSetStatus("waiting")}
            icon="↶"
            title="Remettre en file"
          />
        )}
      </div>
    </motion.div>
  );
}

function ActionBtn({
  onClick,
  icon,
  title,
  accent,
}: {
  onClick: () => void;
  icon: string;
  title: string;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex flex-1 items-center justify-center rounded py-1 text-xs transition-all active:scale-95"
      style={{
        backgroundColor: accent ? `${accent}` : "rgba(255,255,255,0.06)",
        color: accent ? "white" : "rgba(255,255,255,0.85)",
      }}
    >
      {icon}
    </button>
  );
}

function InventoryDialog({ onClose }: { onClose: () => void }) {
  const inventory = useQuery(api.inventory.list);
  const setAvailability = useMutation(api.inventory.setAvailability);
  const [reasons, setReasons] = useState<Record<string, string>>({});

  async function toggle(key: "renaissance" | "perles" | "cendres" | "hotfix") {
    const current = inventory?.[key];
    const newAvailable = !(current?.available ?? true);
    await setAvailability({
      elixir: key,
      available: newAvailable,
      reason: newAvailable ? undefined : reasons[key],
    });
  }

  async function updateReason(
    key: "renaissance" | "perles" | "cendres" | "hotfix",
    reason: string
  ) {
    setReasons((p) => ({ ...p, [key]: reason }));
    const current = inventory?.[key];
    if (current && !current.available) {
      await setAvailability({ elixir: key, available: false, reason });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a1729] p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.28em]"
              style={{ color: TEAL_LIGHT }}
            >
              ── inventaire
            </p>
            <h3 className="mt-1 font-serif text-2xl italic text-white">
              Disponibilité des élixirs
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-white/45 hover:text-white"
          >
            ×
          </button>
        </div>

        <p className="mt-3 text-sm text-white/65">
          Désactive un élixir si tu n'as plus les ingrédients. La divinité
          correspondante sera affichée comme « occupée » dans l'app de commande.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          {ELIXIR_KEYS.map((e) => {
            const slot = inventory?.[e.key];
            const available = slot?.available ?? true;
            const currentReason = reasons[e.key] ?? slot?.reason ?? "";

            return (
              <div
                key={e.key}
                className="rounded-xl border p-3"
                style={{
                  borderColor: available
                    ? "rgba(125, 212, 199, 0.3)"
                    : "rgba(248, 113, 113, 0.35)",
                  backgroundColor: available
                    ? "rgba(125, 212, 199, 0.06)"
                    : "rgba(248, 113, 113, 0.08)",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p
                      className="font-serif text-lg italic"
                      style={{ color: available ? "white" : "rgba(255,255,255,0.5)" }}
                    >
                      {e.label}
                    </p>
                    <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
                      {e.deity} ·{" "}
                      <span
                        style={{
                          color: available ? "#86efac" : "#fca5a5",
                        }}
                      >
                        {available ? "Disponible" : "Indisponible"}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => toggle(e.key)}
                    className="relative flex h-7 w-12 items-center rounded-full transition-all"
                    style={{
                      backgroundColor: available ? TEAL : "rgba(248, 113, 113, 0.4)",
                    }}
                  >
                    <span
                      className="absolute h-5 w-5 rounded-full bg-white shadow-md transition-all"
                      style={{ left: available ? 24 : 3 }}
                    />
                  </button>
                </div>

                {!available && (
                  <input
                    type="text"
                    value={currentReason}
                    onChange={(e2) => updateReason(e.key, e2.target.value)}
                    placeholder="Ce dieu est trop occupé."
                    className="mt-2.5 w-full rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-white/35 focus:border-white/25 focus:outline-none"
                  />
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
          changements appliqués en temps réel sur l'app de commande
        </p>
      </motion.div>
    </motion.div>
  );
}
