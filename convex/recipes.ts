import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const elixirKey = v.union(
  v.literal("renaissance"),
  v.literal("perles"),
  v.literal("cendres"),
  v.literal("hotfix")
);

export type ElixirKey = "renaissance" | "perles" | "cendres" | "hotfix";

const recipeBody = v.object({
  alcoholic: v.object({
    ingredients: v.array(v.object({ name: v.string(), qty: v.string() })),
    steps: v.array(v.string()),
  }),
  mocktail: v.object({
    ingredients: v.array(v.object({ name: v.string(), qty: v.string() })),
    steps: v.array(v.string()),
  }),
});

/**
 * Liste publique des overrides de recettes. Les champs absents conservent
 * les valeurs par défaut du code (src/lib/recipes.ts).
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("recipes").collect();
    const byKey: Partial<
      Record<
        ElixirKey,
        {
          alcoholic: {
            ingredients: { name: string; qty: string }[];
            steps: string[];
          };
          mocktail: {
            ingredients: { name: string; qty: string }[];
            steps: string[];
          };
          updatedAt: number;
          updatedBy?: string;
        }
      >
    > = {};
    for (const doc of docs) {
      byKey[doc.elixir] = {
        alcoholic: doc.alcoholic,
        mocktail: doc.mocktail,
        updatedAt: doc.updatedAt,
        updatedBy: doc.updatedBy,
      };
    }
    return byKey;
  },
});

/**
 * Crée ou met à jour la recette d'un élixir.
 */
export const upsert = mutation({
  args: {
    elixir: elixirKey,
    recipe: recipeBody,
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, { elixir, recipe, updatedBy }) => {
    const existing = await ctx.db
      .query("recipes")
      .withIndex("by_elixir", (q) => q.eq("elixir", elixir))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...recipe,
        updatedAt: Date.now(),
        updatedBy,
      });
    } else {
      await ctx.db.insert("recipes", {
        elixir,
        ...recipe,
        updatedAt: Date.now(),
        updatedBy,
      });
    }
    return { ok: true };
  },
});

/**
 * Supprime l'override d'une recette (retour aux valeurs par défaut du code).
 */
export const reset = mutation({
  args: { elixir: elixirKey },
  handler: async (ctx, { elixir }) => {
    const existing = await ctx.db
      .query("recipes")
      .withIndex("by_elixir", (q) => q.eq("elixir", elixir))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return { ok: true };
  },
});
