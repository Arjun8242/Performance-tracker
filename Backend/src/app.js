import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import healthRoute from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import { successHandler, errorHandler } from './middleware/logger.middleware.js';
import { errorConverter, globalErrorHandler, notFound } from './middleware/error.middleware.js';

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));



// request logging
app.use(successHandler);
app.use(errorHandler);

app.use('/api', healthRoute);
app.use('/auth', authRoutes);

// send 404 error to undefined api routes
app.use(notFound);

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(globalErrorHandler);

export default app;
