import axios from 'axios';
import type { AxiosInstance } from 'axios';

import { CMS_API_URL } from '../utils/cmsConfig';

// Cast axios to any for the create call (safe at runtime) then type the result
export const cmsClient = (axios as any).create({
  baseURL: CMS_API_URL,
  headers: { 'Content-Type': 'application/json' },
}) as AxiosInstance;
