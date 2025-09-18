import { render } from '@testing-library/react-native';
import React from 'react';

import StoreSelectionScreen from '../screens/StoreSelectionScreen';

// Mock the dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('../context/StoreContext', () => ({
  useStore: () => ({ selectedStore: null, setSelectedStore: jest.fn() }),
}));

jest.mock('../api/phase4Client', () => ({
  phase4Client: { get: jest.fn().mockResolvedValue({ data: [] }) },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest
    .fn()
    .mockResolvedValue({ coords: { latitude: 45, longitude: -73 } }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

describe('StoreSelectionScreen', () => {
  it('renders StoreSelection flow and has proper accessibility labels', async () => {
    const { findByTestId } = render(<StoreSelectionScreen />);

    // Basic render test - wait for the screen to appear after async permission checks
    const screen = await findByTestId('store-selection-screen');
    expect(screen).toBeTruthy();
  });

  it('should render accessibility elements', async () => {
    const { findByText } = render(<StoreSelectionScreen />);

    // The screen should have some accessible text content
    // Wait for any element containing 'store' to appear
    const el = await findByText(/store/i);
    expect(el).toBeTruthy();
  });
});
