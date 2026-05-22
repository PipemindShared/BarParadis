import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const elixirKey = v.union(
  v.literal("renaissance"),
  v.literal("perles"),
  v.literal("cendres"),
  v.literal("hotfix")
);

const DEFAULT_REASON = "Ce dieu est trop occupé.";

/**
 * Liste publique: utilisée par l'app visiteur pour afficher quelles
 * divinités sont disponibles. Si un élixir n'a pas de doc, considéré dispo.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("elixirInventory").collect();
    const byKey: Record<string, { available: boolean; reason?: string }> = {
      renaissance: { available: true },
      perles: { available: true },
      cendres: { available: true },
      hotfix: { available: true },
    };
    for (const doc of docs) {
      byKey[doc.elixir] = {
        available: doc.available,
        reason: doc.reason,
      };
    }
    return byKey as {
      renaissance: { available: boolean; reason?: string };
      perles: { available: boolean; reason?: string };
      cendres: { available: boolean; reason?: string };
      hotfix: { available: boolean; reason?: string };
    };
  },
});

/**
 * Toggle la disponibilité d'un élixir. Utilisé par l'app barman (mode avancé).
 */
export const setAvailability = mutation({
  args: {
    elixir: elixirKey,
    available: v.boolean(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("elixirInventory")
      .withIndex("by_elixir", (q) => q.eq("elixir", args.elixir))
      .first();

    const reason =
      args.available
        ? undefined
        : args.reason?.trim() || DEFAULT_REASON;

    if (existing) {
      await ctx.db.patch(existing._id, {
        available: args.available,
        reason,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("elixirInventory", {
        elixir: args.elixir,
        available: args.available,
        reason,
        updatedAt: Date.now(),
      });
    }
    return { ok: true };
  },
});
