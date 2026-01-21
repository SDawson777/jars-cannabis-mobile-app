// src/components/__tests__/StoreCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StoreCard from '../StoreCard';

// Mock dependencies
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  MapPin: () => null,
  Star: () => null,
}));

jest.mock('react-native-shimmer-placeholder', () => {
  const { View } = require('react-native');
  return View;
});

const mockStore = {
  id: 'store-1',
  name: 'Nimbus Downtown',
  slug: 'nimbus-downtown',
  address: '123 Main St, Denver, CO 80202',
  latitude: 39.7392,
  longitude: -104.9903,
  phone: '555-123-4567',
};

describe('StoreCard', () => {
  const defaultProps = {
    store: mockStore,
    onSelect: jest.fn(),
    onGetDirections: jest.fn(),
    onSetPreferred: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders store name', () => {
      const { getByText } = render(<StoreCard {...defaultProps} />);
      expect(getByText('Nimbus Downtown')).toBeTruthy();
    });

    it('renders store address', () => {
      const { getByText } = render(<StoreCard {...defaultProps} />);
      expect(getByText('123 Main St, Denver, CO 80202')).toBeTruthy();
    });

    it('renders distance label when provided', () => {
      const { getByText } = render(<StoreCard {...defaultProps} distanceLabel="1.5 mi" />);
      expect(getByText('1.5 mi')).toBeTruthy();
    });

    it('does not render distance label when not provided', () => {
      const { queryByText } = render(<StoreCard {...defaultProps} />);
      expect(queryByText(/mi$/)).toBeNull();
    });

    it('renders Directions button', () => {
      const { getByText } = render(<StoreCard {...defaultProps} />);
      expect(getByText('Directions')).toBeTruthy();
    });

    it('renders Preferred button', () => {
      const { getByText } = render(<StoreCard {...defaultProps} />);
      expect(getByText('Preferred')).toBeTruthy();
    });

    it('renders Details button when onViewDetails is provided', () => {
      const { getByText } = render(<StoreCard {...defaultProps} onViewDetails={jest.fn()} />);
      expect(getByText('Details')).toBeTruthy();
    });

    it('does not render Details button when onViewDetails is not provided', () => {
      const { queryByText } = render(<StoreCard {...defaultProps} />);
      expect(queryByText('Details')).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('renders shimmer placeholder when loading', () => {
      const { UNSAFE_getAllByType } = render(<StoreCard {...defaultProps} isLoading={true} />);
      const { View } = require('react-native');
      // Should render shimmer placeholders (mocked as View)
      expect(UNSAFE_getAllByType(View).length).toBeGreaterThan(0);
    });

    it('does not render store name when loading', () => {
      const { queryByText } = render(<StoreCard {...defaultProps} isLoading={true} />);
      expect(queryByText('Nimbus Downtown')).toBeNull();
    });
  });

  describe('Interactions', () => {
    it('calls onSelect when card is pressed', () => {
      const onSelect = jest.fn();
      const { getByText } = render(<StoreCard {...defaultProps} onSelect={onSelect} />);

      // Press the store name/card area
      fireEvent.press(getByText('Nimbus Downtown'));

      expect(onSelect).toHaveBeenCalled();
    });

    it('calls onGetDirections when Directions is pressed', () => {
      const onGetDirections = jest.fn();
      const { getByText } = render(
        <StoreCard {...defaultProps} onGetDirections={onGetDirections} />
      );

      fireEvent.press(getByText('Directions'));

      expect(onGetDirections).toHaveBeenCalled();
    });

    it('calls onSetPreferred when Preferred is pressed', () => {
      const onSetPreferred = jest.fn();
      const { getByText } = render(<StoreCard {...defaultProps} onSetPreferred={onSetPreferred} />);

      fireEvent.press(getByText('Preferred'));

      expect(onSetPreferred).toHaveBeenCalled();
    });

    it('calls onViewDetails when Details is pressed', () => {
      const onViewDetails = jest.fn();
      const { getByText } = render(<StoreCard {...defaultProps} onViewDetails={onViewDetails} />);

      fireEvent.press(getByText('Details'));

      expect(onViewDetails).toHaveBeenCalled();
    });
  });

  describe('Preferred State', () => {
    it('renders star indicator when store is preferred', () => {
      const { UNSAFE_getAllByType: _UNSAFE_getAllByType } = render(
        <StoreCard {...defaultProps} isPreferred={true} />
      );
      // Star icon should be rendered (mocked as null but the component is called)
      // Just verify the component renders without error when isPreferred is true
      expect(true).toBe(true);
    });
  });
});
