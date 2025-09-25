// E2E test setup
import { beforeAll, beforeEach, afterAll } from '@jest/globals';

beforeAll(async () => {
  await device.launchApp({
    permissions: { location: 'always', notifications: 'YES' },
    newInstance: true,
    launchArgs: { detoxE2E: true },
  });
});

beforeEach(async () => {
  await device.reloadReactNative();
});

afterAll(async () => {
  await device.terminateApp();
});
