// src/hooks/useFavorites.ts
// Favorites & quick reorder - manage favorites, quick reorder functionality

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost, clientDelete } from '../api/http';
import { logEvent } from '../utils/analytics';
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// Types
// ============================================

export interface FavoriteItem {
  id: string;
  userId: string;
  itemType: 'product' | 'category' | 'strain' | 'article' | 'store' | 'budtender';
  itemId: string;
  item: FavoriteItemDetails;
  notes?: string;
  tags?: string[];
  notifyOnSale: boolean;
  notifyOnRestock: boolean;
  createdAt: string;
}

export interface FavoriteItemDetails {
  id: string;
  name: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  inStock?: boolean;
  category?: string;
  brand?: string;
  rating?: number;
  [key: string]: unknown;
}

export interface FavoriteFolder {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  itemCount: number;
  isDefault: boolean;
  createdAt: string;
}

export interface ReorderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  lastOrderedAt: string;
  orderCount: number;
  inStock: boolean;
  priceChanged: boolean;
  newPrice?: number;
}

export interface PastOrder {
  id: string;
  orderNumber: string;
  items: ReorderItem[];
  total: number;
  storeId: string;
  storeName: string;
  createdAt: string;
  status: 'completed' | 'cancelled';
}

// ============================================
// Favorites Hooks
// ============================================

/**
 * Hook to fetch all favorites
 */
export function useFavorites(options?: {
  itemType?: FavoriteItem['itemType'];
  folderId?: string;
}) {
  return useInfiniteQuery<{ favorites: FavoriteItem[]; nextCursor?: string }, Error>({
    queryKey: ['favorites', 'list', options],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return await clientGet<{ favorites: FavoriteItem[]; nextCursor?: string }>(
        phase4Client,
        '/favorites',
        { params: { ...options, cursor: pageParam } }
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: { favorites: FavoriteItem[]; nextCursor?: string }) => lastPage.nextCursor,
  });
}

/**
 * Hook to fetch favorite products specifically
 */
export function useFavoriteProducts() {
  return useQuery<FavoriteItem[], Error>({
    queryKey: ['favorites', 'products'],
    queryFn: async () => {
      const res = await clientGet<{ favorites: FavoriteItem[] }>(
        phase4Client,
        '/favorites',
        { params: { itemType: 'product' } }
      );
      return res.favorites;
    },
  });
}

/**
 * Hook to check if an item is favorited
 */
export function useIsFavorite(itemType: FavoriteItem['itemType'], itemId: string) {
  return useQuery<boolean, Error>({
    queryKey: ['favorites', 'check', itemType, itemId],
    queryFn: async () => {
      const res = await clientGet<{ isFavorite: boolean }>(
        phase4Client,
        `/favorites/check/${itemType}/${itemId}`
      );
      return res.isFavorite;
    },
    enabled: !!itemId,
  });
}

/**
 * Hook to add to favorites
 */
export function useAddToFavorites() {
  const queryClient = useQueryClient();
  
  return useMutation<FavoriteItem, Error, {
    itemType: FavoriteItem['itemType'];
    itemId: string;
    folderId?: string;
    notes?: string;
    tags?: string[];
    notifyOnSale?: boolean;
    notifyOnRestock?: boolean;
  }>({
    mutationFn: async (favorite: {
      itemType: FavoriteItem['itemType'];
      itemId: string;
      folderId?: string;
      notes?: string;
      tags?: string[];
      notifyOnSale?: boolean;
      notifyOnRestock?: boolean;
    }) => {
      const result = await clientPost<typeof favorite, FavoriteItem>(
        phase4Client,
        '/favorites',
        favorite
      );
      logEvent('favorite_added', { itemType: favorite.itemType, itemId: favorite.itemId });
      return result;
    },
    onSuccess: (_: FavoriteItem, { itemType, itemId }: {
      itemType: FavoriteItem['itemType'];
      itemId: string;
      folderId?: string;
      notes?: string;
      tags?: string[];
      notifyOnSale?: boolean;
      notifyOnRestock?: boolean;
    }) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.setQueryData(['favorites', 'check', itemType, itemId], true);
    },
  });
}

/**
 * Hook to remove from favorites
 */
export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { itemType: FavoriteItem['itemType']; itemId: string }>({
    mutationFn: async ({ itemType, itemId }: { itemType: FavoriteItem['itemType']; itemId: string }) => {
      await clientDelete(phase4Client, `/favorites/${itemType}/${itemId}`);
      logEvent('favorite_removed', { itemType, itemId });
    },
    onSuccess: (_: void, { itemType, itemId }: { itemType: FavoriteItem['itemType']; itemId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.setQueryData(['favorites', 'check', itemType, itemId], false);
    },
  });
}

