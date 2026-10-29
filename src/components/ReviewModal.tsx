/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Riddle, PlayerAnswer } from '../types/game';
import { X, CheckCircle2, XCircle } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  riddles: Riddle[];
  answers: PlayerAnswer[];
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  riddles,
  answers,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white border border-stone-200 rounded-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Riddle Breakdown & Solutions</h3>
            <p className="text-xs text-stone-500">Explanations and accepted solutions for all 7 riddles</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {riddles.map((riddle, idx) => {
            const answer = answers.find((a) => a.riddleId === riddle.id);
            const isCorrect = answer ? answer.isCorrect : false;
            const userTyped = answer && answer.userTyped ? answer.userTyped : 'Skipped / Timed out';

            return (
              <div
                key={riddle.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'bg-[#EEF2E6]/60 border-[#C6D3B6]'
                    : 'bg-rose-50/60 border-rose-200'
                }`}
              >
                {/* Status line */}
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-700">#{idx + 1}</span>
                    <span className="text-stone-300">·</span>
                    <span className="text-[#4D5E2B] font-bold">{riddle.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#6B7F38]" />
                        <span className="text-[#4D5E2B]">Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span className="text-rose-700">Skipped / Incorrect</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Question */}
                <h4 className="text-base font-bold text-stone-900 mb-3">
                  {riddle.question}
                </h4>

                {/* Answer comparison */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-stone-700 bg-stone-100/80 px-3 py-1.5 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-600">You typed:</span>
                    <span className="font-mono">{userTyped}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[#2D3A16] bg-[#EEF2E6] px-3 py-1.5 rounded-xl border border-[#C6D3B6]">
                    <span className="font-bold text-[#4D5E2B]">Accepted Answer:</span>
                    <span className="font-bold">{riddle.answer}</span>
                    {riddle.aliases.length > 0 && (
                      <span className="text-stone-500 font-normal">
                        (also: {riddle.aliases.slice(0, 3).join(', ')})
                      </span>
                    )}
                  </div>
                </div>

                {/* Explanation */}
                <div className="mt-3 pt-2.5 border-t border-stone-200/80 text-xs text-stone-600 leading-relaxed">
                  <strong className="text-stone-900">Why:</strong> {riddle.explanation}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
