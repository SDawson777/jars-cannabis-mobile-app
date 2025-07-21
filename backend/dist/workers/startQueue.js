'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.startWorker = void 0;
const dataExportQueue_1 = require('../queues/dataExportQueue');
function startWorker() {
  dataExportQueue_1.exportQueue.on('completed', (job, result) => {
    console.log(`Export job ${job.id} completed, URL: ${result.downloadUrl}`);
  });
  dataExportQueue_1.exportQueue.on('failed', (job, err) => {
    console.error(`Export job ${job.id} failed:`, err);
  });
}
exports.startWorker = startWorker;
