// src/components/__tests__/BannerCarousel.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BannerCarousel from '../BannerCarousel';

// Mock dependencies
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('../CMSImage', () => {
  const { View } = require('react-native');
  return ({ uri: _uri, alt }: any) => <View testID={`cms-image-${alt}`} />;
});

const mockBanners = [
  {
    __id: 'banner-1',
    title: 'Summer Sale',
    image: { url: 'https://example.com/banner1.jpg', alt: 'Summer Sale' },
    cta: 'Shop Now',
  },
  {
    __id: 'banner-2',
    title: 'New Arrivals',
    image: { url: 'https://example.com/banner2.jpg', alt: 'New Arrivals' },
    cta: 'Discover',
  },
  {
    __id: 'banner-3',
    title: 'Free Delivery',
    image: { url: 'https://example.com/banner3.jpg', alt: 'Free Delivery' },
  },
];

describe('BannerCarousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders all banners', () => {
      const { getByTestId } = render(<BannerCarousel banners={mockBanners} />);
      expect(getByTestId('cms-image-Summer Sale')).toBeTruthy();
      expect(getByTestId('cms-image-New Arrivals')).toBeTruthy();
      expect(getByTestId('cms-image-Free Delivery')).toBeTruthy();
    });

    it('renders CTA text when provided', () => {
      const { getByText } = render(<BannerCarousel banners={mockBanners} />);
      expect(getByText('Shop Now')).toBeTruthy();
      expect(getByText('Discover')).toBeTruthy();
    });

    it('does not render CTA when not provided', () => {
      const bannersWithoutCta = [
        {
          __id: 'banner-1',
          title: 'No CTA Banner',
          image: { url: 'https://example.com/banner1.jpg', alt: 'No CTA Banner' },
        },
      ];
      const { queryByText } = render(<BannerCarousel banners={bannersWithoutCta} />);
      // No CTA should be rendered
      expect(queryByText('Shop Now')).toBeNull();
      expect(queryByText('Discover')).toBeNull();
    });

    it('renders empty when no banners', () => {
      const { UNSAFE_getAllByType } = render(<BannerCarousel banners={[]} />);
      const { Pressable } = require('react-native');
      expect(() => UNSAFE_getAllByType(Pressable)).toThrow();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when banner is pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(<BannerCarousel banners={mockBanners} onPress={onPress} />);

      fireEvent.press(getByText('Shop Now'));

      expect(onPress).toHaveBeenCalledWith(mockBanners[0]);
    });

    it('calls onPress with correct banner', () => {
      const onPress = jest.fn();
      const { getByText } = render(<BannerCarousel banners={mockBanners} onPress={onPress} />);

      fireEvent.press(getByText('Discover'));

      expect(onPress).toHaveBeenCalledWith(mockBanners[1]);
    });
  });

  describe('Auto-scroll', () => {
    it('sets up interval for auto-scroll', () => {
      render(<BannerCarousel banners={mockBanners} />);

      // Interval should be set
      expect(jest.getTimerCount()).toBe(1);
    });

    it('clears interval on unmount', () => {
      const { unmount } = render(<BannerCarousel banners={mockBanners} />);

      unmount();

      // Interval should be cleared
      expect(jest.getTimerCount()).toBe(0);
    });
  });
});
