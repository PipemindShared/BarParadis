import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { isTestPhone } from "./phone";

const modeValidator = v.union(v.literal("live"), v.literal("test"));
type Mode = "live" | "test";

/**
 * Vérifie le PIN d'accès au bar.
 * Retourne le mode correspondant ("live" ou "test") si valide, null sinon.
 */
export const verifyPin = action({
  args: { pin: v.string() },
  handler: async (
    _ctx,
    { pin }
  ): Promise<{ ok: boolean; mode: Mode | null }> => {
    const live = process.env.BAR_ACCESS_PIN;
    const test = process.env.BAR_TEST_PIN;
    const trimmed = pin.trim();
    if (live && trimmed === live) return { ok: true, mode: "live" };
    if (test && trimmed === test) return { ok: true, mode: "test" };
    return { ok: false, mode: null };
  },
});

/**
 * Récupère tous les drinks groupés par statut, ordonnés par priorité puis ancienneté.
 * Filtre selon le mode: "live" exclut les téléphones de test, "test" n'inclut qu'eux.
 */
export const listAll = query({
  args: { mode: v.optional(modeValidator) },
  handler: async (ctx, { mode }) => {
    const effectiveMode: Mode = mode ?? "live";
    const raw = await ctx.db.query("participants").order("asc").collect();
    const all = raw.filter((p) => {
      const isTest = isTestPhone(p.phone);
      return effectiveMode === "test" ? isTest : !isTest;
    });

    // Tri: prioritaire d'abord, puis par createdAt
    const byStatus: Record<string, typeof all> = {
      waiting: [],
      priority: [],
      preparing: [],
      ready: [],
      served: [],
      no_show: [],
    };

    for (const p of all) {
      const status = p.queueStatus ?? "waiting";
      const bucket = byStatus[status] ?? byStatus.waiting;
      bucket.push(p);
    }

    // Pour la file d'attente: priorité d'abord, puis ancienneté
    const queueWaiting = [...byStatus.priority, ...byStatus.waiting].sort(
      (a, b) => {
        // priorité d'abord
        const ap = a.queueStatus === "priority" ? 0 : 1;
        const bp = b.queueStatus === "priority" ? 0 : 1;
        if (ap !== bp) return ap - bp;
        return a.createdAt - b.createdAt;
      }
    );

    return {
      waiting: queueWaiting,
      preparing: byStatus.preparing.sort((a, b) => a.createdAt - b.createdAt),
      ready: byStatus.ready.sort(
        (a, b) => (a.readyAt ?? a.createdAt) - (b.readyAt ?? b.createdAt)
      ),
      served: byStatus.served.sort(
        (a, b) => (b.servedAt ?? 0) - (a.servedAt ?? 0)
      ),
      noShow: byStatus.no_show.sort(
        (a, b) => (b.noShowAt ?? 0) - (a.noShowAt ?? 0)
      ),
      counts: {
        waiting: queueWaiting.length,
        preparing: byStatus.preparing.length,
        ready: byStatus.ready.length,
        served: byStatus.served.length,
        no_show: byStatus.no_show.length,
      },
    };
  },
});

/**
 * Récupère le prochain drink à préparer et le met en "preparing".
 * Priorité aux drinks "priority", puis par ancienneté.
 */
export const pullNext = mutation({
  args: { barmanName: v.optional(v.string()) },
  handler: async (ctx, { barmanName }) => {
    // Cherche d'abord les prioritaires
    const priorityDrinks = await ctx.db
      .query("participants")
      .withIndex("by_queue_status", (q) => q.eq("queueStatus", "priority"))
      .collect();

    let next = priorityDrinks.sort((a, b) => a.createdAt - b.createdAt)[0];

    if (!next) {
      const waitingDrinks = await ctx.db
        .query("participants")
        .withIndex("by_queue_status", (q) => q.eq("queueStatus", "waiting"))
        .collect();
      next = waitingDrinks.sort((a, b) => a.createdAt - b.createdAt)[0];
    }

    if (!next) return { participantId: null };

    await ctx.db.patch(next._id, {
      queueStatus: "preparing",
      preparingAt: Date.now(),
      barmanName: barmanName ?? "Barman",
    });

    return { participantId: next._id };
  },
});

/**
 * Marque un drink comme prêt. Déclenche un SMS d'avis au client.
 */
