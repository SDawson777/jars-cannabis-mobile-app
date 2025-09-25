import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import WeatherForYouRail from '../WeatherForYouRail';

// Mock the hooks
jest.mock('../../hooks/useWeatherRecommendations');
jest.mock('../../hooks/useWeatherCondition');

const mockUseWeatherRecommendations = require('../../hooks/useWeatherRecommendations')
  .useWeatherRecommendations as jest.Mock;
const mockUseWeatherCondition = require('../../hooks/useWeatherCondition')
  .useWeatherCondition as jest.Mock;

// Mock haptic feedback
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

describe('WeatherForYouRail', () => {
  const mockOnSelectProduct = jest.fn();
  const mockOnSeeAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for useWeatherCondition
    mockUseWeatherCondition.mockReturnValue({
      condition: 'sunny',
      isSimulated: false,
      debugInfo: {
        weatherSource: 'openweather',
        lastUpdated: new Date(),
      },
    });
  });

  it('should render loading state', () => {
    mockUseWeatherRecommendations.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<WeatherForYouRail condition="sunny" onSelectProduct={mockOnSelectProduct} />);

    expect(screen.getByText('Finding perfect picks...')).toBeTruthy();
  });

  it('should render weather recommendations successfully', async () => {
    const mockData = {
      condition: 'sunny',
      tags: ['Energizing', 'Uplifting', 'Daytime'],
      description: 'Perfect sunny day picks for outdoor activities and energy',
      products: [
        {
          __id: '1',
          name: 'Test Product 1',
          price: 25.99,
          slug: 'test-product-1',
          type: 'Flower',
          image: { url: 'https://example.com/image1.jpg' },
        },
        {
          __id: '2',
          name: 'Test Product 2',
          price: 35.5,
          slug: 'test-product-2',
          type: 'Concentrate',
          image: { url: 'https://example.com/image2.jpg' },
        },
      ],
    };

    mockUseWeatherRecommendations.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <WeatherForYouRail
        condition="sunny"
        onSelectProduct={mockOnSelectProduct}
        onSeeAll={mockOnSeeAll}
      />
    );

    // Check if the title is rendered with weather emoji
    expect(screen.getByText(mockData.description)).toBeTruthy();
    expect(screen.getByText('☀️')).toBeTruthy();

    // Check if tags are rendered
    expect(screen.getByText('Energizing')).toBeTruthy();
    expect(screen.getByText('Uplifting')).toBeTruthy();
    expect(screen.getByText('Daytime')).toBeTruthy();

    // Check if "See All" button is rendered
    expect(screen.getByText('See All')).toBeTruthy();
  });

  it('should render error state with retry button', () => {
    const mockRefetch = jest.fn();
    mockUseWeatherRecommendations.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Network error',
      refetch: mockRefetch,
    });

    render(
      <WeatherForYouRail
        condition="sunny"
        onSelectProduct={mockOnSelectProduct}
        showEmptyState={true}
      />
    );

    expect(screen.getByText('Unable to load weather recommendations')).toBeTruthy();

    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeTruthy();

    fireEvent.press(retryButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should render empty state when no products are available', () => {
    mockUseWeatherRecommendations.mockReturnValue({
      data: {
        condition: 'sunny',
        tags: ['Energizing'],
        description: 'Perfect sunny day picks',
        products: [],
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <WeatherForYouRail
        condition="sunny"
        onSelectProduct={mockOnSelectProduct}
        showEmptyState={true}
      />
    );

    expect(screen.getByText('No recommendations available for sunny weather')).toBeTruthy();
  });

  it('should not render when no condition is provided', () => {
    // Mock no condition from useWeatherCondition
    mockUseWeatherCondition.mockReturnValue({
      condition: '', // Empty condition
      isSimulated: false,
      debugInfo: {
        weatherSource: 'time-of-day',
        lastUpdated: new Date(),
      },
    });

    mockUseWeatherRecommendations.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<WeatherForYouRail onSelectProduct={mockOnSelectProduct} />);

    // Component should render nothing, so we shouldn't find the testID
    expect(screen.queryByTestId('weather-for-you-rail')).toBeNull();
  });

  it('should call onSeeAll when See All is pressed', () => {
    const mockData = {
      condition: 'sunny',
      tags: ['Energizing'],
      description: 'Perfect sunny day picks',
      products: [
        {
          __id: '1',
          name: 'Test Product',
          price: 25.99,
          slug: 'test-product',
          type: 'Flower',
          image: { url: 'https://example.com/image.jpg' },
        },
      ],
    };

    mockUseWeatherRecommendations.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <WeatherForYouRail
        condition="sunny"
        onSelectProduct={mockOnSelectProduct}
        onSeeAll={mockOnSeeAll}
      />
    );

    const seeAllButton = screen.getByText('See All');
    fireEvent.press(seeAllButton);

    expect(mockOnSeeAll).toHaveBeenCalled();
  });

  it('should render correct weather emojis for different conditions', () => {
    const conditions = [
      { condition: 'sunny', emoji: '☀️' },
      { condition: 'clear', emoji: '🌤️' },
      { condition: 'partly cloudy', emoji: '⛅' },
      { condition: 'cloudy', emoji: '☁️' },
      { condition: 'overcast', emoji: '🌫️' },
      { condition: 'rain', emoji: '🌧️' },
      { condition: 'snow', emoji: '❄️' },
      { condition: 'thunderstorm', emoji: '⛈️' },
    ];

    conditions.forEach(({ condition, emoji }) => {
      mockUseWeatherRecommendations.mockReturnValue({
        data: {
          condition,
          tags: ['Test'],
          description: `${condition} weather`,
          products: [],
        },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { unmount } = render(
        <WeatherForYouRail
          condition={condition}
          onSelectProduct={mockOnSelectProduct}
          showEmptyState={true}
        />
      );

      expect(screen.getByText(emoji)).toBeTruthy();
      unmount();
    });
  });
});
