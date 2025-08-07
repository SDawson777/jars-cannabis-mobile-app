import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

interface Props {
  isVisible: boolean;
  onConfirm(): void;
  onDeny(): void;
}

export default function PermissionRationaleModal({ isVisible, onConfirm, onDeny }: Props) {
  if (!isVisible) return null;
  return (
    <Modal transparent animationType="fade" visible={isVisible} accessibilityViewIsModal accessible>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text allowFontScaling style={styles.text}>
            We use your location to show nearby stores.
          </Text>
          <View style={styles.row}>
            <Pressable
              style={styles.btn}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel="Enable location"
              accessibilityHint="Allows the app to show nearby stores"
            >
              <Text allowFontScaling style={styles.btnText}>
                Enable
              </Text>
            </Pressable>
            <Pressable
              style={styles.btn}
              onPress={onDeny}
              accessibilityRole="button"
              accessibilityLabel="No thanks"
              accessibilityHint="Dismisses this dialog"
            >
              <Text allowFontScaling style={styles.btnText}>
                No Thanks
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, width: '80%' },
  text: { marginBottom: 20, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  btn: { padding: 10, backgroundColor: '#2E5D46', borderRadius: 8 },
  btnText: { color: '#FFF' },
});
