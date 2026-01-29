// Fail explicitly in production if API URL is not configured
const getApiBaseUrl = (): string => {
  const url = process.env.EXPO_PUBLIC_API_URL;

  if (url) {
    return url;
  }

  // In production builds without a configured URL, throw a clear error
  // __DEV__ is a React Native global that is true in development builds
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    console.error(
      '[API Config] EXPO_PUBLIC_API_URL is not set. ' +
        'This is required for production builds. ' +
        'Please configure EAS secrets or environment variables.'
    );
    // Return a clearly invalid URL that will fail fast on first API call
    return 'https://api-not-configured.invalid';
  }

  // In development, fall back to localhost for convenience
  return 'http://localhost:3000';
};

export const API_BASE_URL = getApiBaseUrl();
