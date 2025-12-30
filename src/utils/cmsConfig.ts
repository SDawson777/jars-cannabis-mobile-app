import { API_BASE_URL } from './apiConfig';

// CMS should use the same API origin as the rest of the app. Keep this alias
// so older imports that reference `CMS_API_URL` continue to work.
export const CMS_API_URL = API_BASE_URL;
