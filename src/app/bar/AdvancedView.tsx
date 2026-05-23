"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../../../convex/_generated/api";
import { RecipeManager } from "./RecipeManager";
import { SettingsDialog } from "./SettingsDialog";
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
  mode,
  onMarkReady,
  onMarkServed,
  onMarkNoShow,
  onPullNext,
  onShowRecipe,
}: {
  data: Data;
  now: number;
  mode: "live" | "test";
  onMarkReady: (p: Participant) => void;
  onMarkServed: (p: Participant) => void;
  onMarkNoShow: (p: Participant) => void;
  onPullNext: () => void;
  onShowRecipe: (p: Participant) => void;
}) {
  const setStatus = useMutation(api.bar.setStatus);
  const togglePriority = useMutation(api.bar.togglePriority);
  const [search, setSearch] = useState("");
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [recipesOpen, setRecipesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeMobileCol, setActiveMobileCol] = useState<Status>("waiting");
  const [draggingId, setDraggingId] = useState<Id<"participants"> | null>(null);

  const sensors = useSensors(
    // Pointer: petit délai pour pas confondre avec un click sur les boutons
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    // Touch: long press pour drag (300ms) — évite les conflits avec le scroll
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    }),
    useSensor(KeyboardSensor)
  );

  // Trouve un participant par son ID (utilisé par DragOverlay)
  const allParticipants = useMemo(
    () => [
      ...data.waiting,
      ...data.preparing,
      ...data.ready,
      ...data.served,
      ...data.noShow,
    ],
    [data]
  );

  function findParticipant(id: Id<"participants"> | null): Participant | null {
    if (!id) return null;
    return allParticipants.find((p) => p._id === id) ?? null;
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(event.active.id as Id<"participants">);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null);
    const { active, over } = event;
    if (!over) return;
    const participantId = active.id as Id<"participants">;
    const targetStatus = over.id as Status;
    const participant = findParticipant(participantId);
    if (!participant) return;
    if (participant.queueStatus === targetStatus) return;

    // Si on déplace vers "ready", déclencher aussi le SMS via onMarkReady
    if (targetStatus === "ready") {
      onMarkReady(participant);
      return;
    }
    setStatus({ participantId, status: targetStatus });
  }

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
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md sm:gap-3 sm:px-5">
        <div className="relative flex flex-1 basis-full max-w-md sm:basis-auto">
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
          onClick={() => setRecipesOpen(true)}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition-all hover:bg-white/10"
        >
          📖 Recettes
        </button>

        <button
          onClick={() => setInventoryOpen(true)}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition-all hover:bg-white/10"
        >
          ⚗ Inventaire
        </button>

        <button
          onClick={() => setSettingsOpen(true)}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition-all hover:bg-white/10"
        >
          ⚙ Paramètres
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

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggingId(null)}
      >
        {/* Desktop/Tablet: kanban 5 colonnes côte à côte avec drag & drop */}
        <div className="hidden flex-1 gap-3 overflow-x-auto overflow-y-hidden p-4 teal-scrollbar lg:flex">
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
              onShowRecipe={onShowRecipe}
            />
          ))}
        </div>

      {/* Mobile: onglets + colonne active en pleine largeur */}
      <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
        <div className="flex gap-1.5 overflow-x-auto border-b border-white/10 px-3 py-3 teal-scrollbar">
          {COLUMN_DEFS.map((col) => {
            const active = activeMobileCol === col.key;
            const count = allByStatus[col.key].length;
            return (
              <button
                key={col.key}
                onClick={() => setActiveMobileCol(col.key)}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all"
                style={{
                  backgroundColor: active
                    ? `${col.accent}22`
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${
                    active ? col.accent : "rgba(255,255,255,0.08)"
                  }`,
                  color: active ? col.accent : "rgba(255,255,255,0.6)",
                }}
              >
                {col.label}
                <span
                  className="rounded-full px-1.5 py-0.5 font-serif text-[11px] italic"
                  style={{
                    backgroundColor: active
                      ? `${col.accent}33`
                      : "rgba(255,255,255,0.06)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-3 teal-scrollbar">
          {filtered[activeMobileCol].length === 0 ? (
            <p className="py-12 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
              vide
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered[activeMobileCol].map((p) => (
                <CompactCard
                  key={p._id}
                  participant={p}
                  now={now}
                  status={activeMobileCol}
                  onSetStatus={(s) =>
                    setStatus({ participantId: p._id, status: s })
                  }
                  onTogglePriority={() =>
                    togglePriority({ participantId: p._id })
                  }
                  onMarkReady={() => onMarkReady(p)}
                  onMarkServed={() => onMarkServed(p)}
                  onMarkNoShow={() => onMarkNoShow(p)}
                  onShowRecipe={() => onShowRecipe(p)}
                  draggable={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

        {/* Drag overlay — card flottante pendant le drag */}
        <DragOverlay dropAnimation={{ duration: 200 }}>
          {draggingId ? (
            <DragOverlayCard
              participant={findParticipant(draggingId)!}
              now={now}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {inventoryOpen && (
        <InventoryDialog onClose={() => setInventoryOpen(false)} />
      )}

      {recipesOpen && (
        <RecipeManager onClose={() => setRecipesOpen(false)} />
      )}

      {settingsOpen && (
        <SettingsDialog
          mode={mode}
          onClose={() => setSettingsOpen(false)}
        />
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
  onShowRecipe,
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
  onShowRecipe: (p: Participant) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });

  return (
    <div
      ref={setNodeRef}
      className="flex h-full min-w-[220px] flex-1 flex-col rounded-2xl border bg-white/[0.025] p-3 transition-all"
      style={{
        borderColor: isOver ? col.accent : "rgba(255,255,255,0.08)",
        borderTopWidth: 2,
        borderTopColor: col.accent,
        boxShadow: isOver ? `0 0 0 2px ${col.accent}99, 0 12px 32px -8px ${col.accent}55` : "none",
        backgroundColor: isOver
          ? `${col.accent}11`
          : "rgba(255,255,255,0.025)",
      }}
    >
      <div className="mb-3 flex shrink-0 items-center justify-between px-1">
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

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1 teal-scrollbar">
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
              onShowRecipe={() => onShowRecipe(p)}
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
  draggable = true,
  onSetStatus,
  onTogglePriority,
  onMarkReady,
  onMarkServed,
  onMarkNoShow,
  onShowRecipe,
}: {
  participant: Participant;
  now: number;
  status: Status;
  draggable?: boolean;
  onSetStatus: (s: Status) => void;
  onTogglePriority: () => void;
  onMarkReady: () => void;
  onMarkServed: () => void;
  onMarkNoShow: () => void;
  onShowRecipe: () => void;
}) {
  const drag = useDraggable({ id: participant._id, disabled: !draggable });
  const { attributes, listeners, setNodeRef, transform, isDragging } = drag;
  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;
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
      ref={draggable ? setNodeRef : undefined}
      {...(draggable ? attributes : {})}
      {...(draggable ? listeners : {})}
      className="relative shrink-0 overflow-hidden rounded-xl border bg-white/[0.03]"
      style={{
        borderColor: isPriority
          ? "rgba(251, 191, 36, 0.55)"
          : !withAlcohol
            ? `${TEAL_LIGHT}99`
            : "rgba(255,255,255,0.10)",
        boxShadow: !withAlcohol
          ? `0 0 0 1px ${TEAL_LIGHT}55, 0 4px 12px -4px ${TEAL_LIGHT}33`
          : isPriority
            ? "0 0 0 1px rgba(251, 191, 36, 0.4), 0 4px 12px -4px rgba(251, 191, 36, 0.3)"
            : "0 2px 8px -4px rgba(0,0,0,0.4)",
        touchAction: draggable ? "none" : "manipulation",
        cursor: draggable ? (isDragging ? "grabbing" : "grab") : "pointer",
        opacity: isDragging ? 0.4 : 1,
        ...dragStyle,
      }}
      onDoubleClick={onShowRecipe}
      title={draggable ? "Glisser pour changer de colonne · double-clic pour la recette" : "Double-cliquer pour la recette"}
    >
      {/* Image strip à gauche (plus compact: 56x56) + contenu */}
      <div className="flex gap-2.5 p-2.5">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          {isPriority && (
            <div
              className="absolute right-0.5 top-0.5 rounded-full px-1 text-[10px] font-bold leading-none"
              style={{
                backgroundColor: "#fbbf24",
                color: "#1a0c00",
                lineHeight: 1.2,
                padding: "1px 3px",
              }}
            >
              ★
            </div>
          )}
        </div>

        {/* Contenu droite */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {/* Badges row */}
          <div className="flex items-center gap-1">
            {!withAlcohol && (
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: TEAL, color: "white" }}
              >
                ⊘ Sans alcool
              </span>
            )}
            {isAdmin && (
              <span
                className="rounded px-1 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.9)",
                  color: "#1a0c00",
                }}
                title="Téléphone admin/test"
              >
                ⚙
              </span>
            )}
            {profile && (
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: profile.bg,
                  color: profile.color,
                }}
                title={profile.label}
              >
                {profile.icon} {profile.label}
              </span>
            )}
          </div>

          {/* Nom du drink (varié) */}
          <p
            className="truncate font-serif text-[14px] italic leading-tight text-white"
            title={participant.drinkName ?? participant.elixir ?? undefined}
          >
            {participant.drinkName ?? participant.elixir ?? "—"}
          </p>
          {participant.drinkName && participant.elixir && (
            <p
              className="truncate font-mono text-[8px] uppercase tracking-wider text-white/45"
              title={participant.elixir}
            >
              {participant.elixir}
            </p>
          )}

          {/* Client + temps */}
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[12px] font-medium leading-tight text-white/90">
              {participant.firstName} {maskLastName(participant.lastName)}
            </p>
            <p
              className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {formatDuration(elapsed)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick actions selon le statut */}
      <div
        className="flex gap-1.5 border-t border-white/10 bg-black/15 px-2 py-1.5"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {status === "waiting" && (
          <>
            <ActionBtn
              onClick={onTogglePriority}
              icon={isPriority ? "★" : "☆"}
              label={isPriority ? "Retirer" : "Prioriser"}
              accent={isPriority ? "#fbbf24" : undefined}
            />
            <ActionBtn
              onClick={() => onSetStatus("preparing")}
              icon="→"
              label="Préparer"
              accent={TEAL}
            />
          </>
        )}
        {status === "preparing" && (
          <>
            <ActionBtn
              onClick={() => onSetStatus("waiting")}
              icon="←"
              label="En file"
            />
            <ActionBtn
              onClick={onMarkReady}
              icon="✓"
              label="Prêt"
              accent={TEAL}
            />
          </>
        )}
        {status === "ready" && (
          <>
            <ActionBtn
              onClick={onMarkServed}
              icon="✓"
              label="Servi"
              accent={TEAL}
            />
            <ActionBtn onClick={onMarkNoShow} icon="⊘" label="No-show" />
          </>
        )}
        {status === "served" && (
          <ActionBtn
            onClick={() => onSetStatus("ready")}
            icon="↶"
            label="Annuler"
          />
        )}
        {status === "no_show" && (
          <ActionBtn
            onClick={() => onSetStatus("waiting")}
            icon="↶"
            label="Remettre"
          />
        )}
      </div>
    </motion.div>
  );
}

function DragOverlayCard({
  participant,
  now,
}: {
  participant: Participant;
  now: number;
}) {
  const image = getElixirImage(participant.elixir);
  const profile = getProfileStyle(participant.profile);
  const withAlcohol = participant.withAlcohol !== false;
  const elapsed = now - participant.createdAt;

  return (
    <div
      className="relative w-[260px] cursor-grabbing overflow-hidden rounded-xl border-2"
      style={{
        borderColor: TEAL_LIGHT,
        backgroundColor: "rgba(20, 30, 50, 0.95)",
        boxShadow: `0 20px 60px -10px ${TEAL_LIGHT}88, 0 0 0 4px ${TEAL_LIGHT}33`,
        transform: "rotate(-2deg)",
      }}
    >
      <div className="flex gap-2.5 p-2.5">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-1">
            {!withAlcohol && (
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: TEAL, color: "white" }}
              >
                ⊘ Sans alcool
              </span>
            )}
            {profile && (
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: profile.bg, color: profile.color }}
              >
                {profile.icon} {profile.label}
              </span>
            )}
          </div>
          <p className="truncate font-serif text-[14px] italic leading-tight text-white">
            {participant.drinkName ?? participant.elixir ?? "—"}
          </p>
          {participant.drinkName && participant.elixir && (
            <p className="truncate font-mono text-[8px] uppercase tracking-wider text-white/45">
              {participant.elixir}
            </p>
          )}
          <p className="truncate text-[12px] font-medium leading-tight text-white/90">
            {participant.firstName} {maskLastName(participant.lastName)}
          </p>
          <p className="font-mono text-[9px] uppercase tracking-wider text-white/55">
            {formatDuration(elapsed)}
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  icon,
  label,
  accent,
}: {
  onClick: () => void;
  icon: string;
  label: string;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
      style={{
        backgroundColor: accent ?? "rgba(255,255,255,0.08)",
        color: accent ? "white" : "rgba(255,255,255,0.85)",
        border: accent ? "none" : "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <span className="text-[12px]">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function InventoryDialog({ onClose }: { onClose: () => void }) {
  const inventory = useQuery(api.inventory.list);
  const setAvailability = useMutation(api.inventory.setAvailability);
  const [reasons, setReasons] = useState<Record<string, string>>({});

  if (typeof document === "undefined") return null;

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

  const modal = (
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

  return createPortal(modal, document.body);
}
