import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { LoyaltyContext } from '../context/LoyaltyContext';
import { useStore } from '../context/StoreContext';

export default function WelcomeBanner() {
  const { data } = useContext(LoyaltyContext);
  const { preferredStore } = useStore();
  const loyaltyTier = data?.tier;
  const promo = preferredStore?.promo;

  let message = 'Welcome!';
  if (loyaltyTier === 'Gold') {
    message = 'Gold Tier Perk: Double Points This Week';
  } else if (promo && preferredStore?.name) {
    message = `${preferredStore.name} Exclusive: $10 Off Pickup Orders`;
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
