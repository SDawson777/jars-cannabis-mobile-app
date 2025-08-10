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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // <-- MUST be called first!
// Ensure TS path aliases resolve at runtime after tsc build
require("tsconfig-paths/register");
const Sentry = __importStar(require("@sentry/node"));
require("./firebaseAdmin");
const express_1 = __importDefault(require("express"));
const auth_1 = require("./routes/auth");
const profile_1 = require("./routes/profile");
const products_1 = require("./routes/products");
const stores_1 = require("./routes/stores");
const cart_1 = require("./routes/cart");
const orders_1 = require("./routes/orders");
const content_1 = require("./routes/content");
const recommendations_1 = require("./routes/recommendations");
const loyalty_1 = require("./routes/loyalty");
const greenhouse_1 = require("./routes/greenhouse");
const journal_1 = require("./routes/journal");
const awards_1 = require("./routes/awards");
const data_1 = require("./routes/data");
const accessibility_1 = require("./routes/accessibility");
const concierge_1 = require("./routes/concierge");
const ar_1 = require("./routes/ar");
const stripe_1 = require("./routes/stripe");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/', (_req, res) => {
    res.json({ status: 'healthy' });
});
app.use('/api/v1', auth_1.authRouter);
app.use('/api/v1', profile_1.profileRouter);
app.use('/api/v1', products_1.productsRouter);
app.use('/api/v1', stores_1.storesRouter);
app.use('/api/v1', cart_1.cartRouter);
app.use('/api/v1', orders_1.ordersRouter);
app.use('/api/v1', content_1.contentRouter);
app.use('/api/v1', recommendations_1.recommendationsRouter);
app.use('/api/v1', loyalty_1.loyaltyRouter);
app.use('/api/v1', greenhouse_1.greenhouseRouter);
app.use('/api/v1', journal_1.journalRouter);
app.use('/api/v1', awards_1.awardsRouter);
app.use('/api/v1', data_1.dataRouter);
app.use('/api/v1', accessibility_1.accessibilityRouter);
app.use('/api/v1', concierge_1.conciergeRouter);
app.use('/api/v1', ar_1.arRouter);
app.use('/api/v1', stripe_1.stripeRouter);
// Type-safe Sentry error handler (always after all routes)
app.use((err, req, res, next) => {
    Sentry.captureException(err);
    res.status(500).json({ error: 'Internal server error' });
});
app.get('/sentry-debug', (_req, _res) => {
    throw new Error('Sentry test error!');
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Backend listening on http://localhost:${port}`);
});
