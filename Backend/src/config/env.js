import dotenv from 'dotenv';

dotenv.config();

// Required in all environments
const baseRequiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'MONGO_URI',
  'JWT_SECRET',
];

// Additional requirements for production-only features
const isProduction = process.env.NODE_ENV === 'production';
const prodRequiredEnvVars = [
  'FRONTEND_URL',
  'GMAIL_EMAIL',
  'GMAIL_APP_PASSWORD',
];

const requiredEnvVars = isProduction
  ? [...baseRequiredEnvVars, ...prodRequiredEnvVars]
  : baseRequiredEnvVars;

// Validate required environment variables at startup
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`[Config] Missing required environment variables: ${missingVars.join(', ')}`);
  throw new Error(`Missing critical environment variables: ${missingVars.join(', ')}`);
}

// Optional but recommended
if (!process.env.GEMINI_API_KEY) {
  console.warn('[Config] GEMINI_API_KEY is missing — AI features will be unavailable');
}

// Enforce strong JWT secret
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  throw new Error('[Config] JWT_SECRET must be at least 32 characters long for security');
}

const config = {
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',
  db: {
    uri: process.env.MONGO_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpirationMinutes:
      parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 10) || 30,
  },
  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  email: {
    user: process.env.GMAIL_EMAIL,
    password: process.env.GMAIL_APP_PASSWORD,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
};

export default config;
