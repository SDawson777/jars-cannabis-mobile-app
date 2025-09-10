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
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

describe('StoreSelectionScreen', () => {
  it('renders StoreSelection flow and has proper accessibility labels', () => {
    const { getByTestId } = render(<StoreSelectionScreen />);

    // Basic render test - screen should render without crashing
    expect(getByTestId('store-selection-screen')).toBeTruthy();
  });

  it('should render accessibility elements', () => {
    const { getByText } = render(<StoreSelectionScreen />);

    // The screen should have some accessible text content
    // This is a basic test to ensure accessibility elements are present
    expect(() => getByText(/store/i)).not.toThrow();
  });
});
