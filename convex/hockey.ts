import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { isTestPhone, normalizePhone } from "./phone";
import { scorePrediction } from "./hockeyScore";

const CONFIG_KEY = "main";

const teamCode = v.union(v.literal("mtl"), v.literal("car"));
const periodArray = v.array(v.object({ mtl: v.number(), car: v.number() }));
const scorerArray = v.array(
  v.object({ team: teamCode, player: v.string() })
);
const favTeam = v.union(
  v.literal("canadiens"),
  v.literal("nordiques"),
  v.literal("hurricanes")
);

// ─────────────────────────────────────────────────────────────
// CONFIG / PHASE
// ─────────────────────────────────────────────────────────────

export const getConfig = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db
      .query("hockeyConfig")
      .withIndex("by_key", (q) => q.eq("key", CONFIG_KEY))
      .first();
    return {
      phase: doc?.phase ?? "pregame",
      predictionsOpen: (doc?.phase ?? "pregame") === "pregame",
      actualWinner: doc?.actualWinner,
      actualPeriodScores: doc?.actualPeriodScores,
      actualScorers: doc?.actualScorers,
      actualShots: doc?.actualShots,
    };
  },
});

async function getOrCreateConfigId(
  ctx: MutationCtx
): Promise<Id<"hockeyConfig">> {
  const existing = await ctx.db
    .query("hockeyConfig")
    .withIndex("by_key", (q) => q.eq("key", CONFIG_KEY))
    .first();
  if (existing) return existing._id;
  return await ctx.db.insert("hockeyConfig", {
    key: CONFIG_KEY,
    phase: "pregame" as const,
    updatedAt: Date.now(),
  });
}

export const setPhase = mutation({
  args: {
    phase: v.union(
      v.literal("pregame"),
      v.literal("live"),
      v.literal("final")
    ),
  },
  handler: async (ctx, { phase }) => {
    const id = await getOrCreateConfigId(ctx);
    await ctx.db.patch(id, { phase, updatedAt: Date.now() });
    return { ok: true };
  },
});

// Met à jour les résultats réels (partiels permis — saisis au fil du match)
export const setActuals = mutation({
  args: {
    actualWinner: v.optional(teamCode),
    actualPeriodScores: v.optional(periodArray),
    actualScorers: v.optional(scorerArray),
    actualShots: v.optional(periodArray),
  },
  handler: async (ctx, args) => {
    const id = await getOrCreateConfigId(ctx);
    await ctx.db.patch(id, { ...args, updatedAt: Date.now() });
    return { ok: true };
  },
});

// ─────────────────────────────────────────────────────────────
// INSCRIPTION + PRÉDICTION
// ─────────────────────────────────────────────────────────────

export const register = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    favoriteTeam: favTeam,
    consent: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.consent) {
      throw new Error("Le consentement est obligatoire pour participer.");
    }

    const config = await ctx.db
      .query("hockeyConfig")
      .withIndex("by_key", (q) => q.eq("key", CONFIG_KEY))
      .first();
    if (config && config.phase !== "pregame") {
      throw new Error("PREDICTIONS_CLOSED");
    }

    const normalizedPhone = normalizePhone(args.phone);

    if (!isTestPhone(normalizedPhone)) {
      const existing = await ctx.db
        .query("hockeyEntries")
        .withIndex("by_phone", (q) => q.eq("phone", normalizedPhone))
        .first();
      if (existing) {
        // Déjà inscrit: on renvoie l'entrée existante (reprend sa prédiction)
        return { entryId: existing._id, existed: true };
      }
    }

    const entryId = await ctx.db.insert("hockeyEntries", {
      firstName: args.firstName,
      lastName: args.lastName,
      phone: normalizedPhone,
      favoriteTeam: args.favoriteTeam,
      consent: args.consent,
      createdAt: Date.now(),
    });

    return { entryId, existed: false };
  },
});

export const getEntry = query({
  args: { entryId: v.id("hockeyEntries") },
  handler: async (ctx, { entryId }) => {
    return await ctx.db.get(entryId);
  },
});

export const savePrediction = mutation({
  args: {
    entryId: v.id("hockeyEntries"),
    winner: teamCode,
    periodScores: periodArray,
    scorers: scorerArray,
    shots: periodArray,
  },
  handler: async (ctx, { entryId, winner, periodScores, scorers, shots }) => {
    const entry = await ctx.db.get(entryId);
    if (!entry) throw new Error("Inscription introuvable.");

    const config = await ctx.db
      .query("hockeyConfig")
      .withIndex("by_key", (q) => q.eq("key", CONFIG_KEY))
      .first();
    if (config && config.phase !== "pregame") {
      throw new Error("PREDICTIONS_CLOSED");
    }

    await ctx.db.patch(entryId, {
      winner,
      periodScores,
      scorers,
      shots,
      predictedAt: Date.now(),
    });
    return { ok: true };
  },
});

// ─────────────────────────────────────────────────────────────
// LEADERBOARD (scoring live)
// ─────────────────────────────────────────────────────────────

