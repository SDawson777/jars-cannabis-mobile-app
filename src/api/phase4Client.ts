// src/api/phase4Client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken } from '../utils/auth';

const BASE_URL = 'http://127.0.0.1:4010';

function createPhase4Client(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' } as any,
  });

  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getAuthToken();
      if (token && config.headers) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  return client;
}

export const phase4Client = createPhase4Client();
