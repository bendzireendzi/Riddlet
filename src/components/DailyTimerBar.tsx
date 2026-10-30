/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Timer } from 'lucide-react';

interface DailyTimerBarProps {
  secondsLeft: number;
  totalSeconds: number;
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  answersHistory?: boolean[];
}

export const DailyTimerBar: React.FC<DailyTimerBarProps> = ({
  secondsLeft,
  totalSeconds,
  currentIndex,
  totalQuestions,
  answeredCount,
  correctCount,
  answersHistory = [],
}) => {
  const percentage = Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100));

  let barColor = 'bg-[#6B7F38]';
  let textColor = 'text-[#4D5E2B]';
  let ringBg = 'bg-[#EEF2E6] border-[#C6D3B6]';

  if (secondsLeft <= 10) {
    barColor = 'bg-rose-600 animate-pulse';
    textColor = 'text-rose-700 animate-pulse';
    ringBg = 'bg-rose-50 border-rose-200';
  } else if (secondsLeft <= 25) {
    barColor = 'bg-[#8F9E4F]';
    textColor = 'text-[#5B6D2A]';
    ringBg = 'bg-[#F2F5E8] border-[#D4DEC0]';
  }

  return (
    <div className="w-full bg-white border border-stone-200 rounded-2xl p-4 mb-6 shadow-xs">
      
      {/* Top row: Riddle Progress + Tabular Timer */}
      <div className="flex items-center justify-between mb-3">
        
        {/* Riddle Progress Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = idx < answeredCount;
            const isCorrect = answersHistory[idx] === true;

            return (
              <div
                key={idx}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'w-7 sm:w-9 bg-[#6B7F38] ring-2 ring-[#6B7F38]/30 animate-pulse'
                    : isAnswered
                    ? isCorrect
                      ? 'w-3.5 sm:w-4 bg-[#6B7F38]'
                      : 'w-3.5 sm:w-4 bg-rose-400'
                    : 'w-3.5 sm:w-4 bg-stone-200'
                }`}
                title={`Riddle ${idx + 1}: ${isAnswered ? (isCorrect ? 'Correct' : 'Missed') : isCurrent ? 'Current' : 'Upcoming'}`}
              />
            );
          })}
          <span className="text-xs font-semibold text-stone-500 ml-2 hidden sm:inline tabular-nums">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Live Timer Counter */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${ringBg} transition-colors`}>
          <Timer className={`w-4 h-4 ${textColor}`} />
          <span className={`font-mono text-base sm:text-lg font-bold tabular-nums tracking-tight ${textColor}`}>
            {secondsLeft.toFixed(1)}s
          </span>
        </div>

      </div>

      {/* Continuous Time Bar */}
      <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200">
        <div
          className={`h-full transition-all duration-100 ease-linear rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Meta indicators row */}
      <div className="flex items-center justify-between mt-2.5 text-xs text-stone-500 font-medium">
        <span className="tabular-nums">
          Score: <strong className="text-[#4D5E2B] font-bold">{correctCount}</strong> of {totalQuestions} solved
        </span>
        <span>
          Timer: <strong>60s per riddle</strong>
        </span>
      </div>

    </div>
  );
};
