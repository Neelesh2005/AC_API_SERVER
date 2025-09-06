import jwt from "jsonwebtoken";

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      issuer: "ac_api_server"
    }
  );
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters long`
    };
  }

  if (!hasUpperCase) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter"
    };
  }

  if (!hasLowerCase) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter"
    };
  }

  if (!hasNumbers) {
    return {
      isValid: false,
      message: "Password must contain at least one number"
    };
  }

  if (!hasSpecialChar) {
    return {
      isValid: false,
      message: "Password must contain at least one special character"
    };
  }

  return {
    isValid: true,
    message: "Password is valid"
  };
};

// Extract token from Authorization header
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

// Create response with token
export const createAuthResponse = (user, token) => {
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at
    },
    token,
    expires_in: process.env.JWT_EXPIRES_IN || "7d"
  };
};