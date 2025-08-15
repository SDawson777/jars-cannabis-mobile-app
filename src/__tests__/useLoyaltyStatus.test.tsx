import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLoyaltyStatus } from '../api/hooks/useLoyaltyStatus';
import { phase4Client } from '../api/phase4Client';

jest.mock('../api/phase4Client');

const wrapper: any = ({ children }: any) => {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe('useLoyaltyStatus', () => {
  it('returns data on success', async () => {
    (phase4Client.get as jest.Mock).mockResolvedValue({ data: { points: 10 } });
    const { result } = renderHook(() => useLoyaltyStatus(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual({ points: 10 }));
  });

  it('handles error', async () => {
    (phase4Client.get as jest.Mock).mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useLoyaltyStatus(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
