export type Profile = "Codeur" | "Designer" | "Manager";

export type Module = {
  title: string;
  description: string;
};

export type Formation = {
  profile: Profile;
  title: string; // titre céleste / signature
  subtitle: string; // promesse principale
  intro: string; // 1-2 phrases de contexte
  modules: Module[];
  accentColor: string; // teinte du profil (matching bar profile chip)
  emoji: string; // glyphe représentatif
};

export const FORMATIONS: Formation[] = [
  {
    profile: "Codeur",
    accentColor: "#10b981",
    emoji: "</>",
    title: "Le Code Réincarné",
    subtitle:
      "Tape moins. Spécifie mieux. Laisse la machine porter le poids du clavier.",
    intro:
      "L'IA ne remplace pas ton code — elle change la façon de l'écrire. Tu passes d'artisan de boucles à architecte d'intentions. Cette formation t'apprend à diriger des agents IA comme tu dirigeais autrefois ton terminal.",
    modules: [
      {
        title: "Spec-driven development",
        description:
          "Maîtrise l'art de rédiger des spécifications que l'IA peut suivre fidèlement. Apprends à transformer une intention floue en cahier des charges actionnable — la nouvelle compétence centrale du dev.",
      },
      {
        title: "Gestion du contexte",
        description:
          "Apprends à orchestrer la mémoire de l'IA : quoi inclure, quoi exclure, quand recompacter, quand recommencer. La gestion du contexte devient la nouvelle gestion mémoire.",
      },
      {
        title: "Nouveaux standards (MCP, A2A, etc.)",
        description:
          "Comprends les protocoles émergents qui connectent les agents entre eux. MCP (Model Context Protocol), A2A (Agent-to-Agent), les ponts entre LLMs et outils — l'infrastructure invisible de la nouvelle stack.",
      },
    ],
  },
  {
    profile: "Designer",
    accentColor: "#ec4899",
    emoji: "✿",
    title: "Le Pinceau Augmenté",
    subtitle:
      "Tes idées prennent forme en quelques secondes. Le pixel devient compagnon.",
    intro:
      "La frontière entre UI, UX et front-end s'efface. Le designer du paradis dessine, prototype et livre du code en même temps. Cette formation te donne les outils pour incarner cette nouvelle pratique hybride.",
    modules: [
      {
        title: "Outils pour designs impressionnants",
        description:
          "Apprivoise les nouveaux outils génératifs (Midjourney, Figma AI, v0, Cursor) pour amplifier ta vitesse créative. De l'idée au mockup polished en minutes au lieu d'heures.",
      },
      {
        title: "Vibe Designer : fusion UI/UX/Front-end",
        description:
          "Décloisonne ta pratique. Conçois en Figma, prototype en code, itère en live. Le designer moderne livre des composants fonctionnels, pas juste des maquettes — sans devenir développeur pour autant.",
      },
    ],
  },
  {
    profile: "Manager",
    accentColor: "#f59e0b",
    emoji: "▤",
    title: "Le Chef d'Orchestre IA",
    subtitle:
      "Tu ne gères plus seulement des humains. Tu chorégraphies des équipes hybrides.",
    intro:
      "Le manager du paradis pilote des équipes humain+IA. Il bâtit des cycles où la machine produit et l'humain juge. Cette formation t'arme pour cette responsabilité nouvelle, à la frontière du leadership et de la gouvernance technique.",
    modules: [
      {
        title: "Gestion d'équipe en mode vibe coding",
        description:
          "Adapte ton style de leadership à l'ère IA. Comment encadrer une équipe qui produit avec des agents ? Quels rituels gardent leur sens, quels en perdent ? Comment évaluer la performance dans ce nouveau contexte ?",
      },
      {
        title: "Planification & livraison hybride",
        description:
          "Orchestre des sprints qui mélangent code humain et code généré. Estime, priorise et révise dans un monde où la vitesse de production change toutes les semaines.",
      },
      {
        title: "Gouvernance IA",
        description:
          "Mets en place les garde-fous éthiques et techniques : politiques d'utilisation, contrôles qualité, gestion des risques, conformité. Le manager devient le gardien de l'usage responsable.",
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
