import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

import { logger } from '../logger';

export const onUserPrefChange = functions.firestore
  .document('users/{uid}/prefs/{prefId}')
  .onWrite(async (change: functions.Change<admin.firestore.DocumentData>, context) => {
    const { uid, prefId } = context.params as { uid: string; prefId: string };
    logger.debug('Preference changed', uid, prefId);
    // Add your logic here
  });
