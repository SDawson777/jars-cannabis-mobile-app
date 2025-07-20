// src/screens/DataTransparencyScreen.tsx
import React, { useContext, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import { phase4Client } from '../api/phase4Client';
import { ThemeContext } from '../context/ThemeContext';
import { hapticMedium } from '../utils/haptic';

// Export status type
type ExportStatus = 'pending' | 'completed' | 'failed';

export default function DataTransparencyScreen() {
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);
  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  const [exportId, setExportId] = useState<string | null>(null);
  const [status, setStatus] = useState<ExportStatus | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request a data export
  const requestExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await phase4Client.post<{ exportId: string }>('/data-transparency/export', { userId: 'user-123' });
      setExportId(res.data.exportId);
      setStatus('pending');
      hapticMedium();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Poll export status
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (exportId && status === 'pending') {
      interval = setInterval(async () => {
        try {
          const res = await phase4Client.get<{ exportId: string; status: ExportStatus; downloadUrl?: string }>(
            `/data-transparency/export/${exportId}`
          );
          setStatus(res.data.status);
          if (res.data.status === 'completed') {
            setDownloadUrl(res.data.downloadUrl || null);
            hapticMedium();
            clearInterval(interval);
          }
          if (res.data.status === 'failed') {
            clearInterval(interval);
          }
        } catch (e) {
          setError((e as Error).message);
          clearInterval(interval);
        }
      }, 2000);
    }
    return () => {
      if (exportId) clearInterval(interval);
    };
  }, [exportId, status]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>      
      <View style={styles.content}>
        <Button
          title={loading ? 'Requesting Export...' : 'Request Data Export'}
          color={jarsPrimary}
          onPress={requestExport}
          disabled={loading}
        />

        {loading && <ActivityIndicator style={styles.spinner} />}

        {status === 'pending' && (
          <Text style={[styles.statusText, { color: jarsPrimary }]}>Export pending...</Text>
        )}

        {status === 'completed' && downloadUrl && (
          <Text
            style={[styles.linkText, { color: jarsPrimary }]}
            onPress={() => Linking.openURL(downloadUrl)}
          >
            Download Export
          </Text>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: jarsPrimary }]}>Error: {error}</Text>
            <Button title="Retry" onPress={requestExport} color={jarsPrimary} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, alignItems: 'center' },
  spinner: { marginTop: 20 },
  statusText: { marginTop: 16, fontSize: 16 },
  linkText: { marginTop: 16, fontSize: 16, textDecorationLine: 'underline' },
  errorContainer: { marginTop: 20, alignItems: 'center' },
  errorText: { fontSize: 16, marginBottom: 8 },
});
