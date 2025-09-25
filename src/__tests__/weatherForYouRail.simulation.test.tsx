import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import WeatherForYouRail from '../components/WeatherForYouRail';
import * as useWeatherConditionModule from '../hooks/useWeatherCondition';
import { useWeatherRecommendations } from '../hooks/useWeatherRecommendations';

// Mock hooks
jest.mock('../hooks/useWeatherRecommendations');
jest.mock('../hooks/useWeatherCondition');
jest.mock('../utils/haptic');
jest.mock('../utils/analytics');

const mockUseWeatherRecommendations = useWeatherRecommendations as jest.MockedFunction<
  typeof useWeatherRecommendations
>;
const mockUseWeatherCondition = jest.spyOn(useWeatherConditionModule, 'useWeatherCondition');

const mockProducts = [
  {
    __id: 'product-1',
    name: 'Relaxing Indica',
    slug: 'relaxing-indica',
    price: 25,
    image: { url: 'https://example.com/image1.jpg' },
    type: 'flower',
  },
  {
    __id: 'product-2',
    name: 'Uplifting Sativa',
    slug: 'uplifting-sativa',
    price: 30,
    image: { url: 'https://example.com/image2.jpg' },
    type: 'flower',
  },
];

const mockRecommendationData = {
  condition: 'rain',
  products: mockProducts,
  tags: ['Relaxation', 'Stress Relief'],
  description: 'Perfect for rainy day relaxation',
};

