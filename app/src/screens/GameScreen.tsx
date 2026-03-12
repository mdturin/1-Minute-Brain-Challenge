import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Modal } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import TimerBar from '../components/TimerBar';
import ScoreDisplay from '../components/ScoreDisplay';
import PrimaryButton from '../components/PrimaryButton';
import Card from '../components/Card';
import { generateRandomPuzzle, Puzzle } from '../logic/puzzles';
import MentalMathView from '../components/puzzles/MentalMathView';
import MemorySequenceView from '../components/puzzles/MemorySequenceView';
import LogicMiniView from '../components/puzzles/LogicMiniView';
import { updateStats } from '../storage/stats';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const GAME_DURATION_SECONDS = 60;

export default function GameScreen({ navigation }: Props) {
  const [remainingTime, setRemainingTime] = useState<number>(GAME_DURATION_SECONDS);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle>(() => generateRandomPuzzle());
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
    setCurrentPuzzle(generateRandomPuzzle());
  }, []);

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
      if (!isCorrect) {
        return prev;
      }
      return prev + 1;
    });

    setStreak((prev) => {
      const nextStreak = isCorrect ? prev + 1 : 0;
      if (!isCorrect) {
        return 0;
      }
      setMaxStreak((currentMax) => (nextStreak > currentMax ? nextStreak : currentMax));
      return nextStreak;
    });

    setCurrentPuzzle((prev) => generateRandomPuzzle(prev.type));
  };

  const handleBackToHome = () => {
    setShowSummary(false);
    navigation.replace('Home');
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
        <View style={styles.topBar}>
          <Text style={styles.screenTitle}>1 Minute Brain Challenge</Text>
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
  topBar: {
    marginBottom: 12,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e4e4e7',
    textAlign: 'center',
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