export const leaderboard = query({
  args: { includeSeeds: v.optional(v.boolean()) },
  handler: async (ctx, { includeSeeds }) => {
    const config = await ctx.db
      .query("hockeyConfig")
      .withIndex("by_key", (q) => q.eq("key", CONFIG_KEY))
      .first();

    // Les scores reflètent les résultats réels dès qu'ils sont saisis.
    // (Tant que l'admin n'a rien saisi, aucun "actual" n'existe → tout le
    // monde à 0. Voir le garde-fou côté admin qui n'enregistre qu'après
    // une vraie modification.)
    const actual = {
      actualWinner: config?.actualWinner,
      actualPeriodScores: config?.actualPeriodScores,
      actualScorers: config?.actualScorers,
      actualShots: config?.actualShots,
    };

    const raw = await ctx.db.query("hockeyEntries").collect();
    const entries = raw.filter((e) =>
      includeSeeds ? true : e.isSeed !== true
    );

    const scored = entries.map((e) => {
      const breakdown = scorePrediction(
        {
          winner: e.winner,
          periodScores: e.periodScores,
          scorers: e.scorers,
          shots: e.shots,
        },
        actual
      );

      // Résumé bref de la prédiction (pour l'affichage sous le nom)
      const predFinal = (e.periodScores ?? []).reduce(
        (a, p) => ({ mtl: a.mtl + (p.mtl || 0), car: a.car + (p.car || 0) }),
        { mtl: 0, car: 0 }
      );
      const prediction = e.predictedAt
        ? {
            winner: e.winner ?? null,
            finalMtl: predFinal.mtl,
            finalCar: predFinal.car,
            scorers: (e.scorers ?? []).map((s) => s.player),
          }
        : null;

      return {
        entryId: e._id,
        firstName: e.firstName,
        lastName: e.lastName,
        favoriteTeam: e.favoriteTeam,
        hasPrediction: !!e.predictedAt,
        prediction,
        score: breakdown.total,
        breakdown,
        predictedAt: e.predictedAt ?? e.createdAt,
      };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.predictedAt - b.predictedAt; // départage: plus tôt = mieux classé
    });

    return {
      phase: config?.phase ?? "pregame",
      actual,
      totalEntries: scored.length,
      withPrediction: scored.filter((s) => s.hasPrediction).length,
      rows: scored.map((s, i) => ({ rank: i + 1, ...s })),
    };
  },
});

// Stats simples pour l'admin
export const adminStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("hockeyEntries").collect();
    const real = all.filter((e) => e.isSeed !== true);
    return {
      total: real.length,
      withPrediction: real.filter((e) => !!e.predictedAt).length,
    };
  },
});

// Supprime toutes les inscriptions réelles (pas les seeds). Destructif.
export const clearEntries = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("hockeyEntries").collect();
    let deleted = 0;
    for (const e of all) {
      if (e.isSeed !== true) {
        await ctx.db.delete(e._id);
        deleted++;
      }
    }
    return { deleted };
  },
});

// Crée en lot des participants de test (générés côté admin avec prédictions).
export const bulkCreateTestEntries = mutation({
  args: {
    entries: v.array(
      v.object({
        firstName: v.string(),
        lastName: v.string(),
        phone: v.string(),
        favoriteTeam: favTeam,
        winner: teamCode,
        periodScores: periodArray,
        scorers: scorerArray,
        shots: periodArray,
      })
    ),
  },
  handler: async (ctx, { entries }) => {
    const now = Date.now();
    let created = 0;
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      await ctx.db.insert("hockeyEntries", {
        firstName: e.firstName,
        lastName: e.lastName,
        phone: e.phone,
        favoriteTeam: e.favoriteTeam,
        consent: true,
        winner: e.winner,
        periodScores: e.periodScores,
        scorers: e.scorers,
        shots: e.shots,
        predictedAt: now - i * 1000,
        createdAt: now - i * 1000,
        isSeed: false,
      });
      created++;
    }
    return { created };
  },
});

// Supprime une seule inscription (correction d'erreur depuis l'admin).
// Idempotent: ne lève pas d'erreur si l'entrée a déjà été supprimée.
export const deleteEntry = mutation({
  args: { entryId: v.id("hockeyEntries") },
  handler: async (ctx, { entryId }) => {
    const existing = await ctx.db.get(entryId);
    if (existing) await ctx.db.delete(entryId);
    return { ok: true, deleted: !!existing };
  },
});

// Réinitialise le match: efface les résultats réels et remet en pré-match.
// (Ne touche pas aux inscriptions — utiliser clearEntries pour ça.)
export const resetMatch = mutation({
  args: {},
  handler: async (ctx) => {
    const cfg = await ctx.db
      .query("hockeyConfig")
      .withIndex("by_key", (q) => q.eq("key", CONFIG_KEY))
      .first();
    if (cfg) await ctx.db.delete(cfg._id);
    return { ok: true };
  },
});
