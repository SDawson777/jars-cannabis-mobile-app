import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
// import { API_KEY } from '@env';
const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string;
const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string;
const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string;
const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as string;
const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID as string;
const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string;
const measurementId = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENTID as string;

let app: FirebaseApp;

export const getFirebase = (): FirebaseApp => {
  if (!getApps().length) {
    app = initializeApp({
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      measurementId,
    });
  }
  return app;
};
