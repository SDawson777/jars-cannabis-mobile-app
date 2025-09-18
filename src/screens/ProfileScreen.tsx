// src/screens/ProfileScreen.tsx
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight } from 'lucide-react-native';
import React, { useEffect, useContext } from 'react';
import {
  SafeAreaView,
  FlatList,
  Text,
  View,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';

import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
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
  { id: 'OrderHistory', label: 'My Orders' },
  { id: 'AppSettings', label: 'App Settings' },
  { id: 'Legal', label: 'Legal' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const { data, clearAuth } = useContext(AuthContext as any);

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
      <View style={styles.headerWrap}>
        {data ? (
          <>
            <Pressable testID="profile-image" onPress={() => navigateTo('EditProfile')}>
              <Text accessibilityLabel="profile picture">IMG</Text>
            </Pressable>
            <View style={styles.profileInfo}>
              <Text
                testID="profile-name"
                accessibilityRole="text"
                style={[styles.name, { color: jarsPrimary }]}
              >
                {' '}
                {data?.name ?? 'Guest'}{' '}
              </Text>
              <Text testID="profile-email" style={[styles.email, { color: jarsSecondary }]}>
                {' '}
                {data?.email ?? ''}{' '}
              </Text>
            </View>
            <Pressable
              testID="edit-profile-button"
              accessibilityLabel="edit profile"
              onPress={() => navigateTo('EditProfile')}
            >
              <Text>Edit</Text>
            </Pressable>
            <Pressable onPress={() => clearAuth && clearAuth()}>
              <Text>Logout</Text>
            </Pressable>
          </>
        ) : (
          <Pressable testID="sign-in-button" accessibilityLabel="sign in">
            <Text>Sign in</Text>
          </Pressable>
        )}
      </View>
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
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    justifyContent: 'space-between',
  },
  profileInfo: { flex: 1, marginHorizontal: 12 },
  name: { fontSize: 18, fontWeight: '600' },
  email: { fontSize: 14, marginTop: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  label: { fontSize: 16 },
});
