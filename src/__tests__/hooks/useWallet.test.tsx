import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  useWalletBalance,
  useGiftCards,
  useAddGiftCard,
  useCheckGiftCardBalance,
} from '../../hooks/useWallet';
import * as http from '../../api/http';
import { logEvent } from '../../utils/analytics';

jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
}));

jest.mock('../../utils/analytics', () => ({
  logEvent: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useWalletBalance hook', () => {
  const mockBalance = {
    loyaltyPoints: 1500,
    loyaltyValue: 15,
    giftCardBalance: 50,
    storeCredit: 10,
    totalValue: 75,
    currency: 'USD',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch wallet balance', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockBalance);

    const { result } = renderHook(() => useWalletBalance(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockBalance);
    expect(http.clientGet).toHaveBeenCalledWith(expect.anything(), '/wallet/balance');
  });
});

describe('useGiftCards hook', () => {
  const mockGiftCards = [
    { id: 'gc-1', code: 'ABC123', balance: 25, originalAmount: 50, isActive: true },
    { id: 'gc-2', code: 'DEF456', balance: 100, originalAmount: 100, isActive: true },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch gift cards', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ giftCards: mockGiftCards });

    const { result } = renderHook(() => useGiftCards(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockGiftCards);
    expect(http.clientGet).toHaveBeenCalledWith(expect.anything(), '/wallet/gift-cards');
  });

  it('should handle empty gift cards', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({});

    const { result } = renderHook(() => useGiftCards(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });
});

describe('useAddGiftCard hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a gift card', async () => {
    const mockGiftCard = { id: 'gc-new', code: 'XYZ789', balance: 50 };
    (http.clientPost as jest.Mock).mockResolvedValueOnce(mockGiftCard);

    const { result } = renderHook(() => useAddGiftCard(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ code: 'XYZ789', pin: '1234' });
    });

    expect(http.clientPost).toHaveBeenCalledWith(expect.anything(), '/wallet/gift-cards/add', {
      code: 'XYZ789',
      pin: '1234',
    });
    expect(logEvent).toHaveBeenCalledWith('gift_card_added', { amount: 50 });
  });

  it('should handle invalid gift card', async () => {
    (http.clientPost as jest.Mock).mockRejectedValueOnce(new Error('Invalid gift card code'));

    const { result } = renderHook(() => useAddGiftCard(), {
      wrapper: createWrapper(),
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync({ code: 'INVALID' });
      })
    ).rejects.toThrow('Invalid gift card code');
  });
});

describe('useCheckGiftCardBalance hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should check gift card balance', async () => {
    const mockBalance = { balance: 75, expiresAt: '2025-12-31' };
    (http.clientPost as jest.Mock).mockResolvedValueOnce(mockBalance);

    const { result } = renderHook(() => useCheckGiftCardBalance(), {
      wrapper: createWrapper(),
    });

    let checkResult: any;
    await act(async () => {
      checkResult = await result.current.mutateAsync({ code: 'ABC123', pin: '1234' });
    });

    expect(checkResult).toEqual(mockBalance);
    expect(http.clientPost).toHaveBeenCalledWith(
      expect.anything(),
      '/wallet/gift-cards/check-balance',
      { code: 'ABC123', pin: '1234' }
    );
  });
});
