import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

type InfoRowProps = {
  icon: string;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
};

function InfoRow({ icon, iconColor, label, value, onPress }: InfoRowProps) {
  return (
    <TouchableOpacity
      style={styles.infoRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.infoRowLeft}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      {value && <Text style={styles.infoValue}>{value}</Text>}
      {onPress && <Ionicons name="chevron-forward" size={16} color="#475569" />}
    </TouchableOpacity>
  );
}

const PUZZLE_TYPES = [
  { icon: 'calculator-outline', color: '#60a5fa', label: 'Mental Math' },
  { icon: 'grid-outline', color: '#a5b4fc', label: 'Pattern Visual' },
  { icon: 'bulb-outline', color: '#eab308', label: 'Logic Mini' },
  { icon: 'layers-outline', color: '#22c55e', label: 'Memory Sequence' },
];

const BUILT_WITH = [
  { icon: 'logo-react', color: '#61dafb', label: 'React Native & Expo' },
  { icon: 'flame-outline', color: '#f97316', label: 'Firebase' },
  { icon: 'phone-portrait-outline', color: '#a5b4fc', label: 'TypeScript' },
];

export default function AboutScreen({ navigation }: Props) {
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#e5e7eb" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>About</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* App Identity */}
        <View style={styles.heroCard}>
          <View style={styles.appIconWrapper}>
            <Ionicons name="flash" size={40} color="#a5b4fc" />
          </View>
          <Text style={styles.appName}>1 Minute Brain Challenge</Text>
          <Text style={styles.appTagline}>Train your brain, one minute at a time.</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionBadgeText}>v{appVersion}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardBody}>
            1 Minute Brain Challenge is a fast-paced brain training game designed to sharpen your mental agility through short, focused puzzle sessions. Race against the clock, build streaks, and push your cognitive limits across four unique puzzle types.
          </Text>
        </View>

        {/* Puzzle Types */}
        <Text style={styles.sectionTitle}>Puzzle Types</Text>
        <View style={styles.listCard}>
          {PUZZLE_TYPES.map((item, index) => (
            <React.Fragment key={item.label}>
              <InfoRow icon={item.icon} iconColor={item.color} label={item.label} />
              {index < PUZZLE_TYPES.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Difficulty Levels */}
        <Text style={styles.sectionTitle}>Difficulty Levels</Text>
        <View style={styles.difficultyGrid}>
          <View style={[styles.difficultyCard, { borderColor: 'rgba(34,197,94,0.3)' }]}>
            <Text style={[styles.difficultyLabel, { color: '#22c55e' }]}>Easy</Text>
            <Text style={styles.difficultyDesc}>60 seconds{'\n'}1× score</Text>
          </View>
          <View style={[styles.difficultyCard, { borderColor: 'rgba(234,179,8,0.3)' }]}>
            <Text style={[styles.difficultyLabel, { color: '#eab308' }]}>Medium</Text>
            <Text style={styles.difficultyDesc}>120 seconds{'\n'}1.5× score</Text>
          </View>
          <View style={[styles.difficultyCard, { borderColor: 'rgba(239,68,68,0.3)' }]}>
            <Text style={[styles.difficultyLabel, { color: '#ef4444' }]}>Hard</Text>
            <Text style={styles.difficultyDesc}>180 seconds{'\n'}2× score</Text>
          </View>
        </View>

        {/* Built With */}
        <Text style={styles.sectionTitle}>Built With</Text>
        <View style={styles.listCard}>
          {BUILT_WITH.map((item, index) => (
            <React.Fragment key={item.label}>
              <InfoRow icon={item.icon} iconColor={item.color} label={item.label} />
              {index < BUILT_WITH.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* App Info */}
        <Text style={styles.sectionTitle}>App Info</Text>
        <View style={styles.listCard}>
          <InfoRow icon="code-slash-outline" iconColor="#a5b4fc" label="Version" value={appVersion} />
          <View style={styles.divider} />
          <InfoRow icon="phone-portrait-outline" iconColor="#60a5fa" label="Platform" value="Android & iOS" />
          <View style={styles.divider} />
          <InfoRow
            icon="star-outline"
            iconColor="#eab308"
            label="Rate the App"
            onPress={() => {
              // TODO: Replace with your Play Store / App Store URL
              // Linking.openURL('https://play.google.com/store/apps/details?id=com.oneminutebrain.challenge');
            }}
          />
          <View style={styles.divider} />
          <InfoRow
            icon="mail-outline"
            iconColor="#22c55e"
            label="Contact Us"
            onPress={() => Linking.openURL('mailto:oneminutebrain@gmail.com')}
          />
        </View>

        <Text style={styles.footer}>
          Made with passion for brain training.{'\n'}© {new Date().getFullYear()} 1 Minute Brain Challenge. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050816',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 28,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.15)',
  },
  appIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f9fafb',
    textAlign: 'center',
    marginBottom: 6,
  },
  appTagline: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 14,
  },
  versionBadge: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.2)',
  },
  versionBadgeText: {
    fontSize: 12,
    color: '#a5b4fc',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.1)',
  },
  cardBody: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
  listCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    color: '#e5e7eb',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginLeft: 46,
  },
  difficultyGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  difficultyCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  difficultyDesc: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    fontSize: 12,
    color: '#334155',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
});
