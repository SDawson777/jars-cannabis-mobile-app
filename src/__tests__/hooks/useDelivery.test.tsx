import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  useDeliveryWindows,
  usePickupWindows,
  useDeliveryEstimate,
  useScheduleDelivery,
} from '../../hooks/useDelivery';
import * as http from '../../api/http';
import { logEvent } from '../../utils/analytics';

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

describe('useDeliveryWindows hook', () => {
  const mockWindows = [
    {
      id: 'w1',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '12:00',
      available: true,
      price: 5.99,
      type: 'standard',
    },
    {
      id: 'w2',
      date: '2024-01-15',
      startTime: '14:00',
      endTime: '16:00',
      available: true,
      price: 3.99,
      type: 'economy',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch delivery windows for address', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ windows: mockWindows });

    const { result } = renderHook(() => useDeliveryWindows('addr-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockWindows);
    expect(http.clientGet).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('addressId=addr-123')
    );
  });

  it('should include date in query', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ windows: mockWindows });

    const { result } = renderHook(() => useDeliveryWindows('addr-123', '2024-01-15'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(http.clientGet).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('date=2024-01-15')
    );
  });

  it('should not fetch when addressId is empty', () => {
    const { result } = renderHook(() => useDeliveryWindows(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('usePickupWindows hook', () => {
  const mockPickupWindows = [
    {
      id: 'pw1',
      storeId: 'store-1',
      date: '2024-01-15',
      startTime: '11:00',
      endTime: '12:00',
      available: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch pickup windows for store', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ windows: mockPickupWindows });

    const { result } = renderHook(() => usePickupWindows('store-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPickupWindows);
    expect(http.clientGet).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('/stores/store-1/pickup-windows')
    );
  });

  it('should not fetch when storeId is empty', () => {
    const { result } = renderHook(() => usePickupWindows(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useDeliveryEstimate hook', () => {
  const mockEstimate = {
    addressId: 'addr-123',
    estimatedMinutes: 45,
    estimatedArrival: '2024-01-15T14:30:00Z',
    fee: 5.99,
    freeDeliveryThreshold: 50,
    amountToFreeDelivery: 15,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch delivery estimate', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockEstimate);

    const { result } = renderHook(() => useDeliveryEstimate('addr-123', 35), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockEstimate);
    expect(http.clientGet).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('cartTotal=35')
    );
  });

  it('should not fetch when addressId is empty', () => {
    const { result } = renderHook(() => useDeliveryEstimate(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useScheduleDelivery hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should schedule delivery', async () => {
    const mockResult = {
      orderId: 'order-123',
      windowId: 'w1',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '12:00',
      type: 'delivery',
    };
    (http.clientPost as jest.Mock).mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useScheduleDelivery(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ orderId: 'order-123', windowId: 'w1' });
    });

    expect(http.clientPost).toHaveBeenCalledWith(expect.anything(), '/delivery/schedule', {
      orderId: 'order-123',
      windowId: 'w1',
    });
    expect(logEvent).toHaveBeenCalledWith('delivery_scheduled', {
      orderId: 'order-123',
      windowId: 'w1',
    });
  });
});
