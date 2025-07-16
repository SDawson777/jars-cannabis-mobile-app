// src/screens/EditProfileScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  const profile = (route.params as any)?.profile || {};
  const [name, setName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const onSave = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticMedium();
    // TODO: save profile changes
    Alert.alert('Profile Updated', 'Your profile has been saved.');
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: '#EEEEEE' }]}>
        <Pressable onPress={handleBack} style={styles.iconBtn}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Edit Profile
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(t) => {
            hapticLight();
            setName(t);
          }}
          placeholder="Jane Doe"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(t) => {
            hapticLight();
            setEmail(t);
          }}
          placeholder="you@example.com"
          keyboardType="email-address"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={(t) => {
            hapticLight();
            setPhone(t);
          }}
          placeholder="(123) 456-7890"
          keyboardType="phone-pad"
          placeholderTextColor="#999999"
        />

        <Pressable
          style={[styles.saveBtn, { backgroundColor: jarsPrimary }]}
          onPress={onSave}
        >
          <Text style={styles.saveText}>Save Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  iconBtn: { width: 24, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  form: { padding: 16 },
  label: {
    fontSize: 14,
    color: '#777777',
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  saveBtn: {
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
