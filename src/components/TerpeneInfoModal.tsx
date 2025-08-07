import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { TerpeneInfo } from '../terpene_wheel/data/terpenes';

interface Props {
  terpene: TerpeneInfo | null;
  onClose: () => void;
}

const TerpeneInfoModal: React.FC<Props> = ({ terpene, onClose }) => {
  return (
    <Modal
      visible={!!terpene}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal
      accessible
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close modal"
        accessibilityHint="Returns to the previous screen"
      />
      <View style={styles.content}>
        {terpene && (
          <>
            <Text allowFontScaling style={styles.title}>{terpene.name}</Text>
            <Text allowFontScaling style={styles.section}>
              Aromas: {terpene.aromas.join(', ')}
            </Text>
            <Text allowFontScaling style={styles.section}>
              Effects: {terpene.effects.join(', ')}
            </Text>
            <Text allowFontScaling style={styles.sectionSmall}>
              Strains: {terpene.strains.join(', ')}
            </Text>
          </>
        )}
        <Pressable
          onPress={onClose}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
          accessibilityHint="Closes the modal"
        >
          <Text allowFontScaling style={styles.closeText}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000099' },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  section: { fontSize: 14, marginBottom: 4 },
  sectionSmall: { fontSize: 12, color: '#555' },
  closeButton: { marginTop: 12, alignSelf: 'center' },
  closeText: { fontSize: 16, fontWeight: '600', color: '#007AFF' },
});

export default TerpeneInfoModal;
