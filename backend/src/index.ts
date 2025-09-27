import app from './app';
import { env } from './env';
import { logger } from './utils/logger';

const port = parseInt(env.PORT, 10);
const server = app.listen(port, () => logger.debug(`🚀 Backend listening on http://localhost:${port}`));

function shutdown(signal: string) {
	logger.warn(`shutdown_initiated`, { signal });
	server.close(err => {
		if (err) {
			logger.error('shutdown_error', { error: err.message });
			process.exit(1);
		}
		logger.info('shutdown_complete');
		process.exit(0);
	});
	// hard timeout in case of hung connections
			const t = setTimeout(() => {
			logger.error('shutdown_forced');
			process.exit(1);
		}, 10_000);
			(t as any).unref?.();
}
['SIGTERM', 'SIGINT'].forEach(sig => process.on(sig as any, () => shutdown(sig)));
