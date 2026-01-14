import httpStatus from 'http-status';
import config from '../config/env.js';

const healthCheck = (req, res) => {
    const uptime = process.uptime();
    res.status(httpStatus.OK).json({
        status: 'ok',
        uptime: uptime,
        environment: config.env,
    });
};

export { healthCheck };
