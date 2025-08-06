import React from 'react';
import renderer from 'react-test-renderer';
import WelcomeBanner from '../components/WelcomeBanner';
import { LoyaltyContext } from '../context/LoyaltyContext';
import { StoreProvider } from '../context/StoreContext';

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
  expect(tree.toJSON()).toMatchSnapshot();
});
