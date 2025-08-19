// Minimal stub for @react-native-firebase/auth on web
export default function auth() {
  return {
    currentUser: null as any,
    async signInWithEmailAndPassword(_email: string, _password: string) {
      throw new Error('Auth not available in web demo.');
    },
    async createUserWithEmailAndPassword(_email: string, _password: string) {
      throw new Error('Sign up not available in web demo.');
    },
    async signOut() {},
  };
}

