"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_1 = require("./routes/auth");
const profile_1 = require("./routes/profile");
const stores_1 = require("./routes/stores");
const products_1 = require("./routes/products");
const cart_1 = require("./routes/cart");
const orders_1 = require("./routes/orders");
const content_1 = require("./routes/content");
const loyalty_1 = require("./routes/loyalty");
const journal_1 = require("./routes/journal");
const recommendations_1 = require("./routes/recommendations");
const data_1 = require("./routes/data");
const concierge_1 = require("./routes/concierge");
const ar_1 = require("./routes/ar");
const firebase_admin_1 = require("./bootstrap/firebase-admin");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '1mb' }));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.get('/api/v1/health', (_req, res) => res.json({ ok: true }));
try {
    (0, firebase_admin_1.initFirebase)();
}
catch (e) {
    console.log('Firebase init skipped:', e?.message);
}
app.use('/api/v1', auth_1.authRouter);
app.use('/api/v1', profile_1.profileRouter);
app.use('/api/v1', stores_1.storesRouter);
app.use('/api/v1', products_1.productsRouter);
app.use('/api/v1', cart_1.cartRouter);
app.use('/api/v1', orders_1.ordersRouter);
app.use('/api/v1', content_1.contentRouter);
app.use('/api/v1', loyalty_1.loyaltyRouter);
app.use('/api/v1', journal_1.journalRouter);
app.use('/api/v1', recommendations_1.recommendationsRouter);
app.use('/api/v1', data_1.dataRouter);
app.use('/api/v1', concierge_1.conciergeRouter);
app.use('/api/v1', ar_1.arRouter);
// Global error handler so nothing crashes
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err?.code || err?.message || err);
    res.status(500).json({ error: 'Internal Server Error' });
});
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`🚀 Backend listening on http://localhost:${port}`));
