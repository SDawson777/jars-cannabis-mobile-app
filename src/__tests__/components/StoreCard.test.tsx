/**
 * @jest-environment jsdom
 */

import { render, fireEvent } from '@testing-library/react-native';
import StoreCard from '../../components/StoreCard';

// Mock haptic
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
}));

// Mock shimmer placeholder
jest.mock('react-native-shimmer-placeholder', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="shimmer" {...props} />,
  };
});

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  MapPin: () => null,
  Star: () => null,
}));

import { hapticLight, hapticMedium } from '../../utils/haptic';

describe('StoreCard', () => {
  const mockStore = {
    id: 'store-1',
    name: 'JARS Midtown',
    address: '123 Main St, Detroit, MI',
    phone: '555-1234',
    hours: { open: '9am', close: '9pm' },
  };

  const defaultProps = {
    store: mockStore,
    onSelect: jest.fn(),
    onGetDirections: jest.fn(),
    onSetPreferred: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders store name', () => {
    const { getByText } = render(<StoreCard {...defaultProps} />);
    expect(getByText('JARS Midtown')).toBeTruthy();
  });

  it('renders store address', () => {
    const { getByText } = render(<StoreCard {...defaultProps} />);
    expect(getByText('123 Main St, Detroit, MI')).toBeTruthy();
  });

  it('renders distance label when provided', () => {
    const { getByText } = render(<StoreCard {...defaultProps} distanceLabel="2.5 mi away" />);
    expect(getByText('2.5 mi away')).toBeTruthy();
  });

  it('calls onSelect when card is pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = render(<StoreCard {...defaultProps} onSelect={onSelect} />);

    fireEvent.press(getByText('JARS Midtown'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(hapticLight).toHaveBeenCalled();
  });

  it('calls onGetDirections when Directions button pressed', () => {
    const onGetDirections = jest.fn();
    const { getByText } = render(<StoreCard {...defaultProps} onGetDirections={onGetDirections} />);

    fireEvent.press(getByText('Directions'));

    expect(onGetDirections).toHaveBeenCalledTimes(1);
    expect(hapticMedium).toHaveBeenCalled();
  });

  it('calls onSetPreferred when Preferred button pressed', () => {
    const onSetPreferred = jest.fn();
    const { getByText } = render(<StoreCard {...defaultProps} onSetPreferred={onSetPreferred} />);

    fireEvent.press(getByText('Preferred'));

    expect(onSetPreferred).toHaveBeenCalledTimes(1);
    expect(hapticMedium).toHaveBeenCalled();
  });

  it('shows Details button when onViewDetails is provided', () => {
    const onViewDetails = jest.fn();
    const { getByText } = render(<StoreCard {...defaultProps} onViewDetails={onViewDetails} />);

    expect(getByText('Details')).toBeTruthy();
    fireEvent.press(getByText('Details'));
    expect(onViewDetails).toHaveBeenCalledTimes(1);
  });

  it('does not show Details button when onViewDetails is not provided', () => {
    const { queryByText } = render(<StoreCard {...defaultProps} />);
    expect(queryByText('Details')).toBeNull();
  });

  it('renders loading state with shimmer', () => {
    const { getAllByTestId } = render(<StoreCard {...defaultProps} isLoading={true} />);
    expect(getAllByTestId('shimmer').length).toBeGreaterThan(0);
  });

  it('does not render store name in loading state', () => {
    const { queryByText } = render(<StoreCard {...defaultProps} isLoading={true} />);
    expect(queryByText('JARS Midtown')).toBeNull();
  });
});
