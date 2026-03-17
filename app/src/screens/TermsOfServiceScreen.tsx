import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'TermsOfService'>;

type SectionProps = { title: string; children: string };

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

export default function TermsOfServiceScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#e5e7eb" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Terms of Service</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={styles.lastUpdated}>Last updated: March 2025</Text>

        <Section title="Acceptance of Terms">
          {`By downloading, installing, or using 1 Minute Brain Challenge ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App.\n\nThese Terms apply to all users of the App, including users who create accounts and guest users.`}
        </Section>

        <Section title="Description of Service">
          {`1 Minute Brain Challenge is a free-to-play mobile brain training game that offers timed puzzle challenges across multiple difficulty levels. The App includes optional account creation for syncing progress across devices, an energy system that regenerates over time, and optional reward-based advertisements.`}
        </Section>

        <Section title="User Accounts">
          {`Creating an account is optional. If you choose to create an account:\n\n• You must provide a valid email address and a password of at least 8 characters.\n• You are responsible for maintaining the confidentiality of your account credentials.\n• You are responsible for all activities that occur under your account.\n• You must notify us immediately if you suspect unauthorized access to your account.\n• You must be at least 13 years of age to create an account.`}
        </Section>

        <Section title="Acceptable Use">
          {`You agree to use the App only for lawful purposes. You must not:\n\n• Attempt to gain unauthorized access to any part of the App or its backend systems.\n• Use the App to distribute malicious software or engage in any activity that disrupts the service.\n• Attempt to cheat, exploit bugs, or manipulate game mechanics to gain unfair advantages.\n• Impersonate any person or entity or misrepresent your affiliation.\n• Use automated scripts or bots to interact with the App.`}
        </Section>

        <Section title="In-App Energy System">
          {`The App includes an energy system that limits the number of games you can play within a given period. Energy refills automatically over time and can also be restored by watching rewarded advertisements.\n\nEnergy is a virtual in-game resource with no real-world monetary value and cannot be transferred, sold, or exchanged outside the App.`}
        </Section>

        <Section title="Advertisements">
          {`The App displays advertisements provided by Google AdMob and may offer optional rewarded ads in exchange for in-game energy. By using the App, you consent to the display of advertisements.\n\nWe are not responsible for the content of third-party advertisements. Any interaction with advertisements is at your own discretion.`}
        </Section>

        <Section title="Intellectual Property">
          {`All content within the App, including but not limited to graphics, text, puzzle designs, sound effects, and code, is the property of the App's developer and is protected by applicable intellectual property laws.\n\nYou are granted a limited, non-exclusive, non-transferable licence to use the App for personal, non-commercial purposes. You may not copy, modify, distribute, sell, or reverse-engineer any part of the App.`}
        </Section>

        <Section title="Disclaimers">
          {`The App is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that:\n\n• The App will be uninterrupted or error-free.\n• Defects will be corrected.\n• The App or its servers are free of viruses or harmful components.\n\nBrain training games are intended for entertainment purposes. We make no claims that the App improves cognitive function or intelligence.`}
        </Section>

        <Section title="Limitation of Liability">
          {`To the maximum extent permitted by applicable law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the App, including but not limited to loss of data, loss of profits, or loss of game progress.\n\nOur total liability for any claim arising from your use of the App shall not exceed the amount you paid for the App (which is zero, as the App is free).`}
        </Section>

        <Section title="Termination">
          {`We reserve the right to suspend or terminate your access to the App at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.\n\nYou may stop using the App at any time. If you have an account, you may contact us to request deletion of your data.`}
        </Section>

        <Section title="Changes to Terms">
          {`We reserve the right to modify these Terms at any time. Changes will be communicated through an updated "Last updated" date in the App. Continued use of the App after changes constitutes acceptance of the new Terms.`}
        </Section>

        <Section title="Governing Law">
          {`These Terms shall be governed by and construed in accordance with applicable law. Any disputes arising from these Terms or your use of the App shall be subject to the exclusive jurisdiction of the courts in your country of residence.`}
        </Section>

        <Section title="Contact Us">
          {`If you have any questions about these Terms of Service, please contact us at:\n\noneminutebrain@gmail.com`}
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
