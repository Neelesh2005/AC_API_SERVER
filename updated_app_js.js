import express from "express";
import dotenv from "dotenv";
import companyRoutes from "./src/routes/companyRoutes.js";
import authRoutes from "./src/routes/auth_routes.js";
import errorHandler from "./middleware/errorHandler.js";
import routesList from "./src/utils/routeLists.js";
import formatResponse from "./src/utils/responseFormatter.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS headers (add if needed for frontend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json(
    formatResponse("success", "Server is healthy", {
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  );
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json(
    formatResponse("success", "Welcome to AC_API_SERVER 🚀", {
      available_routes: routesList,
      documentation: "Check README.md for detailed API documentation",
      version: "1.0.0"
    })
  );
});

// Routes
app.use("/auth", authRoutes);      // Authentication routes
app.use("/server", companyRoutes); // Company data routes

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json(
    formatResponse("not_found", `Route ${req.method} ${req.originalUrl} not found`)
  );
});

// Error handling middleware (must be last)
app.use(errorHandler);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`🚀 AC_API_SERVER is running on http://localhost:${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/`);
  console.log(`🔐 Authentication endpoints: http://localhost:${port}/auth`);
  console.log(`📊 Company data endpoints: http://localhost:${port}/server`);
});