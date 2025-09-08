import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 * @param {string|number} userId - User ID to encode in token
 * @param {object} additionalPayload - Additional data to include in token
 * @returns {string} JWT token
 */
export const generateToken = (userId, additionalPayload = {}) => {
  if (!userId) {
    throw new Error('User ID is required to generate token');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const payload = {
    userId,
    ...additionalPayload,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'ac-api-server'
    }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  if (!token) {
    throw new Error('Token is required');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null if invalid
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  return token.length > 0 ? token : null;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }

  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { isValid: false, message: `Password must be at least ${minLength} characters long` };
  }
  if (!hasUpperCase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!hasLowerCase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!hasNumbers) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!hasSpecialChar) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }

  return { isValid: true, message: 'Password is valid' };
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {object} Validation result
 */
export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { isValid: false, message: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters long' };
  }

  if (trimmed.length > 30) {
    return { isValid: false, message: 'Username must be no more than 30 characters long' };
  }

  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(trimmed)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  return { isValid: true, message: 'Username is valid', value: trimmed };
};

/**
 * Create response with user and token
 * @param {object} user - User object
 * @param {string} token - JWT token
 * @returns {object} Auth response object
 */
export const createAuthResponse = (user, token) => {
  if (!user || !token) {
    throw new Error('User and token are required to create auth response');
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at
    },
    token,
    expires_in: process.env.JWT_EXPIRES_IN || '7d'
  };
};

/**
 * Sanitize user input
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
};

/**
 * Validate required fields
 * @param {object} data - Data object to validate
 * @param {array} requiredFields - Array of required field names
 * @returns {object} Validation result
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missing = [];
  const invalid = [];

  for (const field of requiredFields) {
    if (!data.hasOwnProperty(field)) {
      missing.push(field);
    } else if (data[field] === null || data[field] === undefined || data[field] === '') {
      invalid.push(field);
    }
  }

  if (missing.length > 0 || invalid.length > 0) {
    const errors = [];
    if (missing.length > 0) errors.push(`Missing fields: ${missing.join(', ')}`);
    if (invalid.length > 0) errors.push(`Empty fields: ${invalid.join(', ')}`);

    return {
      isValid: false,
      message: 'Validation failed',
      errors
    };
  }

  return { isValid: true, message: 'All required fields are valid' };
};