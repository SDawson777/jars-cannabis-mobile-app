import axios from 'axios';

import { API_BASE_URL } from '../utils/apiConfig';

const BASE_URL = API_BASE_URL;

export const authClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function requestPasswordReset(email: string) {
  return authClient.post('/auth/forgot-password', { email });
}
