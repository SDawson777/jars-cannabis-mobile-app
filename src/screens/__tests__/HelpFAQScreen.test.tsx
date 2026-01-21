import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HelpFAQScreen from '../HelpFAQScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useFocusEffect: (cb: any) => cb(),
}));

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
}));

// Mock haptic
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

// Mock analytics
jest.mock('../../utils/analytics', () => ({
  trackScreenView: jest.fn(),
  trackContentView: jest.fn(),
  trackContentClick: jest.fn(),
}));

// Mock LayoutAnimation
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    LayoutAnimation: {
      configureNext: jest.fn(),
      Presets: { easeInEaseOut: {} },
    },
    UIManager: { setLayoutAnimationEnabledExperimental: jest.fn() },
    Platform: { OS: 'ios' },
  };
});

// Mock ThemeContext
jest.mock('../../context/ThemeContext', () => {
  const ReactForMock = require('react');
  return {
    ThemeContext: ReactForMock.createContext({
      colorTemp: 'neutral',
      brandPrimary: '#2E5D46',
      brandSecondary: '#666',
      brandBackground: '#fff',
    }),
  };
});

// Mock CMSPreviewContext
jest.mock('../../context/CMSPreviewContext', () => ({
  useCMSPreview: () => ({ preview: false }),
}));

// Mock FAQ hook
const mockFAQData = [
  { id: '1', question: 'How do I order?', answer: 'Go to the shop tab.' },
  { id: '2', question: 'What are the delivery times?', answer: 'Usually 1-2 hours.' },
];

let mockIsLoading = false;
let mockIsError = false;
jest.mock('../../hooks/useFAQ', () => ({
  useFAQQuery: () => ({
    data: mockIsError ? undefined : mockFAQData,
    isLoading: mockIsLoading,
    isError: mockIsError,
  }),
}));

// Mock FAQSkeleton
jest.mock('../../components/FAQSkeleton', () => {
  const { View } = require('react-native');
  return () => <View testID="faq-skeleton" />;
});

// Mock PreviewBadge
jest.mock('../../components/PreviewBadge', () => {
  const { View } = require('react-native');
  return () => <View testID="preview-badge" />;
});

describe('HelpFAQScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoading = false;
    mockIsError = false;
  });

  it('renders header with title', () => {
    const { getByText } = render(<HelpFAQScreen />);
    expect(getByText('Help & FAQ')).toBeTruthy();
  });

  it('renders FAQ questions', () => {
    const { getByText } = render(<HelpFAQScreen />);
    expect(getByText('How do I order?')).toBeTruthy();
    expect(getByText('What are the delivery times?')).toBeTruthy();
  });

  it('expands FAQ answer on press', () => {
    const { getByText, queryByText } = render(<HelpFAQScreen />);

    // Answer not visible initially
    expect(queryByText('Go to the shop tab.')).toBeNull();

    // Press question
    fireEvent.press(getByText('How do I order?'));

    // Answer visible
    expect(getByText('Go to the shop tab.')).toBeTruthy();
  });

  it('navigates back on back button press', () => {
    const { UNSAFE_root } = render(<HelpFAQScreen />);
    // Find the back pressable and press it
    const pressables = UNSAFE_root.findAllByType(require('react-native').Pressable);
    if (pressables[0]) {
      fireEvent.press(pressables[0]);
      expect(mockGoBack).toHaveBeenCalled();
    }
  });

  it('shows error state when FAQ fails to load', () => {
    mockIsError = true;
    const { getByText } = render(<HelpFAQScreen />);
    expect(getByText('Unable to load FAQ.')).toBeTruthy();
  });
});
