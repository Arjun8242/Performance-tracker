import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/**
 * Generate JWT auth token with minimal payload
 * 
 * Why minimal payload?
 * - Reduces token size (sent with every request)
 * - Minimizes information exposure if token is compromised
 * - Follows principle of least privilege
 * - User data can be fetched from DB when needed using userId
 * 
 * @param {string} userId - The MongoDB ObjectId of the user
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  if (!userId) {
    throw new Error("Token generation failed: userId is required");
  }

  if (!config.jwt?.secret || !config.jwt?.accessExpirationMinutes) {
    throw new Error("JWT configuration is missing");
  }

  return jwt.sign(
    { userId },
    config.jwt.secret,
    {
      expiresIn: `${config.jwt.accessExpirationMinutes}m`,
      algorithm: "HS256",
    }
  );
}

/**
 * Verify JWT token and extract payload
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret, {
    algorithms: ['HS256'],
  });
};

export { generateToken, verifyToken };
