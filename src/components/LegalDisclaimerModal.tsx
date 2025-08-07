import React, { useContext } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function LegalDisclaimerModal({ visible, onClose }: Props) {
  const { jarsBackground, jarsPrimary, jarsSecondary } = useContext(ThemeContext);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: `${jarsBackground}CC` }]}>
        <View style={[styles.container, { backgroundColor: jarsBackground }]}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={[styles.title, { color: jarsPrimary }]}>Legal Disclaimer</Text>
            <Text style={[styles.body, { color: jarsSecondary }]}>
              This app is intended for use only by adults 21 years of age or older. All purchases
              must comply with applicable state and local laws. Please consume responsibly.
            </Text>
          </ScrollView>
          <Pressable
            style={[styles.close, { backgroundColor: jarsPrimary }]}
            accessibilityRole="button"
            onPress={() => {
              hapticLight();
              onClose();
            }}
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', maxHeight: '90%', borderRadius: 12, overflow: 'hidden' },
  scroll: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  body: { fontSize: 14, lineHeight: 20 },
  close: { padding: 16, alignItems: 'center' },
  closeText: { color: '#FFF', fontWeight: '600' },
});
