import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  useJournalEntry,
  useCreateJournalEntry,
  useUpdateJournalEntry,
  useDeleteJournalEntry,
  useJournalStats,
} from '../../hooks/useJournal';
import * as http from '../../api/http';
import { logEvent } from '../../utils/analytics';

jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
  clientPut: jest.fn(),
  clientDelete: jest.fn(),
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

describe('useJournalEntry hook', () => {
  const mockEntry = {
    id: 'entry-1',
    userId: 'user-1',
    productName: 'Blue Dream',
    rating: 4,
    notes: 'Great experience',
    createdAt: '2024-01-15',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch a journal entry', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockEntry);

    const { result } = renderHook(() => useJournalEntry('entry-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockEntry);
    expect(http.clientGet).toHaveBeenCalledWith(expect.anything(), '/journal/entries/entry-1');
  });

  it('should not fetch when entryId is empty', () => {
    const { result } = renderHook(() => useJournalEntry(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCreateJournalEntry hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a journal entry', async () => {
    const newEntry = { id: 'entry-new', productName: 'OG Kush', rating: 5 };
    (http.clientPost as jest.Mock).mockResolvedValueOnce(newEntry);

    const { result } = renderHook(() => useCreateJournalEntry(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        productId: 'prod-1',
        productName: 'OG Kush',
        rating: 5,
        consumptionMethod: 'vape',
      });
    });

    expect(http.clientPost).toHaveBeenCalledWith(
      expect.anything(),
      '/journal/entries',
      expect.objectContaining({ productName: 'OG Kush', rating: 5 })
    );
    expect(logEvent).toHaveBeenCalledWith('journal_entry_created', {
      hasProduct: true,
      method: 'vape',
      rating: 5,
    });
  });
});

describe('useUpdateJournalEntry hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update a journal entry', async () => {
    const updatedEntry = { id: 'entry-1', rating: 5, notes: 'Updated notes' };
    (http.clientPut as jest.Mock).mockResolvedValueOnce(updatedEntry);

    const { result } = renderHook(() => useUpdateJournalEntry(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: 'entry-1',
        data: { rating: 5, notes: 'Updated notes' },
      });
    });

    expect(http.clientPut).toHaveBeenCalledWith(expect.anything(), '/journal/entries/entry-1', {
      rating: 5,
      notes: 'Updated notes',
    });
    expect(logEvent).toHaveBeenCalledWith('journal_entry_updated', { entryId: 'entry-1' });
  });
});

describe('useDeleteJournalEntry hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a journal entry', async () => {
    (http.clientDelete as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteJournalEntry(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('entry-1');
    });

    expect(http.clientDelete).toHaveBeenCalledWith(expect.anything(), '/journal/entries/entry-1');
    expect(logEvent).toHaveBeenCalledWith('journal_entry_deleted', { entryId: 'entry-1' });
  });
});

describe('useJournalStats hook', () => {
  const mockStats = {
    totalEntries: 50,
    favoriteStrain: 'Blue Dream',
    preferredMethod: 'vape',
    averageRating: 4.2,
    recentMoods: ['relaxed', 'happy'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch journal stats', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockStats);

    const { result } = renderHook(() => useJournalStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockStats);
    expect(http.clientGet).toHaveBeenCalledWith(expect.anything(), '/journal/stats');
  });
});
