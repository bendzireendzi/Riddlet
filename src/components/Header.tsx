/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, Volume2, VolumeX, BarChart2, HelpCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentStreak: number;
  hasPlayedToday: boolean;
  onOpenStats: () => void;
  onOpenRules: () => void;
  onGoHome: () => void;
  onPracticeClick: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  activeTab: 'daily' | 'practice';
}

export const Header: React.FC<HeaderProps> = ({
  currentStreak,
  hasPlayedToday,
  onOpenStats,
  onOpenRules,
  onGoHome,
  onPracticeClick,
  isMuted,
  onToggleMute,
  activeTab,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/90 bg-[#F7F5F0]/95 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand Wordmark (one line, text element) */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left text-lg sm:text-xl font-bold tracking-tight text-stone-900 hover:text-[#5A6F32] transition-colors whitespace-nowrap shrink-0 group focus:outline-none cursor-pointer"
        >
          <span className="w-8 h-8 rounded-lg bg-[#6B7F38]/15 border border-[#6B7F38]/30 text-[#4D5E2B] flex items-center justify-center font-black text-sm group-hover:scale-105 transition-transform">
            7r
          </span>
          <span>Daily Riddle</span>
        </button>

        {/* Zone 2: Navigation Links (single line, clean typography) */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={onGoHome}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'daily' ? 'text-[#4D5E2B] font-bold' : 'hover:text-stone-900'
            }`}
          >
            Daily Challenge
          </button>
          <button
            onClick={onPracticeClick}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'practice' ? 'text-[#4D5E2B] font-bold' : 'hover:text-stone-900'
            }`}
          >
            Practice
          </button>
          <button
            onClick={onOpenRules}
            className="whitespace-nowrap hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-stone-500" />
            <span>Rules</span>
          </button>
          <button
            onClick={onOpenStats}
            className="whitespace-nowrap hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BarChart2 className="w-4 h-4 text-stone-500" />
            <span>Stats</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Quick Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Daily Streak Indicator */}
          <button
            onClick={onOpenStats}
            title={hasPlayedToday ? `Today's streak recorded: ${currentStreak} days` : `Play today to keep your streak! Currently: ${currentStreak} days`}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
              currentStreak > 0
                ? 'bg-[#EEF2E6] text-[#3D4B20] border-[#C6D3B6] shadow-xs'
                : 'bg-white text-stone-600 border-stone-200'
            }`}
          >
            <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-[#6B7F38] fill-[#7B8E54] animate-pulse' : 'text-stone-400'}`} />
            <span className="tabular-nums font-bold">{currentStreak}</span>
            <span className="hidden md:inline text-xs font-normal opacity-85">
              {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleMute();
              sound.playClick();
            }}
            title={isMuted ? 'Unmute sound' : 'Mute sound'}
            className="p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 border border-transparent hover:border-stone-200 transition-colors cursor-pointer"
            aria-label="Toggle sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-[#5A6F32]" />}
          </button>

          {/* Mobile Quick Buttons */}
          <button
            onClick={onOpenStats}
            className="sm:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 cursor-pointer"
            aria-label="Stats"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenRules}
            className="sm:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 cursor-pointer"
            aria-label="Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
