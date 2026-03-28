import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import BannerAd from '../components/BannerAd';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import TimerBar from '../components/TimerBar';
import Card from '../components/Card';
import { generateRandomPuzzle, Puzzle, PuzzleType } from '../logic/puzzles';
import { DIFFICULTIES, type Difficulty } from '../logic/difficulty';
import { calculateScoreForAnswer } from '../logic/scoring';
import MentalMathView from '../components/puzzles/MentalMathView';
import MemorySequenceView from '../components/puzzles/MemorySequenceView';
import LogicMiniView from '../components/puzzles/LogicMiniView';
import PatternVisualView from '../components/puzzles/PatternVisualView';
import WordScrambleView from '../components/puzzles/WordScrambleView';
import OddOneOutView from '../components/puzzles/OddOneOutView';
import SymbolCountView from '../components/puzzles/SymbolCountView';
import DualTaskView from '../components/puzzles/DualTaskView';
import InstructionFlipView from '../components/puzzles/InstructionFlipView';
import TimeDelayedView from '../components/puzzles/TimeDelayedView';
import ReverseLogicView from '../components/puzzles/ReverseLogicView';
import MultiStepView from '../components/puzzles/MultiStepView';
import FakePatternView from '../components/puzzles/FakePatternView';
import HiddenRuleView from '../components/puzzles/HiddenRuleView';
import RapidComparisonView from '../components/puzzles/RapidComparisonView';
import GoNoGoView from '../components/puzzles/GoNoGoView';
import StroopEffectView from '../components/puzzles/StroopEffectView';
import CountDistractionView from '../components/puzzles/CountDistractionView';
import SpotMisspellingView from '../components/puzzles/SpotMisspellingView';
import CategoryClashView from '../components/puzzles/CategoryClashView';
import { updateStats, loadStats, type GameStats } from '../storage/stats';
import { markTodayCompleted } from '../storage/dailyChallenge';
import { canShowInterstitialNow, showInterstitialWithCallbacks } from '../logic/ads';
import { maybeRequestReview } from '../logic/storeReview';
import { createSeededRng, seedFromDateString } from '../logic/seededRng';
import { localDateString } from '../logic/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: '#22c55e',
  medium: '#eab308',
  hard: '#ef4444',
};

const PUZZLE_ICONS: Record<string, string> = {
  mental_math: 'calculator-outline',
  memory_sequence: 'grid-outline',
  logic_mini: 'bulb-outline',
  pattern_visual: 'shapes-outline',
  word_scramble: 'text-outline',
  odd_one_out: 'remove-circle-outline',
  symbol_count: 'eye-outline',
  dual_task: 'layers-outline',
  instruction_flip: 'swap-horizontal-outline',
  time_delayed: 'timer-outline',
  reverse_logic: 'close-circle-outline',
  multi_step: 'git-merge-outline',
  fake_pattern: 'trending-up-outline',
  hidden_rule: 'key-outline',
  rapid_comparison: 'scale-outline',
  go_no_go: 'flash-outline',
  stroop_effect: 'color-palette-outline',
  count_distraction: 'star-outline',
  spot_misspelling: 'search-outline',
  category_clash: 'layers-outline',
};

const PUZZLE_LABELS: Record<string, string> = {
  mental_math: 'Mental Math',
  memory_sequence: 'Memory Sequence',
  logic_mini: 'Logic Pattern',
  pattern_visual: 'Visual Pattern',
  word_scramble: 'Word Scramble',
  odd_one_out: 'Odd One Out',
  symbol_count: 'Symbol Count',
  dual_task: 'Dual Task',
  instruction_flip: 'Instruction Flip',
  time_delayed: 'Time Delayed',
  reverse_logic: 'Reverse Logic',
  multi_step: 'Multi-Step',
  fake_pattern: 'Fake Pattern',
  hidden_rule: 'Hidden Rule',
  rapid_comparison: 'Rapid Comparison',
  go_no_go: 'Go / No-Go',
  stroop_effect: 'Color Conflict',
  count_distraction: 'Count & Filter',
  spot_misspelling: 'Spot the Mistake',
  category_clash: 'Category Clash',
};

