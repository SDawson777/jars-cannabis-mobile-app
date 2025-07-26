import { onProximityAlert } from '../../tasks/locationWatcher';
import { logEvent } from '../utils/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../utils/analytics');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

test('proximity alerts log once per day', async () => {
  await onProximityAlert('1', 100);
  await onProximityAlert('1', 100);
  expect(logEvent).toHaveBeenCalledTimes(1);
});
