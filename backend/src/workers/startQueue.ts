import { exportQueue } from '../queues/dataExportQueue';
import { logger } from '../utils/logger';

export function startWorker() {
  exportQueue.on('completed', (job, result) => {
    logger.debug(`Export job ${job.id} completed, URL: ${(result as any).downloadUrl}`);
  });
  exportQueue.on('failed', (job, err) => {
    console.error(`Export job ${job.id} failed:`, err);
  });
}
