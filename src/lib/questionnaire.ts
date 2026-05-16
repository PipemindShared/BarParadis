export type Profile = "Codeur" | "Designer" | "Visionnaire" | "Gestionnaire";

export type Option = {
  letter: "A" | "B" | "C" | "D";
  text: string;
  profiles: Profile[];
};

export type Question = {
  id: number;
  intro: string;
  text: string;
  options: Option[];
};

export const QUESTIONS: Question[] = [
  {
    id: 1,
    intro: "Comment es-tu arrivé",
    text: "dans le nuage éternel du travail ?",
    options: [
      {
        letter: "A",
        text: "J’ai ouvert un fichier Excel avec 47 onglets, 12 macros et une formule que personne n’ose toucher.",
        profiles: ["Gestionnaire", "Codeur"],
      },
      {
        letter: "B",
        text: "J’ai dit “on devrait refaire l’interface” dans une réunion de 14 personnes.",
        profiles: ["Designer"],
      },
      {
        letter: "C",
        text: "J’ai pitché une idée tellement en avance que même mon PowerPoint a quitté la salle.",
        profiles: ["Visionnaire"],
      },
      {
        letter: "D",
        text: "J’ai tenté d’automatiser une tâche de 5 minutes et j’ai créé une architecture distribuée.",
        profiles: ["Codeur"],
      },
    ],
  },
  {
    id: 2,
    intro: "Devant le portail céleste,",
    text: "ton dernier grand accomplissement ?",
    options: [
      {
        letter: "A",
        text: "J’ai livré un projet malgré 18 changements de scope.",
        profiles: ["Gestionnaire"],
      },
      {
        letter: "B",
        text: "J’ai transformé une idée vague en prototype fonctionnel.",
        profiles: ["Visionnaire", "Codeur"],
      },
      {
        letter: "C",
        text: "J’ai rendu une interface compréhensible pour des humains normaux.",
        profiles: ["Designer"],
      },
      {
        letter: "D",
        text: "J’ai connecté trois API qui ne voulaient clairement pas se parler.",
        profiles: ["Codeur"],
      },
    ],
  },
  {
    id: 3,
    intro: "Ton guide céleste IA",
    text: "t’offre un superpouvoir.",
    options: [
      {
        letter: "A",
        text: "Générer une application complète à partir d’une bonne spécification.",
        profiles: ["Codeur"],
      },
      {
        letter: "B",
        text: "Transformer une idée confuse en parcours utilisateur clair.",
        profiles: ["Designer"],
      },
      {
        letter: "C",
        text: "Identifier les prochaines grandes opportunités avant tout le monde.",
        profiles: ["Visionnaire"],
      },
      {
        letter: "D",
        text: "Transformer une équipe débordée en machine bien organisée.",
        profiles: ["Gestionnaire"],
      },
    ],
  },
  {
    id: 4,
    intro: "Quelle erreur fatale",
    text: "t’a envoyé dans les nuages ?",
    options: [
      {
        letter: "A",
        text: "J’ai dit “on va juste faire un petit MVP” et 8 mois plus tard, il y avait un ERP.",
        profiles: ["Visionnaire", "Gestionnaire"],
      },
      {
        letter: "B",
        text: "J’ai accepté un design “temporaire” qui est resté en production 4 ans.",
        profiles: ["Designer"],
      },
      {
        letter: "C",
        text: "J’ai codé sans documentation, mais avec beaucoup de confiance.",
        profiles: ["Codeur"],
      },
      {
        letter: "D",
        text: "J’ai créé un comité pour décider s’il fallait créer un comité.",
        profiles: ["Gestionnaire"],
      },
    ],
  },
  {
    id: 5,
    intro: "Pour préparer ton élixir,",
    text: "choisis un ingrédient mystique.",
    options: [
      {
        letter: "A",
        text: "Une goutte de café tombée dans un terminal.",
        profiles: ["Codeur"],
      },
      {
        letter: "B",
        text: "Une plume de nuage parfaitement alignée sur une grille de design.",
        profiles: ["Designer"],
      },
      {
        letter: "C",
        text: "Une étincelle trouvée dans une roadmap 2030.",
        profiles: ["Visionnaire"],
      },
      {
        letter: "D",
        text: "Une poussière de Post-it sacré, mais non confessionnel.",
        profiles: ["Gestionnaire"],
      },
    ],
  },
  {
    id: 6,
    intro: "Dans ta prochaine vie pro,",
    text: "tu veux surtout…",
    options: [
      {
        letter: "A",
        text: "Créer des applications plus vite avec l’IA.",
        profiles: ["Codeur"],
      },
      {
        letter: "B",
        text: "Concevoir des expériences plus claires et plus belles.",
        profiles: ["Designer"],
      },
      {
        letter: "C",
        text: "Transformer des idées ambitieuses en prototypes convaincants.",
        profiles: ["Visionnaire"],
      },
      {
        letter: "D",
        text: "Aider mon équipe à livrer mieux, plus vite et avec moins de chaos.",
        profiles: ["Gestionnaire"],
      },
    ],
  },
  {
    id: 7,
    intro: "Ton outil IA idéal",
    text: "serait capable de…",
    options: [
      {
        letter: "A",
        text: "Générer du code propre à partir d’une spécification claire.",
        profiles: ["Codeur"],
      },
      {
        letter: "B",
        text: "Proposer plusieurs interfaces avant même que quelqu’un dise “on peut faire plus moderne ?”",
        profiles: ["Designer"],
      },
      {
        letter: "C",
        text: "Transformer une idée floue en démo qui donne envie d’investir.",
        profiles: ["Visionnaire"],
      },
      {
        letter: "D",
        text: "Résumer les besoins, prioriser les tâches et réduire les réunions inutiles.",
        profiles: ["Gestionnaire"],
      },
    ],
  },
];

export type Answer = {
  questionId: number;
  letter: "A" | "B" | "C" | "D";
};

export function computeProfile(answers: Answer[]): {
  scores: Record<Profile, number>;
  primary: Profile;
  secondary: Profile | null;
} {
  const scores: Record<Profile, number> = {
    Codeur: 0,
    Designer: 0,
    Visionnaire: 0,
    Gestionnaire: 0,
  };

  for (const answer of answers) {
    const question = QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) continue;
    const option = question.options.find((o) => o.letter === answer.letter);
    if (!option) continue;
    for (const profile of option.profiles) {
      scores[profile] += 1;
    }
  }

  const sorted = (Object.entries(scores) as [Profile, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  return {
    scores,
    primary: sorted[0][0],
    secondary: sorted[1][1] > 0 && sorted[1][1] < sorted[0][1] ? sorted[1][0] : null,
  };
}
