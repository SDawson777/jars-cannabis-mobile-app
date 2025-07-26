import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDataCategories } from '../api/hooks/useDataCategories';
import { phase4Client } from '../api/phase4Client';

jest.mock('../api/phase4Client');

const wrapper: any = ({ children }: any) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe('useDataCategories', () => {
  it('returns data on success', async () => {
    (phase4Client.get as jest.Mock).mockResolvedValue({ data: [{ id: '1', label: 'Category' }] });
    const { result } = renderHook(() => useDataCategories(), { wrapper });
    await waitFor(() => result.current.isSuccess, { timeout: 3000 });
    expect(phase4Client.get).toHaveBeenCalled();
  });

  it('handles error', async () => {
    (phase4Client.get as jest.Mock).mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useDataCategories(), { wrapper });
    await waitFor(() => expect(phase4Client.get).toHaveBeenCalled());
  });
});
