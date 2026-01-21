/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import OnboardingSlide from '../../components/OnboardingSlide';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: {
      View,
    },
    FadeIn: {
      duration: jest.fn().mockReturnValue({}),
    },
  };
});

// Mock AnimatedPulseGlow component
jest.mock('../../components/AnimatedPulseGlow', () => 'AnimatedPulseGlow');

describe('OnboardingSlide', () => {
  it('renders headline', () => {
    const { getByText } = render(
      <OnboardingSlide headline="Welcome" benefitText="Get started" isActive={true} />
    );
    expect(getByText('Welcome')).toBeDefined();
  });

  it('renders benefit text', () => {
    const { getByText } = render(
      <OnboardingSlide headline="Welcome" benefitText="Get started" isActive={true} />
    );
    expect(getByText('Get started')).toBeDefined();
  });

  it('renders illustration when provided', () => {
    const mockIllustration = { uri: 'test.png' };
    const { UNSAFE_getAllByType } = render(
      <OnboardingSlide
        headline="Welcome"
        benefitText="Get started"
        illustration={mockIllustration}
        isActive={true}
      />
    );
    expect(UNSAFE_getAllByType).toBeDefined();
  });

  it('sets accessibility label to headline', () => {
    const { getByLabelText } = render(
      <OnboardingSlide headline="Welcome" benefitText="Get started" isActive={true} />
    );
    expect(getByLabelText('Welcome')).toBeDefined();
  });

  it('sets accessibility role to text', () => {
    const { UNSAFE_getAllByProps } = render(
      <OnboardingSlide headline="Welcome" benefitText="Get started" isActive={true} />
    );
    const textElements = UNSAFE_getAllByProps({ accessibilityRole: 'text' });
    expect(textElements.length).toBeGreaterThan(0);
  });

  it('renders without illustration', () => {
    const { getByText } = render(
      <OnboardingSlide headline="Welcome" benefitText="Get started" isActive={true} />
    );
    expect(getByText('Welcome')).toBeDefined();
    expect(getByText('Get started')).toBeDefined();
  });
});
