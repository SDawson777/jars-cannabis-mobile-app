import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import {
  AccessibilityLottie,
  AccessibilityAnimatedView,
} from '../components/AccessibilityComponents';
import { useAccessibilityStore } from '../state/accessibilityStore';

// Mock Lottie
jest.mock('lottie-react-native', () => {
  const React = require('react');
  return React.forwardRef((props: any, ref: any) => {
    const MockLottieView = require('react-native').View;
    return <MockLottieView {...props} ref={ref} testID="lottie-view" />;
  });
});

describe('AccessibilityComponents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useAccessibilityStore.getState().setReduceMotion(false);
  });

  describe('AccessibilityLottie', () => {
    it('renders with autoPlay when reduce motion is disabled', () => {
      const { getByTestId } = render(
        <AccessibilityLottie source={{ uri: 'test' }} testID="test-lottie" />
      );

      const lottieView = getByTestId('lottie-view');
      expect(lottieView.props.autoPlay).toBe(true);
      expect(lottieView.props.loop).toBe(true);
    });

    it('disables autoPlay when reduce motion is enabled', () => {
      // Enable reduce motion
      useAccessibilityStore.getState().setReduceMotion(true);

      const { getByTestId } = render(
        <AccessibilityLottie source={{ uri: 'test' }} testID="test-lottie" />
      );

      const lottieView = getByTestId('lottie-view');
      expect(lottieView.props.autoPlay).toBe(false);
      expect(lottieView.props.loop).toBe(false);
    });

    it('respects custom autoPlay and loop props when reduce motion is disabled', () => {
      const { getByTestId } = render(
        <AccessibilityLottie
          source={{ uri: 'test' }}
          autoPlay={false}
          loop={false}
          testID="test-lottie"
        />
      );

      const lottieView = getByTestId('lottie-view');
      expect(lottieView.props.autoPlay).toBe(false);
      expect(lottieView.props.loop).toBe(false);
    });
  });

  describe('AccessibilityAnimatedView', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <AccessibilityAnimatedView>
          <Text>Test Content</Text>
        </AccessibilityAnimatedView>
      );

      expect(getByText('Test Content')).toBeTruthy();
    });

    it('calls onAnimationComplete immediately when reduce motion is enabled', () => {
      const mockOnComplete = jest.fn();

      // Enable reduce motion
      useAccessibilityStore.getState().setReduceMotion(true);

      render(
        <AccessibilityAnimatedView onAnimationComplete={mockOnComplete}>
          <Text>Test Content</Text>
        </AccessibilityAnimatedView>
      );

      expect(mockOnComplete).toHaveBeenCalled();
    });

    it('does not call onAnimationComplete immediately when reduce motion is disabled', () => {
      const mockOnComplete = jest.fn();

      render(
        <AccessibilityAnimatedView onAnimationComplete={mockOnComplete}>
          <Text>Test Content</Text>
        </AccessibilityAnimatedView>
      );

      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });
});
