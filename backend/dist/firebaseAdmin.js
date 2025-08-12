"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.admin = exports.getFirestore = exports.getAdmin = exports.initFirebase = void 0;
// backend/src/firebaseAdmin.ts
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
let app = null;
function serviceAccountFromEnv() {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!b64)
        throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 missing');
    const json = Buffer.from(b64, 'base64').toString('utf8');
    const svc = JSON.parse(json);
    if (typeof svc.private_key !== 'string' || !svc.private_key.includes('BEGIN PRIVATE KEY')) {
        throw new Error('service account JSON missing valid private_key');
    }
    return svc;
}
/** Initialize Firebase Admin exactly once. */
function initFirebase() {
    if (app)
        return app;
    if (firebase_admin_1.default.apps.length) {
        app = firebase_admin_1.default.app();
        return app;
    }
    const cred = firebase_admin_1.default.credential.cert(serviceAccountFromEnv());
    app = firebase_admin_1.default.initializeApp({ credential: cred });
    return app;
}
exports.initFirebase = initFirebase;
/** Ensure initialized and return the admin namespace (for messaging(), auth(), etc). */
function getAdmin() {
    if (!firebase_admin_1.default.apps.length)
        initFirebase();
    return firebase_admin_1.default;
}
exports.getAdmin = getAdmin;
/** Ensure initialized and return Firestore. */
function getFirestore() {
    return getAdmin().firestore();
}
exports.getFirestore = getFirestore;
/** Convenience export for existing code that expects `db`. */
exports.db = getFirestore();
/** Default export keeps old imports working. */
const firebaseAdmin = { admin: firebase_admin_1.default, initFirebase, getAdmin, getFirestore, db: exports.db };
exports.default = firebaseAdmin;
