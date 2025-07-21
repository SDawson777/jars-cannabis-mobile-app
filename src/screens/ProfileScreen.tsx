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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ProfileNavProp = NativeStackNavigationProp<RootStackParamList>;

const MENU: { id: keyof RootStackParamList; label: string }[] = [
  { id: 'EditProfile', label: 'Edit Profile' },
  { id: 'SavedAddresses', label: 'Saved Addresses' },
  { id: 'SavedPayments', label: 'Saved Payments' },
  { id: 'Favorites', label: 'Favorites' },
  { id: 'OrderHistory', label: 'Order History' },
  { id: 'AppSettings', label: 'App Settings' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  const navigateTo = (route: keyof RootStackParamList) => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate(route as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <FlatList
        data={MENU}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { borderBottomColor: jarsSecondary }]}
            android_ripple={{ color: `${jarsSecondary}20` }}
            onPress={() => navigateTo(item.id)}
          >
            <Text style={[styles.label, { color: jarsPrimary }]}>{item.label}</Text>
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
  },
  label: { fontSize: 16 },
});
