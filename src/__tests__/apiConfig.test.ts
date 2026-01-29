describe('apiConfig', () => {
  const originalEnv = process.env;
  const originalDev = (global as any).__DEV__;

  beforeEach(() => {
    jest.resetModules();
    // Create a fresh copy of env
    process.env = { ...originalEnv };
    delete process.env.EXPO_PUBLIC_API_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
    (global as any).__DEV__ = originalDev;
  });

  it('should return localhost in development when EXPO_PUBLIC_API_URL is not set', () => {
    (global as any).__DEV__ = true;

    const { API_BASE_URL } = require('../utils/apiConfig');

    expect(API_BASE_URL).toBe('http://localhost:3000');
  });

  it('should return invalid URL in production when EXPO_PUBLIC_API_URL is not set', () => {
    (global as any).__DEV__ = false;
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { API_BASE_URL } = require('../utils/apiConfig');

    expect(API_BASE_URL).toBe('https://api-not-configured.invalid');
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('EXPO_PUBLIC_API_URL is not set')
    );

    consoleError.mockRestore();
  });

  it('should handle undefined __DEV__ as development', () => {
    delete (global as any).__DEV__;

    const { API_BASE_URL } = require('../utils/apiConfig');

    expect(API_BASE_URL).toBe('http://localhost:3000');
  });
});
