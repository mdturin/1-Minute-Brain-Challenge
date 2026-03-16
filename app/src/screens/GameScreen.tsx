import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Modal, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import TimerBar from '../components/TimerBar';
import Card from '../components/Card';
import { generateRandomPuzzle, Puzzle } from '../logic/puzzles';
import { DIFFICULTIES, type Difficulty } from '../logic/difficulty';
import { calculateScoreForAnswer } from '../logic/scoring';
import MentalMathView from '../components/puzzles/MentalMathView';
import MemorySequenceView from '../components/puzzles/MemorySequenceView';
import LogicMiniView from '../components/puzzles/LogicMiniView';
import PatternVisualView from '../components/puzzles/PatternVisualView';
import { updateStats } from '../storage/stats';
import { canShowInterstitialNow, showInterstitialWithCallbacks } from '../logic/ads';

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
};

const PUZZLE_LABELS: Record<string, string> = {
  mental_math: 'Mental Math',
  memory_sequence: 'Memory Sequence',
  logic_mini: 'Logic Pattern',
  pattern_visual: 'Visual Pattern',
};

export default function GameScreen({ navigation, route }: Props) {
  const difficultyKey = route.params.difficulty;
  const difficultyConfig = DIFFICULTIES[difficultyKey];
  const accentColor = DIFFICULTY_COLORS[difficultyKey];

  const [remainingTime, setRemainingTime] = useState<number>(difficultyConfig.durationSeconds);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle>(() => generateRandomPuzzle(difficultyKey));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [status, setStatus] = useState<'playing' | 'finished'>('playing');
  const [showSummary, setShowSummary] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<'correct' | 'wrong' | null>(null);
  const [lastPoints, setLastPoints] = useState(0);

  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setRemainingTime(difficultyConfig.durationSeconds);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setPuzzlesSolved(0);
    setStatus('playing');
    setCurrentPuzzle(generateRandomPuzzle(difficultyKey));
  }, [difficultyKey]);

  useEffect(() => {
    if (status !== 'playing') return;
    if (remainingTime <= 0) {
      handleGameEnd();
      return;
    }
    const intervalId = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [remainingTime, status]);

  const handleGameEnd = async () => {
    if (status === 'finished') return;
    setStatus('finished');
    setShowSummary(true);
    try {
      await updateStats({ lastScore: score, lastMaxStreak: maxStreak });
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };

  const showFeedback = (type: 'correct' | 'wrong', points: number) => {
    setLastAnswer(type);
    setLastPoints(points);
    feedbackOpacity.setValue(1);
    Animated.timing(feedbackOpacity, {
      toValue: 0,
      duration: 800,
      useNativeDriver: false,
    }).start();
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (status !== 'playing' || remainingTime <= 0) return;

    const remainingFraction = remainingTime / difficultyConfig.durationSeconds;
    const delta = calculateScoreForAnswer({
      puzzle: currentPuzzle,
      difficulty: difficultyKey,
      isCorrect,
      remainingFraction,
    });

    setScore((prev) => prev + delta);

    if (isCorrect) {
      setPuzzlesSolved((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
      showFeedback('correct', delta);
    } else {
      setStreak(0);
      showFeedback('wrong', 0);
    }

    setCurrentPuzzle((prev) => generateRandomPuzzle(difficultyKey, prev.type));
  };

  const handleBackToHome = () => {
    const goHome = () => {
      setShowSummary(false);
      navigation.replace('Home');
    };
    if (canShowInterstitialNow()) {
      showInterstitialWithCallbacks(goHome, goHome);
    } else {
      goHome();
    }
  };

  const handlePlayAgain = () => {
    setShowSummary(false);
    setRemainingTime(difficultyConfig.durationSeconds);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setPuzzlesSolved(0);
    setStatus('playing');
    setCurrentPuzzle(generateRandomPuzzle(difficultyKey));
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
            onPress={() => navigation.replace('Home')}
            style={styles.backButton}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color="#e5e7eb" />
          </TouchableOpacity>

          <View style={[styles.difficultyBadge, { backgroundColor: accentColor }]}>
            <Text style={styles.difficultyText}>{difficultyConfig.label}</Text>
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

        {/* Puzzle Card */}
        <View style={styles.main}>
          <Card>{renderPuzzle()}</Card>
        </View>

        {/* Feedback Toast */}
        <Animated.View style={[styles.feedbackToast, { opacity: feedbackOpacity }]}>
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

        {/* Game Over Modal */}
        <Modal transparent visible={showSummary} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Ionicons name="trophy" size={48} color="#eab308" />
              <Text style={styles.modalTitle}>Game Over!</Text>

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

              <TouchableOpacity style={styles.modalPlayAgain} onPress={handlePlayAgain} activeOpacity={0.8}>
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.modalPlayAgainText}>Play Again</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalHomeButton} onPress={handleBackToHome} activeOpacity={0.8}>
                <Ionicons name="home-outline" size={18} color="#a5b4fc" />
                <Text style={styles.modalHomeText}>Back to Home</Text>
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
    paddingVertical: 12,
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
  modalHomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a5b4fc',
  },
});
