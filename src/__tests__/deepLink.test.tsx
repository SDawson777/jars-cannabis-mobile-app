/* eslint-disable */
import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';

jest.mock('react-native', () => ({
  Linking: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    getInitialURL: jest.fn(() => Promise.resolve('jars://app/shop?store=midtown')),
  },
}));

import useDeepLinkHandler from '../hooks/useDeepLinkHandler';
import { makeStore } from './testUtils';

const mockSetPreferredStore = jest.fn();
jest.mock('../context/StoreContext', () => ({
  useStore: () => ({ setPreferredStore: mockSetPreferredStore }),
  StoreProvider: ({ children }: any) => <>{children}</>,
}));
import { NavigationContainer } from '@react-navigation/native';
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

test('deep link loads Shop with correct store', async () => {
  const stores = [makeStore()];
  const wrapper = ({ children }: any) => <NavigationContainer>{children}</NavigationContainer>;
  await act(async () => {
    renderHook(() => useDeepLinkHandler(stores), { wrapper });
  });
  await waitFor(() => expect(mockSetPreferredStore).toHaveBeenCalled());
});
