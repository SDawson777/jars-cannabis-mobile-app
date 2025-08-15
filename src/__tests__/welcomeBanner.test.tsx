/* eslint-env jest, node */
/* eslint-disable no-undef */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import WelcomeBanner from '../components/WelcomeBanner';
import { LoyaltyContext } from '../context/LoyaltyContext';
import { makeStore } from './testUtils';
import * as SecureStore from 'expo-secure-store';

jest.mock('../context/StoreContext', () => {
  const { makeStore } = require('./testUtils');
  let preferredStore = makeStore();
  const setPreferredStore = jest.fn();
  return {
    useStore: () => ({ preferredStore, setPreferredStore }),
    __setPreferredStore: (store: any) => {
      preferredStore = store;
    },
    setPreferredStore,
  };
});

jest.mock('react-native', () => ({
  View: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <span>{children}</span>,
  StyleSheet: { create: () => ({}) },
}));

const { __setPreferredStore, setPreferredStore } = require('../context/StoreContext') as any;

beforeEach(() => {
  __setPreferredStore(makeStore());
  setPreferredStore.mockReset();
  SecureStore.getItemAsync.mockResolvedValue(null);
  SecureStore.setItemAsync.mockResolvedValue(undefined);
  SecureStore.deleteItemAsync.mockResolvedValue(undefined);
});

it('shows default message when no promo', async () => {
  let tree: renderer.ReactTestRenderer | undefined;
  await act(async () => {
    tree = renderer.create(
      <LoyaltyContext.Provider
        value={{ data: null, isLoading: false, isError: false, error: undefined }}
      >
        <WelcomeBanner />
      </LoyaltyContext.Provider>
    );
  });
  const span = tree!.root.findByType('span');
  expect(span.children[0]).toBe('Welcome!');
});

it('shows store promo when available', async () => {
  const store = makeStore({ promo: '$10 Off Pickup Orders' });
  __setPreferredStore(store);
  let tree: renderer.ReactTestRenderer | undefined;
  await act(async () => {
    tree = renderer.create(
      <LoyaltyContext.Provider
        value={{ data: null, isLoading: false, isError: false, error: undefined }}
      >
        <WelcomeBanner />
      </LoyaltyContext.Provider>
    );
  });
  const span = tree!.root.findByType('span');
  expect(span.children[0]).toBe(`${store.name} Exclusive: ${store.promo}`);
});

it('shows loyalty banner callouts per tier', async () => {
  let tree: renderer.ReactTestRenderer | undefined;
  await act(async () => {
    tree = renderer.create(
      <LoyaltyContext.Provider
        value={{ data: { tier: 'Gold' }, isLoading: false, isError: false, error: undefined }}
      >
        <WelcomeBanner />
      </LoyaltyContext.Provider>
    );
  });
  const span = tree!.root.findByType('span');
  expect(span.children[0]).toBe('Gold Tier Perk: Double Points This Week');
});
