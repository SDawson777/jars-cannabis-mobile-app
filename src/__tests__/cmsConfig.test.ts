import { CMS_API_URL } from '../utils/cmsConfig';
import { API_BASE_URL } from '../utils/apiConfig';

jest.mock('../utils/apiConfig', () => ({
  API_BASE_URL: 'https://api.example.com',
}));

describe('cmsConfig', () => {
  it('should export CMS_API_URL equal to API_BASE_URL', () => {
    expect(CMS_API_URL).toBe(API_BASE_URL);
  });

  it('should use the same API origin', () => {
    expect(CMS_API_URL).toBe('https://api.example.com');
  });
});
