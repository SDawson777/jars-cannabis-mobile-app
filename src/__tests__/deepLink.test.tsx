import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Linking } from 'react-native';
import useDeepLinkHandler from '../hooks/useDeepLinkHandler';

const setPreferredStore = jest.fn();
jest.mock('../context/StoreContext', () => ({
  useStore: () => ({ setPreferredStore }),
  StoreProvider: ({ children }: any) => <>{children}</>,
}));
import { NavigationContainer } from '@react-navigation/native';

jest.mock('react-native', () => ({
  Linking: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    getInitialURL: jest.fn(() => Promise.resolve('jars://shop?store=midtown')),
  },
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

const navigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate }),
}));

test('deep link loads Shop with correct store', async () => {
  const stores = [
    { id: '1', name: 'Midtown', slug: 'midtown', address: '', latitude: 0, longitude: 0 },
  ];
  const wrapper = ({ children }: any) => <NavigationContainer>{children}</NavigationContainer>;

  renderHook(() => useDeepLinkHandler(stores), { wrapper });
  await waitFor(() => expect(setPreferredStore).toHaveBeenCalled());
});
