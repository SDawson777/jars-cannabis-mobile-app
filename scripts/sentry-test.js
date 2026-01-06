/* eslint-disable no-console */
const Sentry = require('@sentry/node');

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const environment = process.env.EXPO_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development';
const release = process.env.EXPO_PUBLIC_SENTRY_RELEASE;

if (!dsn) {
  console.error('Missing DSN. Set EXPO_PUBLIC_SENTRY_DSN or SENTRY_DSN');
  process.exit(1);
}

Sentry.init({
  dsn,
  environment,
  ...(release ? { release } : {}),
});

async function main() {
  const err = new Error(`Nimbus Sentry test error @ ${new Date().toISOString()}`);
  const eventId = Sentry.captureException(err);
  console.log('Sent test event:', eventId);

  // Give the SDK time to send
  await Sentry.flush(5000);
  await Sentry.close(1000);
}

main().catch(async e => {
  console.error('sentry-test failed:', e);
  try {
    await Sentry.flush(2000);
  } finally {
    process.exit(1);
  }
});
