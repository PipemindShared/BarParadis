import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const register = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    consentParticipation: v.boolean(),
    consentEmailMarketing: v.boolean(),
    consentSmsMarketing: v.boolean(),
    profile: v.optional(v.string()),
    deity: v.optional(v.string()),
    elixir: v.optional(v.string()),
    withAlcohol: v.optional(v.boolean()),
    traits: v.optional(v.array(v.string())),
    rawAnswers: v.optional(
      v.array(
        v.object({
          questionId: v.number(),
          letter: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    if (!args.consentParticipation) {
      throw new Error(
        "Le consentement de participation est obligatoire pour réclamer ton élixir."
      );
    }

    const participantId = await ctx.db.insert("participants", {
      ...args,
      queueStatus: "waiting",
      source: "Interface 2026 — Zone Pipemind",
      createdAt: Date.now(),
    });

    return { participantId };
  },
});

export const queueCount = query({
  args: {},
  handler: async (ctx) => {
    const waiting = await ctx.db
      .query("participants")
      .withIndex("by_queue_status", (q) => q.eq("queueStatus", "waiting"))
      .collect();
    return waiting.length;
  },
});

export const getById = query({
  args: { id: v.id("participants") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
