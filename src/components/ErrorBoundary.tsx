import React from 'react';
import { View, Text } from 'react-native';
import * as Sentry from '@sentry/react-native';

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: errorInfo as any });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          accessible
          accessibilityLabel="error-boundary-fallback"
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}
        >
          <Text accessibilityRole="alert">Oops, something went wrong.</Text>
        </View>
      );
    }

    return this.props.children as React.ReactNode;
  }
}
