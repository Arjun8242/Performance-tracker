import morgan from 'morgan';
import config from '../config/env.js';
import logger from '../utils/logger.js';

morgan.token('message', (req, res) => res.locals.errorMessage || '');

const getIpFormat = () => (config.env === 'production' ? ':remote-addr - ' : '');
const successResponseFormat = ':method :url :status :response-time ms - :res[content-length] - :remote-addr';
const errorResponseFormat = ':method :url :status :response-time ms - :res[content-length] - :remote-addr - :message';

const successHandler = morgan(successResponseFormat, {
    skip: (req, res) => res.statusCode >= 400,
    stream: { write: (message) => logger.info(message.trim()) },
});

const errorHandler = morgan(errorResponseFormat, {
    skip: (req, res) => res.statusCode < 400,
    stream: { write: (message) => logger.error(message.trim()) },
});

export { successHandler, errorHandler };
