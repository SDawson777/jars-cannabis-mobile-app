// Minimal mock for @react-native-firebase/auth used in Jest tests.
const mockAuth = () => ({
  currentUser: { displayName: 'Test User', email: 'test@example.com' },
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn(cb => {
    // call callback immediately with a mock user
    const user = { displayName: 'Test User', email: 'test@example.com' };
    setImmediate(() => cb(user));
    // return unsubscribe
    return () => {};
  }),
});

module.exports = mockAuth;
module.exports.default = mockAuth;
