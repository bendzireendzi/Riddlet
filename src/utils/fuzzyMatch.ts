/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Normalizes input by removing common articles, punctuation, and multiple spaces
export function normalizeAnswer(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD') // handles accents if any
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(a|an|the)\s+/i, '') // remove leading English articles
    .replace(/^(to|of|my|your|his|her|its|our|their)\s+/i, '')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Levenshtein distance for typo tolerance
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Checks if user typed answer matches the expected answer or any accepted aliases,
 * with forgiving tolerance for typos, missing letters, or swapped keys.
 */
export function checkAnswerFuzzy(
  userRawInput: string,
  canonicalAnswer: string,
  aliases: string[] = []
): { isMatch: boolean; matchedTarget?: string; toleranceUsed?: boolean } {
  const user = normalizeAnswer(userRawInput);
  if (!user) return { isMatch: false };

  const allTargets = [canonicalAnswer, ...aliases].map((t) => normalizeAnswer(t)).filter(Boolean);

  // 1. Exact match check against any target or alias
  for (const target of allTargets) {
    if (user === target) {
      return { isMatch: true, matchedTarget: target, toleranceUsed: false };
    }
  }

  // 2. Substring containment check (e.g. target is "blackboard" and user typed "black board" or "a blackboard")
  for (const target of allTargets) {
    const userSpaceless = user.replace(/\s+/g, '');
    const targetSpaceless = target.replace(/\s+/g, '');
    if (userSpaceless === targetSpaceless) {
      return { isMatch: true, matchedTarget: target, toleranceUsed: true };
    }
    // Sub-word match for multi-word targets (e.g. target="postage stamp", user="stamp")
    if (target.includes(' ') && target.split(' ').includes(user)) {
      return { isMatch: true, matchedTarget: target, toleranceUsed: true };
    }
    if (user.includes(' ') && user.split(' ').includes(target)) {
      return { isMatch: true, matchedTarget: target, toleranceUsed: true };
    }
  }

  // 3. Typo tolerance using Levenshtein distance
  for (const target of allTargets) {
    const dist = levenshteinDistance(user, target);

    // Rule 1: Very short words (length 3 to 4) allow 1 typo (e.g. "hol" -> "hole", "cat" -> "cats")
    if (target.length >= 3 && target.length <= 4 && dist <= 1) {
      return { isMatch: true, matchedTarget: target, toleranceUsed: true };
    }

    // Rule 2: Medium/long words (length 5+) allow up to 2 typos (e.g. "secrett" -> "secret", "blakboard" -> "blackboard")
    if (target.length >= 5 && dist <= 2) {
      return { isMatch: true, matchedTarget: target, toleranceUsed: true };
    }

    // Rule 3: For longer compound words (8+ chars), allow up to 3 typos if similarity is > 75%
    if (target.length >= 8 && dist <= 3) {
      const similarity = 1 - dist / Math.max(user.length, target.length);
      if (similarity >= 0.75) {
        return { isMatch: true, matchedTarget: target, toleranceUsed: true };
      }
    }
  }

  return { isMatch: false };
}
