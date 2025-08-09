import React from 'react';
import renderer from 'react-test-renderer';
import WelcomeBanner from '../components/WelcomeBanner';
import { LoyaltyContext } from '../context/LoyaltyContext';
import { StoreProvider } from '../context/StoreContext';

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

it('shows loyalty banner callouts per tier', () => {
  const tree = renderer.create(
    <StoreProvider>
      <LoyaltyContext.Provider
        value={{ data: { tier: 'Gold' }, isLoading: false, isError: false, error: undefined }}
      >
        <WelcomeBanner />
      </LoyaltyContext.Provider>
    </StoreProvider>
  );
  const span = tree.root.findByType('span');
  expect(span.children[0]).toBe('Gold Tier Perk: Double Points This Week');
});
