import auth from '@react-native-firebase/auth';
import { useContext } from 'react';

import { authClient } from '../clients/authClient';
import { AuthContext } from '../context/AuthContext';
import { saveAuthToken } from '../utils/auth';
import { saveSecure } from '../utils/secureStorage';

interface SignUpArgs {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export function useAuth() {
  const { token, setToken, clearAuth, data, isLoading, isError, error } = useContext(AuthContext);

  const signIn = async (email: string, password: string) => {
    // First try backend authentication (email/password)
    try {
      const res = await authClient.post('/auth/login', { email, password });
      const token = res.data?.token;
      if (token) {
        await setToken(token);
        await saveAuthToken(token);
        await saveSecure('useBiometricAuth', 'true');
        return;
      }
    } catch (__e) {
      // fall through to Firebase fallback
    }

    // Fallback: sign in with Firebase and exchange ID token for server JWT
    const cred = await auth().signInWithEmailAndPassword(email, password);
    const idToken = await cred.user.getIdToken();
    const exch = await authClient.post('/auth/login', { idToken });
    const serverToken = exch.data?.token;
    if (!serverToken) throw new Error('Failed to obtain server token');
    await setToken(serverToken);
    await saveAuthToken(serverToken);
    await saveSecure('useBiometricAuth', 'true');
  };

  const signUp = async ({ name, email, phone, password }: SignUpArgs) => {
    // Create user via backend, which returns a server JWT
    try {
      const res = await authClient.post('/auth/register', { email, password });
      const token = res.data?.token;
      if (token) {
        // Optionally update Firebase profile if desired
        try {
          const fb = await auth().createUserWithEmailAndPassword(email, password);
          await fb.user.updateProfile({ displayName: name });
        } catch {
          // ignore firebase profile errors
        }
        await setToken(token);
        await saveAuthToken(token);
        await saveSecure('useBiometricAuth', 'true');
        return;
      }
    } catch (__e) {
      // fallback to Firebase create + exchange idToken
    }

    const cred = await auth().createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name, phoneNumber: phone });
    const idT = await cred.user.getIdToken();
    const exch = await authClient.post('/auth/login', { idToken: idT });
    const serverToken = exch.data?.token;
    if (!serverToken) throw new Error('Failed to obtain server token');
    await setToken(serverToken);
    await saveAuthToken(serverToken);
    await saveSecure('useBiometricAuth', 'true');
  };

  const signOut = async () => {
    await auth().signOut();
    await clearAuth();
  };

  const verifyOtp = async (code: string) => {
    // Placeholder for OTP verification logic
    return code;
  };

  return {
    isAuthenticated: !!token,
    currentUser: data,
    signIn,
    signUp,
    signOut,
    verifyOtp,
    isLoading,
    isError,
    error,
  };
}
