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
};

export default config;
