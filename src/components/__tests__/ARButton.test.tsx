import React from 'react';
import { render } from '@testing-library/react-native';
import { Button } from 'react-native';
import * as Linking from 'expo-linking';
import ARButton from '../ARButton';

jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
}));

jest.mock('../../utils/apiConfig', () => ({
  API_BASE_URL: 'https://api.example.com',
}));

describe('ARButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button with correct title', () => {
    const { UNSAFE_getAllByType } = render(<ARButton productId="product-123" />);
    const buttons = UNSAFE_getAllByType(Button);
    expect(buttons.length).toBe(1);
    expect(buttons[0].props.title).toBe('See it in your space');
  });

  it('opens AR URL when pressed with correct productId', () => {
    const { UNSAFE_getAllByType } = render(<ARButton productId="product-456" />);
    const buttons = UNSAFE_getAllByType(Button);
    buttons[0].props.onPress();
    expect(Linking.openURL).toHaveBeenCalledWith('https://api.example.com/ar/models/product-456');
  });

  it('opens AR URL for different productIds', () => {
    const { UNSAFE_getAllByType } = render(<ARButton productId="abc-xyz" />);
    const buttons = UNSAFE_getAllByType(Button);
    buttons[0].props.onPress();
    expect(Linking.openURL).toHaveBeenCalledWith('https://api.example.com/ar/models/abc-xyz');
  });
});
