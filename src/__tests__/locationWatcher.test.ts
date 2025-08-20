import AsyncStorage from '@react-native-async-storage/async-storage';

import { onProximityAlert } from '../../tasks/locationWatcher';
import { logEvent } from '../utils/analytics';

jest.mock('../utils/analytics');

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('proximity alerts log once per day', async () => {
  await onProximityAlert('1', 100);
  await onProximityAlert('1', 100);
  expect(logEvent).toHaveBeenCalledTimes(1);
});
