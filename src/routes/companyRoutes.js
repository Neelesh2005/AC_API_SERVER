import express from "express";
import { 
  getFinancialsBySymbol,
  getBalanceSheetBySymbol,
  getCashFlowBySymbol,
  getPnLBySymbol,
  getLinksBySymbol,
  getRatiosBySymbol
} from "../controllers/companyController.js";

// Import the new middleware
import apiKeyAuth from "../../middleware/apiKeyAuth.js";
import apiLogger from "../../middleware/apiLogger.js";


// import { apiRateLimit, strictRateLimit } from "../../middleware/rateLimiter.js";

const router = express.Router();

// Apply API key auth and rate limiting to all routes
router.use(apiKeyAuth);

router.use(apiLogger);
// Your existing routes now protected

router.get("/balancesheet/:company", getBalanceSheetBySymbol);
router.get("/cfs/:company", getCashFlowBySymbol);
router.get("/pnl/:company", getPnLBySymbol);

router.get("/links/:company", getLinksBySymbol);
router.get("/ratios/:company", getRatiosBySymbol);
router.get("/:symbol", getFinancialsBySymbol);


// Example of stricter rate limiting for sensitive endpoints
// router.get("/company/sensitive-data/:company", strictRateLimit, (req, res) => {
//   res.json({ message: "Sensitive data endpoint" });
// });

export default router;
