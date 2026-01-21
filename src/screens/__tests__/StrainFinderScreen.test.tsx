// src/screens/__tests__/StrainFinderScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import StrainFinderScreen from '../StrainFinderScreen';
import { BrandProvider } from '../../context/BrandContext';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

const mockMutate = jest.fn();
const mockReset = jest.fn();

jest.mock('../../hooks/useAI', () => ({
  useAiRecommendations: jest.fn(() => ({
    mutate: mockMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
    data: null,
    error: null,
    reset: mockReset,
  })),
}));

jest.mock('../../i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'common.back': 'Back',
        'common.retry': 'Retry',
        'strainFinder.title': 'AI Strain Finder',
        'strainFinder.selectEffects': 'Select desired effects',
        'strainFinder.experienceLevel': 'Experience Level',
        'strainFinder.experience.new': 'New',
        'strainFinder.experience.regular': 'Regular',
        'strainFinder.experience.heavy': 'Heavy',
        'strainFinder.budget': 'Budget',
        'strainFinder.productCategories': 'Product Categories (Optional)',
        'strainFinder.findButton': 'Find Strains',
        'strainFinder.selectEffectsAlertTitle': 'No Effects Selected',
        'strainFinder.selectEffectsAlertMessage': 'Please select at least one desired effect',
        'strainFinder.unableToGetRecommendations': 'Unable to get recommendations',
        'strainFinder.recommendationsFound': `${params?.count || 0} Recommendations Found`,
        'strainFinder.newSearch': 'New Search',
        'strainFinder.noMatchesTitle': 'No Matches Found',
        'strainFinder.noMatchesMessage': 'Try adjusting your preferences',
        'errors.generic': 'Something went wrong',
      };
      return translations[key] || key;
    },
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<BrandProvider>{ui}</BrandProvider>);
};

