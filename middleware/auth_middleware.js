import jwt from "jsonwebtoken";
import supabase from "../config/supabaseClient.js";
import formatResponse from "../src/utils/responseFormatter.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        formatResponse("unauthorized", "Access token required")
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists in database
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, username, created_at")
      .eq("id", decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json(
        formatResponse("unauthorized", "Invalid token or user not found")
      );
    }

    // Add user info to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        formatResponse("unauthorized", "Invalid token")
      );
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        formatResponse("unauthorized", "Token expired")
      );
    } else {
      return res.status(500).json(
        formatResponse("error", "Authentication error")
      );
    }
  }
};

export default authMiddleware;