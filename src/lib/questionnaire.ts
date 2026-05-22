export type Profile = "Codeur" | "Designer" | "Manager";

export type QuestionType = "profile" | "trait" | "deity" | "alcohol";

export type Option = {
  letter: "A" | "B" | "C" | "D";
  text: string;
  subtitle?: string; // ex: "Grecque" pour les divinités
  description?: string; // sous-texte pour les divinités
  profile?: Profile;
  trait?: string;
  elixir?: string;
  withAlcohol?: boolean;
};

export type Question = {
  id: number;
  intro: string;
  text: string;
  type: QuestionType;
  options: Option[];
};

export const ELIXIRS = {
  renaissance: "L’Élixir de Renaissance",
  perles: "Les Perles du Paradis",
  cendres: "Les Cendres du Phénix",
  hotfix: "Le Hotfix Royal",
} as const;

export const QUESTIONS: Question[] = [
  {
    id: 1,
    intro: "Dans ta vie d’avant à job,",
    text: "ton arme principale c’était…",
    type: "profile",
    options: [
      {
        letter: "A",
        text: "Un clavier mécanique qui clique pas à peu près",
        profile: "Codeur",
      },
      {
        letter: "B",
        text: "Ton iPad pis Figma ouvert sur deux écrans",
        profile: "Designer",
      },
      {
        letter: "C",
        text: "Un Excel à 47 onglets que personne ose toucher",
        profile: "Manager",
      },
    ],
  },
  {
    id: 2,
    intro: "Vendredi, 6h le soir. Un bug pète en prod.",
    text: "Ta réaction ?",
    type: "profile",
    options: [
      {
        letter: "A",
        text: "Tu pognes les logs, le bureau est tranquille, t’es ben content",
        profile: "Codeur",
      },
      {
        letter: "B",
        text: "Tu ressors le Figma original — c’est clairement pas ton design qui a été shippé",
        profile: "Designer",
      },
      {
        letter: "C",
        text: "Tu pitches ça dans Jira, on en r’parle lundi 9h",
        profile: "Manager",
      },
    ],
  },
  {
    id: 3,
    intro: "Quelle phrase",
    text: "tu répétais le plus à job ?",
    type: "trait",
    options: [
      {
        letter: "A",
        text: "« Ça marche sur ma machine »",
        trait: "stubborn",
      },
      {
        letter: "B",
        text: "« As-tu pensé à l’utilisateur, là ? »",
        trait: "empathic",
      },
      {
        letter: "C",
        text: "« Booke-moi 30 minutes dans 3 semaines, on va voir ça ensemble »",
        trait: "procrastinator",
      },
      {
        letter: "D",
        text: "« Petite question rapide… » (pis 14 paragraphes après)",
        trait: "chaotic",
      },
    ],
  },
  {
    id: 4,
    intro: "Le symbole",
    text: "de ton chaos professionnel ?",
    type: "trait",
    options: [
      {
        letter: "A",
        text: "Le café d’hier que tu bois pareil",
        trait: "endurant",
      },
      {
        letter: "B",
        text: "L’Excel que tout le monde évite (pis tu sais c’est toi qui va l’ouvrir)",
        trait: "guardian",
      },
      {
        letter: "C",
        text: "Le meeting qui aurait dû être un courriel",
        trait: "social_survivor",
      },
      {
        letter: "D",
        text: "Le commit nommé « fix » à 11h47 le soir",
        trait: "night_cowboy",
      },
    ],
  },
  {
    id: 5,
    intro: "Sous quelle divinité",
    text: "veux-tu renaître ?",
    type: "deity",
    options: [
      { letter: "A", text: "Iris", elixir: ELIXIRS.renaissance },
      { letter: "B", text: "Idun", elixir: ELIXIRS.perles },
      { letter: "C", text: "Mellona", elixir: ELIXIRS.cendres },
      { letter: "D", text: "Heimdall", elixir: ELIXIRS.hotfix },
    ],
  },
  {
    id: 6,
    intro: "Pour ton élixir,",
    text: "avec ou sans spiritueux ?",
    type: "alcohol",
    options: [
      {
        letter: "A",
        text: "Avec — c’est ma deuxième vie, je la prends pas à jeun",
        withAlcohol: true,
      },
      {
        letter: "B",
        text: "Sans — je veux me souvenir de cette renaissance",
        withAlcohol: false,
      },
    ],
  },
];

export type Answer = {
  questionId: number;
  letter: "A" | "B" | "C" | "D";
};

const TRAIT_TO_PROFILE_HINT: Record<string, Profile | null> = {
  stubborn: "Codeur",
  empathic: "Designer",
  procrastinator: "Manager",
  chaotic: null,
  endurant: null,
  guardian: null,
  social_survivor: "Manager",
  night_cowboy: "Codeur",
};

export const PROFILE_ELIXIRS: Record<Profile, string[]> = {
  Codeur: [ELIXIRS.perles, ELIXIRS.renaissance],
  Designer: [ELIXIRS.cendres, ELIXIRS.renaissance],
  Manager: [ELIXIRS.hotfix, ELIXIRS.renaissance],
};

export function pickDrinkName(profile: Profile): string {
  const list = PROFILE_ELIXIRS[profile];
  return list[Math.floor(Math.random() * list.length)];
}

export type QuestionnaireResult = {
  scores: Record<Profile, number>;
  primary: Profile;
  withAlcohol: boolean;
  traits: string[];
  elixir: string | null;
  deity: string | null;
};

export function computeResult(answers: Answer[]): QuestionnaireResult {
  const scores: Record<Profile, number> = {
    Codeur: 0,
    Designer: 0,
    Manager: 0,
  };
  const traits: string[] = [];
  let withAlcohol = true;
  let elixir: string | null = null;
  let deity: string | null = null;

  for (const answer of answers) {
    const question = QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) continue;
    const option = question.options.find((o) => o.letter === answer.letter);
    if (!option) continue;

    if (option.profile) {
      scores[option.profile] += 1;
    }
    if (option.trait) {
      traits.push(option.trait);
      const hint = TRAIT_TO_PROFILE_HINT[option.trait];
      if (hint) {
        scores[hint] += 0.25;
      }
    }
    if (option.withAlcohol !== undefined) {
      withAlcohol = option.withAlcohol;
    }
    if (option.elixir) {
      elixir = option.elixir;
    }
    if (question.type === "deity" && option.text) {
      deity = option.text;
    }
  }

  const sorted = (Object.entries(scores) as [Profile, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  return {
    scores,
    primary: sorted[0][0],
    withAlcohol,
    traits,
    elixir,
    deity,
  };
}

// Backward compat
export function computeProfile(answers: Answer[]): {
  scores: Record<Profile, number>;
  primary: Profile;
  secondary: Profile | null;
} {
  const result = computeResult(answers);
  const sorted = (Object.entries(result.scores) as [Profile, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  return {
    scores: result.scores,
    primary: sorted[0][0],
    secondary:
      sorted[1][1] > 0 && sorted[1][1] < sorted[0][1] ? sorted[1][0] : null,
  };
}
