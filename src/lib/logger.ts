import * as Sentry from '@sentry/react-native';

type Meta = unknown;

export const logger = {
  log: (m: string, meta?: Meta) => {
    if (meta !== undefined) console.log(m, meta);
    else console.log(m);
  },
  warn: (m: string, meta?: Meta) => {
    if (meta !== undefined) console.warn(m, meta);
    else console.warn(m);
  },
  error: (m: string, meta?: Meta, err?: unknown) => {
    if (meta !== undefined) console.error(m, meta);
    else console.error(m);
    if (err) Sentry.captureException(err);
  },
};

export default logger;
