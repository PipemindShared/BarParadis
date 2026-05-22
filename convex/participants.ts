import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { isTestPhone, normalizePhone } from "./phone";

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

    const normalizedPhone = normalizePhone(args.phone);

    // Téléphones de test : illimités, on saute la vérif d'unicité
    if (!isTestPhone(normalizedPhone)) {
      const existing = await ctx.db
        .query("participants")
        .withIndex("by_phone", (q) => q.eq("phone", normalizedPhone))
        .first();
      if (existing) {
        throw new Error("PHONE_ALREADY_REGISTERED");
      }
    }

    const participantId = await ctx.db.insert("participants", {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: normalizedPhone,
      consentParticipation: args.consentParticipation,
      consentEmailMarketing: args.consentEmailMarketing,
      consentSmsMarketing: args.consentSmsMarketing,
      profile: args.profile,
      deity: args.deity,
      elixir: args.elixir,
      withAlcohol: args.withAlcohol,
      traits: args.traits,
      rawAnswers: args.rawAnswers,
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

/**
 * Position d'un participant dans la file: combien d'élixirs avant le sien.
 * Compte les drinks en "preparing" + prioritaires devant + waiting plus anciens.
 * Exclut les seeds (test data).
 */
export const getQueuePosition = query({
  args: { participantId: v.id("participants") },
  handler: async (ctx, { participantId }) => {
    const me = await ctx.db.get(participantId);
    if (!me) return null;

    const myStatus = me.queueStatus ?? "waiting";
    const isPriorityMe = myStatus === "priority";

    // Si on est plus dans la file (ready, served, no_show), pas de position à calculer
    if (
      myStatus !== "waiting" &&
      myStatus !== "priority" &&
      myStatus !== "preparing"
    ) {
      return {
        status: myStatus,
        ahead: 0,
        me: {
          firstName: me.firstName,
          elixir: me.elixir,
          deity: me.deity,
        },
      };
    }

    const all = await ctx.db.query("participants").collect();
    const real = all.filter((p) => !p.isSeed);

    // Drinks en cours de préparation (devant tout le monde)
    const preparingCount = real.filter(
      (p) => p.queueStatus === "preparing" && p._id !== participantId
    ).length;

    let ahead = preparingCount;

    if (myStatus === "preparing") {
      // Je suis en préparation — donc personne d'autre devant
      // (sauf les autres en préparation qui ont commencé avant moi)
      ahead = real.filter(
        (p) =>
          p.queueStatus === "preparing" &&
          p._id !== participantId &&
          (p.preparingAt ?? p.createdAt) < (me.preparingAt ?? me.createdAt)
      ).length;
    } else {
      // En attente (waiting ou priority)
      // Prioritaires devant moi
      const priorityAhead = real.filter((p) => {
        if (p.queueStatus !== "priority") return false;
        if (isPriorityMe) return p.createdAt < me.createdAt;
        return true; // si je suis waiting, tous les priority sont devant
      }).length;
      ahead += priorityAhead;

      // Si je suis waiting, les autres waiting plus anciens
      if (!isPriorityMe) {
        const waitingAhead = real.filter(
          (p) =>
            p.queueStatus === "waiting" &&
            p._id !== participantId &&
            p.createdAt < me.createdAt
        ).length;
        ahead += waitingAhead;
      }
    }

    return {
      status: myStatus,
      ahead,
      me: {
        firstName: me.firstName,
        elixir: me.elixir,
        deity: me.deity,
      },
    };
  },
});
