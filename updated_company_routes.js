import express from "express";
import { 
  getFinancialsBySymbol,
  getBalanceSheetBySymbol,
  getCashFlowBySymbol,
  getPnLBySymbol,
  getLinksBySymbol,
  getRatiosBySymbol
} from "../controllers/companyController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// Public route - No authentication required
router.get("/company/:symbol", getFinancialsBySymbol);

// Protected routes - Authentication required
router.get("/company/balancesheet/:company", authMiddleware, getBalanceSheetBySymbol);
router.get("/company/cfs/:company", authMiddleware, getCashFlowBySymbol);
router.get("/company/pnl/:company", authMiddleware, getPnLBySymbol);
router.get("/company/links/:company", authMiddleware, getLinksBySymbol);
router.get("/company/ratios/:company", authMiddleware, getRatiosBySymbol);

export default router;