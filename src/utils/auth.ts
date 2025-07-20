// src/utils/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem('userToken');
}
