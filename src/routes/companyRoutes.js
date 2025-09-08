import express from 'express';
import { 
  getFinancialsBySymbol,
  getBalanceSheetBySymbol,
  getCashFlowBySymbol,
  getIncomeStatementBySymbol,
  getLinksBySymbol,
  getRatiosBySymbol
} from '../controllers/companyController.js';

const router = express.Router();

// IMPORTANT: More specific routes must come BEFORE general routes
// The order matters! Express matches routes in the order they are defined

// Specific financial statement routes (these must come first)
router.get('/balance-sheet/:symbol', getBalanceSheetBySymbol);
router.get('/cash-flow/:symbol', getCashFlowBySymbol);
router.get('/income-statement/:symbol', getIncomeStatementBySymbol);
router.get('/links/:symbol', getLinksBySymbol);
router.get('/ratios/:symbol', getRatiosBySymbol);

// General company route (this must come last)
router.get('/:symbol', getFinancialsBySymbol);

export default router;