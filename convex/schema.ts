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
    elixir: v.optional(v.string()), // "L'Élixir de Renaissance" | etc. (nom canonique)
    drinkName: v.optional(v.string()), // Nom personnalisé selon profil + divinité
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
    // Données générées (seed) pour le mode test
    isSeed: v.optional(v.boolean()),

    // Métadonnées
    source: v.string(), // "Interface 2026 — Zone Pipemind"
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_queue_status", ["queueStatus"])
    .index("by_created", ["createdAt"]),

  // Disponibilité des élixirs (1 ligne par élixir)
  elixirInventory: defineTable({
    elixir: v.union(
      v.literal("renaissance"),
      v.literal("perles"),
      v.literal("cendres"),
      v.literal("hotfix")
    ),
    available: v.boolean(),
    reason: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_elixir", ["elixir"]),

  // Config singleton du bar (1 seule ligne avec key="main")
  barConfig: defineTable({
    key: v.string(),
    acceptingOrders: v.boolean(),
    closedMessage: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // Recettes éditables (override les défauts du code)
  recipes: defineTable({
    elixir: v.union(
      v.literal("renaissance"),
      v.literal("perles"),
      v.literal("cendres"),
      v.literal("hotfix")
    ),
    alcoholic: v.object({
      ingredients: v.array(
        v.object({ name: v.string(), qty: v.string() })
      ),
      steps: v.array(v.string()),
    }),
    mocktail: v.object({
      ingredients: v.array(
        v.object({ name: v.string(), qty: v.string() })
      ),
      steps: v.array(v.string()),
    }),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  }).index("by_elixir", ["elixir"]),

  // ─────────────────────────────────────────────────────────────
  // HOCKEY — app de prédiction de match (indépendante du Paradis)
  // Match: Canadiens (mtl) vs Hurricanes (car)
  // ─────────────────────────────────────────────────────────────

  // Une ligne par participant: identité + sa prédiction
  hockeyEntries: defineTable({
    // Identité
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    // Équipe de coeur (badge cosmétique sur le leaderboard) — 3 choix
    favoriteTeam: v.union(
      v.literal("canadiens"),
      v.literal("nordiques"),
      v.literal("hurricanes")
    ),
    consent: v.boolean(),

    // Prédiction (optionnelle jusqu'à soumission)
    winner: v.optional(v.union(v.literal("mtl"), v.literal("car"))),
    // Score par période: tableau de 3 objets { mtl, car }
    periodScores: v.optional(
      v.array(v.object({ mtl: v.number(), car: v.number() }))
    ),
    // Buteurs prédits: un par but prévu
    scorers: v.optional(
      v.array(
        v.object({
          team: v.union(v.literal("mtl"), v.literal("car")),
          player: v.string(),
        })
      )
    ),
    // Tirs au but par période par équipe: tableau de 3 objets { mtl, car }
    shots: v.optional(
      v.array(v.object({ mtl: v.number(), car: v.number() }))
    ),
    predictedAt: v.optional(v.number()),

    createdAt: v.number(),
    isSeed: v.optional(v.boolean()),
  })
    .index("by_phone", ["phone"])
    .index("by_created", ["createdAt"]),

  // Config singleton du match (key="main"): phase + résultats réels
  hockeyConfig: defineTable({
    key: v.string(),
    // pregame = prédictions ouvertes; live = fermées; final = terminé
    phase: v.union(
      v.literal("pregame"),
      v.literal("live"),
      v.literal("final")
    ),
    // Résultats réels saisis par l'admin (partiels permis, remplis au fil du match)
    actualWinner: v.optional(v.union(v.literal("mtl"), v.literal("car"))),
    actualPeriodScores: v.optional(
      v.array(v.object({ mtl: v.number(), car: v.number() }))
    ),
    actualScorers: v.optional(
      v.array(
        v.object({
          team: v.union(v.literal("mtl"), v.literal("car")),
          player: v.string(),
        })
      )
    ),
    actualShots: v.optional(
      v.array(v.object({ mtl: v.number(), car: v.number() }))
    ),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
