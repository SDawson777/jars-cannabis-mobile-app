import { fetchJson } from '../../../src/utils/apiClient';

const DEFAULT_BASE = 'http://localhost:8080/api/v1';
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || DEFAULT_BASE;

export async function getJson<T>(path: string): Promise<T> {
  return fetchJson<T>(`${API_BASE_URL}${path}`);
}
