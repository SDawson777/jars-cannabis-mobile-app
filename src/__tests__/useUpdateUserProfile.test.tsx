import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useUpdateUserProfile } from '../api/hooks/useUpdateUserProfile';
import { phase4Client } from '../api/phase4Client';
import { toast } from '../utils/toast';

jest.mock('../api/phase4Client');
jest.mock('../utils/toast', () => ({ toast: jest.fn() }));

describe('useUpdateUserProfile', () => {
  const wrapper: any = ({ children }: any) => {
    const client = new QueryClient();
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };

  it('invalidates profile on success', async () => {
    const client = new QueryClient();
    jest.spyOn(client, 'invalidateQueries');
    (phase4Client.put as jest.Mock).mockResolvedValue({ data: {} });
    const hookWrapper: any = ({ children }: any) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useUpdateUserProfile(), {
      wrapper: hookWrapper,
    });
    await act(() => result.current.mutate({ name: 'x' }));
    await waitFor(() =>
      expect(client.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['profile'] })
    );
  });

  it('shows toast on error', async () => {
    (phase4Client.put as jest.Mock).mockRejectedValue(new Error('fail'));
    const toastMock = toast as jest.Mock;
    const { result } = renderHook(() => useUpdateUserProfile(), { wrapper });
    await act(() => result.current.mutate({}));
    await waitFor(() => expect(toastMock).toHaveBeenCalledWith('fail'));
  });
});