export default function GameScreen({ navigation, route }: Props) {
  const difficultyKey = route.params.difficulty;
  const isDailyChallenge = route.params.isDailyChallenge ?? false;
  const difficultyConfig = DIFFICULTIES[difficultyKey];
  const accentColor = isDailyChallenge ? '#fbbf24' : DIFFICULTY_COLORS[difficultyKey];

  // Seeded RNG for daily challenge — created once, advances with each call
  const rngRef = useRef<(() => number) | undefined>(
    isDailyChallenge
      ? createSeededRng(seedFromDateString(localDateString()))
      : undefined,
  );

  const [remainingTime, setRemainingTime] = useState<number>(difficultyConfig.durationSeconds);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle>(
    () => generateRandomPuzzle(difficultyKey, [], rngRef.current),
  );
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);

  // Refs so handleGameEnd always reads the latest values regardless of closure timing
  const scoreRef = useRef(0);
  const maxStreakRef = useRef(0);
  const puzzlesSolvedRef = useRef(0);
  const recentTypesRef = useRef<PuzzleType[]>([]);
  const [status, setStatus] = useState<'playing' | 'finished'>('playing');
  const [showSummary, setShowSummary] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<'correct' | 'wrong' | null>(null);
  const [lastPoints, setLastPoints] = useState(0);
  const [savedStats, setSavedStats] = useState<GameStats | null>(null);

  // Refs are updated synchronously inside state setters (see handleAnswer / setStreak callbacks)

  // Load existing stats once on mount so they're ready when game ends
  useEffect(() => {
    loadStats().then(setSavedStats).catch(() => {});
  }, []);

  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const isAnsweringRef = useRef(false);
  const [puzzleKey, setPuzzleKey] = useState(0);

  // Reset double-tap guard whenever a new puzzle is issued.
  // Using puzzleKey (always increments) instead of currentPuzzle so that
  // if puzzle generation ever fails silently the guard still resets and
  // the buttons never lock permanently.
  useEffect(() => {
    isAnsweringRef.current = false;
  }, [puzzleKey]);

  useEffect(() => {
    setRemainingTime(difficultyConfig.durationSeconds);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setPuzzlesSolved(0);
    setStatus('playing');
    scoreRef.current = 0;
    maxStreakRef.current = 0;
    puzzlesSolvedRef.current = 0;
    recentTypesRef.current = [];
    setCurrentPuzzle(generateRandomPuzzle(difficultyKey, [], rngRef.current));
    setPuzzleKey((k) => k + 1);
  }, [difficultyKey]);

  useEffect(() => {
    if (status !== 'playing') return;
    const intervalId = setInterval(() => {
      setRemainingTime((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [status]);

  useEffect(() => {
    if (remainingTime === 0 && status === 'playing') {
      handleGameEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingTime]);

  const handleGameEnd = async () => {
    if (status === 'finished') return;
    // Read from refs to avoid stale closure (score/maxStreak state may lag behind)
    const finalScore = scoreRef.current;
    const finalMaxStreak = maxStreakRef.current;
    setStatus('finished');
    setShowSummary(true);
    try {
      if (isDailyChallenge) {
        await markTodayCompleted(finalScore);
      }
      await updateStats({ lastScore: finalScore, lastMaxStreak: finalMaxStreak });
      // Update local stats snapshot so the summary modal shows fresh values
      setSavedStats((prev) => {
        const base = prev ?? { bestScore: 0, gamesPlayed: 0, totalScore: 0, bestStreak: 0, currentDayStreak: 0, longestDayStreak: 0, lastPlayedDate: '' };
        return {
          ...base,
          bestScore: Math.max(base.bestScore, finalScore),
          gamesPlayed: base.gamesPlayed + 1,
          totalScore: base.totalScore + finalScore,
          bestStreak: Math.max(base.bestStreak, finalMaxStreak),
        };
      });
    } catch (error) {
      console.error("Error updating stats:", error);
    }
    // Prompt for app store review after enough games (non-blocking)
    void maybeRequestReview(puzzlesSolvedRef.current + 1);
  };

  const showFeedback = (type: 'correct' | 'wrong', points: number) => {
    setLastAnswer(type);
    setLastPoints(points);
    feedbackOpacity.stopAnimation();
    feedbackOpacity.setValue(1);
    Animated.timing(feedbackOpacity, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (status !== 'playing' || remainingTime <= 0 || isAnsweringRef.current) return;
    isAnsweringRef.current = true;

    const remainingFraction = remainingTime / difficultyConfig.durationSeconds;
    const delta = calculateScoreForAnswer({
      puzzle: currentPuzzle,
      difficulty: difficultyKey,
      isCorrect,
      remainingFraction,
    });

    setScore((prev) => {
      const next = prev + delta;
      scoreRef.current = next;  // sync ref immediately
      return next;
    });

    if (isCorrect) {
      setPuzzlesSolved((prev) => {
        const next = prev + 1;
        puzzlesSolvedRef.current = next;
        return next;
      });
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((m) => {
        const newMax = Math.max(m, newStreak);
        maxStreakRef.current = newMax;
        return newMax;
      });
      showFeedback('correct', delta);
    } else {
      setStreak(0);
      showFeedback('wrong', 0);
    }

    setPuzzleKey((k) => k + 1);
    setCurrentPuzzle((prev) => {
      const updatedRecent = [...recentTypesRef.current, prev.type].slice(-4);
      recentTypesRef.current = updatedRecent;
      return generateRandomPuzzle(difficultyKey, updatedRecent, rngRef.current);
    });
  };

  const goBack = () => {
    if (isDailyChallenge) {
      navigation.replace('DailyChallenge');
    } else {
      navigation.replace('Home', savedStats ? {
        updatedStats: {
          bestScore: savedStats.bestScore,
          gamesPlayed: savedStats.gamesPlayed,
          totalScore: savedStats.totalScore,
        },
      } : undefined);
    }
  };

  const handleBackToHome = () => {
    if (adLoading) return;
    const go = () => {
      setAdLoading(false);
      setShowSummary(false);
      goBack();
    };
    if (canShowInterstitialNow()) {
      setAdLoading(true);
      showInterstitialWithCallbacks(go, go);
    } else {
      go();
    }
  };

  const handlePlayAgain = () => {
    if (adLoading) return;
    const resetAndPlay = () => {
      setAdLoading(false);
      setShowSummary(false);
      setRemainingTime(difficultyConfig.durationSeconds);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setPuzzlesSolved(0);
      setStatus('playing');
      recentTypesRef.current = [];
      setCurrentPuzzle(generateRandomPuzzle(difficultyKey, [], rngRef.current));
      setPuzzleKey((k) => k + 1);
      scoreRef.current = 0;
      maxStreakRef.current = 0;
      puzzlesSolvedRef.current = 0;
    };
    if (canShowInterstitialNow()) {
      setAdLoading(true);
      showInterstitialWithCallbacks(resetAndPlay, resetAndPlay);
    } else {
      resetAndPlay();
    }
  };

  const progress = useMemo(
    () => remainingTime / difficultyConfig.durationSeconds,
    [remainingTime, difficultyConfig.durationSeconds]
  );

  const renderPuzzle = () => {
    switch (currentPuzzle.type) {
      case 'mental_math':
        return <MentalMathView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'memory_sequence':
        return <MemorySequenceView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'logic_mini':
        return <LogicMiniView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'pattern_visual':
        return <PatternVisualView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'word_scramble':
        return <WordScrambleView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'odd_one_out':
        return <OddOneOutView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'symbol_count':
        return <SymbolCountView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'dual_task':
        return <DualTaskView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'instruction_flip':
        return <InstructionFlipView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'time_delayed':
        return <TimeDelayedView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'reverse_logic':
        return <ReverseLogicView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'multi_step':
        return <MultiStepView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'fake_pattern':
        return <FakePatternView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'hidden_rule':
        return <HiddenRuleView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'rapid_comparison':
        return <RapidComparisonView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'go_no_go':
        return <GoNoGoView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'stroop_effect':
        return <StroopEffectView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'count_distraction':
        return <CountDistractionView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'spot_misspelling':
        return <SpotMisspellingView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'category_clash':
        return <CategoryClashView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      default:
        return null;
    }
  };

  const avgTimePerPuzzle = puzzlesSolved > 0
    ? ((difficultyConfig.durationSeconds - remainingTime) / puzzlesSolved).toFixed(1)
    : '0.0';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={goBack}
            style={styles.backButton}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color="#e5e7eb" />
          </TouchableOpacity>

          <View style={[styles.difficultyBadge, { backgroundColor: accentColor }]}>
            {isDailyChallenge
              ? <Text style={styles.difficultyText}>Daily Challenge</Text>
              : <Text style={styles.difficultyText}>{difficultyConfig.label}</Text>
            }
          </View>

          <View style={styles.scoreChip}>
            <Text style={styles.scoreChipValue}>{score}</Text>
          </View>
        </View>

        {/* Timer */}
        <TimerBar progress={progress} remainingSeconds={remainingTime} />

        {/* Puzzle Type Indicator */}
        <View style={styles.puzzleTypeRow}>
          <Ionicons
            name={(PUZZLE_ICONS[currentPuzzle.type] || 'help-outline') as any}
            size={16}
            color="#94a3b8"
          />
          <Text style={styles.puzzleTypeText}>
            {PUZZLE_LABELS[currentPuzzle.type] || currentPuzzle.type}
          </Text>
        </View>

        {/* Puzzle Card — key forces full remount on each new puzzle so that
            components with internal phase state (DualTaskView, TimeDelayedView)
            always start fresh instead of resuming a stale phase. */}
        <View key={puzzleKey} style={styles.main}>
          <Card>{renderPuzzle()}</Card>
        </View>

        {/* Feedback Toast */}
        <Animated.View pointerEvents="none" style={[styles.feedbackToast, { opacity: feedbackOpacity }]}>
          {lastAnswer === 'correct' ? (
            <View style={styles.feedbackRow}>
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <Text style={[styles.feedbackText, { color: '#22c55e' }]}>+{lastPoints} pts</Text>
            </View>
          ) : (
            <View style={styles.feedbackRow}>
              <Ionicons name="close-circle" size={18} color="#ef4444" />
              <Text style={[styles.feedbackText, { color: '#ef4444' }]}>Wrong!</Text>
            </View>
          )}
        </Animated.View>

        {/* Bottom Score/Streak */}
        <View style={styles.bottom}>
          <View style={styles.bottomCard}>
            <View style={styles.bottomStat}>
              {streak >= 3 && <Ionicons name="flame" size={18} color="#ef4444" />}
              <Text style={styles.bottomStatLabel}>Streak</Text>
              <Text style={[styles.bottomStatValue, { color: '#60a5fa' }]}>{streak}</Text>
            </View>
          </View>
          <View style={styles.bottomCard}>
            <View style={styles.bottomStat}>
              <Ionicons name="checkmark-done" size={18} color="#22c55e" />
              <Text style={styles.bottomStatLabel}>Solved</Text>
              <Text style={[styles.bottomStatValue, { color: '#22c55e' }]}>{puzzlesSolved}</Text>
            </View>
          </View>
        </View>

        {/* Banner Ad */}
        <BannerAd />

        {/* Game Over Modal */}
        <Modal transparent visible={showSummary} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              {isDailyChallenge
                ? <Ionicons name="calendar" size={48} color="#fbbf24" />
                : <Ionicons name="trophy" size={48} color="#eab308" />
              }
              <Text style={styles.modalTitle}>
                {isDailyChallenge ? 'Daily Complete!' : 'Game Over!'}
              </Text>

              <View style={styles.modalScoreCard}>
                <Text style={styles.modalScoreLabel}>Final Score</Text>
                <Text style={styles.modalScoreValue}>{score.toLocaleString()}</Text>
              </View>

              <View style={styles.modalStatsRow}>
                <View style={styles.modalStatItem}>
                  <Text style={styles.modalStatValue}>{puzzlesSolved}</Text>
                  <Text style={styles.modalStatLabel}>Solved</Text>
                </View>
                <View style={styles.modalStatDivider} />
                <View style={styles.modalStatItem}>
                  <Text style={styles.modalStatValue}>{maxStreak}</Text>
                  <Text style={styles.modalStatLabel}>Best Streak</Text>
                </View>
                <View style={styles.modalStatDivider} />
                <View style={styles.modalStatItem}>
                  <Text style={styles.modalStatValue}>{avgTimePerPuzzle}s</Text>
                  <Text style={styles.modalStatLabel}>Avg Time</Text>
                </View>
              </View>

              {savedStats && (
                <View style={styles.modalAllTimeRow}>
                  <View style={styles.modalAllTimeItem}>
                    <Text style={styles.modalAllTimeLabel}>All-Time Best</Text>
                    <Text style={styles.modalAllTimeValue}>{savedStats.bestScore.toLocaleString()}</Text>
                  </View>
                  <View style={styles.modalAllTimeDivider} />
                  <View style={styles.modalAllTimeItem}>
                    <Text style={styles.modalAllTimeLabel}>Avg Score</Text>
                    <Text style={styles.modalAllTimeValue}>
                      {savedStats.gamesPlayed > 0
                        ? Math.round(savedStats.totalScore / savedStats.gamesPlayed).toLocaleString()
                        : '—'}
                    </Text>
                  </View>
                  <View style={styles.modalAllTimeDivider} />
                  <View style={styles.modalAllTimeItem}>
                    <Text style={styles.modalAllTimeLabel}>Games</Text>
                    <Text style={styles.modalAllTimeValue}>{savedStats.gamesPlayed}</Text>
                  </View>
                </View>
              )}

              {!isDailyChallenge && (
                <TouchableOpacity
                  style={[styles.modalPlayAgain, adLoading && styles.modalButtonDisabled]}
                  onPress={handlePlayAgain}
                  activeOpacity={0.8}
                  disabled={adLoading}
                >
                  {adLoading ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.modalPlayAgainText}>Loading…</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="refresh" size={18} color="#fff" />
                      <Text style={styles.modalPlayAgainText}>Play Again</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.modalHomeButton, isDailyChallenge && styles.modalHomeButtonPrimary, adLoading && styles.modalButtonDisabled]}
                onPress={handleBackToHome}
                activeOpacity={0.8}
                disabled={adLoading}
              >
                {adLoading ? (
                  <>
                    <ActivityIndicator size="small" color={isDailyChallenge ? '#fbbf24' : '#a5b4fc'} />
                    <Text style={[styles.modalHomeText, isDailyChallenge && styles.modalHomeTextDaily]}>
                      Loading…
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name={isDailyChallenge ? 'calendar-outline' : 'home-outline'}
                      size={18}
                      color={isDailyChallenge ? '#fbbf24' : '#a5b4fc'}
                    />
                    <Text style={[styles.modalHomeText, isDailyChallenge && styles.modalHomeTextDaily]}>
                      {isDailyChallenge ? 'See Daily History' : 'Back to Home'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050816',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  difficultyBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  scoreChip: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  scoreChipValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#22c55e',
  },
  puzzleTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  puzzleTypeText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  main: {
    flex: 1,
    marginTop: 4,
  },
  feedbackToast: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    backgroundColor: 'rgba(17,24,39,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '700',
  },
  bottom: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  bottomCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bottomStat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bottomStatLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  bottomStatValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 360,
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.15)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f9fafb',
    marginTop: 8,
    marginBottom: 16,
  },
  modalScoreCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
  },
  modalScoreLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalScoreValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#22c55e',
  },
  modalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalStatItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f9fafb',
  },
  modalStatLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  modalStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#1e293b',
  },
  modalAllTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.1)',
  },
  modalAllTimeItem: {
    flex: 1,
    alignItems: 'center',
  },
  modalAllTimeLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modalAllTimeValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#a5b4fc',
  },
  modalAllTimeDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1e293b',
  },
  modalPlayAgain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    marginBottom: 10,
  },
  modalPlayAgainText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.3)',
    width: '100%',
  },
  modalHomeButtonPrimary: {
    borderColor: 'rgba(251,191,36,0.4)',
    backgroundColor: 'rgba(251,191,36,0.08)',
  },
  modalHomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a5b4fc',
  },
  modalHomeTextDaily: {
    color: '#fbbf24',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
});
