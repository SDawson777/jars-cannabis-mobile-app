'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.exportQueue = void 0;
// backend/src/queues/dataExportQueue.ts
const bull_1 = __importDefault(require('bull'));
const client_1 = require('@prisma/client');
const prisma = new client_1.PrismaClient();
// Connect to Redis (default localhost:6379—override with REDIS_URL env var if needed)
exports.exportQueue = new bull_1.default('exportQueue', {
  redis: { port: 6379, host: '127.0.0.1' },
});
// Define the job processor
exports.exportQueue.process(async job => {
  const { exportId, userId } = job.data;
  // Simulate data generation (e.g., CSV/ZIP creation)
  await new Promise(resolve => setTimeout(resolve, 3000));
  const fakeUrl = `https://example.com/downloads/${exportId}.zip`;
  // Update the database record to completed
  await prisma.dataExport.update({
    where: { id: exportId },
    data: { status: 'completed', downloadUrl: fakeUrl },
  });
  return { downloadUrl: fakeUrl };
});
