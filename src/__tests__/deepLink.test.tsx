/* eslint-env jest, node */
/* eslint-disable no-undef */
import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';

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

const { setPreferredStore } = require('../context/StoreContext') as any;
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn() }),
  };
});

beforeEach(() => {
  setPreferredStore.mockReset();
  SecureStore.getItemAsync.mockResolvedValue(null);
  SecureStore.setItemAsync.mockResolvedValue(undefined);
  SecureStore.deleteItemAsync.mockResolvedValue(undefined);
});

test('deep link loads Shop with correct store', async () => {
  const stores = [makeStore()];
  const wrapper = ({ children }: any) => <NavigationContainer>{children}</NavigationContainer>;
  await act(async () => {
    renderHook(() => useDeepLinkHandler(stores), { wrapper });
  });
  await waitFor(() => expect(setPreferredStore).toHaveBeenCalled());
});
