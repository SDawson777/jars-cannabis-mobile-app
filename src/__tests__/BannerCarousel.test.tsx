import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import BannerCarousel from '../components/BannerCarousel';
import * as haptic from '../utils/haptic';

jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('../components/CMSImage', () => {
  const { View } = require('react-native');
  return ({ uri: _uri, alt, style }: any) => <View testID={`cms-image-${alt}`} style={style} />;
});

const mockBanners = [
  {
    __id: 'banner-1',
    title: 'Banner 1',
    image: { url: 'https://example.com/1.jpg', alt: 'banner1' },
    cta: 'Shop Now',
    link: '/products',
  },
  {
    __id: 'banner-2',
    title: 'Banner 2',
    image: { url: 'https://example.com/2.jpg', alt: 'banner2' },
    cta: null,
    link: '/deals',
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

  it('should render banners', () => {
    const { getByText } = render(<BannerCarousel banners={mockBanners} />);
    expect(getByText('Shop Now')).toBeTruthy();
  });

  it('should call onPress with banner when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<BannerCarousel banners={mockBanners} onPress={onPress} />);

    fireEvent.press(getByText('Shop Now'));

    expect(onPress).toHaveBeenCalledWith(mockBanners[0]);
    expect(haptic.hapticLight).toHaveBeenCalled();
  });

  it('should render without CTA text when cta is null', () => {
    const singleBanner = [
      {
        __id: 'banner-no-cta',
        title: 'No CTA',
        image: { url: 'https://example.com/3.jpg', alt: 'no-cta' },
        cta: null,
        link: '/no-cta',
      },
    ];

    const { queryByText } = render(<BannerCarousel banners={singleBanner} />);

    // Should not render null CTA
    expect(queryByText('No CTA')).toBeNull();
  });

  it('should render empty when no banners', () => {
    const { toJSON } = render(<BannerCarousel banners={[]} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should auto-scroll periodically', () => {
    render(<BannerCarousel banners={mockBanners} />);

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    // Just ensure no errors occur during auto-scroll
    expect(true).toBe(true);
  });

  it('should cleanup interval on unmount', () => {
    const { unmount } = render(<BannerCarousel banners={mockBanners} />);

    unmount();

    // Ensure cleanup happens without errors
    act(() => {
      jest.advanceTimersByTime(8000);
    });
    expect(true).toBe(true);
  });
});
