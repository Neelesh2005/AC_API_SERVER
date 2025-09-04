import express from "express";
import { 
  getFinancialsBySymbol,
  getBalanceSheetBySymbol,
  getCashFlowBySymbol,
  getPnLBySymbol,
  getLinksBySymbol,
  getRatiosBySymbol
} from "../controllers/companyController.js";

const router = express.Router();

router.get("/company/:symbol", getFinancialsBySymbol);

router.get("/company/balancesheet/:company", getBalanceSheetBySymbol);
router.get("/company/cfs/:company", getCashFlowBySymbol);
router.get("/company/pnl/:company", getPnLBySymbol);

router.get("/company/links/:company", getLinksBySymbol);
router.get("/company/ratios/:company", getRatiosBySymbol);

export default router;