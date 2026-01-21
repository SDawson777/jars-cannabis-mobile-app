/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import WelcomeBanner from '../../components/WelcomeBanner';
import { LoyaltyContext } from '../../context/LoyaltyContext';

// Mock useStore hook
jest.mock('../../context/StoreContext', () => ({
  useStore: jest.fn(),
}));

import { useStore } from '../../context/StoreContext';

const renderWithLoyalty = (loyaltyData: any) => {
  return render(
    <LoyaltyContext.Provider
      value={{ data: loyaltyData, isLoading: false, isError: false, error: null }}
    >
      <WelcomeBanner />
    </LoyaltyContext.Provider>
  );
};

describe('WelcomeBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useStore as jest.Mock).mockReturnValue({ preferredStore: null });
  });

  it('renders default welcome message', () => {
    const { getByText } = renderWithLoyalty(null);
    expect(getByText('Welcome!')).toBeTruthy();
  });

  it('renders Gold tier perk message', () => {
    const { getByText } = renderWithLoyalty({ level: 'Gold' });
    expect(getByText('Gold Tier Perk: Double Points This Week')).toBeTruthy();
  });

  it('renders store promo when available', () => {
    (useStore as jest.Mock).mockReturnValue({
      preferredStore: { name: 'JARS Midtown', promo: '20% off edibles' },
    });
    const { getByText } = renderWithLoyalty(null);
    expect(getByText('JARS Midtown Exclusive: 20% off edibles')).toBeTruthy();
  });

  it('prefers Gold tier message over store promo', () => {
    (useStore as jest.Mock).mockReturnValue({
      preferredStore: { name: 'JARS Midtown', promo: '20% off edibles' },
    });
    const { getByText, queryByText } = renderWithLoyalty({ level: 'Gold' });
    expect(getByText('Gold Tier Perk: Double Points This Week')).toBeTruthy();
    expect(queryByText('20% off edibles')).toBeNull();
  });

  it('has header accessibility role', () => {
    const { getByRole } = renderWithLoyalty(null);
    expect(getByRole('header')).toBeTruthy();
  });

  it('renders welcome when store has no promo', () => {
    (useStore as jest.Mock).mockReturnValue({
      preferredStore: { name: 'JARS Midtown' },
    });
    const { getByText } = renderWithLoyalty(null);
    expect(getByText('Welcome!')).toBeTruthy();
  });
});
