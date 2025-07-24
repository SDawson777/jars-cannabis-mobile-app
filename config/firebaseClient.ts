import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  EXPO_PUBLIC_FIREBASE_API_KEY as apiKey,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as authDomain,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID as projectId,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as storageBucket,
  EXPO_PUBLIC_FIREBASE_SENDER_ID as messagingSenderId,
  EXPO_PUBLIC_FIREBASE_APP_ID as appId,
  EXPO_PUBLIC_FIREBASE_MEASUREMENTID as measurementId,
} from '@env';

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
