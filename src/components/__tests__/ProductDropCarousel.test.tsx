// src/components/__tests__/ProductDropCarousel.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductDropCarousel from '../ProductDropCarousel';

// Mock dependencies
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('../CMSImage', () => {
  const { View } = require('react-native');
  return ({ uri: _uri, alt }: any) => <View testID={`cms-image-${alt}`} />;
});

const mockDrops = [
  {
    __id: 'drop-1',
    title: 'Summer Collection',
    image: { url: 'https://example.com/drop1.jpg', alt: 'Summer Drop' },
    highlight: 'Limited Edition',
    items: 12,
  },
  {
    __id: 'drop-2',
    title: 'New Strains',
    image: { url: 'https://example.com/drop2.jpg', alt: 'New Strains Drop' },
    items: 8,
  },
];

describe('ProductDropCarousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders all drops', () => {
      const { getByTestId } = render(<ProductDropCarousel drops={mockDrops} />);
      expect(getByTestId('cms-image-Summer Drop')).toBeTruthy();
      expect(getByTestId('cms-image-New Strains Drop')).toBeTruthy();
    });

    it('renders drop titles', () => {
      const { getByText } = render(<ProductDropCarousel drops={mockDrops} />);
      expect(getByText('Summer Collection')).toBeTruthy();
      expect(getByText('New Strains')).toBeTruthy();
    });

    it('renders item count', () => {
      const { getByText } = render(<ProductDropCarousel drops={mockDrops} />);
      expect(getByText('12 items')).toBeTruthy();
      expect(getByText('8 items')).toBeTruthy();
    });

    it('renders highlight when provided', () => {
      const { getByText } = render(<ProductDropCarousel drops={mockDrops} />);
      expect(getByText('Limited Edition')).toBeTruthy();
    });

    it('does not render highlight when not provided', () => {
      const dropsWithoutHighlight = [
        {
          __id: 'drop-1',
          title: 'Test Drop',
          image: { url: 'https://example.com/drop.jpg', alt: 'Test' },
          items: 5,
        },
      ];
      const { queryByText } = render(<ProductDropCarousel drops={dropsWithoutHighlight} />);
      expect(queryByText('Limited Edition')).toBeNull();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when drop is pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(<ProductDropCarousel drops={mockDrops} onPress={onPress} />);

      fireEvent.press(getByText('Summer Collection'));

      expect(onPress).toHaveBeenCalledWith(mockDrops[0]);
    });

    it('calls onPress with correct drop', () => {
      const onPress = jest.fn();
      const { getByText } = render(<ProductDropCarousel drops={mockDrops} onPress={onPress} />);

      fireEvent.press(getByText('New Strains'));

      expect(onPress).toHaveBeenCalledWith(mockDrops[1]);
    });
  });

  describe('Auto-scroll', () => {
    it('sets up interval for auto-scroll', () => {
      render(<ProductDropCarousel drops={mockDrops} />);
      expect(jest.getTimerCount()).toBe(1);
    });

    it('clears interval on unmount', () => {
      const { unmount } = render(<ProductDropCarousel drops={mockDrops} />);
      unmount();
      expect(jest.getTimerCount()).toBe(0);
    });
  });
});
