import React from 'react';
import { renderHook, act } from '@testing-library/react-native';

import { useAuth } from '../../hooks/useAuth';
import { AuthContext } from '../../context/AuthContext';
import { authClient } from '../../clients/authClient';
import * as authUtils from '../../utils/auth';
import * as secureStorage from '../../utils/secureStorage';

// Mock dependencies
jest.mock('@react-native-firebase/auth', () => {
  const mockUser = {
    getIdToken: jest.fn().mockResolvedValue('firebase-id-token'),
    updateProfile: jest.fn().mockResolvedValue(undefined),
  };
  return () => ({
    signInWithEmailAndPassword: jest.fn().mockResolvedValue({ user: mockUser }),
    createUserWithEmailAndPassword: jest.fn().mockResolvedValue({ user: mockUser }),
    signOut: jest.fn().mockResolvedValue(undefined),
  });
});

jest.mock('../../clients/authClient', () => ({
  authClient: {
    post: jest.fn(),
  },
}));

jest.mock('../../utils/auth', () => ({
  saveAuthToken: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../utils/secureStorage', () => ({
  saveSecure: jest.fn().mockResolvedValue(undefined),
}));

describe('useAuth hook', () => {
  const mockSetToken = jest.fn().mockResolvedValue(undefined);
  const mockClearAuth = jest.fn().mockResolvedValue(undefined);

  const createWrapper = (tokenValue: string | null = null) => {
    return ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider
        value={{
          token: tokenValue,
          setToken: mockSetToken,
          clearAuth: mockClearAuth,
          data: tokenValue
            ? { id: 'user-1', email: 'test@example.com', name: 'Test User' }
            : undefined,
          isLoading: false,
          isError: false,
          error: null,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return isAuthenticated false when no token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(null) });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBeNull();
  });

  it('should return isAuthenticated true when token exists', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper('valid-token') });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.currentUser).toEqual({ id: 'user-1', email: 'test@example.com' });
  });

  it('should sign in via backend when successful', async () => {
    (authClient.post as jest.Mock).mockResolvedValueOnce({ data: { token: 'backend-token' } });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(authClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
    expect(mockSetToken).toHaveBeenCalledWith('backend-token');
    expect(authUtils.saveAuthToken).toHaveBeenCalledWith('backend-token');
    expect(secureStorage.saveSecure).toHaveBeenCalledWith('useBiometricAuth', 'true');
  });

  it('should fallback to Firebase when backend fails', async () => {
    (authClient.post as jest.Mock)
      .mockRejectedValueOnce(new Error('Backend error'))
      .mockResolvedValueOnce({ data: { token: 'firebase-exchanged-token' } });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(mockSetToken).toHaveBeenCalledWith('firebase-exchanged-token');
  });

  it('should sign up via backend when successful', async () => {
    (authClient.post as jest.Mock).mockResolvedValueOnce({ data: { token: 'signup-token' } });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.signUp({
        name: 'Test User',
        email: 'test@example.com',
        phone: '555-1234',
        password: 'password123',
      });
    });

    expect(authClient.post).toHaveBeenCalledWith('/auth/register', {
      email: 'test@example.com',
      password: 'password123',
    });
    expect(mockSetToken).toHaveBeenCalledWith('signup-token');
  });

  it('should sign out and clear auth', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper('valid-token') });

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockClearAuth).toHaveBeenCalled();
  });

  it('should verify OTP', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    let code: string = '';
    await act(async () => {
      code = await result.current.verifyOtp('123456');
    });

    expect(code).toBe('123456');
  });

  it('should expose loading and error states', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider
        value={{
          token: null,
          setToken: mockSetToken,
          clearAuth: mockClearAuth,
          data: undefined,
          isLoading: true,
          isError: true,
          error: new Error('Auth error'),
        }}
      >
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
