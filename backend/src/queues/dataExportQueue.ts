// backend/src/queues/dataExportQueue.ts
import Queue from 'bull';
import { prisma } from '../prismaClient';

// Connect to Redis (default localhost:6379—override with REDIS_URL env var if needed)
export const exportQueue = new Queue('exportQueue', {
  redis: { port: 6379, host: '127.0.0.1' },
});

// Define the job processor
exportQueue.process(async job => {
  const { exportId } = job.data as { exportId: string; userId: string };

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
