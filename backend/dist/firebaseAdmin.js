'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.db = exports.auth = void 0;
// backend/src/firebaseAdmin.ts
const firebase_admin_1 = __importDefault(require('firebase-admin'));
const dotenv_1 = __importDefault(require('dotenv'));
dotenv_1.default.config();
// Initialize the Firebase Admin SDK if it hasn't been already
if (!firebase_admin_1.default.apps.length) {
  firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}
// If the FIRESTORE_EMULATOR_HOST env var is set, point Firestore at the emulator
if (process.env.FIRESTORE_EMULATOR_HOST) {
  firebase_admin_1.default.firestore().settings({
    host: process.env.FIRESTORE_EMULATOR_HOST,
    ssl: false,
  });
}
exports.auth = firebase_admin_1.default.auth();
exports.db = firebase_admin_1.default.firestore();
