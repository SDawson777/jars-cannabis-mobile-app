import * as Sentry from '@sentry/react-native';

type Meta = unknown;

export const logger = {
  log: (m: string, meta?: Meta) => {
    if (meta === undefined) {
      console.log(m);
    } else {
      // Explicitly stringify metadata so tests see a deterministic message
      console.log(`${m} :: ${JSON.stringify(meta)}`);
    }
  },
  warn: (m: string, meta?: Meta) => {
    if (meta === undefined) {
      console.warn(m);
    } else {
      console.warn(`${m} :: ${JSON.stringify(meta)}`);
    }
  },
  error: (m: string, meta?: Meta, err?: unknown) => {
    const formatted = meta === undefined ? undefined : `${m} :: ${JSON.stringify(meta)}`;
    if (err) {
      try {
        Sentry.captureException(err);
        if (formatted) console.error(formatted);
        else console.error(m);
      } catch (__e) {
        // On Sentry failure we intentionally log only the message (no metadata)
        console.error(m);
      }
    } else {
      if (formatted) console.error(formatted);
      else console.error(m);
    }
  },
};

export default logger;
