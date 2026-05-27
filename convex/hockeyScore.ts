// Scoring pur pour les prédictions de hockey.
// Autonome (pas d'import hors de convex/) pour rester bundlable par Convex.
// Les constantes du barème sont dupliquées de src/lib/hockey.ts (gardées en sync).

export type TeamCode = "mtl" | "car";
export type PeriodScore = { mtl: number; car: number };
export type Scorer = { team: TeamCode; player: string };

export type Prediction = {
  winner?: TeamCode;
  periodScores?: PeriodScore[];
  scorers?: Scorer[];
  shots?: PeriodScore[];
};

export type Actual = {
  actualWinner?: TeamCode;
  actualPeriodScores?: PeriodScore[];
  actualScorers?: Scorer[];
  actualShots?: PeriodScore[];
};

const POINTS = {
  winner: 2,
  finalScore: 2,
  periodTeamScore: 2,
  scorer: 2,
  shotsExact: 2,
  shotsClose: 1,
};
const SHOTS_CLOSE_THRESHOLD = 5;

export type ScoreBreakdown = {
  winner: number;
  finalScore: number;
  periodScores: number;
  scorers: number;
  shots: number;
  total: number;
};

function sumPeriods(p?: PeriodScore[]): { mtl: number; car: number } {
  if (!p) return { mtl: 0, car: 0 };
  return p.reduce(
    (a, x) => ({ mtl: a.mtl + (x.mtl || 0), car: a.car + (x.car || 0) }),
    { mtl: 0, car: 0 }
  );
}

/**
 * Calcule le pointage d'une prédiction face aux résultats réels.
 * Chaque composante n'est notée que si le résultat réel correspondant
 * est disponible — permet un calcul "live" au fil de la saisie admin.
 */
export function scorePrediction(
  pred: Prediction,
  actual: Actual
): ScoreBreakdown {
  let winner = 0;
  let finalScore = 0;
  let periodScores = 0;
  let scorers = 0;
  let shots = 0;

  // 1) Gagnant
  if (actual.actualWinner && pred.winner) {
    if (pred.winner === actual.actualWinner) winner += POINTS.winner;
  }

  // 2) Score par période (par équipe) + score final dérivé
  if (
    actual.actualPeriodScores &&
    actual.actualPeriodScores.length > 0 &&
    pred.periodScores
  ) {
    const n = Math.min(
      actual.actualPeriodScores.length,
      pred.periodScores.length
    );
    for (let i = 0; i < n; i++) {
      const a = actual.actualPeriodScores[i];
      const p = pred.periodScores[i];
      if (p.mtl === a.mtl) periodScores += POINTS.periodTeamScore;
      if (p.car === a.car) periodScores += POINTS.periodTeamScore;
    }
    // Score final = somme des périodes (les 2 équipes exactes)
    const aTot = sumPeriods(actual.actualPeriodScores);
    const pTot = sumPeriods(pred.periodScores);
    if (pTot.mtl === aTot.mtl && pTot.car === aTot.car) {
      finalScore += POINTS.finalScore;
    }
  }

  // 3) Buteurs — intersection multiset (par équipe + joueur), 2 pts chacun
  if (
    actual.actualScorers &&
    actual.actualScorers.length > 0 &&
    pred.scorers &&
    pred.scorers.length > 0
  ) {
    const remaining = new Map<string, number>();
    for (const s of actual.actualScorers) {
      const k = `${s.team}:${s.player}`;
      remaining.set(k, (remaining.get(k) ?? 0) + 1);
    }
    for (const s of pred.scorers) {
      const k = `${s.team}:${s.player}`;
      const left = remaining.get(k) ?? 0;
      if (left > 0) {
        scorers += POINTS.scorer;
        remaining.set(k, left - 1);
      }
    }
  }

  // 4) Tirs au but par période par équipe: exact = 2, +/- seuil = 1
  if (actual.actualShots && actual.actualShots.length > 0 && pred.shots) {
    const n = Math.min(actual.actualShots.length, pred.shots.length);
    for (let i = 0; i < n; i++) {
      const a = actual.actualShots[i];
      const p = pred.shots[i];
      for (const team of ["mtl", "car"] as const) {
        const diff = Math.abs((p[team] || 0) - (a[team] || 0));
        if (diff === 0) shots += POINTS.shotsExact;
        else if (diff <= SHOTS_CLOSE_THRESHOLD) shots += POINTS.shotsClose;
      }
    }
  }

  const total = winner + finalScore + periodScores + scorers + shots;
  return { winner, finalScore, periodScores, scorers, shots, total };
}
