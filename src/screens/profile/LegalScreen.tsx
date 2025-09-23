import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import React, { useContext, useState } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';

import LegalDisclaimerModal from '../../components/LegalDisclaimerModal';
import { ThemeContext } from '../../context/ThemeContext';
import type { RootStackParamList } from '../../navigation/types';
import { hapticLight } from '../../utils/haptic';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Legal'>;

const LINKS = [
  { id: 'privacy', label: 'Privacy Policy', content: 'Privacy policy content goes here.' },
  { id: 'terms', label: 'Terms of Use', content: 'Terms of use content goes here.' },
  {
    id: 'accessibility',
    label: 'Accessibility Statement',
    content: 'Accessibility statement content goes here.',
  },
];

export default function LegalScreen() {
  const navigation = useNavigation<NavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const [selected, setSelected] = useState<(typeof LINKS)[number] | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
        <Pressable
          onPress={() => {
            hapticLight();
            navigation.goBack();
          }}
        >
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>Legal</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.list}>
        {LINKS.map(item => (
          <Pressable
            key={item.id}
            style={[styles.row, { borderBottomColor: jarsSecondary }]}
            onPress={() => {
              hapticLight();
              setSelected(item);
            }}
          >
            <Text style={[styles.label, { color: jarsPrimary }]}>{item.label}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => setShowDisclaimer(true)} style={styles.disclaimerBtn}>
          <Text style={[styles.disclaimerLink, { color: jarsPrimary }]}>View Disclaimer</Text>
        </Pressable>
      </View>

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: bgColor }]}>
          <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
            <Pressable onPress={() => setSelected(null)}>
              <ChevronLeft color={jarsPrimary} size={24} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: jarsPrimary }]}>{selected?.label}</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={{ color: jarsSecondary }}>{selected?.content}</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <LegalDisclaimerModal visible={showDisclaimer} onClose={() => setShowDisclaimer(false)} />
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
  list: { paddingHorizontal: 16 },
  row: { paddingVertical: 12, borderBottomWidth: 1 },
  label: { fontSize: 16 },
  disclaimerBtn: { alignItems: 'center', marginTop: 24 },
  disclaimerLink: { fontSize: 14, textDecorationLine: 'underline' },
  modalContainer: { flex: 1 },
  modalContent: { padding: 16 },
});
