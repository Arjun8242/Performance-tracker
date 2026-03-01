import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'MONGO_URI',
  'GEMINI_API_KEY',
];

// Validate required environment variables at startup
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`[Config] Missing required environment variables: ${missingVars.join(', ')}`);
  if (missingVars.some(v => v !== 'GEMINI_API_KEY')) {
    // Critical vars (DB, etc.) — halt startup
    throw new Error(`Missing critical environment variables: ${missingVars.filter(v => v !== 'GEMINI_API_KEY').join(', ')}`);
  }
  // GEMINI_API_KEY missing — warn but allow startup (AI features will be degraded)
  console.warn('[Config] GEMINI_API_KEY is missing — AI features will be unavailable');
}

const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV,
  db: {
    uri: process.env.MONGO_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    accessExpirationMinutes: parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 10) || 30,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  }
};

export default config;
