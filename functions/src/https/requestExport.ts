import * as functions from 'firebase-functions';

import { logger } from '../logger';

export const requestExport = functions.https.onRequest(async (req, res) => {
  const uid = req.query.uid as string;
  logger.debug('Export requested for', uid);
  res.json({ status: 'started' });
});
