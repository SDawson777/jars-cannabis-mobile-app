import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, Alert } from 'react-native';

import ErrorBoundary from '../../components/ErrorBoundary';

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// A component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>Content</Text>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for error boundary tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Child content</Text>
      </ErrorBoundary>
    );

    expect(getByText('Child content')).toBeTruthy();
  });

  it('should render fallback UI when error occurs', () => {
    const { getByText, getByLabelText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(getByText('Oops, something went wrong.')).toBeTruthy();
    expect(getByText("We've logged this issue and will fix it soon.")).toBeTruthy();
    expect(getByLabelText('error-boundary-fallback')).toBeTruthy();
  });

  it('should capture exception with Sentry', () => {
    const Sentry = require('@sentry/react-native');

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { boundary: 'root' },
      })
    );
  });

  it('should reset on Try Again button press', () => {
    let shouldThrow = true;
    const ResettableError = () => {
      if (shouldThrow) {
        throw new Error('Resettable error');
      }
      return <Text>Recovered content</Text>;
    };

    const { getByText, getByLabelText, rerender } = render(
      <ErrorBoundary>
        <ResettableError />
      </ErrorBoundary>
    );

    // Error state
    expect(getByText('Oops, something went wrong.')).toBeTruthy();

    // Fix the error
    shouldThrow = false;

    // Press Try Again
    fireEvent.press(getByLabelText('Try again'));

    // Force rerender to see recovery
    rerender(
      <ErrorBoundary>
        <ResettableError />
      </ErrorBoundary>
    );

    expect(getByText('Recovered content')).toBeTruthy();
  });

  it('should have accessible role on error message', () => {
    const { getByRole } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(getByRole('alert')).toBeTruthy();
  });

  it('should show try again button with correct accessibilityRole', () => {
    const { getByLabelText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    const button = getByLabelText('Try again');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityRole).toBe('button');
  });
});
