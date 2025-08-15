// src/screens/PrivacyIntelligenceScreen.tsx
import React from 'react';
import { ScrollView, View, Text, Switch, Button, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../hooks/useAuth';
import { usePersonalization } from '../hooks/usePersonalization';
import { PRIVACY_EXPORT_FORM } from '../constants/links';

export default function PrivacyIntelligenceScreen() {
  const [enabled, setEnabled] = usePersonalization();
  const { currentUser } = useAuth();

  const handleDownload = async () => {
    const url = PRIVACY_EXPORT_FORM.replace(
      '{{EMAIL}}',
      encodeURIComponent(currentUser?.email ?? '')
    );
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Personalized recommendations</Text>
        <Switch value={enabled} onValueChange={setEnabled} />
      </View>
      <Button title="Download my data" onPress={handleDownload} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  label: { fontSize: 16 },
});