describe('WeatherForYouRail Weather Simulation', () => {
  const mockOnSelectProduct = jest.fn();
  const mockOnSeeAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default successful weather recommendations
    mockUseWeatherRecommendations.mockReturnValue({
      data: mockRecommendationData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('should use simulated weather condition when simulation is enabled', async () => {
    mockUseWeatherCondition.mockReturnValue({
      condition: 'rain',
      isSimulated: true,
      debugInfo: {
        weatherSource: 'openweather',
        lastUpdated: new Date(),
        simulation: {
          enabled: true,
          condition: 'rain',
        },
      },
    });

    const { getByText } = render(
      <WeatherForYouRail onSelectProduct={mockOnSelectProduct} onSeeAll={mockOnSeeAll} />
    );

    // Should show rain emoji and simulation badge
    expect(getByText('🌧️')).toBeTruthy();
    expect(getByText('SIM')).toBeTruthy();
    expect(getByText('Perfect for rainy day relaxation')).toBeTruthy();

    // Should call useWeatherRecommendations with simulated condition
    expect(mockUseWeatherRecommendations).toHaveBeenCalledWith({
      condition: 'rain',
      city: undefined,
      state: undefined,
      limit: 8,
      enabled: true,
    });
  });

  it('should use actual weather condition when simulation is disabled', async () => {
    mockUseWeatherCondition.mockReturnValue({
      condition: 'sunny',
      isSimulated: false,
      debugInfo: {
        weatherSource: 'openweather',
        lastUpdated: new Date(),
        actualCondition: 'sunny',
      },
    });

    mockUseWeatherRecommendations.mockReturnValue({
      data: {
        ...mockRecommendationData,
        description: 'Perfect for sunny day activities',
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByText, queryByText } = render(
      <WeatherForYouRail onSelectProduct={mockOnSelectProduct} onSeeAll={mockOnSeeAll} />
    );

    // Should show sun emoji and no simulation badge
    expect(getByText('☀️')).toBeTruthy();
    expect(queryByText('SIM')).toBeFalsy();
    expect(getByText('Perfect for sunny day activities')).toBeTruthy();
  });

  it('should prefer provided condition over detected condition', async () => {
    mockUseWeatherCondition.mockReturnValue({
      condition: 'rain',
      isSimulated: true,
      debugInfo: {
        weatherSource: 'openweather',
        lastUpdated: new Date(),
      },
    });

    render(
      <WeatherForYouRail
        condition="sunny"
        onSelectProduct={mockOnSelectProduct}
        onSeeAll={mockOnSeeAll}
      />
    );

    // Should use provided condition, not detected
    expect(mockUseWeatherRecommendations).toHaveBeenCalledWith({
      condition: 'sunny',
      city: undefined,
      state: undefined,
      limit: 8,
      enabled: true,
    });
  });

  it('should show different emojis for different simulated conditions', () => {
    const conditionTests = [
      { condition: 'sunny', emoji: '☀️' },
      { condition: 'rain', emoji: '🌧️' },
      { condition: 'snow', emoji: '❄️' },
      { condition: 'cloudy', emoji: '☁️' },
    ];

    conditionTests.forEach(({ condition, emoji }) => {
      mockUseWeatherCondition.mockReturnValue({
        condition,
        isSimulated: true,
        debugInfo: {
          weatherSource: 'openweather',
          lastUpdated: new Date(),
        },
      });

      const { getByText, unmount } = render(
        <WeatherForYouRail onSelectProduct={mockOnSelectProduct} onSeeAll={mockOnSeeAll} />
      );

      expect(getByText(emoji)).toBeTruthy();
      expect(getByText('SIM')).toBeTruthy();

      unmount();
    });
  });

  it('should include simulation status in analytics events', async () => {
    mockUseWeatherCondition.mockReturnValue({
      condition: 'rain',
      isSimulated: true,
      debugInfo: {
        weatherSource: 'openweather',
        lastUpdated: new Date(),
      },
    });

    const { logEvent } = require('../utils/analytics');

    const { getByText } = render(
      <WeatherForYouRail onSelectProduct={mockOnSelectProduct} onSeeAll={mockOnSeeAll} />
    );

    // Simulate clicking "See All"
    const seeAllButton = getByText('See All');
    fireEvent.press(seeAllButton);

    expect(logEvent).toHaveBeenCalledWith(
      'weather_recs_view_all',
      expect.objectContaining({
        weather_condition: 'rain',
        is_simulated: true,
      })
    );
  });

  it('should handle missing weather condition gracefully', () => {
    mockUseWeatherCondition.mockReturnValue({
      condition: '',
      isSimulated: false,
      debugInfo: {
        weatherSource: 'time-of-day',
        lastUpdated: new Date(),
      },
    });

    const { UNSAFE_root } = render(
      <WeatherForYouRail onSelectProduct={mockOnSelectProduct} onSeeAll={mockOnSeeAll} />
    );

    // Should not render anything when no condition
    expect(UNSAFE_root).toBeEmptyElement();
  });

  it('should show loading state', () => {
    mockUseWeatherCondition.mockReturnValue({
      condition: 'rain',
      isSimulated: true,
      debugInfo: {
        weatherSource: 'openweather',
        lastUpdated: new Date(),
      },
    });

    mockUseWeatherRecommendations.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { getByText } = render(
      <WeatherForYouRail onSelectProduct={mockOnSelectProduct} onSeeAll={mockOnSeeAll} />
    );

    expect(getByText('Finding perfect picks...')).toBeTruthy();
    expect(getByText('SIM')).toBeTruthy(); // Simulation badge should still show
  });

  it('should show error state with retry option', () => {
    mockUseWeatherCondition.mockReturnValue({
      condition: 'rain',
      isSimulated: true,
      debugInfo: {
        weatherSource: 'openweather',
        lastUpdated: new Date(),
      },
    });

    const mockRefetch = jest.fn();
    mockUseWeatherRecommendations.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Network error',
      refetch: mockRefetch,
    });

    const { getByText } = render(
      <WeatherForYouRail onSelectProduct={mockOnSelectProduct} onSeeAll={mockOnSeeAll} />
    );

    expect(getByText('Unable to load weather recommendations')).toBeTruthy();

    const retryButton = getByText('Try Again');
    fireEvent.press(retryButton);

    expect(mockRefetch).toHaveBeenCalled();
  });
});
