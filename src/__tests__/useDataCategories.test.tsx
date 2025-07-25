import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDataCategories } from '../api/hooks/useDataCategories';
import { phase4Client } from '../api/phase4Client';

jest.mock('../api/phase4Client');

const wrapper: any = ({ children }: any) => {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe('useDataCategories', () => {
  it('returns data on success', async () => {
    (phase4Client.get as jest.Mock).mockResolvedValue({ data: [{ id: '1', label: 'Category' }] });
    const { result, waitFor } = renderHook(() => useDataCategories(), { wrapper });
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual([{ id: '1', label: 'Category' }]);
  });

  it('handles error', async () => {
    (phase4Client.get as jest.Mock).mockRejectedValue(new Error('fail'));
    const { result, waitFor } = renderHook(() => useDataCategories(), { wrapper });
    await waitFor(() => result.current.isError);
    expect(result.current.isError).toBe(true);
  });
});
