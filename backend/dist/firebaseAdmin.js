"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.admin = exports.getFirestore = exports.initFirebase = void 0;
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
function getFirestore() {
    if (!firebase_admin_1.default.apps.length)
        initFirebase();
    return firebase_admin_1.default.firestore();
}
exports.getFirestore = getFirestore;
// Keep a convenient named export for compatibility
exports.db = (() => {
    try {
        return getFirestore();
    }
    catch {
        return undefined;
    }
})();
// Default export so `import firebaseAdmin from './firebaseAdmin'` works
const firebaseAdmin = { admin: firebase_admin_1.default, initFirebase, getFirestore, db: exports.db };
exports.default = firebaseAdmin;