export const markReady = mutation({
  args: { participantId: v.id("participants") },
  handler: async (ctx, { participantId }) => {
    const participant = await ctx.db.get(participantId);
    if (!participant) throw new Error("Drink introuvable");

    await ctx.db.patch(participantId, {
      queueStatus: "ready",
      readyAt: Date.now(),
    });

    // Le SMS est déclenché côté action depuis le client (pour pouvoir importer twilio)
    return { ok: true };
  },
});

/**
 * Marque un drink comme distribué.
 */
export const markServed = mutation({
  args: { participantId: v.id("participants") },
  handler: async (ctx, { participantId }) => {
    await ctx.db.patch(participantId, {
      queueStatus: "served",
      servedAt: Date.now(),
    });
    return { ok: true };
  },
});

/**
 * Marque un drink no-show. Le drink original est marqué no_show.
 * Si reassignToId fourni, ce participant reçoit le drink (avec nouveau timestamp et SMS).
 */
export const markNoShow = mutation({
  args: {
    participantId: v.id("participants"),
    reassignToId: v.optional(v.id("participants")),
  },
  handler: async (ctx, { participantId, reassignToId }) => {
    const original = await ctx.db.get(participantId);
    if (!original) throw new Error("Drink introuvable");

    await ctx.db.patch(participantId, {
      queueStatus: "no_show",
      noShowAt: Date.now(),
    });

    if (reassignToId) {
      const candidate = await ctx.db.get(reassignToId);
      if (!candidate) throw new Error("Candidat de réassignement introuvable");
      await ctx.db.patch(reassignToId, {
        queueStatus: "ready",
        readyAt: Date.now(),
        reassignedFromId: participantId,
      });
      return { ok: true, reassignedToId: reassignToId };
    }

    return { ok: true };
  },
});

/**
 * Toggle le statut prioritaire d'un drink en attente.
 */
export const togglePriority = mutation({
  args: { participantId: v.id("participants") },
  handler: async (ctx, { participantId }) => {
    const p = await ctx.db.get(participantId);
    if (!p) throw new Error("Drink introuvable");

    if (p.queueStatus === "waiting") {
      await ctx.db.patch(participantId, { queueStatus: "priority" });
    } else if (p.queueStatus === "priority") {
      await ctx.db.patch(participantId, { queueStatus: "waiting" });
    } else {
      throw new Error(
        "On ne peut prioriser qu'un drink en attente."
      );
    }
    return { ok: true };
  },
});

/**
 * Change le statut d'un drink manuellement (Mode Avancé / drag-drop).
 */
export const setStatus = mutation({
  args: {
    participantId: v.id("participants"),
    status: v.union(
      v.literal("waiting"),
      v.literal("priority"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served"),
      v.literal("no_show")
    ),
  },
  handler: async (ctx, { participantId, status }) => {
    const updates: Record<string, unknown> = { queueStatus: status };
    if (status === "preparing") updates.preparingAt = Date.now();
    if (status === "ready") updates.readyAt = Date.now();
    if (status === "served") updates.servedAt = Date.now();
    if (status === "no_show") updates.noShowAt = Date.now();
    await ctx.db.patch(participantId, updates);
    return { ok: true };
  },
});

/**
 * Liste les candidats pour réassignement: participants en file (waiting/priority)
 * qui ont commandé le même élixir.
 */
export const reassignmentCandidates = query({
  args: { elixir: v.string() },
  handler: async (ctx, { elixir }) => {
    const all = await ctx.db.query("participants").collect();
    return all
      .filter(
        (p) =>
          p.elixir === elixir &&
          (p.queueStatus === "waiting" || p.queueStatus === "priority")
      )
      .sort((a, b) => a.createdAt - b.createdAt);
  },
});

/**
 * Réinitialise tous les drinks de test (téléphones de test) à l'état "waiting".
 * Efface les timestamps d'avancement pour permettre un test propre.
 * Utilisé en mode test uniquement.
 */
export const resetTestDrinks = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("participants").collect();
    let count = 0;
    for (const p of all) {
      if (isTestPhone(p.phone)) {
        await ctx.db.patch(p._id, {
          queueStatus: "waiting",
          preparingAt: undefined,
          readyAt: undefined,
          servedAt: undefined,
          noShowAt: undefined,
          barmanName: undefined,
          reassignedFromId: undefined,
        });
        count++;
      }
    }
    return { count };
  },
});
