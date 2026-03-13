import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import TimerBar from '../components/TimerBar';
import ScoreDisplay from '../components/ScoreDisplay';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { generateRandomPuzzle, Puzzle } from '../logic/puzzles';
import { DIFFICULTIES } from '../logic/difficulty';
import { calculateScoreForAnswer } from '../logic/scoring';
import MentalMathView from '../components/puzzles/MentalMathView';
import MemorySequenceView from '../components/puzzles/MemorySequenceView';
import LogicMiniView from '../components/puzzles/LogicMiniView';
import { updateStats } from '../storage/stats';
import { canShowInterstitialNow, showInterstitialWithCallbacks } from '../logic/ads';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const GAME_DURATION_SECONDS = 60;

export default function GameScreen({ navigation, route }: Props) {
  const difficultyKey = route.params.difficulty;
  const difficultyConfig = DIFFICULTIES[difficultyKey];

  const [remainingTime, setRemainingTime] = useState<number>(GAME_DURATION_SECONDS);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle>(() => generateRandomPuzzle(difficultyKey));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [status, setStatus] = useState<'playing' | 'finished'>('playing');
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    setRemainingTime(GAME_DURATION_SECONDS);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setStatus('playing');
    setCurrentPuzzle(generateRandomPuzzle(difficultyKey));
  }, [difficultyKey]);

  useEffect(() => {
    if (status !== 'playing') {
      return;
    }

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
    if (status === 'finished') {
      return;
    }
    setStatus('finished');
    setShowSummary(true);
    await updateStats({ lastScore: score, lastMaxStreak: maxStreak });
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (status !== 'playing' || remainingTime <= 0) {
      return;
    }

    setScore((prev) => {
      const remainingFraction = remainingTime / GAME_DURATION_SECONDS;
      const delta = calculateScoreForAnswer({
        puzzle: currentPuzzle,
        difficulty: difficultyKey,
        isCorrect,
        remainingFraction,
      });
      return prev + delta;
    });

    setStreak((prev) => {
      const nextStreak = isCorrect ? prev + 1 : 0;
      if (!isCorrect) {
        return 0;
      }
      setMaxStreak((currentMax) => (nextStreak > currentMax ? nextStreak : currentMax));
      return nextStreak;
    });

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

  const progress = useMemo(
    () => remainingTime / GAME_DURATION_SECONDS,
    [remainingTime]
  );

  const renderPuzzle = () => {
    switch (currentPuzzle.type) {
      case 'mental_math':
        return <MentalMathView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'memory_sequence':
        return <MemorySequenceView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      case 'logic_mini':
        return <LogicMiniView puzzle={currentPuzzle} onAnswer={handleAnswer} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            onPress={() => navigation.replace('Home')}
            style={styles.backButton}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color="#e5e7eb" />
          </TouchableOpacity>
        </View>

        <View style={styles.topBar}>
          <Text style={styles.screenTitle}>1 Minute Brain Challenge</Text>
          <Text style={styles.difficultyBadge}>{difficultyConfig.label}</Text>
        </View>

        <TimerBar progress={progress} remainingSeconds={remainingTime} />

        <View style={styles.main}>
          <Card>{renderPuzzle()}</Card>
        </View>

        <View style={styles.bottom}>
          <ScoreDisplay score={score} streak={streak} />
        </View>

        <Modal transparent visible={showSummary} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Time&apos;s up!</Text>
              <Text style={styles.modalScoreLabel}>Final Score</Text>
              <Text style={styles.modalScoreValue}>{score}</Text>
              <Text style={styles.modalDetail}>Best streak this game: {maxStreak}</Text>
              <PrimaryButton label="Back to Home" onPress={handleBackToHome} />
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
    paddingVertical: 16,
    backgroundColor: '#050816',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  topBar: {
    marginBottom: 12,
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e4e4e7',
    textAlign: 'center',
  },
  difficultyBadge: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#1d4ed8',
    color: '#e5e7eb',
    fontSize: 12,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    marginTop: 12,
  },
  bottom: {
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f4f4f5',
    marginBottom: 12,
  },
  modalScoreLabel: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  modalScoreValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#22c55e',
    marginVertical: 8,
  },
  modalDetail: {
    fontSize: 14,
    color: '#e4e4e7',
    marginBottom: 16,
  },
});

