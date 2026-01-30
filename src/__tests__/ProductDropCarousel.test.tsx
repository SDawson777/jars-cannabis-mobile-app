import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductDropCarousel from '../components/ProductDropCarousel';
import { hapticLight } from '../utils/haptic';
import type { CMSDrop } from '../types/cms';

// Mock haptic feedback
jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

// Mock CMSImage component
jest.mock('../components/CMSImage', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function CMSImage() {
    return React.createElement(View, { testID: 'cms-image' });
  };
});

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({ width: 375, height: 812 })),
}));

describe('ProductDropCarousel', () => {
  const mockDrops: CMSDrop[] = [
    {
      __id: 'drop-1',
      title: 'Summer Sale',
      highlight: 'Up to 30% off',
      items: 15,
      image: {
        url: 'https://example.com/summer.jpg',
        alt: 'Summer sale products',
      },
    },
    {
      __id: 'drop-2',
      title: 'New Arrivals',
      items: 8,
      image: {
        url: 'https://example.com/new.jpg',
        alt: 'New arrival products',
      },
    },
    {
      __id: 'drop-3',
      title: 'Best Sellers',
      highlight: 'Top picks this week',
      items: 12,
      image: {
        url: 'https://example.com/bestsellers.jpg',
        alt: 'Best selling products',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders all drops', () => {
    const { getByText } = render(<ProductDropCarousel drops={mockDrops} />);

    expect(getByText('Summer Sale')).toBeTruthy();
    expect(getByText('New Arrivals')).toBeTruthy();
    expect(getByText('Best Sellers')).toBeTruthy();
  });

  it('renders item counts for each drop', () => {
    const { getByText } = render(<ProductDropCarousel drops={mockDrops} />);

    expect(getByText('15 items')).toBeTruthy();
    expect(getByText('8 items')).toBeTruthy();
    expect(getByText('12 items')).toBeTruthy();
  });

  it('renders highlight text when present', () => {
    const { getByText } = render(<ProductDropCarousel drops={mockDrops} />);

    expect(getByText('Up to 30% off')).toBeTruthy();
    expect(getByText('Top picks this week')).toBeTruthy();
  });

  it('does not render highlight when missing', () => {
    const { queryByText } = render(<ProductDropCarousel drops={mockDrops} />);

    // New Arrivals has no highlight
    expect(queryByText('undefined')).toBeNull();
  });

  it('calls onPress callback when drop is pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<ProductDropCarousel drops={mockDrops} onPress={onPress} />);

    fireEvent.press(getByText('Summer Sale'));

    expect(onPress).toHaveBeenCalledWith(mockDrops[0]);
  });

  it('triggers haptic feedback when drop is pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<ProductDropCarousel drops={mockDrops} onPress={onPress} />);

    fireEvent.press(getByText('New Arrivals'));

    expect(hapticLight).toHaveBeenCalledTimes(1);
  });

  it('handles pressing different drops', () => {
    const onPress = jest.fn();
    const { getByText } = render(<ProductDropCarousel drops={mockDrops} onPress={onPress} />);

    fireEvent.press(getByText('Summer Sale'));
    fireEvent.press(getByText('Best Sellers'));

    expect(onPress).toHaveBeenCalledTimes(2);
    expect(onPress).toHaveBeenNthCalledWith(1, mockDrops[0]);
    expect(onPress).toHaveBeenNthCalledWith(2, mockDrops[2]);
  });

  it('works without onPress callback', () => {
    const { getByText } = render(<ProductDropCarousel drops={mockDrops} />);

    // Should not throw error
    expect(() => fireEvent.press(getByText('Summer Sale'))).not.toThrow();
  });

  it('renders empty carousel with no drops', () => {
    const { toJSON } = render(<ProductDropCarousel drops={[]} />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders single drop correctly', () => {
    const singleDrop = [mockDrops[0]];
    const { getByText } = render(<ProductDropCarousel drops={singleDrop} />);

    expect(getByText('Summer Sale')).toBeTruthy();
    expect(getByText('15 items')).toBeTruthy();
  });

  it('renders CMSImage for each drop', () => {
    const { getAllByTestId } = render(<ProductDropCarousel drops={mockDrops} />);

    const images = getAllByTestId('cms-image');
    expect(images).toHaveLength(3);
  });
});
