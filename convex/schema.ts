import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  participants: defineTable({
    // Identité
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),

    // Consentements (obligatoire + optionnels)
    consentParticipation: v.boolean(),
    consentEmailMarketing: v.boolean(),
    consentSmsMarketing: v.boolean(),

    // Données du questionnaire
    profile: v.optional(v.string()), // "Codeur" | "Designer" | "Manager"
    deity: v.optional(v.string()), // "Iris" | "Idun" | "Mellona" | "Heimdall"
    elixir: v.optional(v.string()), // "L'Élixir de Renaissance" | etc.
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

    // État dans la file d'attente (6 statuts du flow barman)
    queueStatus: v.optional(
      v.union(
        v.literal("waiting"), // en attente (file normale)
        v.literal("priority"), // prioritaire (marqué manuellement)
        v.literal("preparing"), // en cours de fabrication
        v.literal("ready"), // prêt à distribuer
        v.literal("served"), // distribué
        v.literal("no_show"), // no show
        // legacy (anciens statuts, à ne plus utiliser)
        v.literal("called"),
        v.literal("present"),
        v.literal("expired"),
        v.literal("requeued"),
        v.literal("cancelled")
      )
    ),
    queuePosition: v.optional(v.number()),
    preparingAt: v.optional(v.number()),
    readyAt: v.optional(v.number()),
    servedAt: v.optional(v.number()),
    noShowAt: v.optional(v.number()),
    // Barman qui prépare ce drink (nom libre, multi-tablette)
    barmanName: v.optional(v.string()),
    // Réassignement
    reassignedFromId: v.optional(v.id("participants")),

    // Métadonnées
    source: v.string(), // "Interface 2026 — Zone Pipemind"
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_queue_status", ["queueStatus"])
    .index("by_created", ["createdAt"]),
});
