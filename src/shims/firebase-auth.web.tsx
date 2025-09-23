// Minimal stub for @react-native-firebase/auth on web
export default function auth() {
  return {
    currentUser: null as any,
    async signInWithEmailAndPassword(__email: string, __password: string) {
      throw new Error('Auth not available in web demo.');
    },
    async createUserWithEmailAndPassword(__email: string, __password: string) {
      throw new Error('Sign up not available in web demo.');
    },
    async signOut() {},
  };
}
