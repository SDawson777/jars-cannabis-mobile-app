import app from './app';
import { logger } from './utils/logger';

const port = process.env.PORT || 8080;
app.listen(port, () => logger.debug(`🚀 Backend listening on http://localhost:${port}`));
