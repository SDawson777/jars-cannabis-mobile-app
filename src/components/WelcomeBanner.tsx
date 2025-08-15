import React from 'react';
import { View, Text, StyleSheet } from 'react-native'; // eslint-disable-line import/no-extraneous-dependencies
import { useContext } from 'react';
import { LoyaltyContext } from '../context/LoyaltyContext';
import { useStore } from '../context/StoreContext';

export default function WelcomeBanner() {
  const { data } = useContext(LoyaltyContext);
  const { preferredStore } = useStore();
  const loyaltyLevel = data?.level;
  const promo = preferredStore?.promo;

  let message = 'Welcome!';
  if (loyaltyLevel === 'Gold') {
    message = 'Gold Tier Perk: Double Points This Week';
  } else if (promo && preferredStore?.name) {
    message = `${preferredStore.name} Exclusive: ${promo}`;
  }

  return (
    <View style={styles.container} accessible accessibilityRole="header">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    alignItems: 'center',
  },
  text: { fontSize: 16, fontWeight: '500' },
});
