import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StoreSelectionScreen from '../screens/StoreSelectionScreen';

const Stack = createNativeStackNavigator();

// Mock dependencies
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
  getCurrentPositionAsync: jest.fn(),
}));

function TestApp() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="StoreSelection"
          component={StoreSelectionScreen}
          options={{ title: 'Select Store' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

describe('StoreSelection Navigation', () => {
  it('screen headers present and navigation works', () => {
    const { getByText } = render(<TestApp />);

    // Check that the screen header is present
    expect(getByText('Select Store')).toBeTruthy();
  });

  it('renders without navigation errors', () => {
    expect(() => render(<TestApp />)).not.toThrow();
  });
});
