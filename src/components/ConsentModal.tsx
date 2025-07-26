import React, { useContext, useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserConsentContext } from '../context/UserConsentContext';

export default function ConsentModal() {
  const { setPersonalized } = useContext(UserConsentContext);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('consent_shown').then(v => {
      if (!v) setVisible(true);
    });
  }, []);

  const accept = async () => {
    await setPersonalized(true);
    await AsyncStorage.setItem('consent_shown', 'true');
    setVisible(false);
  };

  const decline = async () => {
    await setPersonalized(false);
    await AsyncStorage.setItem('consent_shown', 'true');
    setVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" testID="consent-modal">
      <View style={styles.overlay}>
        <View style={styles.box} accessibilityLabel="Consent dialog">
          <Text style={styles.title}>Allow personalized recommendations?</Text>
          <Pressable onPress={accept} style={styles.btn} testID="consent-accept">
            <Text style={styles.btnText}>Yes</Text>
          </Pressable>
          <Pressable onPress={decline} style={styles.btn} testID="consent-decline">
            <Text style={styles.btnText}>No</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  box: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, width: '80%' },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  btn: { paddingVertical: 8, alignItems: 'center' },
  btnText: { color: '#2E5D46', fontSize: 15 },
});
