import * as functions from 'firebase-functions';

export const requestExport = functions.https.onRequest(async (req, res) => {
  const uid = req.query.uid as string;
  console.log('Export requested for', uid);
  res.json({ status: 'started' });
});
