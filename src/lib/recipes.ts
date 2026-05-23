import { ELIXIRS } from "./questionnaire";

export type RecipeStep = string;

export type Recipe = {
  elixir: string;
  deity: string;
  image: string;
  rim: string;
  allergens: string[];
  prep?: string;
  signature: string;
  alcoholic: {
    spirits: string;
    ingredients: Array<{ name: string; qty: string }>;
    steps: RecipeStep[];
  };
  mocktail: {
    substitution: string;
    ingredients: Array<{ name: string; qty: string }>;
    steps: RecipeStep[];
  };
};

export const RECIPES: Record<string, Recipe> = {
  [ELIXIRS.renaissance]: {
    elixir: ELIXIRS.renaissance,
    deity: "Iris",
    image: "/images/renaissance.jpeg",
    rim: "Sucre violet",
    allergens: [],
    prep: "Infuser le gin avec des fleurs de Butterfly Pea la veille (donne un gin bleu saphir).",
    signature: "Change de couleur (bleu → violet) au contact du citron",
    alcoholic: {
      spirits: "Gin (infusé Butterfly Pea)",
      ingredients: [
        { name: "Mélange citron + sirop simple + glitter", qty: "1.5 oz" },
        { name: "Gin bleu (infusé)", qty: "2 oz" },
        { name: "Club Soda", qty: "compléter" },
      ],
      steps: [
        "Givrer le verre au sucre violet.",
        "Verser le mélange citron-sirop-glitter sur glace.",
        "Ajouter le gin bleu.",
        "Observer la transformation bleu → violet.",
        "Compléter avec Club Soda.",
      ],
    },
    mocktail: {
      substitution: "Thé de fleurs Butterfly Pea (infusion eau chaude, refroidi)",
      ingredients: [
        { name: "Mélange citron + sirop simple + glitter", qty: "1.5 oz" },
        { name: "Thé Butterfly Pea froid", qty: "2 oz" },
        { name: "Club Soda", qty: "compléter" },
      ],
      steps: [
        "Givrer le verre au sucre violet.",
        "Verser le mélange citron-sirop-glitter sur glace.",
        "Ajouter le thé Butterfly Pea bleu.",
        "Observer la transformation bleu → violet.",
        "Compléter avec Club Soda.",
      ],
    },
  },

  [ELIXIRS.perles]: {
    elixir: ELIXIRS.perles,
    deity: "Idun",
    image: "/images/paradis.jpeg",
    rim: "Sucre standard",
    allergens: [],
    prep: "Cuire les boba pearls (mangue ou passionfruit) selon le paquet, 1h avant le service.",
    signature: "Perles de boba qui éclatent en bouche + glitter or",
    alcoholic: {
      spirits: "Rhum (blanc ou épicé)",
      ingredients: [
        { name: "Boba pearls (mangue/passionfruit)", qty: "1 grosse cuillère" },
        { name: "Mélange ananas + lime + glitter or", qty: "3 oz" },
        { name: "Rhum", qty: "2 oz" },
        { name: "Ginger Beer", qty: "compléter" },
      ],
      steps: [
        "Givrer le verre au sucre standard.",
        "Déposer les boba pearls au fond du verre.",
        "Ajouter de la glace.",
        "Verser le mélange ananas-lime-glitter or.",
        "Ajouter le rhum.",
        "Compléter avec Ginger Beer.",
      ],
    },
    mocktail: {
      substitution: "Ginger Ale (à la place du rhum + ginger beer)",
      ingredients: [
        { name: "Boba pearls (mangue/passionfruit)", qty: "1 grosse cuillère" },
        { name: "Mélange ananas + lime + glitter or", qty: "3 oz" },
        { name: "Ginger Ale", qty: "compléter" },
      ],
      steps: [
        "Givrer le verre au sucre standard.",
        "Déposer les boba pearls au fond du verre.",
        "Ajouter de la glace.",
        "Verser le mélange ananas-lime-glitter or.",
        "Compléter avec Ginger Ale.",
      ],
    },
  },

  [ELIXIRS.cendres]: {
    elixir: ELIXIRS.cendres,
    deity: "Mellona",
    image: "/images/phenix.jpeg",
    rim: "Sucre standard",
    allergens: ["Fruits à coque (amande)"],
    signature: "Glitter argent ou rose en suspension, goût amande dessert",
    alcoholic: {
      spirits: "Amaretto",
      ingredients: [
        {
          name: "Mélange citron + lime + sirop simple + glitter argent/rose",
          qty: "2 oz",
        },
        { name: "Amaretto", qty: "2 oz" },
        { name: "Club Soda", qty: "trait" },
      ],
      steps: [
        "Givrer le verre au sucre standard.",
        "Verser le mélange citron-lime-sirop-glitter sur glace.",
        "Ajouter l'amaretto.",
        "Remuer doucement pour faire tournoyer le glitter.",
        "Ajouter un trait de Club Soda pour la pétillance.",
      ],
    },
    mocktail: {
      substitution: "Sirop d'orgeat (amande) à la place de l'amaretto",
      ingredients: [
        {
          name: "Mélange citron + lime + sirop simple + glitter argent/rose",
          qty: "2 oz",
        },
        { name: "Sirop d'orgeat", qty: "2 oz" },
        { name: "Club Soda", qty: "trait" },
      ],
      steps: [
        "Givrer le verre au sucre standard.",
        "Verser le mélange citron-lime-sirop-glitter sur glace.",
        "Ajouter le sirop d'orgeat.",
        "Remuer doucement.",
        "Ajouter un trait de Club Soda.",
      ],
    },
  },

  [ELIXIRS.hotfix]: {
    elixir: ELIXIRS.hotfix,
    deity: "Heimdall",
    image: "/images/hotfix.jpeg",
    rim: "Sucre violet",
    allergens: ["Fruits à coque (amande)"],
    signature: "Goût rappelant le Dr. Pepper, glitter qui tournoie dans le cola",
    alcoholic: {
      spirits: "Rhum + Amaretto",
      ingredients: [
        { name: "Boba pearls", qty: "quelques-unes" },
        { name: "Mélange lime + sirop simple + glitter", qty: "1 oz" },
        { name: "Rhum", qty: "1 oz" },
        { name: "Amaretto", qty: "1 oz" },
        { name: "Cola", qty: "compléter" },
      ],
      steps: [
        "Givrer le verre au sucre violet.",
        "Déposer quelques boba pearls au fond.",
        "Ajouter de la glace.",
        "Verser le mélange lime-sirop-glitter.",
        "Ajouter le rhum et l'amaretto.",
        "Compléter avec Cola.",
        "Observer le glitter tournoyer dans le cola sombre.",
      ],
    },
    mocktail: {
      substitution: "Extrait + sirop d'amande à la place du rhum + amaretto",
      ingredients: [
        { name: "Boba pearls", qty: "quelques-unes" },
        { name: "Mélange lime + sirop simple + glitter", qty: "1 oz" },
        { name: "Extrait d'amande", qty: "trait" },
        { name: "Sirop d'amande", qty: "1 oz" },
        { name: "Cola", qty: "compléter" },
      ],
      steps: [
        "Givrer le verre au sucre violet.",
        "Déposer quelques boba pearls au fond.",
        "Ajouter de la glace.",
        "Verser le mélange lime-sirop-glitter avec l'extrait et le sirop d'amande.",
        "Compléter avec Cola.",
      ],
    },
  },
};