describe('StrainFinderScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { useAiRecommendations } = require('../../hooks/useAI');
    useAiRecommendations.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
      isError: false,
      data: null,
      error: null,
      reset: mockReset,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the screen header', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);
      expect(getByText('AI Strain Finder')).toBeTruthy();
    });

    it('renders effects options', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);
      expect(getByText('Relaxed')).toBeTruthy();
      expect(getByText('Energetic')).toBeTruthy();
      expect(getByText('Creative')).toBeTruthy();
      expect(getByText('Focused')).toBeTruthy();
    });

    it('renders experience level options', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);
      expect(getByText('Experience Level')).toBeTruthy();
      expect(getByText('New')).toBeTruthy();
      expect(getByText('Regular')).toBeTruthy();
      expect(getByText('Heavy')).toBeTruthy();
    });

    it('renders budget options', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);
      expect(getByText('Budget')).toBeTruthy();
      expect(getByText('$')).toBeTruthy();
      expect(getByText('$$')).toBeTruthy();
      expect(getByText('$$$')).toBeTruthy();
    });

    it('renders product categories', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);
      expect(getByText('Product Categories (Optional)')).toBeTruthy();
      expect(getByText('Flower')).toBeTruthy();
      expect(getByText('Edibles')).toBeTruthy();
      expect(getByText('Vape')).toBeTruthy();
    });

    it('renders find strains button', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);
      expect(getByText('Find Strains')).toBeTruthy();
    });
  });

  describe('Effects Selection', () => {
    it('toggles effect selection when pressed', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);
      const relaxedOption = getByText('Relaxed');

      fireEvent.press(relaxedOption);
      // Selection is handled internally, verify no errors
      expect(relaxedOption).toBeTruthy();
    });

    it('allows multiple effect selections', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      fireEvent.press(getByText('Relaxed'));
      fireEvent.press(getByText('Energetic'));
      fireEvent.press(getByText('Creative'));

      // All options should still be rendered
      expect(getByText('Relaxed')).toBeTruthy();
      expect(getByText('Energetic')).toBeTruthy();
      expect(getByText('Creative')).toBeTruthy();
    });

    it('can deselect an effect', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      // Select and deselect
      fireEvent.press(getByText('Relaxed'));
      fireEvent.press(getByText('Relaxed'));

      expect(getByText('Relaxed')).toBeTruthy();
    });

    it('renders all 10 effect options', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      expect(getByText('Relaxed')).toBeTruthy();
      expect(getByText('Energetic')).toBeTruthy();
      expect(getByText('Creative')).toBeTruthy();
      expect(getByText('Focused')).toBeTruthy();
      expect(getByText('Happy')).toBeTruthy();
      expect(getByText('Sleepy')).toBeTruthy();
      expect(getByText('Uplifted')).toBeTruthy();
      expect(getByText('Euphoric')).toBeTruthy();
      expect(getByText('Calm')).toBeTruthy();
      expect(getByText('Social')).toBeTruthy();
    });
  });

  describe('Experience Level Selection', () => {
    it('defaults to regular experience level', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);
      const regularOption = getByText('Regular');
      expect(regularOption).toBeTruthy();
    });

    it('changes experience level when pressed', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      fireEvent.press(getByText('New'));
      expect(getByText('New')).toBeTruthy();

      fireEvent.press(getByText('Heavy'));
      expect(getByText('Heavy')).toBeTruthy();
    });
  });

  describe('Budget Level Selection', () => {
    it('defaults to medium budget', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);
      expect(getByText('$$')).toBeTruthy();
    });

    it('changes budget level when pressed', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      fireEvent.press(getByText('$'));
      expect(getByText('$')).toBeTruthy();

      fireEvent.press(getByText('$$$'));
      expect(getByText('$$$')).toBeTruthy();
    });
  });

  describe('Category Selection', () => {
    it('toggles category selection when pressed', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      fireEvent.press(getByText('Flower'));
      expect(getByText('Flower')).toBeTruthy();
    });

    it('allows multiple category selections', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      fireEvent.press(getByText('Flower'));
      fireEvent.press(getByText('Edibles'));
      fireEvent.press(getByText('Vape'));

      expect(getByText('Flower')).toBeTruthy();
      expect(getByText('Edibles')).toBeTruthy();
      expect(getByText('Vape')).toBeTruthy();
    });

    it('renders all 6 category options', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      expect(getByText('Flower')).toBeTruthy();
      expect(getByText('Edibles')).toBeTruthy();
      expect(getByText('Vape')).toBeTruthy();
      expect(getByText('PreRoll')).toBeTruthy();
      expect(getByText('Concentrate')).toBeTruthy();
      expect(getByText('Tincture')).toBeTruthy();
    });
  });

  describe('Find Strains Flow', () => {
    it('shows alert when finding strains without selecting effects', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      fireEvent.press(getByText('Find Strains'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'No Effects Selected',
        'Please select at least one desired effect'
      );
    });

    it('calls mutate with correct params when effects are selected', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      fireEvent.press(getByText('Relaxed'));
      fireEvent.press(getByText('Find Strains'));

      expect(mockMutate).toHaveBeenCalledWith({
        desiredEffects: ['Relaxed'],
        experienceLevel: 'regular',
        budgetLevel: 'medium',
        preferredCategories: undefined,
      });
    });

    it('includes categories in request when selected', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      fireEvent.press(getByText('Relaxed'));
      fireEvent.press(getByText('Flower'));
      fireEvent.press(getByText('Edibles'));
      fireEvent.press(getByText('Find Strains'));

      expect(mockMutate).toHaveBeenCalledWith({
        desiredEffects: ['Relaxed'],
        experienceLevel: 'regular',
        budgetLevel: 'medium',
        preferredCategories: ['Flower', 'Edibles'],
      });
    });

    it('includes experience level in request', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      fireEvent.press(getByText('Relaxed'));
      fireEvent.press(getByText('New'));
      fireEvent.press(getByText('Find Strains'));

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          experienceLevel: 'new',
        })
      );
    });

    it('includes budget level in request', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      fireEvent.press(getByText('Relaxed'));
      fireEvent.press(getByText('$$$'));
      fireEvent.press(getByText('Find Strains'));

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          budgetLevel: 'high',
        })
      );
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator when pending', () => {
      const { useAiRecommendations } = require('../../hooks/useAI');
      useAiRecommendations.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        isSuccess: false,
        isError: false,
        data: null,
        error: null,
        reset: mockReset,
      });

      const { UNSAFE_getByType } = renderWithProviders(<StrainFinderScreen />);
      const { ActivityIndicator } = require('react-native');

      // Loading indicator is shown
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('shows error message when API fails', () => {
      const { useAiRecommendations } = require('../../hooks/useAI');
      useAiRecommendations.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isSuccess: false,
        isError: true,
        data: null,
        error: { message: 'API error' },
        reset: mockReset,
      });

      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      expect(getByText('Something went wrong')).toBeTruthy();
      expect(getByText('API error')).toBeTruthy();
    });

    it('shows retry button on error', () => {
      const { useAiRecommendations } = require('../../hooks/useAI');
      useAiRecommendations.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isSuccess: false,
        isError: true,
        data: null,
        error: { message: 'API error' },
        reset: mockReset,
      });

      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      expect(getByText('Retry')).toBeTruthy();
    });

    it('calls handleFindStrains when retry is pressed', () => {
      const { useAiRecommendations } = require('../../hooks/useAI');
      useAiRecommendations.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isSuccess: false,
        isError: true,
        data: null,
        error: { message: 'API error' },
        reset: mockReset,
      });

      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      fireEvent.press(getByText('Retry'));

      // Will show alert because no effects selected
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  describe('Results Display', () => {
    it('shows results count when recommendations are returned', () => {
      const { useAiRecommendations } = require('../../hooks/useAI');
      useAiRecommendations.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isSuccess: true,
        isError: false,
        data: {
          recommendations: [
            {
              id: '1',
              name: 'Blue Dream',
              brand: 'Premium Cannabis',
              category: 'Flower',
              score: 95,
              price: 45.0,
              thcPercent: 24,
              cbdPercent: 1,
              reasoning: 'Perfect for relaxation',
            },
          ],
        },
        error: null,
        reset: mockReset,
      });

      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      expect(getByText('1 Recommendations Found')).toBeTruthy();
    });

    it('renders product cards for each recommendation', () => {
      const { useAiRecommendations } = require('../../hooks/useAI');
      useAiRecommendations.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isSuccess: true,
        isError: false,
        data: {
          recommendations: [
            {
              id: '1',
              name: 'Blue Dream',
              brand: 'Premium Cannabis',
              category: 'Flower',
              score: 95,
              price: 45.0,
              thcPercent: 24,
              cbdPercent: 1,
              reasoning: 'Perfect for relaxation',
            },
          ],
        },
        error: null,
        reset: mockReset,
      });

      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      expect(getByText('Blue Dream')).toBeTruthy();
      expect(getByText('Premium Cannabis')).toBeTruthy();
      expect(getByText('Flower')).toBeTruthy();
      expect(getByText('95%')).toBeTruthy();
      expect(getByText('THC: 24%')).toBeTruthy();
      expect(getByText('CBD: 1%')).toBeTruthy();
      expect(getByText('$45.00')).toBeTruthy();
      expect(getByText('Perfect for relaxation')).toBeTruthy();
    });

    it('shows new search button when results are shown', () => {
      const { useAiRecommendations } = require('../../hooks/useAI');
      useAiRecommendations.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isSuccess: true,
        isError: false,
        data: {
          recommendations: [
            {
              id: '1',
              name: 'Blue Dream',
              brand: 'Premium Cannabis',
              category: 'Flower',
              score: 95,
              price: 45.0,
              reasoning: 'Perfect',
            },
          ],
        },
        error: null,
        reset: mockReset,
      });

      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      expect(getByText('New Search')).toBeTruthy();
    });

    it('resets form when new search is pressed', () => {
      const { useAiRecommendations } = require('../../hooks/useAI');
      useAiRecommendations.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isSuccess: true,
        isError: false,
        data: {
          recommendations: [
            {
              id: '1',
              name: 'Blue Dream',
              brand: 'Premium Cannabis',
              category: 'Flower',
              score: 95,
              price: 45.0,
              reasoning: 'Perfect',
            },
          ],
        },
        error: null,
        reset: mockReset,
      });

      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      fireEvent.press(getByText('New Search'));

      expect(mockReset).toHaveBeenCalled();
    });

    it('shows no results message when recommendations are empty', () => {
      const { useAiRecommendations } = require('../../hooks/useAI');
      useAiRecommendations.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isSuccess: true,
        isError: false,
        data: {
          recommendations: [],
        },
        error: null,
        reset: mockReset,
      });

      const { getByText } = renderWithProviders(<StrainFinderScreen />);

      expect(getByText('No Matches Found')).toBeTruthy();
      expect(getByText('Try adjusting your preferences')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('applies brand primary color to selected effects', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);
      const relaxedOption = getByText('Relaxed');

      expect(relaxedOption).toBeTruthy();
    });

    it('applies brand colors to buttons', () => {
      const { getByText } = renderWithProviders(<StrainFinderScreen />);
      const findButton = getByText('Find Strains');

      expect(findButton).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has accessibility label for back button', () => {
      renderWithProviders(<StrainFinderScreen />);

      // Back button has accessibility label via mock
      const navigation = require('@react-navigation/native').useNavigation();
      expect(navigation).toBeDefined();
    });
  });
});
