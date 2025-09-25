export const logger = {
  debug: (...args: any[]) => {
    if (process.env.DEBUG === 'true') {
      console.debug(...args);
    }
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
  info: (...args: any[]) => {
    console.info(...args);
  },
  warn: (...args: any[]) => {
    console.warn(...args);
  },
};
