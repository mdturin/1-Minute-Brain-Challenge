import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { loadUserProfile, saveUserProfile } from '../storage/userProfile';
import { COUNTRIES } from '../constants/countries';

type Props = NativeStackScreenProps<RootStackParamList, 'UserInfo'>;

export default function UserInfoScreen({ navigation }: Props) {
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES;

  const canContinue = age.trim().length > 0 && country.length > 0;

  const handleNext = async () => {
    try {
      const profile = await loadUserProfile();
      await saveUserProfile({
        ...profile,
        age: Number(age),
        country,
      });
    } catch {}
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={52} color="#6366f1" />
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>Help us personalise your experience</Text>
        </View>

        {/* Age */}
        <View style={styles.field}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            placeholderTextColor="#475569"
            keyboardType="number-pad"
            maxLength={3}
            value={age}
            onChangeText={setAge}
          />
        </View>

        {/* Country */}
        <View style={styles.field}>
          <Text style={styles.label}>Country</Text>
          <TouchableOpacity style={styles.input} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
            <Text style={country ? styles.selectedText : styles.placeholder}>
              {country || 'Select your country'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Next button */}
        <TouchableOpacity
          style={[styles.btn, !canContinue && styles.btnDisabled]}
          onPress={handleNext}
          disabled={!canContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Next</Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity onPress={() => navigation.replace('Home')} activeOpacity={0.7}>
          <Text style={styles.skip}>Skip for now</Text>
        </TouchableOpacity>
      </View>

      {/* Country picker modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity onPress={() => { setModalVisible(false); setSearch(''); }}>
              <Ionicons name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <Ionicons name="search" size={16} color="#475569" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search countries..."
              placeholderTextColor="#475569"
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color="#475569" />
              </TouchableOpacity>
            )}
          </View>

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={item => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.countryRow, item === country && styles.countryRowSelected]}
                onPress={() => {
                  setCountry(item);
                  setModalVisible(false);
                  setSearch('');
                }}
              >
                <Text style={[styles.countryText, item === country && styles.countryTextSelected]}>
                  {item}
                </Text>
                {item === country && <Ionicons name="checkmark" size={18} color="#6366f1" />}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050816' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 32 },

  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#f9fafb', marginTop: 14, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center' },

  field: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#94a3b8', marginBottom: 8, letterSpacing: 0.5 },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#f9fafb',
    fontSize: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholder: { color: '#475569', fontSize: 15 },
  selectedText: { color: '#f9fafb', fontSize: 15 },

  btn: {
    backgroundColor: '#6366f1',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  btnDisabled: { opacity: 0.35 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  skip: { textAlign: 'center', fontSize: 13, color: '#475569' },

  // Modal
  modal: { flex: 1, backgroundColor: '#0f172a' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#f9fafb' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 16,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, color: '#f9fafb', fontSize: 15 },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  countryRowSelected: { backgroundColor: 'rgba(99,102,241,0.08)' },
  countryText: { fontSize: 15, color: '#cbd5e1' },
  countryTextSelected: { color: '#6366f1', fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#1e293b', marginHorizontal: 20 },
});
