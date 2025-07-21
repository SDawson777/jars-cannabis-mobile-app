'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.processDataExport = void 0;
const admin = __importStar(require('firebase-admin'));
const functions = __importStar(require('firebase-functions'));
// Point the Admin SDK at emulators if running locally:
if (process.env.FIREBASE_EMULATOR_HUB /* or check FIRESTORE_EMULATOR_HOST */) {
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
}
// Initialize Admin
admin.initializeApp({
  // keep your other init (credential etc) if needed
  projectId: process.env.FIREBASE_PROJECT_ID,
  // optionally set a fake bucket name for emulator
  storageBucket: process.env.STORAGE_BUCKET || 'demo-bucket',
});
exports.processDataExport = functions.firestore
  .document('exports/{exportId}')
  .onCreate(async (snap, context) => {
    const exportId = context.params.exportId;
    const { userId } = snap.data();
    // … your export logic …
    // Now this bucket call will go to localhost:9199
    const bucket = admin.storage().bucket();
    // ...
  });
