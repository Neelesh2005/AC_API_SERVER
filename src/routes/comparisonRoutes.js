import express from "express";
import { 
  getTopStocksBySector,
  getAvailableMetrics,
  getAvailableSectors
} from "../controllers/comparisonController.js";
import apiKeyAuth from "../../middleware/apiKeyAuth.js";
import apiLogger from "../../middleware/apiLogger.js";
const router = express.Router();
router.use(apiKeyAuth);

router.use(apiLogger);
// Get available metrics for comparison
router.get("/metrics", getAvailableMetrics);

// Get all available sectors
router.get("/sectors", getAvailableSectors);

// Get top stocks in a sector by metric
router.get("/sector/:sector", getTopStocksBySector);

export default router;
