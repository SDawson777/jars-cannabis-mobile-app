import React from 'react';
import { render } from '@testing-library/react-native';
import OnboardingSlide from '../components/OnboardingSlide';

jest.mock('../components/AnimatedPulseGlow', () => {
  const { View } = require('react-native');
  return () => <View testID="pulse-glow" />;
});

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View: ({ children, style }: any) => <View style={style}>{children}</View>,
    },
    FadeIn: {
      duration: () => ({}),
    },
  };
});

describe('OnboardingSlide', () => {
  const mockIllustration = { uri: 'https://example.com/illustration.png' };

  it('should render headline', () => {
    const { getByText } = render(
      <OnboardingSlide
        headline="Welcome to Nimbus"
        benefitText="Your cannabis journey starts here"
        isActive={true}
      />
    );
    expect(getByText('Welcome to Nimbus')).toBeTruthy();
  });

  it('should render benefit text', () => {
    const { getByText } = render(
      <OnboardingSlide
        headline="Personalized"
        benefitText="Get recommendations tailored to you"
        isActive={true}
      />
    );
    expect(getByText('Get recommendations tailored to you')).toBeTruthy();
  });

  it('should render illustration when provided', () => {
    const { UNSAFE_getByType } = render(
      <OnboardingSlide
        headline="Test"
        benefitText="Test"
        illustration={mockIllustration}
        isActive={true}
      />
    );
    const { Image } = require('react-native');
    expect(UNSAFE_getByType(Image)).toBeTruthy();
  });

  it('should render without illustration', () => {
    const { toJSON } = render(
      <OnboardingSlide headline="Test" benefitText="Test" isActive={true} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should have accessibility label with headline', () => {
    const { getByLabelText } = render(
      <OnboardingSlide headline="Welcome" benefitText="Get started" isActive={true} />
    );
    expect(getByLabelText('Welcome')).toBeTruthy();
  });

  it('should have text accessibility role', () => {
    const { getAllByRole } = render(
      <OnboardingSlide headline="Welcome" benefitText="Get started" isActive={true} />
    );
    const textElements = getAllByRole('text');
    expect(textElements.length).toBeGreaterThan(0);
  });
});
