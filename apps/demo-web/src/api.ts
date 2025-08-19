const DEFAULT_BASE = 'http://localhost:8080/api/v1';
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || DEFAULT_BASE;

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

