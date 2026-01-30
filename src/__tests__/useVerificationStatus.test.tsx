import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useVerificationStatus } from '../hooks/useVerificationStatus';
import * as verificationServiceModule from '../services/verificationService';

jest.mock('../services/verificationService', () => ({
  verificationService: {
    getUserVerificationStatus: jest.fn(),
  },
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

  it.skip('should fetch verification status', async () => {
    const mockStatus = {
      verified: true,
      status: 'approved',
      verificationDate: '2024-01-01T00:00:00Z',
    };
    (
      verificationServiceModule.verificationService.getUserVerificationStatus as jest.Mock
    ).mockResolvedValue(mockStatus);

    const { result } = renderHook(() => useVerificationStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true);
      },
      { timeout: 3000 }
    );

    expect(result.current.data).toEqual(mockStatus);
  });

  it.skip('should call verification service', async () => {
    const mockStatus = {
      verified: false,
      status: 'pending',
    };
    (
      verificationServiceModule.verificationService.getUserVerificationStatus as jest.Mock
    ).mockResolvedValue(mockStatus);

    const { result } = renderHook(() => useVerificationStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true);
      },
      { timeout: 3000 }
    );

    expect(
      verificationServiceModule.verificationService.getUserVerificationStatus
    ).toHaveBeenCalled();
  });

  it('should return loading state initially', () => {
    (
      verificationServiceModule.verificationService.getUserVerificationStatus as jest.Mock
    ).mockResolvedValue({
      verified: false,
      status: 'pending',
    });

    const { result } = renderHook(() => useVerificationStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
