import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  RefreshControl,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';

import { fetchOrders } from '../../clients/orderClient';
import OrderCard from '../../components/OrderCard';
import useSkeletonText from '../../components/useSkeletonText';
import { ThemeContext } from '../../context/ThemeContext';
import type { Order, OrdersResponse } from '../../types/order';
import { hapticLight, hapticMedium } from '../../utils/haptic';
import { toast } from '../../utils/toast';

import OrderDetailModal from './OrderDetailModal';

export default function OrderHistoryScreen() {
  const { colorTemp, brandPrimary, brandSecondary, brandBackground } = useContext(ThemeContext);
  const [selected, setSelected] = useState<Order | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useInfiniteQuery<OrdersResponse>({
    queryKey: ['orders'],
    initialPageParam: 1,
    queryFn: ({ pageParam }: { pageParam?: number }) => fetchOrders(pageParam as number),
    getNextPageParam: (lastPage: OrdersResponse) => lastPage.nextPage,
  });

  const orders = useMemo(
    () => data?.pages.flatMap((p: OrdersResponse) => p.orders) ?? [],
    [data?.pages]
  );

  useEffect(() => {
    if (error) {
      toast('Unable to fetch orders. Please try again.');
    }
  }, [error]);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : brandBackground;

  // Memoized callbacks for list interactions
  const handleOrderPress = useCallback((order: Order) => {
    hapticLight();
    setSelected(order);
  }, []);

  const handleRefresh = useCallback(() => {
    hapticMedium();
    refetch();
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

  const handleCloseModal = useCallback(() => {
    setSelected(null);
  }, []);

  // Memoized renderItem to prevent unnecessary re-renders
  const renderOrderItem = useCallback(
    ({ item }: { item: Order }) => (
      <OrderCard
        order={item}
        onPress={() => handleOrderPress(item)}
        primaryColor={brandPrimary}
        secondaryColor={brandSecondary}
      />
    ),
    [brandPrimary, brandSecondary, handleOrderPress]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {isLoading && orders.length === 0 ? (
        <View style={styles.skeletonWrap}>
          {Array.from({ length: 5 }).map((_, i: number) => (
            <View key={i} style={styles.skeletonRow}>
              {useSkeletonText(200, 20)}
              <View style={{ height: 8 }} />
              {useSkeletonText(120, 14)}
            </View>
          ))}
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: brandSecondary }}>You haven’t placed any orders yet.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id}
          renderItem={renderOrderItem}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
          onEndReached={handleEndReached}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator style={{ margin: 16 }} /> : null
          }
        />
      )}
      <OrderDetailModal order={selected} onClose={handleCloseModal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skeletonWrap: { padding: 16 },
  skeletonRow: { marginBottom: 16 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
