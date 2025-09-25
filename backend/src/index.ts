import app from './app';
import { env } from './env';
import { logger } from './utils/logger';

const port = parseInt(env.PORT, 10);
app.listen(port, () => logger.debug(`🚀 Backend listening on http://localhost:${port}`));
