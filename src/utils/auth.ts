// src/utils/auth.ts
import { getSecure, saveSecure, deleteSecure } from './secureStorage';

// Read the persisted server-issued JWT used by AuthContext
export async function getAuthToken(): Promise<string | null> {
  return getSecure('jwtToken');
}

export async function saveAuthToken(token: string) {
  return saveSecure('jwtToken', token);
}

export async function clearAuthToken() {
  return deleteSecure('jwtToken');
}
