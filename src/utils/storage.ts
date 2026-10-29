/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerStats, DailyResult } from '../types/game';

const STORAGE_KEY = 'daily_riddle_player_stats_v3';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_STATS: PlayerStats = {
  currentStreak: 0,
  maxStreak: 0,
  totalPlayed: 0,
  totalWins: 0,
  perfectGames: 0,
  totalCorrect: 0,
  totalQuestionsAnswered: 0,
  averageTime: 0,
  lastPlayedDate: '',
  playedDates: [],
  history: [],
};

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw) as PlayerStats;
    
    // Check streak lapse
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    if (parsed.lastPlayedDate && parsed.lastPlayedDate !== today && parsed.lastPlayedDate !== yesterday) {
      parsed.currentStreak = 0;
    }

    return parsed;
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save player stats to localStorage', e);
  }
}

export function recordGameCompletion(result: DailyResult, isDaily: boolean): PlayerStats {
  const stats = loadPlayerStats();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  if (isDaily) {
    if (stats.lastPlayedDate === yesterday) {
      stats.currentStreak += 1;
    } else if (stats.lastPlayedDate === today) {
      if (stats.currentStreak === 0) stats.currentStreak = 1;
    } else {
      stats.currentStreak = 1;
    }

    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.lastPlayedDate = today;

    if (!stats.playedDates.includes(today)) {
      stats.playedDates.push(today);
    }

    stats.todayDailyResult = result;
  }

  // Update aggregated statistics
  const prevTotalTime = stats.averageTime * stats.totalPlayed;
  stats.totalPlayed += 1;
  stats.totalCorrect += result.score;
  stats.totalQuestionsAnswered += result.totalQuestions;
  if (result.score >= 4) {
    stats.totalWins += 1;
  }
  if (result.score === 7) {
    stats.perfectGames += 1;
  }
  stats.averageTime = Number(((prevTotalTime + result.timeUsed) / stats.totalPlayed).toFixed(1));

  // Add to history
  stats.history.unshift({
    date: result.date,
    dayNumber: result.dayNumber,
    score: result.score,
    timeUsed: result.timeUsed,
    percentile: result.percentile,
    mode: isDaily ? 'daily' : 'practice',
  });

  if (stats.history.length > 60) {
    stats.history = stats.history.slice(0, 60);
  }

  savePlayerStats(stats);
  return stats;
}

export function hasPlayedDailyToday(): boolean {
  const stats = loadPlayerStats();
  const today = getTodayDateString();
  return stats.lastPlayedDate === today && !!stats.todayDailyResult;
}

export function getTodayDailyResult(): DailyResult | undefined {
  const stats = loadPlayerStats();
  const today = getTodayDateString();
  if (stats.lastPlayedDate === today && stats.todayDailyResult) {
    return stats.todayDailyResult;
  }
  return undefined;
}

// Generate last 7 days status for streak tracking with English labels
export function getRecentStreakDays(): { date: string; dayLabel: string; played: boolean; isToday: boolean }[] {
  const stats = loadPlayerStats();
  const days: { date: string; dayLabel: string; played: boolean; isToday: boolean }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const todayStr = getTodayDateString();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const dayLabel = dayNames[d.getDay()];

    days.push({
      date: dateStr,
      dayLabel,
      played: stats.playedDates.includes(dateStr),
      isToday: dateStr === todayStr,
    });
  }

  return days;
}
