import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import React from 'react';

import { usePrivacyPreferences } from '../api/hooks/usePrivacyPreferences';
import { phase4Client } from '../api/phase4Client';
import { toast } from '../utils/toast';

jest.mock('../api/phase4Client');
jest.mock('../utils/toast', () => ({ toast: jest.fn() }));

describe('usePrivacyPreferences', () => {
  const wrapper: any = ({ children }: any) => {
    const client = new QueryClient();
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };

  it('updates prefs and invalidates', async () => {
    const client = new QueryClient();
    jest.spyOn(client, 'invalidateQueries');
    (phase4Client.get as jest.Mock).mockResolvedValue({ data: { highContrast: false } });
    (phase4Client.put as jest.Mock).mockResolvedValue({ data: {} });
    const hookWrapper: any = ({ children }: any) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => usePrivacyPreferences(), {
      wrapper: hookWrapper,
    });
    await waitFor(() => result.current.data !== undefined);
    await act(() => {
      result.current.updatePreferences({ highContrast: true });
    });
    expect(client.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['privacy-preferences'] });
  });

  it('shows toast on error', async () => {
    (phase4Client.get as jest.Mock).mockResolvedValue({ data: { highContrast: false } });
    (phase4Client.put as jest.Mock).mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => usePrivacyPreferences(), { wrapper });
    await waitFor(() => result.current.data !== undefined);
    await act(() => {
      result.current.updatePreferences({ highContrast: true });
    });
    expect(toast).toHaveBeenCalledWith('fail');
  });
});
