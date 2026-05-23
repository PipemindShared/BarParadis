import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

const modeValidator = v.union(v.literal("live"), v.literal("test"));
type Mode = "live" | "test";

// Profils, divinités, élixirs pour les seeds (mêmes que le client)
const SEED_PARTICIPANTS: Array<{
  firstName: string;
  lastName: string;
  profile: "Codeur" | "Designer" | "Manager";
  deity: "Iris" | "Idun" | "Mellona" | "Heimdall";
  elixir: string;
  withAlcohol: boolean;
}> = [
  { firstName: "Marie", lastName: "Tremblay", profile: "Codeur", deity: "Iris", elixir: "L’Élixir de Renaissance", withAlcohol: true },
  { firstName: "Olivier", lastName: "Bouchard", profile: "Designer", deity: "Mellona", elixir: "Les Cendres du Phénix", withAlcohol: true },
  { firstName: "Sophie", lastName: "Gagnon", profile: "Manager", deity: "Heimdall", elixir: "Le Hotfix Royal", withAlcohol: false },
  { firstName: "Jean-Philippe", lastName: "Lapointe", profile: "Codeur", deity: "Idun", elixir: "Les Perles du Paradis", withAlcohol: true },
  { firstName: "Maxime", lastName: "Roy", profile: "Designer", deity: "Iris", elixir: "L’Élixir de Renaissance", withAlcohol: false },
  { firstName: "Émilie", lastName: "Pelletier", profile: "Manager", deity: "Mellona", elixir: "Les Cendres du Phénix", withAlcohol: true },
  { firstName: "Antoine", lastName: "Drouin", profile: "Codeur", deity: "Heimdall", elixir: "Le Hotfix Royal", withAlcohol: true },
  { firstName: "Charlotte", lastName: "Vachon", profile: "Designer", deity: "Idun", elixir: "Les Perles du Paradis", withAlcohol: false },
  { firstName: "Hugo", lastName: "Beaudoin", profile: "Manager", deity: "Iris", elixir: "L’Élixir de Renaissance", withAlcohol: true },
  { firstName: "Léa", lastName: "Boisvert", profile: "Codeur", deity: "Mellona", elixir: "Les Cendres du Phénix", withAlcohol: true },
  { firstName: "Samuel", lastName: "Charette", profile: "Designer", deity: "Heimdall", elixir: "Le Hotfix Royal", withAlcohol: true },
  { firstName: "Camille", lastName: "Gosselin", profile: "Manager", deity: "Idun", elixir: "Les Perles du Paradis", withAlcohol: false },
  { firstName: "Vincent", lastName: "Caron", profile: "Codeur", deity: "Iris", elixir: "L’Élixir de Renaissance", withAlcohol: true },
  { firstName: "Élodie", lastName: "Dufresne", profile: "Designer", deity: "Mellona", elixir: "Les Cendres du Phénix", withAlcohol: false },
  { firstName: "Mathieu", lastName: "Thibault", profile: "Manager", deity: "Heimdall", elixir: "Le Hotfix Royal", withAlcohol: true },
];

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
      const isSeed = p.isSeed === true;
      return effectiveMode === "test" ? isSeed : !isSeed;
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

const CONFIG_KEY = "main";

const DEFAULT_CLOSED_MESSAGE =
  "Le portail du paradis s'est refermé.";

/**
 * Config publique du bar — utilisée par l'app visiteur pour savoir
 * si on accepte de nouvelles commandes.
 */
export const getConfig = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db
      .query("barConfig")
      .withIndex("by_key", (q) => q.eq("key", CONFIG_KEY))
      .first();
    return {
      acceptingOrders: doc?.acceptingOrders ?? true,
      closedMessage: doc?.closedMessage ?? DEFAULT_CLOSED_MESSAGE,
    };
  },
});

/**
 * Met à jour l'état "accepte les commandes" et optionnellement le message custom.
 */
export const setAcceptingOrders = mutation({
  args: {
    accepting: v.boolean(),
    closedMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("barConfig")
      .withIndex("by_key", (q) => q.eq("key", CONFIG_KEY))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        acceptingOrders: args.accepting,
        closedMessage: args.closedMessage ?? existing.closedMessage,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("barConfig", {
        key: CONFIG_KEY,
        acceptingOrders: args.accepting,
        closedMessage: args.closedMessage,
        updatedAt: Date.now(),
      });
    }
    return { ok: true };
  },
});

/**
 * Supprime TOUTES les commandes live (vraies inscriptions, pas les seeds).
 * Action destructive — utilisée pour repartir à zéro.
 */
export const clearLiveOrders = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("participants").collect();
    let deleted = 0;
    for (const p of all) {
      if (!p.isSeed) {
        await ctx.db.delete(p._id);
        deleted++;
      }
    }
    return { deleted };
  },
});

/**
 * Mode test: génère les 15 drinks de seed s'ils n'existent pas, sinon
 * les remet à l'état "waiting" avec createdAt = maintenant (staggered).
 */
export const resetTestDrinks = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = (await ctx.db.query("participants").collect()).filter(
      (p) => p.isSeed === true
    );

    const now = Date.now();
    let resetCount = 0;
    let createdCount = 0;

    if (existing.length === 0) {
      // Première fois: créer les 15 drinks
      for (let i = 0; i < SEED_PARTICIPANTS.length; i++) {
        const s = SEED_PARTICIPANTS[i];
        const offset = (SEED_PARTICIPANTS.length - 1 - i) * 30_000; // 30s entre chaque
        await ctx.db.insert("participants", {
          firstName: s.firstName,
          lastName: s.lastName,
          email: `${s.firstName.toLowerCase().replace(/[^a-z]/g, "")}.${s.lastName.toLowerCase().replace(/[^a-z]/g, "")}@seed.paradis`,
          phone: `+1418555${String(i).padStart(4, "0")}`,
          consentParticipation: true,
          consentEmailMarketing: false,
          consentSmsMarketing: false,
          profile: s.profile,
          deity: s.deity,
          elixir: s.elixir,
          withAlcohol: s.withAlcohol,
          queueStatus: "waiting",
          source: "Seed test data",
          createdAt: now - offset,
          isSeed: true,
        });
        createdCount++;
      }
    } else {
      // Reset: tous remis en attente avec createdAt staggered
      // Tri par createdAt actuel pour garder l'ordre relatif
      const sorted = [...existing].sort((a, b) => a.createdAt - b.createdAt);
      for (let i = 0; i < sorted.length; i++) {
        const offset = (sorted.length - 1 - i) * 30_000;
        await ctx.db.patch(sorted[i]._id, {
          queueStatus: "waiting",
          createdAt: now - offset,
          preparingAt: undefined,
          readyAt: undefined,
          servedAt: undefined,
          noShowAt: undefined,
          barmanName: undefined,
          reassignedFromId: undefined,
        });
        resetCount++;
      }
    }

    return { resetCount, createdCount, total: resetCount + createdCount };
  },
});
