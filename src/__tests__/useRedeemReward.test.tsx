import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRedeemReward } from '../api/hooks/useRedeemReward';
import { phase4Client } from '../api/phase4Client';
import { toast } from '../utils/toast';

jest.mock('../api/phase4Client');
jest.mock('../utils/toast', () => ({ toast: jest.fn() }));

describe('useRedeemReward', () => {
  it('invalidates loyaltyStatus on success', async () => {
    const client = new QueryClient();
    jest.spyOn(client, 'invalidateQueries');
    (phase4Client.post as jest.Mock).mockResolvedValue({});
    const wrapper: any = ({ children }: any) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result, waitFor } = renderHook(() => useRedeemReward(), { wrapper });
    await act(() => result.current.mutate({ id: '1', points: 5 }));
    await waitFor(() =>
      expect(client.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['loyaltyStatus'] })
    );
  });

  it('calls rollback on error', async () => {
    const client = new QueryClient();
    (phase4Client.post as jest.Mock).mockRejectedValue(new Error('fail'));
    const toastMock = toast as jest.Mock;
    const wrapper: any = ({ children }: any) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result, waitFor } = renderHook(() => useRedeemReward(), { wrapper });
    await act(() => result.current.mutate({ id: '1', points: 5 }));
    await waitFor(() => expect(toastMock).toHaveBeenCalledWith('fail'));
  });
});
