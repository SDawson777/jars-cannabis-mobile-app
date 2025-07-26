import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Linking } from 'react-native';
import useDeepLinkHandler from '../hooks/useDeepLinkHandler';
import { StoreProvider, useStore } from '../context/StoreContext';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Linking: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getInitialURL: jest.fn(() => Promise.resolve('jars://shop?store=midtown')),
  },
}));

const navigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate }),
}));

test('deep link loads Shop with correct store', async () => {
  const stores = [{ id: '1', name: 'Midtown', slug: 'midtown', address: '', latitude: 0, longitude: 0 }];
  const wrapper = ({ children }: any) => (
    <StoreProvider>
      <NavigationContainer>{children}</NavigationContainer>
    </StoreProvider>
  );

  renderHook(() => useDeepLinkHandler(stores), { wrapper });
  await waitFor(() => expect(navigate).toHaveBeenCalledWith('ShopScreen'));
  const { result } = renderHook(() => useStore(), { wrapper });
  expect(result.current.preferredStore?.slug).toBe('midtown');
});
