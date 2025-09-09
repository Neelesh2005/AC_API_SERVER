import formatResponse from "../src/utils/responseFormatter.js";

// List of valid keys
const CLIENT_KEY = process.env.CLIENT_API_KEY;
const ADMIN_KEY = process.env.ADMIN_API_KEY;

const apiKeyAuth = (req, res, next) => {
  const apiKey =
    req.headers["x-api-key"] ||
    req.headers["api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");

  if (!apiKey) {
    return res.status(401).json(
      formatResponse(
        "unauthorized",
        "API key is required. Please include 'x-api-key' header with your request."
      )
    );
  }

  if (apiKey === ADMIN_KEY) {
    req.apiRole = "admin";
    req.apiKeyUsed = "ADMIN";
    return next();
  }

  if (apiKey === CLIENT_KEY) {
    req.apiRole = "client";
    req.apiKeyUsed = "CLIENT";
    return next();
  }

  return res.status(403).json(
    formatResponse("forbidden", "Invalid API key. Access denied.")
  );
};

export default apiKeyAuth;
