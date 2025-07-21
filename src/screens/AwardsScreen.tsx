// src/screens/AwardsScreen.tsx
import React, { useContext } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  Image,
  ActivityIndicator,
  Button,
  StyleSheet,
  ListRenderItemInfo,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { ThemeContext } from '../context/ThemeContext';
import { hapticMedium } from '../utils/haptic';

// Define Award type
interface Award {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  earnedDate: string;
}

export default function AwardsScreen() {
  // Fetch awards with React Query
  const {
    data: awards,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Award[], Error>({
    queryKey: ['awards'],
    queryFn: async () => {
      const res = await phase4Client.get<Award[]>('/awards');
      return res.data;
    },
  });

  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);
  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  // Render each award item
  const renderItem = ({ item }: ListRenderItemInfo<Award>) => (
    <View style={[styles.card, { borderColor: jarsPrimary }]}>
      <Image source={{ uri: item.iconUrl }} style={styles.icon} />
      <Text style={[styles.title, { color: jarsPrimary }]}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
      <Text style={styles.date}>Earned: {item.earnedDate}</Text>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  // Error state
  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: jarsPrimary }]}>Error: {error.message}</Text>
          <Button
            title="Retry"
            onPress={() => {
              hapticMedium();
              refetch();
            }}
            color={jarsPrimary}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Success state
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <FlatList
        data={awards ?? []}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  icon: { width: 40, height: 40, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '600' },
  desc: { fontSize: 14, marginVertical: 4 },
  date: { fontSize: 12, color: '#777' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, marginBottom: 8 },
});
