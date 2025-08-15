/* eslint-env jest, node */
/* eslint-disable no-undef */
import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';

jest.mock('react-native', () => ({
  Linking: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    getInitialURL: jest.fn(() => Promise.resolve('jars://app/shop?store=midtown')),
  },
}));

jest.mock('../context/StoreContext', () => {
  const setPreferredStore = jest.fn();
  return {
    useStore: () => ({ setPreferredStore }),
    StoreProvider: ({ children }: any) => <>{children}</>,
    setPreferredStore,
  };
});
import useDeepLinkHandler from '../hooks/useDeepLinkHandler';
import { makeStore } from './testUtils';
import { NavigationContainer } from '@react-navigation/native';
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

const { setPreferredStore } = require('../context/StoreContext') as any;
const navigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate }),
}));

beforeEach(() => {
  setPreferredStore.mockReset();
});

test('deep link loads Shop with correct store', async () => {
  const stores = [makeStore()];
  const wrapper = ({ children }: any) => <NavigationContainer>{children}</NavigationContainer>;
  await act(async () => {
    renderHook(() => useDeepLinkHandler(stores), { wrapper });
  });
  await waitFor(() => expect(setPreferredStore).toHaveBeenCalled());
});
