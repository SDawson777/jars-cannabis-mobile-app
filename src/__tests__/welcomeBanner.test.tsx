/* eslint-disable */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import WelcomeBanner from '../components/WelcomeBanner';
import { LoyaltyContext } from '../context/LoyaltyContext';
import { makeStore } from './testUtils';

let mockPreferredStore = makeStore();
jest.mock('../context/StoreContext', () => ({
  useStore: () => ({ preferredStore: mockPreferredStore, setPreferredStore: jest.fn() }),
}));

jest.mock('react-native', () => ({
  View: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <span>{children}</span>,
  StyleSheet: { create: () => ({}) },
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

beforeEach(() => {
  mockPreferredStore = makeStore();
});

it('shows default message when no promo', async () => {
  mockPreferredStore.promo = undefined;
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
  mockPreferredStore = makeStore({ promo: '$10 Off Pickup Orders' });
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
  expect(span.children[0]).toBe(
    `${mockPreferredStore.name} Exclusive: ${mockPreferredStore.promo}`
  );
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
