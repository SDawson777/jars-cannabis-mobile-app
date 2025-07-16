// src/screens/HelpFAQScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  { id: '1', question: 'How do I track my order?', answer: 'Go to Order Tracking on the Home screen.' },
  { id: '2', question: 'How do I apply a promo code?', answer: 'Enter your code in the Cart screen under Promo Code.' },
  { id: '3', question: 'How can I contact support?', answer: 'Use the Contact Us screen or in-app chat via Concierge.' },
];

export default function HelpFAQScreen() {
  const navigation = useNavigation();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);
  const [openIds, setOpenIds] = useState<string[]>([]);

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

  const toggleFAQ = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticLight();
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: '#EEEEEE' }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Help & FAQ
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* FAQ List */}
      <ScrollView contentContainerStyle={styles.content}>
        {FAQS.map((item) => (
          <View key={item.id} style={styles.faqItem}>
            <Pressable onPress={() => toggleFAQ(item.id)}>
              <Text style={[styles.question, { color: jarsPrimary }]}>
                {item.question}
              </Text>
            </Pressable>
            {openIds.includes(item.id) && (
              <Text style={styles.answer}>{item.answer}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  content: { padding: 16 },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 12,
  },
  question: { fontSize: 16, fontWeight: '500' },
  answer: { fontSize: 14, color: '#333333', marginTop: 8, lineHeight: 20 },
});
