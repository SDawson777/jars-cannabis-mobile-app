import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserProfile } from '../api/hooks/useUserProfile';
import { phase4Client } from '../api/phase4Client';

jest.mock('../api/phase4Client');

const wrapper: any = ({ children }: any) => {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe('useUserProfile', () => {
  it('returns data on success', async () => {
    (phase4Client.get as jest.Mock).mockResolvedValue({ data: { name: 'Jane' } });
    const { result, waitFor } = renderHook(() => useUserProfile(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual({ name: 'Jane' });
  });

  it('handles error', async () => {
    (phase4Client.get as jest.Mock).mockRejectedValue(new Error('fail'));
    const { result, waitFor } = renderHook(() => useUserProfile(), { wrapper });
    await waitFor(() => result.current.isError);
    expect(result.current.isError).toBe(true);
  });
});
