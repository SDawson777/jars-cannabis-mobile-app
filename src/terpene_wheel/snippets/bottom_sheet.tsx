// @ts-nocheck

/* prettier-ignore */

import React from 'react';
import { Text } from 'react-native';

// Dummy styles object so the code still reads sensibly
const styles = {
  title: {},
  section: {},
  sectionSmall: {},
};

export const BottomSheetContent = ({ info }) => (
  <>
    <Text style={styles.title}>{info.name}</Text>
    <Text style={styles.section}>Aromas: {info.aromas.join(', ')}</Text>
    <Text style={styles.section}>Effects: {info.effects.join(', ')}</Text>
    <Text style={styles.sectionSmall}>Strains: {info.strains.join(', ')}</Text>
  </>
);
