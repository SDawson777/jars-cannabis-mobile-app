import AsyncStorage from '@react-native-async-storage/async-storage';

import { logEvent } from '../src/utils/analytics';

export async function onProximityAlert(store_id: string, distance: number) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `visit_${store_id}_${today}`;
  const already = await AsyncStorage.getItem(key);
  if (!already) {
    logEvent('store_visit_nearby', { store_id, distance });
    await AsyncStorage.setItem(key, '1');
  }
}
