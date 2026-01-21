import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import ArticleListScreen from '../../screens/ArticleListScreen';
import { ThemeContext } from '../../context/ThemeContext';
import * as useEducationalArticlesModule from '../../hooks/useEducationalArticles';
import * as analytics from '../../utils/analytics';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useFocusEffect: jest.fn(cb => cb()),
}));

// Mock hooks
jest.mock('../../hooks/useEducationalArticles', () => ({
  useEducationalArticles: jest.fn(),
}));

// Mock analytics
jest.mock('../../utils/analytics', () => ({
  trackScreenView: jest.fn(),
  trackContentClick: jest.fn(),
}));

// Mock haptic
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

const createThemeWrapper =
  (colorTemp: 'warm' | 'neutral' | 'cool' = 'neutral') =>
  ({ children }: { children: React.ReactNode }) => (
    <ThemeContext.Provider
      value={{
        colorTemp,
        brandPrimary: '#2E5D46',
        brandSecondary: '#8CD24C',
        brandBackground: '#F9F9F9',
        brandAccent: '#FFD700',
        cornerRadius: 12,
        logoUrl: undefined,
        elevation: 'soft',
        loading: false,
        debugInfo: { weatherSource: 'time-of-day', lastUpdated: new Date() },
        cmsTheme: null,
        weatherSimulation: { enabled: false, condition: null },
        setWeatherSimulation: jest.fn(),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );

describe('ArticleListScreen', () => {
  const mockArticles = [
    {
      __id: 'article-1',
      title: 'Cannabis Basics',
      slug: 'cannabis-basics',
      content: 'Introduction to cannabis',
    },
    {
      __id: 'article-2',
      title: 'Strain Guide',
      slug: 'strain-guide',
      content: 'Learn about strains',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    (useEducationalArticlesModule.useEducationalArticles as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { UNSAFE_root } = render(<ArticleListScreen />, {
      wrapper: createThemeWrapper(),
    });

    // Check for ActivityIndicator via the component structure
    expect(UNSAFE_root.findAllByType('ActivityIndicator').length).toBeGreaterThan(0);
  });

  it('should render articles list', () => {
    (useEducationalArticlesModule.useEducationalArticles as jest.Mock).mockReturnValue({
      data: mockArticles,
      isLoading: false,
    });

    const { getByText } = render(<ArticleListScreen />, {
      wrapper: createThemeWrapper(),
    });

    expect(getByText('Cannabis Basics')).toBeTruthy();
    expect(getByText('Strain Guide')).toBeTruthy();
  });

  it('should navigate to article detail on press', () => {
    (useEducationalArticlesModule.useEducationalArticles as jest.Mock).mockReturnValue({
      data: mockArticles,
      isLoading: false,
    });

    const { getByText } = render(<ArticleListScreen />, {
      wrapper: createThemeWrapper(),
    });

    fireEvent.press(getByText('Cannabis Basics'));

    expect(mockNavigate).toHaveBeenCalledWith('ArticleDetail', { slug: 'cannabis-basics' });
  });

  it('should track screen view on focus', () => {
    (useEducationalArticlesModule.useEducationalArticles as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<ArticleListScreen />, { wrapper: createThemeWrapper() });

    expect(analytics.trackScreenView).toHaveBeenCalledWith('ArticleListScreen');
  });

  it('should track content click on article press', () => {
    (useEducationalArticlesModule.useEducationalArticles as jest.Mock).mockReturnValue({
      data: mockArticles,
      isLoading: false,
    });

    const { getByText } = render(<ArticleListScreen />, {
      wrapper: createThemeWrapper(),
    });

    fireEvent.press(getByText('Strain Guide'));

    expect(analytics.trackContentClick).toHaveBeenCalledWith('article', 'strain-guide', {
      title: 'Strain Guide',
    });
  });

  it('should handle empty articles list', () => {
    (useEducationalArticlesModule.useEducationalArticles as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { queryByText } = render(<ArticleListScreen />, {
      wrapper: createThemeWrapper('warm'),
    });

    // Should not crash with empty list
    expect(queryByText('Cannabis Basics')).toBeNull();
  });
});
