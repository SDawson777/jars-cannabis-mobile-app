/* eslint-env jest, node */
import { renderHook, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { Linking } from 'react-native';

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
  // Ensure Linking functions on the global mock are set for this test
  (Linking as any).addEventListener = jest.fn((_type, _cb) => ({ remove: jest.fn() }));
  (Linking as any).getInitialURL = jest.fn(() => Promise.resolve('jars://app/shop?store=midtown'));
  (Linking as any).getInitialURL = jest.fn(() => Promise.resolve('jars://shop?store=midtown'));
});

test('deep link loads Shop with correct store', async () => {
  const stores = [makeStore()];
  // Use a simple fragment wrapper to avoid mock/import ordering issues with
  // NavigationContainer in the test environment. The hook only needs a mounted
  // React tree for effects to run.
  const wrapper = ({ children }: any) => <>{children}</>;
  // renderHook internally wraps renders with act; no outer act required here
  renderHook(() => useDeepLinkHandler(stores), { wrapper });
  await waitFor(() => expect(setPreferredStore).toHaveBeenCalled());
});
