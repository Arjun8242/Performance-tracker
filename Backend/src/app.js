import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import config from './config/env.js';
import healthRoute from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import workoutRoutes from './routes/workout.routes.js';
import workoutLogRoutes from './routes/workoutLog.routes.js';
import progressRoutes from './routes/progress.routes.js';
import adminRoutes from './routes/admin.routes.js';
import exerciseRoutes from './routes/exercise.routes.js';
import aiRoutes from './routes/ai.routes.js';
import userRoutes from './routes/user.routes.js';
import { successHandler, errorHandler } from './middleware/logger.middleware.js';
import { errorConverter, globalErrorHandler, notFound } from './middleware/error.middleware.js';
import { generalLimiter } from './middleware/rateLimiter.middleware.js';

const app = express();

// Trust proxy (needed for secure cookies & rate limiting behind load balancers)
app.set('trust proxy', 1);

// Remove X-Powered-By header
app.disable('x-powered-by');

// Set security HTTP headers
app.use(helmet());

// Enable CORS with credentials support
const devOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const allowedOrigins = config.env === 'production'
    ? [config.cors.frontendUrl]
    : [...devOrigins, config.cors.frontendUrl];

const corsOptions = {
    origin(origin, callback) {
        // Allow non-browser tools (no Origin header) in non-production
        if (!origin && config.env !== 'production') {
            return callback(null, true);
        }

        if (origin && allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions));

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));




// parse cookies
app.use(cookieParser());

// Apply rate limiting to all routes
app.use(generalLimiter);

// request logging
app.use(successHandler);
app.use(errorHandler);

app.use('/api', healthRoute);
app.use('/auth', authRoutes);
app.use('/workouts', workoutRoutes);
app.use('/workouts', workoutLogRoutes);
app.use('/progress', progressRoutes);
app.use('/admin', adminRoutes);
app.use('/exercises', exerciseRoutes);
app.use('/ai', aiRoutes);
app.use('/users', userRoutes);

// send 404 error to undefined api routes
app.use(notFound);

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(globalErrorHandler);

export default app;
