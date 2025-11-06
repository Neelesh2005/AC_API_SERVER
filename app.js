import express from "express";
import dotenv from "dotenv";
import companyRoutes from "./src/routes/companyRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import routesList from "./src/utils/routeLists.js";
import formatResponse from "./src/utils/responseFormatter.js";
import comparisonRoutes from "./src/routes/comparisonRoutes.js";
import newsRoutes from "./src/routes/newsRoutes.js";
import dailyRoutes from "./src/routes/dailyRoutes.js";
dotenv.config();

const app = express();
app.use(express.json());

// Public route (no auth required)
app.get("/", (req, res) => {
  const payload = formatResponse(
    "success",
    "Welcome to AC_API_SERVER 🚀",
    {
      available_routes: routesList,
      authentication: "API key required for /server/* routes",
      header_format: "x-api-key: YOUR_API_KEY"
    }
  );

  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload, null, 2));
});

// Health check endpoint (no auth required)
app.get("/health", (req, res) => {
  res.json(formatResponse("success", "API is healthy", { timestamp: new Date().toISOString() }));
});

// Protected routes (require API key)
app.use("/server/company", companyRoutes);  
app.use("/server/comparison", comparisonRoutes);
app.use("/server/news", newsRoutes);
app.use("/server/daily", dailyRoutes);

// Error handling
app.use(errorHandler);

const port = process.env.PORT || 5000;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 API is running on http://localhost:${port}`);
    console.log(`🔑 API key authentication enabled`);
  });
}

// Export for Vercel
export default app;