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

import { phase4Client, getDataPrefs, updateDataPrefs } from '../api/phase4Client';
import { ThemeContext } from '../context/ThemeContext';
import { hapticMedium } from '../utils/haptic';
import { toast } from '../utils/toast';

type Preferences = {
  personalizedAds: boolean;
  emailTracking: boolean;
  shareWithPartners: boolean;
};

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
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [prefLoading, setPrefLoading] = useState<keyof Preferences | null>(null);

  useEffect(() => {
    getDataPrefs()
      .then(setPrefs)
      .catch(e => setError((e as Error).message));
  }, []);

  const handleToggle = async (key: keyof Preferences) => {
    if (!prefs) return;
    const newVal = !prefs[key];
    setPrefLoading(key);
    // Optimistic update with rollback on failure
    const previous = { ...prefs };
    const updated = { ...prefs, [key]: newVal };
    setPrefs(updated);
    try {
      await updateDataPrefs(updated);
      hapticMedium();
      const ts = new Date().toLocaleString();
      toast(`Saved • ${ts}`);
    } catch (e) {
      setPrefs(previous);
      setError((e as Error).message);
    } finally {
      setPrefLoading(null);
    }
  };

  // Request a data export
  const requestExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await phase4Client.post<{ exportId: string }>('/data-transparency/export', {
        userId: 'user-123',
      });
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
          const res = await phase4Client.get<{
            exportId: string;
            status: ExportStatus;
            downloadUrl?: string;
          }>(`/data-transparency/export/${exportId}`);
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
        {!prefs ? (
          <ActivityIndicator style={styles.spinner} />
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: jarsPrimary }]}>Data Preferences</Text>

            <View style={styles.prefRow}>
              <Text style={{ color: jarsPrimary }}>Personalized Ads</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Button
                  title={prefs.personalizedAds ? 'On' : 'Off'}
                  color={prefs.personalizedAds ? jarsPrimary : '#CCCCCC'}
                  onPress={() => handleToggle('personalizedAds')}
                  disabled={prefLoading !== null}
                  accessibilityLabel="Toggle personalized ads"
                />
                {prefLoading === 'personalizedAds' && (
                  <ActivityIndicator style={{ marginLeft: 8 }} />
                )}
              </View>
            </View>

            <View style={styles.prefRow}>
              <Text style={{ color: jarsPrimary }}>Email Tracking</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Button
                  title={prefs.emailTracking ? 'On' : 'Off'}
                  color={prefs.emailTracking ? jarsPrimary : '#CCCCCC'}
                  onPress={() => handleToggle('emailTracking')}
                  disabled={prefLoading !== null}
                  accessibilityLabel="Toggle email tracking"
                />
                {prefLoading === 'emailTracking' && <ActivityIndicator style={{ marginLeft: 8 }} />}
              </View>
            </View>

            <View style={styles.prefRow}>
              <Text style={{ color: jarsPrimary }}>Share With Partners</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Button
                  title={prefs.shareWithPartners ? 'On' : 'Off'}
                  color={prefs.shareWithPartners ? jarsPrimary : '#CCCCCC'}
                  onPress={() => handleToggle('shareWithPartners')}
                  disabled={prefLoading !== null}
                  accessibilityLabel="Toggle share with partners"
                />
                {prefLoading === 'shareWithPartners' && (
                  <ActivityIndicator style={{ marginLeft: 8 }} />
                )}
              </View>
            </View>
          </>
        )}

        <Button
          title={loading ? 'Requesting Export...' : 'Request Data Export'}
          color={jarsPrimary}
          onPress={requestExport}
          disabled={loading || status === 'pending'}
          accessibilityLabel="Request data export"
        />

        {(loading || status === 'pending') && <ActivityIndicator style={styles.spinner} />}

        {status === 'pending' && (
          <Text style={[styles.statusText, { color: jarsPrimary }]}>Export pending...</Text>
        )}

        {status === 'completed' && downloadUrl && (
          <Text
            style={[styles.linkText, { color: jarsPrimary }]}
            onPress={() => Linking.openURL(downloadUrl)}
            accessibilityLabel="Download data export"
            accessible
          >
            Download Export
          </Text>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: jarsPrimary }]}>Error: {error}</Text>
            <Button
              title="Retry"
              onPress={requestExport}
              color={jarsPrimary}
              accessibilityLabel="Retry export"
            />
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
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
});
