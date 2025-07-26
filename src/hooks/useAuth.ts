import { useContext } from 'react';
import auth from '@react-native-firebase/auth';
import { AuthContext } from '../context/AuthContext';

interface SignUpArgs {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export function useAuth() {
  const { token, setToken, clearAuth, data, isLoading, isError, error } = useContext(AuthContext);

  const signIn = async (email: string, password: string) => {
    const cred = await auth().signInWithEmailAndPassword(email, password);
    const t = await cred.user.getIdToken();
    await setToken(t);
  };

  const signUp = async ({ name, email, phone, password }: SignUpArgs) => {
    const cred = await auth().createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name, phoneNumber: phone });
    const t = await cred.user.getIdToken();
    await setToken(t);
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
