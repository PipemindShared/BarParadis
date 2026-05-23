export type Profile = "Codeur" | "Designer" | "Manager";

export type Module = {
  title: string;
  description: string;
};

export type Formation = {
  profile: Profile;
  category: string; // tag catégorie (DÉVELOPPEMENT, DESIGN, MANAGEMENT)
  title: string;
  subtitle: string;
  modules: Module[];
  accentColor: string;
  duration: string; // ex: "12h sur 2 jours"
  level: string; // ex: "Intermédiaire"
};

export const FORMATIONS: Formation[] = [
  {
    profile: "Codeur",
    category: "Développement",
    accentColor: "#10b981",
    duration: "16h sur 2 jours",
    level: "Intermédiaire",
    title: "Vibe Coding & Développement IA",
    subtitle:
      "Maîtrise les nouvelles pratiques du développement assisté par IA — du prompt à la production.",
    modules: [
      {
        title: "Spec-Driven Development",
        description: "Rédiger des spécifications actionnables pour les LLMs.",
      },
      {
        title: "Gestion du contexte",
        description: "Orchestrer la mémoire des agents IA en environnement réel.",
      },
      {
        title: "Standards d'agents : MCP & A2A",
        description: "Protocoles émergents de communication entre agents et outils.",
      },
    ],
  },
  {
    profile: "Designer",
    category: "Design",
    accentColor: "#ec4899",
    duration: "12h sur 2 jours",
    level: "Tous niveaux",
    title: "Design & IA",
    subtitle:
      "Du concept au prototype fonctionnel, en intégrant l'IA dans tes flux quotidiens.",
    modules: [
      {
        title: "Outils génératifs en pratique",
        description: "Workflows Figma AI, v0, Midjourney pour accélérer la création.",
      },
      {
        title: "Vibe Designer : fusion UI/UX/Front-end",
        description: "Concevoir et livrer du code fonctionnel sans rupture.",
      },
    ],
  },
  {
    profile: "Manager",
    category: "Management",
    accentColor: "#f59e0b",
    duration: "14h sur 2 jours",
    level: "Confirmé",
    title: "Management & Gouvernance IA",
    subtitle:
      "Piloter des équipes hybrides humain+IA et encadrer l'usage responsable des outils.",
    modules: [
      {
        title: "Gestion d'équipes en environnement IA",
        description: "Adapter le leadership aux nouvelles dynamiques de production.",
      },
      {
        title: "Planification de cycles hybrides",
        description: "Estimer, prioriser et livrer dans un contexte humain+IA.",
      },
      {
        title: "Gouvernance et risques",
        description: "Cadres éthiques, conformité et garde-fous techniques.",
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
