/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerStats } from '../types/game';
import { X, Flame, Trophy, Award, Clock, History, RotateCcw } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onResetStats: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onResetStats,
}) => {
  if (!isOpen) return null;

  const winRate = stats.totalPlayed > 0 
    ? Math.round((stats.totalWins / stats.totalPlayed) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-white border border-stone-200 rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#5A6F32]" />
              <span>Player Statistics</span>
            </h3>
            <p className="text-xs text-stone-500">Anonymous streak tracking and game history</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main 4 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5">
              <div className="text-xs text-stone-500 mb-1 font-medium">Played</div>
              <div className="text-2xl font-black text-stone-900 tabular-nums">
                {stats.totalPlayed}
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5">
              <div className="text-xs text-stone-500 mb-1 font-medium">Win Rate</div>
              <div className="text-2xl font-black text-[#4D5E2B] tabular-nums">
                {winRate}%
              </div>
            </div>

            <div className="bg-[#EEF2E6] border border-[#C6D3B6] rounded-2xl p-3.5">
              <div className="text-xs text-[#3D4B20] mb-1 flex items-center justify-center gap-1 font-bold">
                <Flame className="w-3.5 h-3.5 fill-[#6B7F38]" />
                <span>Streak</span>
              </div>
              <div className="text-2xl font-black text-[#3D4B20] tabular-nums">
                {stats.currentStreak}
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5">
              <div className="text-xs text-stone-500 mb-1 font-medium">Max Streak</div>
              <div className="text-2xl font-black text-stone-800 tabular-nums">
                {stats.maxStreak}
              </div>
            </div>

          </div>

          {/* Secondary stats strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-3.5 flex items-center justify-between">
              <span className="text-xs text-stone-600 flex items-center gap-1.5 font-medium">
                <Award className="w-4 h-4 text-[#6B7F38]" />
                <span>Perfect Games (7/7):</span>
              </span>
              <strong className="text-sm font-bold text-stone-900 tabular-nums">{stats.perfectGames}</strong>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-3.5 flex items-center justify-between">
              <span className="text-xs text-stone-600 flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Average Time:</span>
              </span>
              <strong className="text-sm font-bold text-stone-900 font-mono tabular-nums">{stats.averageTime}s</strong>
            </div>
          </div>

          {/* History log */}
          <div>
            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-stone-400" />
              <span>Recent Games ({stats.history.length})</span>
            </h4>

            {stats.history.length === 0 ? (
              <div className="text-center py-6 text-xs text-stone-500 bg-stone-50 rounded-2xl border border-stone-200">
                No games recorded yet. Complete your first daily sprint!
              </div>
            ) : (
              <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto bg-stone-50 rounded-2xl border border-stone-200">
                {stats.history.slice(0, 10).map((item, idx) => (
                  <div key={idx} className="p-2.5 px-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.score >= 4 ? 'bg-[#6B7F38]' : 'bg-[#98A869]'}`} />
                      <span className="text-stone-800 font-semibold">
                        {item.mode === 'daily' ? `Challenge #${item.dayNumber}` : 'Practice'}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="text-stone-500 font-mono text-[11px]">{item.date}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-stone-500">{item.timeUsed.toFixed(1)}s</span>
                      <span className="font-bold text-stone-900 tabular-nums">{item.score}/7</span>
                      <span className="text-[#4D5E2B] font-bold text-[11px] w-12 text-right">
                        {item.percentile}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500 leading-relaxed">
            🔒 <strong>Zero Login & Full Privacy:</strong> Your streak, accuracy history, and scores are stored exclusively in your local browser storage. No accounts, cookies, or trackers.
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset your player statistics and streak?')) {
                onResetStats();
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Stats</span>
          </button>

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
