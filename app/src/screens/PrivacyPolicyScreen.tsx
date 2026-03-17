import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

type SectionProps = { title: string; children: string };

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#e5e7eb" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Privacy Policy</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={styles.lastUpdated}>Last updated: March 2025</Text>

        <Section title="Introduction">
          {`1 Minute Brain Challenge ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.\n\nBy using the app, you agree to the collection and use of information in accordance with this policy.`}
        </Section>

        <Section title="Information We Collect">
          {`We collect the following types of information:\n\n• Email address – when you create an account or sign in via Firebase Authentication.\n\n• Game statistics – your scores, streaks, games played, and difficulty preferences, stored locally on your device and optionally synced to the cloud when you are signed in.\n\n• Profile information – display name, age, and country, which you provide voluntarily in the Profile screen.\n\n• Energy data – your in-app energy level and refill timestamps, stored locally.\n\nWe do not collect any sensitive personal data such as payment information, location, or contacts.`}
        </Section>

        <Section title="How We Use Your Information">
          {`We use the information we collect to:\n\n• Provide and maintain the app's functionality.\n• Sync your progress and scores across devices when you are signed in.\n• Show you your personal statistics and progress.\n• Deliver advertisements through Google AdMob to support free access to the app.`}
        </Section>

        <Section title="Data Storage">
          {`Your data is stored in two ways:\n\n• Local storage – game data is saved on your device using AsyncStorage. This data remains on your device and is not accessible to us unless you create an account.\n\n• Cloud storage – if you create an account, your profile and game statistics are synced to Firebase Firestore (Google LLC) servers. Firebase's privacy practices apply: firebase.google.com/support/privacy.`}
        </Section>

        <Section title="Third-Party Services">
          {`We use the following third-party services that may collect data independently:\n\n• Firebase Authentication & Firestore (Google LLC) – for user accounts and cloud data sync.\n\n• Google AdMob – to display advertisements within the app. AdMob may collect device identifiers and usage data to serve relevant ads. You can learn more at policies.google.com/privacy.\n\nThese services have their own privacy policies and we encourage you to review them.`}
        </Section>

        <Section title="Advertising">
          {`This app displays advertisements provided by Google AdMob. Ads may be personalised based on your interests using data collected by Google. You can opt out of personalised advertising in your device settings:\n\n• Android: Settings → Google → Ads → Opt out of Ads Personalisation\n• iOS: Settings → Privacy → Apple Advertising → Limit Ad Tracking`}
        </Section>

        <Section title="Children's Privacy">
          {`This app is not directed to children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us and we will delete such information promptly.`}
        </Section>

        <Section title="Data Retention">
          {`We retain your data for as long as your account is active or as needed to provide you with the app's services. You may delete your account and all associated data at any time by contacting us. Locally stored data can be cleared by uninstalling the app.`}
        </Section>

        <Section title="Your Rights">
          {`You have the right to:\n\n• Access the personal data we hold about you.\n• Request correction of inaccurate data.\n• Request deletion of your data.\n• Withdraw consent at any time by deleting your account.\n\nTo exercise these rights, please contact us at the email below.`}
        </Section>

        <Section title="Security">
          {`We take reasonable measures to protect your information. Your data is transmitted over encrypted connections (HTTPS/TLS) and stored securely using Firebase's security infrastructure. However, no method of transmission over the internet is 100% secure.`}
        </Section>

        <Section title="Changes to This Policy">
          {`We may update this Privacy Policy from time to time. Any changes will be reflected in the app with an updated "Last updated" date. Continued use of the app after changes constitutes your acceptance of the revised policy.`}
        </Section>

        <Section title="Contact Us">
          {`If you have any questions about this Privacy Policy, please contact us at:\n\noneminutebrain@gmail.com`}
        </Section>
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
    marginBottom: 20,
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
  lastUpdated: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.1)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a5b4fc',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
  },
});
