"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.getFirestore = exports.initFirebase = void 0;
const admin = __importStar(require("firebase-admin"));
exports.admin = admin;
let appInstance = null;
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
const initFirebase = () => {
    if (appInstance)
        return appInstance;
    if (admin.apps.length) {
        appInstance = admin.app();
        return appInstance;
    }
    appInstance = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountFromEnv()),
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    });
    return appInstance;
};
exports.initFirebase = initFirebase;
const getFirestore = () => {
    if (!admin.apps.length)
        (0, exports.initFirebase)();
    return admin.firestore();
};
exports.getFirestore = getFirestore;
