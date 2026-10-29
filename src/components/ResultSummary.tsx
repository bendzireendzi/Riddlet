/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { DailyResult, PlayerStats } from '../types/game';
import { calculateDailyPercentile } from '../utils/percentile';
import { Flame, Share2, Check, RotateCcw, BookOpen, Clock, Trophy, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface ResultSummaryProps {
  result: DailyResult;
  stats: PlayerStats;
  isDaily: boolean;
  onPlayPractice: () => void;
  onReviewAnswers: () => void;
  onGoHome: () => void;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({
  result,
  stats,
  isDaily,
  onPlayPractice,
  onReviewAnswers,
  onGoHome,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeUntilTomorrow, setTimeUntilTomorrow] = useState<string>('');

  const percentileData = calculateDailyPercentile(result.score, result.timeUsed, result.date);

  useEffect(() => {
    if (result.score >= 4) {
      sound.playFanfare();
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#6B7F38', '#8A9E58', '#059669', '#3B82F6'],
        });
      } catch {
        // Fallback
      }
    }
  }, [result.score]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diffMs = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilTomorrow(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = () => {
    sound.playClick();
    const answerSquares = result.answers
      .map((a) => (a.isCorrect ? '🟩' : '🟥'))
      .join('');

    const textToShare = 
`🧠 Daily Riddle #${result.dayNumber} (${result.date})
🎯 Score: ${result.score}/7 solved
⏱️ Time: ${result.timeUsed.toFixed(1)}s (60s per riddle)
🏆 Better than ${percentileData.percentile}% of players!
🔥 Streak: ${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}
${answerSquares}

Play free with no login required: ${window.location.origin}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToShare).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      
      {/* 1. Main Percentile & Score Hero Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden text-center">
        
        {/* Subtle olive glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-[#6B7F38]/10 blur-3xl pointer-events-none rounded-full" />

        {/* Challenge date and kicker */}
        <div className="text-xs text-stone-500 mb-2 flex items-center justify-center gap-2 font-medium">
          <span>{isDaily ? `Daily Challenge #${result.dayNumber}` : 'Practice Mode'}</span>
          <span aria-hidden="true">·</span>
          <span>{result.date}</span>
        </div>

        {/* Hero Percentile Headline */}
        <div className="my-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#C6D3B6] bg-[#EEF2E6] text-[#3D4B20] text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Trophy className="w-3.5 h-3.5 text-[#5A6F32]" />
            <span>{percentileData.rankTitle}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            Better than{' '}
            <span className="text-[#5A6F32] tabular-nums font-mono">
              {percentileData.percentile}%
            </span>{' '}
            of players today!
          </h1>
          
          <p className="text-sm sm:text-base text-stone-600 mt-3 max-w-lg mx-auto leading-relaxed">
            {percentileData.percentile >= 80
              ? 'Incredible typing speed and sharp intuition! Your performance places you at the very top.'
              : percentileData.percentile >= 50
              ? 'Great round! You outsmarted the average player and typed out the answers under pressure.'
              : 'Solid sprint! Speed typing and thinking in 60s is tough. Come back tomorrow for 7 new riddles!'}
          </p>
        </div>

        {/* Bell Curve Distribution Chart */}
        <div className="mt-8 pt-6 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-3 font-semibold">
            <span>Daily Player Distribution</span>
            <span className="text-[#4D5E2B] font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B7F38]" />
              Your Score ({result.score}/7)
            </span>
          </div>

          <div className="h-32 w-full flex items-end gap-1.5 sm:gap-2.5 pt-6 px-3 bg-stone-50 rounded-2xl border border-stone-200/80 relative">
            {percentileData.distributionBins.map((bin) => {
              const heightPct = Math.max(14, (bin.countPct / 28) * 100);
              return (
                <div key={bin.score} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-stone-900 text-[10px] text-white px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                    {bin.score}/7: ~{bin.countPct}% players
                  </div>

                  {/* Marker if player bin */}
                  {bin.isPlayerBin && (
                    <div className="absolute -top-4 flex flex-col items-center">
                      <span className="text-[10px] font-black text-[#4D5E2B] leading-none">You</span>
                      <span className="w-1.5 h-1.5 bg-[#6B7F38] rotate-45 mt-0.5" />
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      bin.isPlayerBin
                        ? 'bg-[#6B7F38] ring-2 ring-[#6B7F38]/40'
                        : 'bg-stone-200 group-hover:bg-stone-300'
                    }`}
                  />

                  {/* X Axis Label */}
                  <span className={`text-[11px] mt-1.5 font-mono ${bin.isPlayerBin ? 'text-[#4D5E2B] font-bold' : 'text-stone-500'}`}>
                    {bin.score}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-[11px] text-stone-500 mt-2 text-center">
            Number of correct riddles (0 to 7)
          </div>
        </div>

      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Score Box */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4.5 text-center shadow-xs">
          <div className="text-xs text-stone-500 uppercase tracking-wider mb-1 font-bold flex items-center justify-center gap-1.5">
            <Award className="w-4 h-4 text-[#6B7F38]" />
            <span>Accuracy</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums">
            {result.score} <span className="text-base text-stone-400 font-normal">/ {result.totalQuestions}</span>
          </div>
          <div className="text-xs text-[#4D5E2B] font-semibold mt-1">
            {Math.round((result.score / result.totalQuestions) * 100)}% solved rate
          </div>
        </div>

        {/* Time Used Box */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4.5 text-center shadow-xs">
          <div className="text-xs text-stone-500 uppercase tracking-wider mb-1 font-bold flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Time Taken</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 font-mono tabular-nums">
            {result.timeUsed.toFixed(1)}s
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Remaining: <strong className="text-stone-700 tabular-nums font-mono">{result.timeRemaining.toFixed(1)}s</strong>
          </div>
        </div>

        {/* Speed Average Box */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4.5 text-center shadow-xs">
          <div className="text-xs text-stone-500 uppercase tracking-wider mb-1 font-bold flex items-center justify-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#6B7F38]" />
            <span>Pace</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#4D5E2B] font-mono tabular-nums">
            {(result.timeUsed / result.totalQuestions).toFixed(1)}s
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Average per riddle
          </div>
        </div>

      </div>

      {/* 3. Daily Streak Card (Zero login required!) */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF2E6] border border-[#C6D3B6] flex items-center justify-center text-[#5A6F32]">
              <Flame className="w-6 h-6 fill-[#6B7F38] animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-stone-900">Daily Streak</span>
                <span className="text-xs text-stone-400 font-normal">· No sign-in needed</span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Your progress and streak are saved directly in your browser.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 self-start sm:self-auto">
            <div className="text-left sm:text-right">
              <div className="text-xs text-stone-500 font-medium">Current Streak</div>
              <div className="text-2xl font-black text-[#4D5E2B] tabular-nums">
                {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs text-stone-500 font-medium">Best Streak</div>
              <div className="text-2xl font-black text-stone-700 tabular-nums">
                {stats.maxStreak} {stats.maxStreak === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>
        </div>

        {/* 7-day visual calendar streak strip */}
        <div className="mt-5 pt-1">
          <div className="text-xs font-semibold text-stone-500 mb-2.5">Last 7 Days:</div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, idx) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - idx));
              const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
              const isPlayed = stats.playedDates.includes(dateStr);
              const isToday = idx === 6;

              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-center transition-colors ${
                    isPlayed
                      ? 'bg-[#EEF2E6] border-[#C6D3B6] text-[#3D4B20]'
                      : isToday
                      ? 'bg-stone-100 border-stone-300 text-stone-800'
                      : 'bg-stone-50 border-stone-200 text-stone-400'
                  }`}
                >
                  <span className="text-[10px] text-stone-500 font-bold uppercase">{dayShort}</span>
                  <div className="my-1.5">
                    {isPlayed ? (
                      <Check className="w-4 h-4 text-[#6B7F38] stroke-[3]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-stone-300 mx-auto" />
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-stone-500 font-medium">{d.getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Daily Riddle Clock */}
        {timeUntilTomorrow && (
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Next daily riddle unlocks in:</span>
            <span className="font-mono font-bold text-[#4D5E2B] tabular-nums text-sm">
              {timeUntilTomorrow}
            </span>
          </div>
        )}
      </div>

      {/* 4. Action Buttons Footer */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        
        {/* Share Button in Olive Green */}
        <button
          onClick={handleShare}
          className="flex-1 min-h-[50px] px-6 py-3.5 bg-[#6B7F38] hover:bg-[#5C6E30] active:bg-[#4E5E28] text-white font-bold rounded-2xl transition-all shadow-md shadow-[#6B7F38]/25 flex items-center justify-center gap-2 group cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-white stroke-[3]" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              <span>Share Result With Friends</span>
            </>
          )}
        </button>

        {/* Review Answers Button */}
        <button
          onClick={onReviewAnswers}
          className="px-5 py-3.5 bg-white hover:bg-stone-100 text-stone-800 font-bold rounded-2xl border border-stone-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <BookOpen className="w-4 h-4 text-stone-500" />
          <span>Review Answers</span>
        </button>

        {/* Practice Mode Button */}
        <button
          onClick={onPlayPractice}
          className="px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-2xl border border-stone-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[#5A6F32]" />
          <span>Practice Mode</span>
        </button>

      </div>

    </div>
  );
};
