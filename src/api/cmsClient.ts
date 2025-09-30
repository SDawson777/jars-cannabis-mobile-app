import axios, { AxiosInstance } from 'axios';

import { CMS_API_URL } from '../utils/cmsConfig';

export const cmsClient: AxiosInstance = axios.create({
  baseURL: CMS_API_URL,
  headers: { 'Content-Type': 'application/json' },
});
