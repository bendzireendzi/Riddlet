/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Riddle } from '../types/game';
import { checkAnswerFuzzy } from '../utils/fuzzyMatch';
import { sound } from '../utils/audio';
import { Check, ArrowRight, SkipForward, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameCardProps {
  riddle: Riddle;
  currentIndex: number;
  totalQuestions: number;
  comboCount?: number;
  onAnswerCorrect: (userTyped: string, targetAnswer: string) => void;
  onSkip: () => void;
  canSkip?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({
  riddle,
  currentIndex,
  totalQuestions,
  comboCount = 0,
  onAnswerCorrect,
  onSkip,
  canSkip = true,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input and reset state on new riddle
  useEffect(() => {
    setInputValue('');
    setStatus('idle');
    setFeedbackMsg('');
    setIsShaking(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [riddle.id]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || status === 'correct') return;

    // Check with forgiving typo tolerance & alias matcher
    const matchResult = checkAnswerFuzzy(trimmed, riddle.answer, riddle.aliases);

    if (matchResult.isMatch) {
      setStatus('correct');
      if (matchResult.toleranceUsed) {
        sound.playTypoAccept();
        setFeedbackMsg(`Accepted! (${riddle.answer})`);
      } else {
        sound.playCorrect();
        setFeedbackMsg('Brilliant! Correct!');
      }

      // Micro confetti burst on the button / screen
      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.65 },
          colors: ['#6B7F38', '#8A9E58', '#4D5E2B', '#EAB308'],
        });
      } catch {
        // Fallback
      }

      // Smooth advance after 320ms so player sees green feedback
      setTimeout(() => {
        onAnswerCorrect(trimmed, riddle.answer);
      }, 320);
    } else {
      setStatus('wrong');
      setIsShaking(true);
      sound.playWrong();
      setFeedbackMsg('Not quite! Check your spelling and try again.');
      
      setTimeout(() => setIsShaking(false), 380);

      // Select input so user can instantly retype without backspacing
      inputRef.current?.select();
    }
  };

  return (
    <div
      className={`w-full max-w-2xl mx-auto bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-9 shadow-sm relative overflow-hidden transition-all ${
        isShaking ? 'animate-shake' : ''
      }`}
    >
      {/* Category, Combo & Step Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 mb-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#4D5E2B] bg-[#EEF2E6] px-2.5 py-0.5 rounded-full border border-[#C6D3B6]/50">
            {riddle.category}
          </span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="capitalize text-stone-600 font-medium">{riddle.difficulty}</span>
        </div>

        <div className="flex items-center gap-3">
          {comboCount >= 2 && (
            <span className="inline-flex items-center gap-1 font-bold text-xs text-[#4D5E2B] animate-pop bg-[#EEF2E6] px-2 py-0.5 rounded-full border border-[#C6D3B6]">
              <span>🔥</span>
              <span>{comboCount}x Combo</span>
            </span>
          )}
          <div className="font-mono text-stone-500 font-semibold">
            {currentIndex + 1} / {totalQuestions}
          </div>
        </div>
      </div>

      {/* Riddle Question */}
      <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug tracking-tight mb-6 min-h-[68px] flex items-center">
        {riddle.question}
      </h2>

      {/* Interactive Text Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-5">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (status === 'wrong') {
                setStatus('idle');
                setFeedbackMsg('');
              }
            }}
            disabled={status === 'correct'}
            placeholder="Type your answer here..."
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            enterKeyHint="go"
            inputMode="text"
            className={`w-full h-15 px-5 text-base sm:text-lg font-medium rounded-2xl border transition-all outline-none pr-32 ${
              status === 'correct'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                : status === 'wrong'
                ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-400/20'
                : 'bg-[#FAF8F5] border-stone-300 text-stone-900 focus:bg-white focus:border-[#6B7F38] focus:ring-3 focus:ring-[#6B7F38]/20'
            }`}
          />

          {/* Submit Button inside input */}
          <button
            type="submit"
            disabled={!inputValue.trim() || status === 'correct'}
            className="absolute right-2 top-2 bottom-2 px-5 bg-[#6B7F38] hover:bg-[#5C6E30] active:bg-[#4E5E28] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            {status === 'correct' ? (
              <Check className="w-5 h-5 text-white stroke-[3] animate-pop" />
            ) : (
              <>
                <span>Enter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Feedback message (Correct / Typo accepted / Try again) */}
        {feedbackMsg && (
          <div
            className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all animate-pop ${
              status === 'correct'
                ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                : 'text-rose-800 bg-rose-50 border border-rose-200'
            }`}
          >
            {status === 'correct' ? (
              <>
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{feedbackMsg}</span>
              </>
            ) : (
              <span>{feedbackMsg}</span>
            )}
          </div>
        )}
      </form>

      {/* Footer controls: Skip Button */}
      {canSkip && onSkip && (
        <div className="flex items-center justify-end pt-3 border-t border-stone-100 text-xs text-stone-500">
          <button
            type="button"
            onClick={onSkip}
            disabled={status === 'correct'}
            className="flex items-center gap-1.5 text-stone-500 hover:text-[#4D5E2B] transition-colors py-1.5 px-3 rounded-lg hover:bg-stone-100 text-xs font-semibold cursor-pointer"
          >
            <span>Skip for now</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
