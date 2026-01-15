// src/screens/DealsScreen.tsx
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Tag, Clock } from 'lucide-react-native';
import React, { useContext, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';

import { ThemeContext } from '../context/ThemeContext';
import { useDeals } from '../hooks/useDeals';
import type { RootStackParamList } from '../navigation/types';
import type { CMSDeal } from '../types/cmsExtra';
import { hapticLight } from '../utils/haptic';
import { trackScreenView, trackContentClick, trackContentView } from '../utils/analytics';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type DealsNavProp = NativeStackNavigationProp<RootStackParamList, 'DealsScreen'>;

export default function DealsScreen() {
  const navigation = useNavigation<DealsNavProp>();
  const { colorTemp, brandPrimary, brandSecondary, brandBackground, cornerRadius } = useContext(ThemeContext);
  const { data: deals, isLoading, isError, refetch } = useDeals();

  // Track screen view
  useFocusEffect(
    useCallback(() => {
      trackScreenView('DealsScreen');
    }, [])
  );

  // Track deals view when data loads
  React.useEffect(() => {
    if (deals && deals.length > 0) {
      trackContentView('deals', 'deals_list', { count: deals.length });
    }
  }, [deals]);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : brandBackground;

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const handleDealPress = (deal: CMSDeal) => {
    hapticLight();
    trackContentClick('deal', deal.id, { title: deal.title });
    
    // Navigate to shop with deal filter
    navigation.navigate('ShopScreen', { dealId: deal.id } as any);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDiscountLabel = (deal: CMSDeal) => {
    if (deal.discountType === 'percent' && deal.discountValue) {
      return `${deal.discountValue}% OFF`;
    }
    if (deal.discountType === 'fixed' && deal.discountValue) {
      return `$${deal.discountValue} OFF`;
    }
    if (deal.discountType === 'bogo') {
      return 'BOGO';
    }
    return 'DEAL';
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={brandPrimary} />
      </SafeAreaView>
    );
  }

  if (isError || !deals) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={{ color: brandSecondary, marginBottom: 16 }}>Unable to load deals.</Text>
        <Pressable onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: brandPrimary }]}>
          <Text style={{ color: '#fff' }}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const renderDeal = ({ item }: { item: CMSDeal }) => (
    <Pressable
      style={[styles.dealCard, { borderRadius: cornerRadius, backgroundColor: '#fff' }]}
      onPress={() => handleDealPress(item)}
    >
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={[styles.dealImage, { borderTopLeftRadius: cornerRadius, borderTopRightRadius: cornerRadius }]}
          resizeMode="cover"
        />
      )}
      <View style={styles.dealContent}>
        <View style={[styles.discountBadge, { backgroundColor: brandPrimary }]}>
          <Tag color="#fff" size={14} />
          <Text style={styles.discountText}>{getDiscountLabel(item)}</Text>
        </View>
        <Text style={[styles.dealTitle, { color: brandPrimary }]}>{item.title}</Text>
        <Text style={[styles.dealDescription, { color: brandSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.dealMeta}>
          <Clock color={brandSecondary} size={14} />
          <Text style={[styles.dealDates, { color: brandSecondary }]}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} testID="deals-screen">
      <View style={[styles.header, { borderBottomColor: brandSecondary }]}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <ChevronLeft color={brandPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: brandPrimary }]}>Deals & Promotions</Text>
        <View style={{ width: 24 }} />
      </View>

      {deals.length === 0 ? (
        <View style={styles.emptyState}>
          <Tag color={brandSecondary} size={48} />
          <Text style={[styles.emptyTitle, { color: brandPrimary }]}>No Active Deals</Text>
          <Text style={[styles.emptySubtitle, { color: brandSecondary }]}>
            Check back soon for new promotions!
          </Text>
        </View>
      ) : (
        <FlatList<CMSDeal>
          data={deals}
          keyExtractor={item => item.id}
          renderItem={renderDeal}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 24 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  list: { padding: 16 },
  dealCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  dealImage: {
    width: '100%',
    height: 150,
  },
  dealContent: {
    padding: 16,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
    gap: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  dealDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  dealMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dealDates: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});