/**
 * Hook to toggle favorite status
 */
export function useToggleFavorite() {
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();
  
  const toggle = useCallback(async (
    itemType: FavoriteItem['itemType'],
    itemId: string,
    isFavorite: boolean
  ) => {
    if (isFavorite) {
      await removeFromFavorites.mutateAsync({ itemType, itemId });
    } else {
      await addToFavorites.mutateAsync({ itemType, itemId });
    }
  }, [addToFavorites, removeFromFavorites]);
  
  return {
    toggle,
    isPending: addToFavorites.isPending || removeFromFavorites.isPending,
  };
}

/**
 * Hook to update favorite settings
 */
export function useUpdateFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation<FavoriteItem, Error, {
    favoriteId: string;
    updates: {
      notes?: string;
      tags?: string[];
      folderId?: string;
      notifyOnSale?: boolean;
      notifyOnRestock?: boolean;
    };
  }>({
    mutationFn: async ({ favoriteId, updates }: {
      favoriteId: string;
      updates: {
        notes?: string;
        tags?: string[];
        folderId?: string;
        notifyOnSale?: boolean;
        notifyOnRestock?: boolean;
      };
    }) => {
      const result = await clientPost<typeof updates, FavoriteItem>(
        phase4Client,
        `/favorites/${favoriteId}`,
        updates
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

// ============================================
// Folder Hooks
// ============================================

/**
 * Hook to fetch favorite folders
 */
export function useFavoriteFolders() {
  return useQuery<FavoriteFolder[], Error>({
    queryKey: ['favorites', 'folders'],
    queryFn: async () => {
      const res = await clientGet<{ folders: FavoriteFolder[] }>(
        phase4Client,
        '/favorites/folders'
      );
      return res.folders;
    },
  });
}

/**
 * Hook to create a favorite folder
 */
export function useCreateFavoriteFolder() {
  const queryClient = useQueryClient();
  
  return useMutation<FavoriteFolder, Error, {
    name: string;
    color?: string;
    icon?: string;
  }>({
    mutationFn: async (folder: { name: string; color?: string; icon?: string }) => {
      const result = await clientPost<typeof folder, FavoriteFolder>(
        phase4Client,
        '/favorites/folders',
        folder
      );
      logEvent('favorite_folder_created', { name: folder.name });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', 'folders'] });
    },
  });
}

/**
 * Hook to delete a favorite folder
 */
export function useDeleteFavoriteFolder() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (folderId: string) => {
      await clientDelete(phase4Client, `/favorites/folders/${folderId}`);
      logEvent('favorite_folder_deleted', { folderId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', 'folders'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

/**
 * Hook to move favorites to a folder
 */
export function useMoveFavoritesToFolder() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { favoriteIds: string[]; folderId: string }>({
    mutationFn: async ({ favoriteIds, folderId }: { favoriteIds: string[]; folderId: string }) => {
      await clientPost<{ favoriteIds: string[]; folderId: string }, void>(
        phase4Client,
        '/favorites/move',
        { favoriteIds, folderId }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites', 'folders'] });
    },
  });
}

// ============================================
// Quick Reorder Hooks
// ============================================

/**
 * Hook to fetch frequently ordered items
 */
export function useFrequentlyOrdered() {
  return useQuery<ReorderItem[], Error>({
    queryKey: ['reorder', 'frequent'],
    queryFn: async () => {
      const res = await clientGet<{ items: ReorderItem[] }>(
        phase4Client,
        '/reorder/frequent'
      );
      return res.items;
    },
  });
}

/**
 * Hook to fetch past orders for reordering
 */
export function usePastOrders() {
  return useInfiniteQuery<{ orders: PastOrder[]; nextCursor?: string }, Error>({
    queryKey: ['reorder', 'orders'],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return await clientGet<{ orders: PastOrder[]; nextCursor?: string }>(
        phase4Client,
        '/reorder/orders',
        { params: { cursor: pageParam } }
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: { orders: PastOrder[]; nextCursor?: string }) => lastPage.nextCursor,
  });
}

/**
 * Hook to get last order for quick reorder
 */
export function useLastOrder() {
  return useQuery<PastOrder | null, Error>({
    queryKey: ['reorder', 'last'],
    queryFn: async () => {
      const res = await clientGet<{ order: PastOrder | null }>(
        phase4Client,
        '/reorder/last'
      );
      return res.order;
    },
  });
}

/**
 * Hook to reorder from a past order
 */
export function useReorderFromOrder() {
  const queryClient = useQueryClient();
  
  return useMutation<{ cartId: string; addedItems: number; unavailableItems: string[] }, Error, {
    orderId: string;
    items?: string[]; // Optional: specific item IDs to reorder
  }>({
    mutationFn: async ({ orderId, items }: { orderId: string; items?: string[] }) => {
      const result = await clientPost<{ orderId: string; items?: string[] }, { 
        cartId: string; 
        addedItems: number; 
        unavailableItems: string[] 
      }>(
        phase4Client,
        '/reorder',
        { orderId, items }
      );
      logEvent('reorder_from_order', { orderId, itemCount: result.addedItems });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

/**
 * Hook to quick add a single item
 */
export function useQuickAddToCart() {
  const queryClient = useQueryClient();
  
  return useMutation<{ cartId: string }, Error, {
    productId: string;
    quantity: number;
  }>({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const result = await clientPost<{ productId: string; quantity: number }, { cartId: string }>(
        phase4Client,
        '/cart/quick-add',
        { productId, quantity }
      );
      logEvent('quick_add_to_cart', { productId, quantity });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

/**
 * Hook to add multiple items to cart
 */
export function useBulkAddToCart() {
  const queryClient = useQueryClient();
  
  return useMutation<{ 
    cartId: string; 
    added: number; 
    unavailable: string[] 
  }, Error, { productId: string; quantity: number }[]>({
    mutationFn: async (items: { productId: string; quantity: number }[]) => {
      const result = await clientPost<{ items: typeof items }, { 
        cartId: string; 
        added: number; 
        unavailable: string[] 
      }>(
        phase4Client,
        '/cart/bulk-add',
        { items }
      );
      logEvent('bulk_add_to_cart', { itemCount: result.added });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// ============================================
// Local Favorites Cache
// ============================================

const LOCAL_FAVORITES_KEY = '@nimbus/local_favorites';

/**
 * Hook for offline favorites caching
 */
export function useLocalFavoritesCache() {
  const [localFavorites, setLocalFavorites] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    AsyncStorage.getItem(LOCAL_FAVORITES_KEY).then((data) => {
      if (data) {
        setLocalFavorites(new Set(JSON.parse(data)));
      }
    });
  }, []);
  
  const addLocal = useCallback(async (itemKey: string) => {
    const newFavorites = new Set(localFavorites);
    newFavorites.add(itemKey);
    setLocalFavorites(newFavorites);
    await AsyncStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify([...newFavorites]));
  }, [localFavorites]);
  
  const removeLocal = useCallback(async (itemKey: string) => {
    const newFavorites = new Set(localFavorites);
    newFavorites.delete(itemKey);
    setLocalFavorites(newFavorites);
    await AsyncStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify([...newFavorites]));
  }, [localFavorites]);
  
  const isLocalFavorite = useCallback((itemKey: string) => {
    return localFavorites.has(itemKey);
  }, [localFavorites]);
  
  return {
    localFavorites,
    addLocal,
    removeLocal,
    isLocalFavorite,
  };
}

// ============================================
// Notifications Hooks
// ============================================

/**
 * Hook to fetch items on sale from favorites
 */
export function useFavoritesOnSale() {
  return useQuery<FavoriteItem[], Error>({
    queryKey: ['favorites', 'on-sale'],
    queryFn: async () => {
      const res = await clientGet<{ favorites: FavoriteItem[] }>(
        phase4Client,
        '/favorites/on-sale'
      );
      return res.favorites;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch back-in-stock favorites
 */
export function useFavoritesBackInStock() {
  return useQuery<FavoriteItem[], Error>({
    queryKey: ['favorites', 'back-in-stock'],
    queryFn: async () => {
      const res = await clientGet<{ favorites: FavoriteItem[] }>(
        phase4Client,
        '/favorites/back-in-stock'
      );
      return res.favorites;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// Share Favorites Hook
// ============================================

/**
 * Hook to share favorites list
 */
export function useShareFavorites() {
  return useMutation<{ shareUrl: string; expiresAt: string }, Error, {
    favoriteIds?: string[];
    folderId?: string;
    message?: string;
  }>({
    mutationFn: async (shareData: {
      favoriteIds?: string[];
      folderId?: string;
      message?: string;
    }) => {
      const result = await clientPost<typeof shareData, { shareUrl: string; expiresAt: string }>(
        phase4Client,
        '/favorites/share',
        shareData
      );
      logEvent('favorites_shared', { 
        hasFolder: !!shareData.folderId,
        itemCount: shareData.favoriteIds?.length 
      });
      return result;
    },
  });
}
