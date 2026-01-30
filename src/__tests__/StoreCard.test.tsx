import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StoreCard from '../components/StoreCard';
import * as haptic from '../utils/haptic';

jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
}));

jest.mock('react-native-shimmer-placeholder', () => {
  const { View } = require('react-native');
  return ({ style }: any) => <View testID="shimmer" style={style} />;
});

jest.mock('lucide-react-native', () => ({
  MapPin: () => null,
  Star: () => null,
}));

const mockStore = {
  id: 'store-1',
  name: 'Downtown Dispensary',
  slug: 'downtown-dispensary',
  address: '123 Main St, City, ST 12345',
  latitude: 40.7128,
  longitude: -74.006,
};

describe('StoreCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render store name', () => {
    const { getByText } = render(
      <StoreCard
        store={mockStore}
        onSelect={jest.fn()}
        onGetDirections={jest.fn()}
        onSetPreferred={jest.fn()}
      />
    );
    expect(getByText('Downtown Dispensary')).toBeTruthy();
  });

  it('should render store address', () => {
    const { getByText } = render(
      <StoreCard
        store={mockStore}
        onSelect={jest.fn()}
        onGetDirections={jest.fn()}
        onSetPreferred={jest.fn()}
      />
    );
    expect(getByText('123 Main St, City, ST 12345')).toBeTruthy();
  });

  it('should render distance label when provided', () => {
    const { getByText } = render(
      <StoreCard
        store={mockStore}
        distanceLabel="2.5 mi"
        onSelect={jest.fn()}
        onGetDirections={jest.fn()}
        onSetPreferred={jest.fn()}
      />
    );
    expect(getByText('2.5 mi')).toBeTruthy();
  });

  it('should call onSelect when card pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <StoreCard
        store={mockStore}
        onSelect={onSelect}
        onGetDirections={jest.fn()}
        onSetPreferred={jest.fn()}
      />
    );
    fireEvent.press(getByText('Downtown Dispensary'));
    expect(onSelect).toHaveBeenCalled();
    expect(haptic.hapticLight).toHaveBeenCalled();
  });

  it('should call onGetDirections when directions button pressed', () => {
    const onGetDirections = jest.fn();
    const { getByText } = render(
      <StoreCard
        store={mockStore}
        onSelect={jest.fn()}
        onGetDirections={onGetDirections}
        onSetPreferred={jest.fn()}
      />
    );
    fireEvent.press(getByText('Directions'));
    expect(onGetDirections).toHaveBeenCalled();
    expect(haptic.hapticMedium).toHaveBeenCalled();
  });

  it('should call onSetPreferred when preferred button pressed', () => {
    const onSetPreferred = jest.fn();
    const { getByText } = render(
      <StoreCard
        store={mockStore}
        onSelect={jest.fn()}
        onGetDirections={jest.fn()}
        onSetPreferred={onSetPreferred}
      />
    );
    fireEvent.press(getByText('Preferred'));
    expect(onSetPreferred).toHaveBeenCalled();
    expect(haptic.hapticMedium).toHaveBeenCalled();
  });

  it('should render loading state', () => {
    const { getAllByTestId } = render(
      <StoreCard
        store={mockStore}
        isLoading={true}
        onSelect={jest.fn()}
        onGetDirections={jest.fn()}
        onSetPreferred={jest.fn()}
      />
    );
    expect(getAllByTestId('shimmer').length).toBeGreaterThan(0);
  });

  it('should render details button when onViewDetails provided', () => {
    const onViewDetails = jest.fn();
    const { getByText } = render(
      <StoreCard
        store={mockStore}
        onSelect={jest.fn()}
        onGetDirections={jest.fn()}
        onSetPreferred={jest.fn()}
        onViewDetails={onViewDetails}
      />
    );
    fireEvent.press(getByText('Details'));
    expect(onViewDetails).toHaveBeenCalled();
  });
});
