/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Riddle, PlayerAnswer, DailyResult, PlayerStats, GameMode, GamePhase } from './types/game';
import { getDailyRiddles, getRandomRiddles, getDayNumber } from './data/riddles';
import {
  loadPlayerStats,
  recordGameCompletion,
  getTodayDateString,
  hasPlayedDailyToday,
  getTodayDailyResult,
  savePlayerStats,
} from './utils/storage';
import { sound } from './utils/audio';
import { Header } from './components/Header';
import { DailyTimerBar } from './components/DailyTimerBar';
import { GameCard } from './components/GameCard';
import { ResultSummary } from './components/ResultSummary';
import { ReviewModal } from './components/ReviewModal';
import { StatsModal } from './components/StatsModal';
import { RulesModal } from './components/RulesModal';
import { Play, RotateCcw, Timer, Flame, Trophy, Sparkles, CheckCircle2, Keyboard } from 'lucide-react';

const MASCOT_IMAGE = '/src/assets/images/sage_owl_beige_1793196415514.jpg';
const BANNER_IMAGE = '/src/assets/images/brain_hourglass_beige_1793196415815.jpg';

export default function App() {
  const [stats, setStats] = useState<PlayerStats>(() => loadPlayerStats());
  const [phase, setPhase] = useState<GamePhase>('INTRO');
  const [gameMode, setGameMode] = useState<GameMode>('daily');
  const [activeTab, setActiveTab] = useState<'daily' | 'practice'>('daily');

  // Active game state
  const [riddles, setRiddles] = useState<Riddle[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [playerAnswers, setPlayerAnswers] = useState<PlayerAnswer[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [readyCountdown, setReadyCountdown] = useState<number>(3);
  const [activeResult, setActiveResult] = useState<DailyResult | null>(null);

  // Modals
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => sound.getMuted());

  // Timers and refs
  const timerIntervalRef = useRef<number | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const gameStartTimeRef = useRef<number>(Date.now());
  const lastTickSecondRef = useRef<number>(10);

  const todayStr = getTodayDateString();
  const todayDayNumber = getDayNumber(todayStr);
  const alreadyPlayedToday = hasPlayedDailyToday();

  // Load existing daily result if already completed today
  useEffect(() => {
    const todayRes = getTodayDailyResult();
    if (todayRes && activeTab === 'daily') {
      setActiveResult(todayRes);
      setPhase('SUMMARY');
      setRiddles(getDailyRiddles(todayStr));
      setPlayerAnswers(todayRes.answers);
    }
  }, [todayStr, activeTab]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Ready countdown loop (3, 2, 1, GO!)
  useEffect(() => {
    if (phase === 'READY') {
      setReadyCountdown(3);
      sound.playClick();
      const interval = setInterval(() => {
        setReadyCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            startGamePlay();
            return 0;
          }
          sound.playClick();
          return prev - 1;
        });
      }, 700);

      return () => clearInterval(interval);
    }
  }, [phase]);

  // Per-riddle 60-second speed timer (resets to 60s for each question)
  useEffect(() => {
    if (phase === 'PLAYING') {
      lastTickSecondRef.current = 10;
      setSecondsLeft(60);
      questionStartTimeRef.current = Date.now();

      timerIntervalRef.current = window.setInterval(() => {
        const elapsedSec = (Date.now() - questionStartTimeRef.current) / 1000;
        const remaining = Math.max(0, 60 - elapsedSec);

        setSecondsLeft(remaining);

        if (remaining <= 10 && Math.floor(remaining) < lastTickSecondRef.current) {
          lastTickSecondRef.current = Math.floor(remaining);
          sound.playTick();
        }

        if (remaining <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          handleRiddleTimeout();
        }
      }, 100);

      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };
    }
  }, [phase, currentIndex]);

  const initiateGame = (mode: GameMode) => {
    setGameMode(mode);
    setActiveTab(mode);

    if (mode === 'daily') {
      const dailyQuestions = getDailyRiddles(todayStr);
      setRiddles(dailyQuestions);
    } else {
      const practiceQuestions = getRandomRiddles(7);
      setRiddles(practiceQuestions);
    }

    setCurrentIndex(0);
    setPlayerAnswers([]);
    setSecondsLeft(60);
    setPhase('READY');
  };

  const startGamePlay = () => {
    setSecondsLeft(60);
    gameStartTimeRef.current = Date.now();
    questionStartTimeRef.current = Date.now();
    setPhase('PLAYING');
  };

  // Called when user submits a correct or typo-tolerated answer
  const handleAnswerCorrect = (userTyped: string, targetAnswer: string) => {
    if (phase !== 'PLAYING') return;

    const currentRiddle = riddles[currentIndex];
    const timeSpent = Math.min(60, (Date.now() - questionStartTimeRef.current) / 1000);

    const answerRecord: PlayerAnswer = {
      riddleId: currentRiddle.id,
      userTyped,
      targetAnswer,
      isCorrect: true,
      timeSpentSec: Number(timeSpent.toFixed(1)),
    };

    const updatedAnswers = [...playerAnswers, answerRecord];
    setPlayerAnswers(updatedAnswers);

    if (currentIndex + 1 >= riddles.length) {
      finishGame(updatedAnswers);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Skip question to end
  const handleSkip = () => {
    if (phase !== 'PLAYING' || riddles.length <= 1) return;
    sound.playClick();
    
    const currentRiddle = riddles[currentIndex];
    const newRiddles = [...riddles];
    newRiddles.splice(currentIndex, 1);
    newRiddles.push(currentRiddle);
    setRiddles(newRiddles);
    questionStartTimeRef.current = Date.now();
    setSecondsLeft(60);
  };

  // Called when 60s expires on the current riddle
  const handleRiddleTimeout = () => {
    sound.playWrong();
    const currentRiddle = riddles[currentIndex];
    const timeoutRecord: PlayerAnswer = {
      riddleId: currentRiddle.id,
      userTyped: 'Time expired (60s)',
      targetAnswer: currentRiddle.answer,
      isCorrect: false,
      timeSpentSec: 60,
    };

    const updatedAnswers = [...playerAnswers, timeoutRecord];
    setPlayerAnswers(updatedAnswers);

    if (currentIndex + 1 >= riddles.length) {
      finishGame(updatedAnswers);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const finishGame = (answers: PlayerAnswer[]) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const totalTimeUsed = Number(
      answers.reduce((acc, a) => acc + (a.timeSpentSec || 0), 0).toFixed(1)
    );
    const maxTotalTime = 7 * 60; // 420s total
    const timeRemaining = Math.max(0, maxTotalTime - totalTimeUsed);
    const correctCount = answers.filter((a) => a.isCorrect).length;

    const resultObj: DailyResult = {
      date: todayStr,
      dayNumber: todayDayNumber,
      score: correctCount,
      totalQuestions: 7,
      timeUsed: totalTimeUsed,
      timeRemaining: Number(timeRemaining.toFixed(1)),
      percentile: 0,
      ratingScore: 0,
      answers,
      completedAt: new Date().toISOString(),
    };

    const isDaily = gameMode === 'daily';
    const updatedStats = recordGameCompletion(resultObj, isDaily);
    setStats({ ...updatedStats });
    setActiveResult(resultObj);
    setPhase('SUMMARY');
  };

  const handleResetStats = () => {
    const freshStats: PlayerStats = {
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
    savePlayerStats(freshStats);
    setStats(freshStats);
    setActiveResult(null);
    setPhase('INTRO');
    setIsStatsOpen(false);
  };

  const currentRiddle = riddles[currentIndex];
  const correctCountSoFar = playerAnswers.filter((a) => a.isCorrect).length;

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-900 flex flex-col selection:bg-[#EEF2E6]">
      
      {/* Top Bar Header */}
      <Header
        currentStreak={stats.currentStreak}
        hasPlayedToday={alreadyPlayedToday}
        onOpenStats={() => {
          sound.playClick();
          setIsStatsOpen(true);
        }}
        onOpenRules={() => {
          sound.playClick();
          setIsRulesOpen(true);
        }}
        onGoHome={() => {
          sound.playClick();
          setActiveTab('daily');
          if (alreadyPlayedToday && stats.todayDailyResult) {
            setActiveResult(stats.todayDailyResult);
            setPhase('SUMMARY');
          } else {
            setPhase('INTRO');
          }
        }}
        onPracticeClick={() => {
          sound.playClick();
          initiateGame('practice');
        }}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = sound.toggleMute();
          setIsMuted(next);
        }}
        activeTab={activeTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 md:py-10 flex flex-col justify-center">
        
        {/* PHASE 1: READY COUNTDOWN (3, 2, 1) */}
        {phase === 'READY' && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="text-xs uppercase tracking-widest text-stone-500 font-bold mb-3">
              {gameMode === 'daily' ? `Daily Challenge #${todayDayNumber}` : 'Practice Mode'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-6">
              Get Ready! 60 Seconds For Each Riddle.
            </h2>
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#EEF2E6] border-2 border-[#C6D3B6] text-[#4D5E2B] flex items-center justify-center text-5xl sm:text-7xl font-black font-mono shadow-lg shadow-[#6B7F38]/15 animate-pulse">
              {readyCountdown > 0 ? readyCountdown : 'GO!'}
            </div>
            <p className="text-xs text-stone-500 mt-6 max-w-xs font-medium">
              You have 60 seconds for each riddle. Minor typos are accepted!
            </p>
          </div>
        )}

        {/* PHASE 2: PLAYING ACTIVE SPEED ROUND */}
        {phase === 'PLAYING' && currentRiddle && (
          <div className="w-full">
            <DailyTimerBar
              secondsLeft={secondsLeft}
              totalSeconds={60}
              currentIndex={currentIndex}
              totalQuestions={riddles.length}
              answeredCount={playerAnswers.length}
              correctCount={correctCountSoFar}
            />

            <GameCard
              riddle={currentRiddle}
              currentIndex={currentIndex}
              totalQuestions={riddles.length}
              onAnswerCorrect={handleAnswerCorrect}
              onSkip={handleSkip}
              canSkip={riddles.length > 1}
            />
          </div>
        )}

        {/* PHASE 3: SUMMARY / RESULTS */}
        {phase === 'SUMMARY' && activeResult && (
          <ResultSummary
            result={activeResult}
            stats={stats}
            isDaily={gameMode === 'daily'}
            onPlayPractice={() => initiateGame('practice')}
            onReviewAnswers={() => {
              sound.playClick();
              setIsReviewOpen(true);
            }}
            onGoHome={() => {
              sound.playClick();
              setPhase('INTRO');
            }}
          />
        )}

        {/* PHASE 4: INTRO / LANDING VIEW */}
        {phase === 'INTRO' && (
          <div className="w-full space-y-8 animate-fade-in">
            
            {/* Hero Card */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Left Column: Text & Primary CTA */}
                <div className="md:col-span-7 space-y-5 text-left">
                  
                  {/* Clean unboxed metadata separator */}
                  <div className="flex items-center gap-2 text-xs font-bold text-[#4D5E2B]">
                    <span>Daily Challenge #{todayDayNumber}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span>7 Riddles</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span>60s Per Riddle</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span>Type Answers</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
                    Type & solve with <span className="text-[#5A6F32]">60 seconds</span> per riddle.
                  </h1>

                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                    A fast daily brain sprint. No multiple choice—type your answer directly! 
                    You have a full 60 seconds for each riddle. Typos and close spellings are automatically forgiven.
                  </p>

                  {/* Daily Streak Status Box */}
                  <div className="p-4 bg-[#FAF8F5] border border-stone-200 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Flame className={`w-5 h-5 ${stats.currentStreak > 0 ? 'text-[#6B7F38] fill-[#7B8E54]' : 'text-stone-400'}`} />
                      <div>
                        <div className="font-bold text-stone-900">
                          {stats.currentStreak > 0
                            ? `Daily Streak: ${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`
                            : 'Start your daily streak today!'}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {alreadyPlayedToday
                            ? 'Today’s sprint is recorded in your browser!'
                            : 'Play instantly without any login'}
                        </div>
                      </div>
                    </div>
                    {stats.maxStreak > 0 && (
                      <span className="font-mono text-stone-500">
                        Record: <strong className="text-stone-800">{stats.maxStreak}</strong>
                      </span>
                    )}
                  </div>

                  {/* CTAs in Olive Green */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {alreadyPlayedToday ? (
                      <button
                        onClick={() => {
                          const todayRes = getTodayDailyResult();
                          if (todayRes) {
                            setActiveResult(todayRes);
                            setRiddles(getDailyRiddles(todayStr));
                            setPhase('SUMMARY');
                          }
                        }}
                        className="px-6 py-3.5 bg-[#6B7F38] hover:bg-[#5C6E30] text-white font-bold rounded-2xl transition-all shadow-md shadow-[#6B7F38]/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>View Today’s Result</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => initiateGame('daily')}
                        className="px-7 py-3.5 bg-[#6B7F38] hover:bg-[#5C6E30] text-white font-bold text-base rounded-2xl transition-all shadow-md shadow-[#6B7F38]/25 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99] group"
                      >
                        <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                        <span>Start Daily Challenge (60s/riddle)</span>
                      </button>
                    )}

                    <button
                      onClick={() => initiateGame('practice')}
                      className="px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm rounded-2xl border border-stone-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-[#5A6F32]" />
                      <span>Practice Mode</span>
                    </button>
                  </div>

                </div>

                {/* Right Column: Beige Owl Artwork */}
                <div className="md:col-span-5 flex flex-col items-center justify-center">
                  <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border border-stone-200 shadow-sm group">
                    <img
                      src={MASCOT_IMAGE}
                      alt="Wise sage owl with spectacles"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent flex items-end p-4">
                      <div className="text-left">
                        <span className="text-[11px] font-bold text-[#D3DEBD] uppercase tracking-wider block">
                          Daily Owl Sage
                        </span>
                        <span className="text-xs text-white font-medium">
                          7 questions · 60s per riddle
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-[#EEF2E6] text-[#4D5E2B] flex items-center justify-center mb-3 font-bold">
                  <Keyboard className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 mb-1">
                  Type Answers Directly
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  No multiple-choice spoilers! Type what comes to mind. Minor typos and misspellings are recognized.
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-[#EEF2E6] text-[#4D5E2B] flex items-center justify-center mb-3 font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 mb-1">
                  Daily Percentile Rank
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  See what percentage of players you outperformed today on the normal distribution curve. Share like Wordle.
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-[#EEF2E6] text-[#4D5E2B] flex items-center justify-center mb-3 font-bold">
                  <Flame className="w-5 h-5 fill-[#6B7F38]" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 mb-1">
                  Daily Streak Without Login
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  No passwords or accounts needed. Your browser automatically preserves your consecutive daily streak.
                </p>
              </div>

            </div>

            {/* Banner Section */}
            <div className="rounded-3xl border border-stone-200 overflow-hidden relative shadow-xs">
              <img
                src={BANNER_IMAGE}
                alt="Hourglass with golden sand"
                className="w-full h-36 sm:h-44 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/60 to-transparent flex items-center px-6 sm:px-8">
                <div className="max-w-md">
                  <div className="flex items-center gap-2 text-[#D3DEBD] text-xs font-bold mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Daily Ritual</span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-white">
                    One minute a day for a sharper mind
                  </h4>
                  <p className="text-xs text-stone-200 mt-1">
                    New logic, math, and wordplay riddles unlock every night at midnight.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} Daily Riddle. 7 riddles in 60 seconds.
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => {
                sound.playClick();
                setIsRulesOpen(true);
              }}
              className="hover:text-stone-800 transition-colors cursor-pointer"
            >
              How to play
            </button>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <button
              onClick={() => {
                sound.playClick();
                setIsStatsOpen(true);
              }}
              className="hover:text-stone-800 transition-colors cursor-pointer"
            >
              Stats & streak
            </button>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>No sign-in required</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        riddles={riddles}
        answers={playerAnswers}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        onResetStats={handleResetStats}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

    </div>
  );
}
