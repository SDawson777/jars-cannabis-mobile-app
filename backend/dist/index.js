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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const Sentry = __importStar(require('@sentry/node'));
require('./firebaseAdmin');
const express_1 = __importDefault(require('express'));
const dotenv_1 = __importDefault(require('dotenv'));
const phase4_1 = require('./routes/phase4');
dotenv_1.default.config();
const app = (0, express_1.default)();
// Use Sentry.requestHandler and errorHandler **directly from Sentry default export**
app.use(Sentry.requestHandler());
app.use(express_1.default.json());
app.get('/', (_req, res) => {
  res.json({ status: 'healthy' });
});
app.use('/', phase4_1.phase4Router);
app.use(Sentry.errorHandler());
app.get('/sentry-debug', () => {
  throw new Error('Sentry test error!');
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Backend listening on http://localhost:${port}`);
});
