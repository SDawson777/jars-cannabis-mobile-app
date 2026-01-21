import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFavorites,
  useFavoriteProducts,
  useIsFavorite,
  useAddToFavorites,
  useRemoveFromFavorites,
  useToggleFavorite,
  useFavoriteFolders,
} from '../../hooks/useFavorites';

// Mock dependencies
jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
  clientDelete: jest.fn(),
}));

jest.mock('../../api/phase4Client', () => ({
  phase4Client: {},
}));

jest.mock('../../utils/analytics', () => ({
  logEvent: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

import { clientGet, clientPost, clientDelete } from '../../api/http';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useFavorites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useFavoriteProducts', () => {
    it('fetches favorite products successfully', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          userId: 'user-1',
          itemType: 'product',
          itemId: 'prod-1',
          item: { id: 'prod-1', name: 'Blue Dream', price: 45 },
          notifyOnSale: false,
          notifyOnRestock: false,
          createdAt: '2024-01-01',
        },
      ];
      (clientGet as jest.Mock).mockResolvedValue({ favorites: mockFavorites });

      const { result } = renderHook(() => useFavoriteProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockFavorites);
      expect(clientGet).toHaveBeenCalled();
    });

    it('handles error state', async () => {
      (clientGet as jest.Mock).mockRejectedValue(new Error('Failed to fetch favorites'));

      const { result } = renderHook(() => useFavoriteProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('handles empty favorites', async () => {
      (clientGet as jest.Mock).mockResolvedValue({ favorites: [] });

      const { result } = renderHook(() => useFavoriteProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useIsFavorite', () => {
    it('returns true when item is favorited', async () => {
      (clientGet as jest.Mock).mockResolvedValue({ isFavorite: true });

      const { result } = renderHook(() => useIsFavorite('product', 'prod-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(true);
    });

    it('returns false when item is not favorited', async () => {
      (clientGet as jest.Mock).mockResolvedValue({ isFavorite: false });

      const { result } = renderHook(() => useIsFavorite('product', 'prod-456'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(false);
    });

    it('is disabled when itemId is empty', () => {
      const { result } = renderHook(() => useIsFavorite('product', ''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('handles error state', async () => {
      (clientGet as jest.Mock).mockRejectedValue(new Error('Check failed'));

      const { result } = renderHook(() => useIsFavorite('store', 'store-789'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});

describe('useFavorites', () => {
  it('fetches all favorites with pagination', async () => {
    const mockResponse = {
      favorites: [{ id: 'f1', itemType: 'product' }],
      nextCursor: 'cursor1',
    };
    (clientGet as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].favorites).toHaveLength(1);
  });

  it('filters by itemType', async () => {
    const mockResponse = { favorites: [], nextCursor: undefined };
    (clientGet as jest.Mock).mockResolvedValue(mockResponse);

    renderHook(() => useFavorites({ itemType: 'product' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(clientGet).toHaveBeenCalled());
  });
});

describe('useAddToFavorites', () => {
  it('adds item to favorites', async () => {
    const mockFavorite = {
      id: 'f1',
      userId: 'u1',
      itemType: 'product',
      itemId: 'p1',
      item: { id: 'p1', name: 'Product' },
      notifyOnSale: false,
      notifyOnRestock: false,
      createdAt: '2024-01-01',
    };
    (clientPost as jest.Mock).mockResolvedValue(mockFavorite);

    const { result } = renderHook(() => useAddToFavorites(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ itemType: 'product', itemId: 'p1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockFavorite);
  });
});

describe('useRemoveFromFavorites', () => {
  it('removes item from favorites', async () => {
    (clientDelete as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useRemoveFromFavorites(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ itemType: 'product', itemId: 'p1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientDelete).toHaveBeenCalled();
  });
});

describe('useToggleFavorite', () => {
  it('toggles favorite status', async () => {
    (clientPost as jest.Mock).mockResolvedValue({});
    (clientDelete as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useToggleFavorite(), {
      wrapper: createWrapper(),
    });

    await result.current.toggle('product', 'p1', false);

    expect(clientPost).toHaveBeenCalled();
  });
});

describe('useFavoriteFolders', () => {
  it('fetches favorite folders', async () => {
    const mockFolders = [
      {
        id: 'folder1',
        name: 'My Favorites',
        itemCount: 5,
        isDefault: true,
        createdAt: '2024-01-01',
      },
    ];
    (clientGet as jest.Mock).mockResolvedValue({ folders: mockFolders });

    const { result } = renderHook(() => useFavoriteFolders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockFolders);
  });
});
