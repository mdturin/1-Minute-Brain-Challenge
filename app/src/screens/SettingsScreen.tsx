import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

type SettingsRowProps = {
  icon: string;
  iconColor: string;
  label: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
};

function SettingsRow({ icon, iconColor, label, onPress, trailing }: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      {trailing || (onPress && <Ionicons name="chevron-forward" size={18} color="#475569" />)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#e5e7eb" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Settings</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* About Section */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="document-text-outline"
            iconColor="#60a5fa"
            label="Privacy Policy"
            onPress={() => {
              // TODO: Replace with actual privacy policy URL
              Linking.openURL('https://example.com/privacy');
            }}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="clipboard-outline"
            iconColor="#60a5fa"
            label="Terms of Service"
            onPress={() => {
              // TODO: Replace with actual terms URL
              Linking.openURL('https://example.com/terms');
            }}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="information-circle-outline"
            iconColor="#a5b4fc"
            label="About"
            onPress={() => {
              // Could navigate to an about screen
            }}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="star-outline"
            iconColor="#eab308"
            label="Rate Us"
            onPress={() => {
              // TODO: Replace with Play Store / App Store URL
            }}
          />
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>1 Minute Brain Challenge</Text>
          <Text style={styles.versionNumber}>Version {appVersion}</Text>
        </View>
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
    paddingBottom: 32,
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 15,
    color: '#e5e7eb',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginLeft: 48,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
    gap: 4,
  },
  versionText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  versionNumber: {
    fontSize: 12,
    color: '#334155',
  },
});
