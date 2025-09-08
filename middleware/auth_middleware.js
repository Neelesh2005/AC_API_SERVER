import jwt from 'jsonwebtoken';
import supabase from '../config/supabaseClient.js';
import { formatResponse } from '../src/utils/responseFormatter.js';
import { extractTokenFromHeader } from '../src/utils/auth_utils.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json(
        formatResponse('unauthorized', 'Access token required')
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json(
          formatResponse('unauthorized', 'Invalid token')
        );
      }
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json(
          formatResponse('unauthorized', 'Token expired')
        );
      }
      throw jwtError;
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, username, created_at, updated_at')
      .eq('id', decoded.userId)
      .maybeSingle();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Database error in auth middleware:', userError);
      throw userError;
    }

    if (!user) {
      return res.status(401).json(
        formatResponse('unauthorized', 'Invalid token - user not found')
      );
    }

    // Attach user to request object
    req.user = user;
    req.token = token;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json(
      formatResponse('error', 'Authentication error')
    );
  }
};

export default authMiddleware;