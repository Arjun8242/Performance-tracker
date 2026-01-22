import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'MONGO_URI',
];

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
};

export default config;
