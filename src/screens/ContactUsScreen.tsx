// src/screens/ContactUsScreen.tsx
import React, { useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  Linking,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft, Phone, Mail, MessageCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ContactNavProp = NativeStackNavigationProp<RootStackParamList, 'ContactUs'>;

export default function ContactUsScreen() {
  const navigation = useNavigation<ContactNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const contacts = [
    {
      icon: <Phone size={20} color={jarsPrimary} />,
      label: 'Call Us',
      action: () => {
        hapticLight();
        Linking.openURL('tel:+18005551234');
      },
    },
    {
      icon: <Mail size={20} color={jarsPrimary} />,
      label: 'Email Us',
      action: () => {
        hapticLight();
        Linking.openURL('mailto:help@jarsapp.com');
      },
    },
    {
      icon: <MessageCircle size={20} color={jarsPrimary} />,
      label: 'In-App Chat',
      action: () => {
        hapticLight();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        navigation.navigate('ConciergeChat');
      },
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>Contact Us</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>
        {contacts.map((c, idx) => (
          <Pressable
            key={idx}
            style={styles.row}
            onPress={c.action}
            android_ripple={{ color: '#EEE' }}
          >
            <View style={styles.iconWrapper}>{c.icon}</View>
            <Text style={[styles.label, { color: jarsPrimary }]}>{c.label}</Text>
          </Pressable>
        ))}
      </View>
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
  headerTitle: { fontSize: 20, fontWeight: '600' },
  content: { padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  iconWrapper: {
    width: 32,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginLeft: 12,
  },
});
