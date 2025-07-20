import { exportQueue } from '../queues/dataExportQueue';

export function startWorker() {
  exportQueue.on('completed', (job, result) => {
    console.log(`Export job ${job.id} completed, URL: ${(result as any).downloadUrl}`);
  });
  exportQueue.on('failed', (job, err) => {
    console.error(`Export job ${job.id} failed:`, err);
  });
}
