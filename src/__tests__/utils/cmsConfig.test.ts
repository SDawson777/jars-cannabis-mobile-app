// src/__tests__/utils/cmsConfig.test.ts
import { CMS_API_URL } from '../../utils/cmsConfig';
import { API_BASE_URL } from '../../utils/apiConfig';

describe('cmsConfig', () => {
  it('should export CMS_API_URL equal to API_BASE_URL', () => {
    expect(CMS_API_URL).toBe(API_BASE_URL);
  });

  it('should be a valid URL string', () => {
    expect(typeof CMS_API_URL).toBe('string');
    expect(CMS_API_URL.length).toBeGreaterThan(0);
  });
});
