import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const LABELS = ['A', 'B', 'C', 'D'];

type Props = {
  label: string;
  index: number;
  onPress: () => void;
  disabled?: boolean;
};

export default function OptionButton({ label, index, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <View style={[styles.badge, disabled && styles.badgeDisabled]}>
        <Text style={styles.badgeText}>{LABELS[index] ?? '?'}</Text>
      </View>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      <View style={styles.badgeSpacer} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#3730a3',
    borderWidth: 1,
    borderColor: '#6366f1',
    borderBottomWidth: 5,
    borderBottomColor: '#1e1b4b',
    gap: 12,
  },
  buttonDisabled: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
    borderBottomColor: '#1f2937',
  },
  buttonPressed: {
    transform: [{ translateY: 4 }],
    borderBottomWidth: 1,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDisabled: {
    backgroundColor: '#4b5563',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#f9fafb',
    textAlign: 'center',
  },
  labelDisabled: {
    color: '#9ca3af',
  },
  badgeSpacer: {
    width: 32,
  },
});
