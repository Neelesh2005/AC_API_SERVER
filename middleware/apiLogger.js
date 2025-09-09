const apiLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip;
  const apiKey = req.headers['x-api-key'] ? req.headers['x-api-key'].substring(0, 8) + '...' : 'none';
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - API Key: ${apiKey}`);
  
  next();
};

export default apiLogger;
