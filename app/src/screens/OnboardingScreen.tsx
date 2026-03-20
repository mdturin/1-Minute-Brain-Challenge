import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const PAGES = [
  {
    icon: 'bulb' as const,
    iconColor: '#a5b4fc',
    title: '7 Puzzle Types',
    description: 'Mental Math, Memory Sequences, Logic Patterns, Visual Puzzles, Word Scramble, Odd One Out & Symbol Count.',
  },
  {
    icon: 'flame' as const,
    iconColor: '#ef4444',
    title: 'Build Your Streak',
    description: 'Answer correctly to build combos. The faster you answer, the more bonus points you earn. Keep your streak alive!',
  },
  {
    icon: 'trophy' as const,
    iconColor: '#eab308',
    title: 'Choose Your Difficulty',
    description: 'Easy (60s), Medium (120s), or Hard (180s). Higher difficulty means tougher puzzles but bigger score multipliers.',
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [page, setPage] = useState(0);
  const current = PAGES[page];

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
  };

  const handleNext = async () => {
    if (page < PAGES.length - 1) {
      setPage(page + 1);
    } else {
      await completeOnboarding();
      navigation.replace('Home');
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Skip */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name={current.icon} size={56} color={current.iconColor} />
          </View>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.description}>{current.description}</Text>
        </View>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === page ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.nextText}>
            {page < PAGES.length - 1 ? 'Next' : "Let's Go!"}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  skipButton: {
    alignSelf: 'flex-end',
  },
  skipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(165,180,252,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f9fafb',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: '#6366f1',
    width: 28,
    borderRadius: 5,
  },
  dotInactive: {
    backgroundColor: '#1e293b',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 14,
  },
  nextText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
