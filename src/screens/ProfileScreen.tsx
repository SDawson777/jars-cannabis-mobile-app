// src/screens/ProfileScreen.tsx
import React, { useEffect, useContext } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MENU = [
  { id: 'edit', label: 'Edit Profile', route: 'EditProfile' },
  { id: 'addresses', label: 'Saved Addresses', route: 'SavedAddresses' },
  { id: 'payments', label: 'Saved Payments', route: 'SavedPayments' },
  { id: 'favorites', label: 'Favorites', route: 'Favorites' },
  { id: 'orders', label: 'Order History', route: 'OrderHistory' },
  { id: 'settings', label: 'App Settings', route: 'AppSettings' },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const handlePress = (route: string) => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate(route as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <FlatList
        data={MENU}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => handlePress(item.route)}
          >
            <Text style={[styles.label, { color: jarsPrimary }]}>
              {item.label}
            </Text>
            <ChevronRight color={jarsPrimary} size={20} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  label: { fontSize: 16 },
});
