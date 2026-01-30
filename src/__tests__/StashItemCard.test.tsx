import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StashItemCard from '../components/StashItemCard';
import * as haptic from '../utils/haptic';

jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  BookOpen: () => null,
  ShoppingCart: () => null,
}));

const mockItem = {
  id: 'stash-1',
  name: 'Blue Dream',
  strainType: 'Hybrid',
  purchaseDate: '2024-01-15',
  imageUrl: 'https://example.com/blue-dream.jpg',
  status: 'in_stock',
};

describe('StashItemCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render item name', () => {
    const { getByText } = render(<StashItemCard item={mockItem} onJournal={jest.fn()} />);
    expect(getByText('Blue Dream')).toBeTruthy();
  });

  it('should render strain type', () => {
    const { getByText } = render(<StashItemCard item={mockItem} onJournal={jest.fn()} />);
    expect(getByText('Hybrid')).toBeTruthy();
  });

  it('should render purchase date', () => {
    const { getByText } = render(<StashItemCard item={mockItem} onJournal={jest.fn()} />);
    expect(getByText('2024-01-15')).toBeTruthy();
  });

  it('should call onJournal when journal button pressed', () => {
    const onJournal = jest.fn();
    const { getByText } = render(<StashItemCard item={mockItem} onJournal={onJournal} />);
    fireEvent.press(getByText('Journal'));
    expect(onJournal).toHaveBeenCalled();
  });

  it('should trigger haptic feedback on journal press', () => {
    const { getByText } = render(<StashItemCard item={mockItem} onJournal={jest.fn()} />);
    fireEvent.press(getByText('Journal'));
    expect(haptic.hapticLight).toHaveBeenCalled();
  });

  it('should render reorder button when onReorder provided', () => {
    const { getByText } = render(
      <StashItemCard item={mockItem} onJournal={jest.fn()} onReorder={jest.fn()} />
    );
    expect(getByText('Reorder')).toBeTruthy();
  });

  it('should not render reorder button when onReorder not provided', () => {
    const { queryByText } = render(<StashItemCard item={mockItem} onJournal={jest.fn()} />);
    expect(queryByText('Reorder')).toBeNull();
  });

  it('should call onReorder when reorder button pressed', () => {
    const onReorder = jest.fn();
    const { getByText } = render(
      <StashItemCard item={mockItem} onJournal={jest.fn()} onReorder={onReorder} />
    );
    fireEvent.press(getByText('Reorder'));
    expect(onReorder).toHaveBeenCalled();
  });

  it('should trigger haptic feedback on reorder press', () => {
    const { getByText } = render(
      <StashItemCard item={mockItem} onJournal={jest.fn()} onReorder={jest.fn()} />
    );
    fireEvent.press(getByText('Reorder'));
    expect(haptic.hapticLight).toHaveBeenCalled();
  });

  it('should render item image when imageUrl provided', () => {
    const { UNSAFE_getByType } = render(<StashItemCard item={mockItem} onJournal={jest.fn()} />);
    const { Image } = require('react-native');
    expect(UNSAFE_getByType(Image)).toBeTruthy();
  });
});
