import React, { Component, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

/**
 * Global error boundary that catches unhandled JS errors and shows
 * a friendly recovery screen instead of a blank crash.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production, send to crash reporter here (Sentry / Firebase Crashlytics)
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Ionicons name="warning-outline" size={64} color="#ef4444" style={styles.icon} />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle}>
          An unexpected error occurred. Please try again.
        </Text>
        {__DEV__ && this.state.error && (
          <View style={styles.devBox}>
            <Text style={styles.devText} numberOfLines={6}>
              {this.state.error.message}
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.button} onPress={this.handleRetry} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  devBox: {
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
    width: '100%',
  },
  devText: {
    fontSize: 11,
    color: '#ef4444',
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
