/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Error function approximation for Gaussian cumulative distribution
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

// Normal CDF
function normalCDF(value: number, mean: number, stdDev: number): number {
  return 0.5 * (1 + erf((value - mean) / (stdDev * Math.sqrt(2))));
}

export interface PercentileResult {
  percentile: number; // e.g. 84 (meaning better than 84% of players today)
  ratingScore: number;
  rankTitle: string;
  rankBadgeColor: string;
  distributionBins: { score: number; countPct: number; isPlayerBin: boolean }[];
}

/**
 * Calculates what percentage of daily players the user outperformed.
 * @param score Number of correct answers (0..7)
 * @param timeUsed Total seconds spent out of 60s
 * @param dateStr Current date string (for difficulty baseline calibration)
 */
export function calculateDailyPercentile(score: number, timeUsed: number, dateStr: string): PercentileResult {
  const maxTotalTime = 7 * 60; // 420 seconds total (60s per riddle)
  const timeRemaining = Math.max(0, maxTotalTime - timeUsed);
  
  // Rating combines accuracy (major weight) + speed bonus (minor weight)
  const speedBonus = score > 0 ? (timeRemaining / maxTotalTime) * 120 * (score / 7) : 0;
  const ratingScore = Math.round((score * 100) + speedBonus);

  // Today's benchmark parameters
  let seedNum = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seedNum += dateStr.charCodeAt(i);
  }
  const meanShift = (seedNum % 21) - 10;
  const mean = 450 + meanShift;
  const stdDev = 130;

  let rawP = normalCDF(ratingScore, mean, stdDev) * 100;

  // Clamps based on 60s per riddle pacing
  const avgTimePerRiddle = timeUsed / 7;
  if (score === 7) {
    if (avgTimePerRiddle < 15) rawP = Math.max(rawP, 98);
    else if (avgTimePerRiddle < 28) rawP = Math.max(rawP, 95);
    else rawP = Math.max(rawP, 92);
  } else if (score === 6) {
    rawP = Math.min(Math.max(rawP, 78), 91);
  } else if (score === 0) {
    rawP = Math.min(rawP, 5);
  }

  const finalPercentile = Math.max(1, Math.min(99, Math.round(rawP)));

  // English titles and badges optimized for beige/light theme
  let rankTitle = 'Good Effort';
  let rankBadgeColor = 'text-stone-600 bg-stone-100 border-stone-200';
  if (finalPercentile >= 95) {
    rankTitle = 'Riddle Grandmaster';
    rankBadgeColor = 'text-amber-800 bg-amber-100 border-amber-300';
  } else if (finalPercentile >= 85) {
    rankTitle = 'Brilliant Mind';
    rankBadgeColor = 'text-emerald-800 bg-emerald-100 border-emerald-300';
  } else if (finalPercentile >= 70) {
    rankTitle = 'Sharp Intellect';
    rankBadgeColor = 'text-sky-800 bg-sky-100 border-sky-300';
  } else if (finalPercentile >= 50) {
    rankTitle = 'Above Average';
    rankBadgeColor = 'text-blue-800 bg-blue-100 border-blue-300';
  } else if (finalPercentile >= 30) {
    rankTitle = 'Solid Tactician';
    rankBadgeColor = 'text-stone-700 bg-stone-100 border-stone-300';
  } else {
    rankTitle = 'Brave Attempt';
    rankBadgeColor = 'text-stone-600 bg-stone-100 border-stone-200';
  }

  const typicalDistribution = [3, 7, 14, 21, 25, 17, 10, 3];
  const distributionBins = typicalDistribution.map((pct, qScore) => ({
    score: qScore,
    countPct: pct,
    isPlayerBin: qScore === score,
  }));

  return {
    percentile: finalPercentile,
    ratingScore,
    rankTitle,
    rankBadgeColor,
    distributionBins,
  };
}