export function getRecipe(elixirName: string | undefined | null): Recipe | null {
  if (!elixirName) return null;
  return RECIPES[elixirName] ?? null;
}

export type ElixirKey = "renaissance" | "perles" | "cendres" | "hotfix";

export const ELIXIR_NAME_TO_KEY: Record<string, ElixirKey> = {
  [ELIXIRS.renaissance]: "renaissance",
  [ELIXIRS.perles]: "perles",
  [ELIXIRS.cendres]: "cendres",
  [ELIXIRS.hotfix]: "hotfix",
};

export const ELIXIR_KEY_TO_NAME: Record<ElixirKey, string> = {
  renaissance: ELIXIRS.renaissance,
  perles: ELIXIRS.perles,
  cendres: ELIXIRS.cendres,
  hotfix: ELIXIRS.hotfix,
};

/**
 * Variantes de nom de drink selon le profil + l'élixir (donc la divinité).
 * 4 noms par combinaison (3 profils × 4 élixirs = 12 combos × 4 = 48 noms).
 * Inspirés du profil, de la divinité et de ses attributs, des ingrédients,
 * et de la thématique de résurrection/renaissance.
 */
export const DRINK_NAME_VARIANTS: Record<
  ElixirKey,
  Record<"Codeur" | "Designer" | "Manager", string[]>
