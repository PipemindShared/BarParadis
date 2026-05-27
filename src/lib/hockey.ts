// ─────────────────────────────────────────────────────────────
// HOCKEY — données partagées (client + admin)
// Match: Canadiens de Montréal (mtl) vs Hurricanes de la Caroline (car)
// Équipe de coeur à l'inscription: 3 choix (incl. Nordiques, cosmétique)
// ─────────────────────────────────────────────────────────────

export type TeamCode = "mtl" | "car";
export type FavTeam = "canadiens" | "nordiques" | "hurricanes";

export type TeamMeta = {
  code: TeamCode;
  name: string;
  short: string;
  abbr: string;
  logo: string;
  color: string;
};

// Les deux équipes du match réel
export const TEAMS: Record<TeamCode, TeamMeta> = {
  mtl: {
    code: "mtl",
    name: "Canadiens de Montréal",
    short: "Canadiens",
    abbr: "MTL",
    logo: "/images/Canadiens.png",
    color: "#AF1E2D",
  },
  car: {
    code: "car",
    name: "Hurricanes de la Caroline",
    short: "Hurricanes",
    abbr: "CAR",
    logo: "/images/Hurricane.png",
    color: "#CC0000",
  },
};

export const TEAM_CODES: TeamCode[] = ["mtl", "car"];

// Équipe de coeur (badge sur le leaderboard) — inclut les Nordiques
export type FavTeamMeta = {
  code: FavTeam;
  name: string;
  short: string;
  logo: string;
  color: string;
};

export const FAV_TEAMS: FavTeamMeta[] = [
  {
    code: "canadiens",
    name: "Canadiens de Montréal",
    short: "Canadiens",
    logo: "/images/Canadiens.png",
    color: "#AF1E2D",
  },
  {
    code: "nordiques",
    name: "Nordiques de Québec",
    short: "Nordiques",
    logo: "/images/Nordiques.png",
    color: "#0072CE",
  },
  {
    code: "hurricanes",
    name: "Hurricanes de la Caroline",
    short: "Hurricanes",
    logo: "/images/Hurricane.png",
    color: "#CC0000",
  },
];

export function favTeamMeta(code: FavTeam): FavTeamMeta {
  return FAV_TEAMS.find((t) => t.code === code) ?? FAV_TEAMS[0];
}

// Patineurs (attaquants + défenseurs) — pour le choix de scoreur.
// Les gardiens sont listés à part (ils marquent rarement).
export const ROSTERS: Record<TeamCode, string[]> = {
  mtl: [
    // Attaquants
    "Nick Suzuki",
    "Cole Caufield",
    "Juraj Slafkovský",
    "Kirby Dach",
    "Phillip Danault",
    "Alex Newhook",
    "Joe Veleno",
    "Alexandre Texier",
    "Ivan Demidov",
    "Zachary Bolduc",
    "Jake Evans",
    "Josh Anderson",
    "Brendan Gallagher",
    "Florian Xhekaj",
    "Owen Beck",
    // Défenseurs
    "Mike Matheson",
    "Kaiden Guhle",
    "Lane Hutson",
    "Noah Dobson",
    "Alexandre Carrier",
    "Arber Xhekaj",
    "Jayden Struble",
    "David Reinbacher",
    "Adam Engström",
  ],
  car: [
    // Attaquants
    "Sebastian Aho",
    "Andrei Svechnikov",
    "Seth Jarvis",
    "Logan Stankoven",
    "Taylor Hall",
    "Nikolaj Ehlers",
    "Jackson Blake",
    "Jesperi Kotkaniemi",
    "Jordan Staal",
    "Jordan Martinook",
    "William Carrier",
    "Eric Robinson",
    "Mark Jankowski",
    "Nicolas Deslauriers",
    "Charlie Cerrato",
    // Défenseurs
    "Jaccob Slavin",
    "K'Andre Miller",
    "Sean Walker",
    "Shayne Gostisbehere",
    "Jalen Chatfield",
    "Alexander Nikishin",
    "Mike Reilly",
  ],
};

export const GOALIES: Record<TeamCode, string[]> = {
  mtl: ["Sam Montembeault", "Jakub Dobeš", "Jacob Fowler"],
  car: ["Frederik Andersen", "Pyotr Kochetkov", "Brandon Bussi"],
};

export const NUM_PERIODS = 3;

// Barème (points)
export const POINTS = {
  winner: 2, // bonne équipe gagnante
  finalScore: 2, // score final exact (les 2 équipes)
  periodTeamScore: 2, // score exact d'une équipe pour une période
  scorer: 2, // par bon scoreur prédit
  shotsExact: 2, // tirs au but exacts (par équipe par période)
  shotsClose: 1, // tirs au but à +/- 5 (par équipe par période)
};

export const SHOTS_CLOSE_THRESHOLD = 5;

export const MAX_GOALS_PER_TEAM = 12; // garde-fou UI (nb de scoreurs à choisir)

// Type de prédiction (et de résultat réel) partagé
export type PeriodScore = { mtl: number; car: number };
export type Scorer = { team: TeamCode; player: string };

export type Prediction = {
  winner?: TeamCode;
  periodScores?: PeriodScore[];
  scorers?: Scorer[];
  shots?: PeriodScore[];
};

export function emptyPeriods(): PeriodScore[] {
  return Array.from({ length: NUM_PERIODS }, () => ({ mtl: 0, car: 0 }));
}

export function totalFromPeriods(periods: PeriodScore[] | undefined): {
  mtl: number;
  car: number;
} {
  if (!periods) return { mtl: 0, car: 0 };
  return periods.reduce(
    (acc, p) => ({ mtl: acc.mtl + (p.mtl || 0), car: acc.car + (p.car || 0) }),
    { mtl: 0, car: 0 }
  );
}
