import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import type { TerpeneInfo } from '../../terpene_wheel/data/terpenes';

interface Props {
  info: TerpeneInfo | null;
}

const TerpeneInfoModal = React.forwardRef<BottomSheetModal, Props>(({ info }, ref) => {
  const snapPoints = React.useMemo(() => ['45%'], []);

  if (!info) {
    return null;
  }

  return (
    <BottomSheetModal ref={ref} index={0} snapPoints={snapPoints}>
      <View style={styles.content}>
        <Text style={styles.title}>{info.name}</Text>
        <Text style={styles.section}>Aromas: {info.aromas.join(', ')}</Text>
        <Text style={styles.section}>Effects: {info.effects.join(', ')}</Text>
        <Text style={styles.sectionSmall}>Strains: {info.strains.join(', ')}</Text>
      </View>
    </BottomSheetModal>
  );
});

export default TerpeneInfoModal;

const styles = StyleSheet.create({
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  section: { fontSize: 14, marginBottom: 6 },
  sectionSmall: { fontSize: 12, color: '#555' },
});
