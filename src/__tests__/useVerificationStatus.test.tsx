import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useVerificationStatus } from '../hooks/useVerificationStatus';
import * as verificationService from '../services/verificationService';

jest.mock('../services/verificationService', () => ({
  getUserVerificationStatus: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useVerificationStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch verification status', async () => {
    const mockStatus = {
      status: 'verified',
      verifiedAt: '2024-01-01T00:00:00Z',
    };
    (verificationService.getUserVerificationStatus as jest.Mock).mockResolvedValue(mockStatus);

    const { result } = renderHook(() => useVerificationStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockStatus);
  });

  it('should call verification service', async () => {
    const mockStatus = {
      status: 'unverified',
    };
    (verificationService.getUserVerificationStatus as jest.Mock).mockResolvedValue(mockStatus);

    const { result } = renderHook(() => useVerificationStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(verificationService.getUserVerificationStatus).toHaveBeenCalled();
  });

  it('should return loading state initially', () => {
    (verificationService.getUserVerificationStatus as jest.Mock).mockResolvedValue({
      status: 'pending',
    });

    const { result } = renderHook(() => useVerificationStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
