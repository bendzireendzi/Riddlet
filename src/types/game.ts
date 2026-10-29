/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RiddleCategory = 
  | 'Logic'
  | 'Classic'
  | 'Nature'
  | 'Math'
  | 'Objects'
  | 'Wordplay'
  | 'Trivia';

export interface Riddle {
  id: string;
  question: string;
  category: RiddleCategory;
  answer: string; // The primary canonical answer
  aliases: string[]; // Alternate synonyms, plural forms, short names
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PlayerAnswer {
  riddleId: string;
  userTyped: string;
  targetAnswer: string;
  isCorrect: boolean;
  timeSpentSec: number;
}

export interface DailyResult {
  date: string;
  dayNumber: number;
  score: number; // 0..7
  totalQuestions: number; // 7
  timeUsed: number; // in seconds
  timeRemaining: number;
  percentile: number; // 0..99
  ratingScore: number;
  answers: PlayerAnswer[];
  completedAt: string;
}

export interface PlayerStats {
  currentStreak: number;
  maxStreak: number;
  totalPlayed: number;
  totalWins: number;
  perfectGames: number;
  totalCorrect: number;
  totalQuestionsAnswered: number;
  averageTime: number;
  lastPlayedDate: string;
  playedDates: string[];
  history: {
    date: string;
    dayNumber: number;
    score: number;
    timeUsed: number;
    percentile: number;
    mode: 'daily' | 'practice';
  }[];
  todayDailyResult?: DailyResult;
}

export type GameMode = 'daily' | 'practice';

export type GamePhase = 
  | 'INTRO'
  | 'READY'
  | 'PLAYING'
  | 'SUMMARY'
  | 'REVIEW';
