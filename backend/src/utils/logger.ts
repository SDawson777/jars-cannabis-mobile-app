interface LogContext { [k: string]: any }
type LogFn = (msg: string, ctx?: LogContext) => void;

function fmt(msg: string, ctx?: LogContext) {
  if (!ctx || Object.keys(ctx).length === 0) return msg;
  // Attach serialized context at end for simple parsing
  return `${msg} ${JSON.stringify(ctx)}`;
}

function baseLogger(baseCtx?: LogContext) {
  const buildCtx = (ctx?: LogContext) => ({ ...(baseCtx || {}), ...(ctx || {}) });
  const l: any = {
    debug: (msg: string, ctx?: LogContext) => {
      if (process.env.DEBUG === 'true') console.debug(fmt(msg, buildCtx(ctx)));
    },
    info: (msg: string, ctx?: LogContext) => console.info(fmt(msg, buildCtx(ctx))),
    warn: (msg: string, ctx?: LogContext) => console.warn(fmt(msg, buildCtx(ctx))),
    error: (msg: string, ctx?: LogContext) => console.error(fmt(msg, buildCtx(ctx))),
    child: (ctx: LogContext) => baseLogger(buildCtx(ctx)),
  };
  return l as { debug: LogFn; info: LogFn; warn: LogFn; error: LogFn; child: (c: LogContext) => any };
}

export const logger = baseLogger();
