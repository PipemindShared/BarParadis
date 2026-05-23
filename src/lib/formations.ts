export type Profile = "Codeur" | "Designer" | "Manager";

export type Module = {
  title: string;
  description: string;
};

export type Formation = {
  profile: Profile;
  title: string;
  subtitle: string;
  modules: Module[];
  accentColor: string;
  emoji: string;
};

export const FORMATIONS: Formation[] = [
  {
    profile: "Codeur",
    accentColor: "#10b981",
    emoji: "</>",
    title: "Le Code Réincarné",
    subtitle: "Tape moins. Spécifie mieux. L'IA porte le clavier.",
    modules: [
      {
        title: "Spec-driven development",
        description:
          "L'art d'écrire des specs que l'IA peut suivre fidèlement.",
      },
      {
        title: "Gestion du contexte",
        description:
          "Orchestrer la mémoire de l'IA — la nouvelle gestion mémoire.",
      },
      {
        title: "Standards émergents (MCP, A2A)",
        description:
          "Les protocoles qui connectent agents et outils entre eux.",
      },
    ],
  },
  {
    profile: "Designer",
    accentColor: "#ec4899",
    emoji: "✿",
    title: "Le Pinceau Augmenté",
    subtitle:
      "La frontière UI/UX/Front-end s'efface. Tu livres en design et en code.",
    modules: [
      {
        title: "Outils génératifs",
        description:
          "Maîtriser Midjourney, Figma AI, v0 pour amplifier ta vitesse.",
      },
      {
        title: "Vibe Designer",
        description: "Fusionner UI, UX et front-end en une seule pratique.",
      },
    ],
  },
  {
    profile: "Manager",
    accentColor: "#f59e0b",
    emoji: "▤",
    title: "Le Chef d'Orchestre IA",
    subtitle: "Tu chorégraphies des équipes hybrides humain+IA.",
    modules: [
      {
        title: "Gestion d'équipe en vibe coding",
        description: "Encadrer une équipe qui produit avec des agents IA.",
      },
      {
        title: "Planification hybride",
        description: "Orchestrer des cycles humain+IA, estimer autrement.",
      },
      {
        title: "Gouvernance IA",
        description: "Garde-fous éthiques et techniques de l'usage IA.",
      },
    ],
  },
];

export function getFormationByProfile(
  profile: Profile | string | undefined | null
): Formation | null {
  if (!profile) return null;
  return FORMATIONS.find((f) => f.profile === profile) ?? null;
}