> = {
  // Iris — arc-en-ciel, transformation, traînée acidulée
  renaissance: {
    Codeur: [
      "Le Refactor d’Iris",
      "La Compilation Arc-en-Ciel",
      "Le Commit Acidulé",
      "L’Iridescence du Code",
    ],
    Designer: [
      "Le Spectre d’Iris",
      "La Palette Renaissance",
      "Le Pigment Acidulé",
      "Le Gradient Céleste",
    ],
    Manager: [
      "Le Sprint d’Iris",
      "La Roadmap Iridescente",
      "Le Pivot Acidulé",
      "La Réincarnation du Pipeline",
    ],
  },
  // Idun — gardienne des pommes d'or, jeunesse éternelle, perles dorées
  perles: {
    Codeur: [
      "Le Cache Doré d’Idun",
      "Les Perles d’API",
      "Le Buffer Éternel",
      "Le Stash Tropical",
    ],
    Designer: [
      "Les Pixels Dorés d’Idun",
      "L’Icône Renaissance",
      "La Maquette Tropicale",
      "Le Drop Shadow Doré",
    ],
    Manager: [
      "Le Sprint Doré d’Idun",
      "Le Backlog Tropical",
      "La Récompense Éternelle",
      "Le KPI des Vergers",
    ],
  },
  // Mellona — abeilles, miel, poussières sucrées
  cendres: {
    Codeur: [
      "Le Hotpatch de Mellona",
      "Le Build Sucré",
      "Les Cendres du Stack",
      "La Rebuild Mielleuse",
    ],
    Designer: [
      "Le Halo Sucré de Mellona",
      "Le Reset Doux",
      "L’Éclat Pollinisé",
      "La Renaissance UX",
    ],
    Manager: [
      "Le Standup Sucré",
      "Le Sprint des Abeilles",
      "Le Post-Mortem Doré",
      "La Vélocité de Mellona",
    ],
  },
  // Heimdall — veilleur d'Asgard, yeux d'or, nuits longues
  hotfix: {
    Codeur: [
      "Le Hotfix de Heimdall",
      "Le Patch des Nuits Longues",
      "Le Deploy Nocturne",
      "La Sentinelle du Stack",
    ],
    Designer: [
      "La Veille de Heimdall",
      "Le Rework Nocturne",
      "Le Pixel des Cieux",
      "L’Aurora Royale",
    ],
    Manager: [
      "Le Standup de 11h47",
      "Le Sprint Nocturne",
      "Le Rétro Royal",
      "L’Escalade de Heimdall",
    ],
  },
};

/**
 * Choisit aléatoirement un nom de drink selon profil + élixir (déduit du nom canonique).
 */
export function pickDrinkNameVariant(
  elixirName: string | undefined | null,
  profile: "Codeur" | "Designer" | "Manager" | undefined | null
): string | null {
  if (!elixirName || !profile) return null;
  const key = ELIXIR_NAME_TO_KEY[elixirName];
  if (!key) return null;
  const variants = DRINK_NAME_VARIANTS[key]?.[profile];
  if (!variants || variants.length === 0) return null;
  return variants[Math.floor(Math.random() * variants.length)];
}

type RecipeOverride = {
  alcoholic: {
    ingredients: { name: string; qty: string }[];
    steps: string[];
  };
  mocktail: {
    ingredients: { name: string; qty: string }[];
    steps: string[];
  };
};

/**
 * Retourne une recette en appliquant les overrides Convex sur les défauts.
 */
export function getRecipeMerged(
  elixirName: string | undefined | null,
  overrides: Partial<Record<ElixirKey, RecipeOverride>> | undefined
): Recipe | null {
  const base = getRecipe(elixirName);
  if (!base) return null;
  const key = ELIXIR_NAME_TO_KEY[elixirName ?? ""];
  if (!key || !overrides || !overrides[key]) return base;
  const o = overrides[key]!;
  return {
    ...base,
    alcoholic: {
      ...base.alcoholic,
      ingredients: o.alcoholic.ingredients,
      steps: o.alcoholic.steps,
    },
    mocktail: {
      ...base.mocktail,
      ingredients: o.mocktail.ingredients,
      steps: o.mocktail.steps,
    },
  };
}
