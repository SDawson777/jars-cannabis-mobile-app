import * as Sentry from '@sentry/react-native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      extra: errorInfo as any,
      tags: { boundary: 'root' },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View
          accessible
          accessibilityLabel="error-boundary-fallback"
          style={styles.container}
        >
          <Text style={styles.title} accessibilityRole="alert">
            Oops, something went wrong.
          </Text>
          <Text style={styles.subtitle}>
            We've logged this issue and will fix it soon.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.devError}>{this.state.error.message}</Text>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleReset}
            accessibilityLabel="Try again"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children as React.ReactNode;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  devError: {
    fontSize: 12,
    color: '#cc0000',
    fontFamily: 'monospace',
    marginBottom: 16,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
