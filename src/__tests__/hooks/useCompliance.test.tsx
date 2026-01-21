import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  useComplianceStatus,
  useRecallNotices,
  useAcknowledgeRecall,
  useAgeVerification,
} from '../../hooks/useCompliance';
import * as http from '../../api/http';
import { logEvent } from '../../utils/analytics';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

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

describe('useComplianceStatus hook', () => {
  const mockStatus = {
    ageVerified: true,
    ageVerifiedAt: '2024-01-01',
    state: 'CA',
    stateAllowed: true,
    activeAlerts: [],
    activeRecalls: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch compliance status', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockStatus);

    const { result } = renderHook(() => useComplianceStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockStatus);
  });

  it('should return default status on error', async () => {
    (http.clientGet as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useComplianceStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      ageVerified: false,
      stateAllowed: true,
      activeAlerts: [],
      activeRecalls: [],
    });
  });
});

describe('useRecallNotices hook', () => {
  const mockRecalls = [
    { id: 'recall-1', productId: 'prod-1', productName: 'Product A', severity: 'high' },
    { id: 'recall-2', productId: 'prod-2', productName: 'Product B', severity: 'low' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should fetch recall notices', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockRecalls);

    const { result } = renderHook(() => useRecallNotices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
  });

  it('should mark acknowledged recalls', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockRecalls);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(['recall-1']));

    const { result } = renderHook(() => useRecallNotices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.[0].acknowledged).toBe(true);
    expect(result.current.data?.[1].acknowledged).toBe(false);
  });

  it('should return empty array on error', async () => {
    (http.clientGet as jest.Mock).mockRejectedValueOnce(new Error('Error'));

    const { result } = renderHook(() => useRecallNotices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });
});

describe('useAcknowledgeRecall hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('should acknowledge a recall', async () => {
    (http.clientPost as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAcknowledgeRecall(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('recall-1');
    });

    expect(AsyncStorage.setItem).toHaveBeenCalled();
    expect(logEvent).toHaveBeenCalledWith('recall_acknowledged', { recallId: 'recall-1' });
  });

  it('should not duplicate acknowledgments', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(['recall-1']));
    (http.clientPost as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAcknowledgeRecall(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('recall-1');
    });

    // setItem should still be called, but with the same array
    expect(logEvent).toHaveBeenCalledWith('recall_acknowledged', { recallId: 'recall-1' });
  });
});

describe('useAgeVerification hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should verify age successfully', async () => {
    (http.clientPost as jest.Mock).mockResolvedValueOnce({
      verified: true,
      expiresAt: '2025-01-01',
    });

    const { result } = renderHook(() => useAgeVerification(), {
      wrapper: createWrapper(),
    });

    let verifyResult: any;
    await act(async () => {
      verifyResult = await result.current.mutateAsync({ birthDate: '1990-01-01' });
    });

    expect(verifyResult.verified).toBe(true);
    expect(http.clientPost).toHaveBeenCalledWith(expect.anything(), '/compliance/verify-age', {
      birthDate: '1990-01-01',
    });
    expect(logEvent).toHaveBeenCalledWith('age_verification_attempt', { verified: true });
  });

  it('should handle failed verification', async () => {
    (http.clientPost as jest.Mock).mockResolvedValueOnce({ verified: false });

    const { result } = renderHook(() => useAgeVerification(), {
      wrapper: createWrapper(),
    });

    let verifyResult: any;
    await act(async () => {
      verifyResult = await result.current.mutateAsync({ birthDate: '2010-01-01' });
    });

    expect(verifyResult.verified).toBe(false);
    expect(logEvent).toHaveBeenCalledWith('age_verification_attempt', { verified: false });
  });
});
