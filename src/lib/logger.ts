import * as Sentry from '@sentry/react-native';

type Meta = Record<string, unknown>;

const fmt = (msg: string, meta?: Meta) => meta ? `${msg} :: ${JSON.stringify(meta)}` : msg;

export const logger = {
  log:   (m: string, meta?: Meta) => console.log(fmt(m, meta)),
  warn:  (m: string, meta?: Meta) => console.warn(fmt(m, meta)),
  error: (m: string, meta?: Meta, err?: unknown) => { 
    console.error(fmt(m, meta)); 
    if (err) Sentry.captureException(err); 
  },
};

export default logger;