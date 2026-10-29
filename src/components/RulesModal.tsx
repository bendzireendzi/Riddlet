/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Timer, Flame, Trophy, Keyboard } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white border border-stone-200 rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-stone-900">How It Works</h3>
            <p className="text-xs text-stone-500">Rules of the Daily 60-Second Riddle Sprint</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          <div className="flex gap-3.5 p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2E6] text-[#4D5E2B] flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 mb-0.5">60 Seconds Per Riddle</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                You have a generous 60 seconds for each of the 7 riddles. If the timer runs out on a riddle, it automatically moves to the next one with a fresh 60s!
              </p>
            </div>
          </div>

          <div className="flex gap-3.5 p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2E6] text-[#4D5E2B] flex items-center justify-center shrink-0">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 mb-0.5">Type Your Answers (Typo-Tolerant)</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                No A, B, C, D choices! Type your answer directly. Don’t worry about minor typos or missing letters—our fuzzy matching system will accept them!
              </p>
            </div>
          </div>

          <div className="flex gap-3.5 p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2E6] text-[#4D5E2B] flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 mb-0.5">Daily Percentile Ranking</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                See what percentage of players you outperformed today based on speed and accuracy.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5 p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 mb-0.5">Daily Streak (No Sign-In)</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Keep the flame alive each day. Your streak is stored locally in your browser with zero login required.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#6B7F38] hover:bg-[#5C6E30] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Got it, let’s play!
          </button>
        </div>

      </div>
    </div>
  );
};
