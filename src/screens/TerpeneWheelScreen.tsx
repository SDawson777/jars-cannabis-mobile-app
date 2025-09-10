import React from 'react';
import { View, Text, StyleSheet, AccessibilityInfo } from 'react-native';

import { TerpeneInfoModal } from '../terpene_wheel/components/TerpeneInfoModal';
import { TerpeneWheel } from '../terpene_wheel/components/TerpeneWheel';
import type { TerpeneInfo } from '../terpene_wheel/data/terpenes';

export default function TerpeneWheelScreen() {
  const [selectedTerpene, setSelectedTerpene] = React.useState<TerpeneInfo | null>(null);

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility?.('Terpene Wheel');
  }, []);

  return (
    <View style={styles.container} testID="terpene-wheel-screen">
      <Text style={styles.title}>Terpene Wheel</Text>
      <TerpeneWheel onSelect={setSelectedTerpene} />
      {selectedTerpene && (
        <TerpeneInfoModal
          terpene={selectedTerpene}
          visible={!!selectedTerpene}
          onClose={() => setSelectedTerpene(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
