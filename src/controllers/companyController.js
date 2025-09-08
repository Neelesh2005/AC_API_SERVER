import supabase from '../../config/supabaseClient.js';
import { formatResponse, successResponse, errorResponse } from '../utils/responseFormatter.js';

/**
 * Validate calendar year parameter
 */
const validateCalendarYear = (year) => {
  if (!year) return { isValid: true, value: null };

  const parsed = parseInt(year);
  if (isNaN(parsed) || parsed < 2020 || parsed > 2025) {
    return {
      isValid: false,
      message: 'Calendar year must be between 2020 and 2025'
    };
  }
  return { isValid: true, value: parsed };
};

/**
 * Generic function to fetch financial data
 */
const fetchFinancials = async ({
  res,
  next,
  company,
  fields,
  statementType,
  calendarYear,
}) => {
  try {
    // Validate calendar year
    const yearValidation = validateCalendarYear(calendarYear);
    if (!yearValidation.isValid) {
      return res.status(400).json(
        errorResponse(yearValidation.message)
      );
    }

    // Build query
    let query = supabase
      .from('COMPANY_FINANCIALS')
      .select(fields)
      .eq('symbol', company.toUpperCase());

    // Add year filter if provided
    if (yearValidation.value) {
      query = query.eq('calendarYear', yearValidation.value);
    }

    // Execute query
    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      const yearFilter = calendarYear ? ` for year ${calendarYear}` : '';
      return res.status(404).json(
        errorResponse(`No ${statementType.replace('_', ' ')} data found for symbol: ${company}${yearFilter}`)
      );
    }

    // Send successful response
    res.status(200).json(
      successResponse(`${statementType.replace('_', ' ')} data retrieved successfully`, {
        symbol: company.toUpperCase(),
        statement_type: statementType,
        calendar_year: calendarYear || 'all_years',
        total_records: data.length,
        records: data
      })
    );

  } catch (error) {
    console.error(`Error fetching ${statementType}:`, error);
    next(error);
  }
};

/**
 * Get all financial data by symbol
 */
export const getFinancialsBySymbol = async (req, res, next) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json(
        errorResponse('Company symbol is required')
      );
    }

    const { data, error } = await supabase
      .from('COMPANY_FINANCIALS')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json(
        errorResponse(`No financial data found for symbol: ${symbol}`)
      );
    }

    res.status(200).json(
      successResponse('Financial data retrieved successfully', {
        symbol: symbol.toUpperCase(),
        total_records: data.length,
        records: data
      })
    );

  } catch (error) {
    console.error('Error fetching financials:', error);
    next(error);
  }
};

/**
 * Get balance sheet data by symbol
 */
export const getBalanceSheetBySymbol = async (req, res, next) => {
  const { symbol } = req.params;
  const { calendarYear } = req.query;

  if (!symbol) {
    return res.status(400).json(
      errorResponse('Company symbol is required')
    );
  }

  const balanceSheetFields = `
    symbol,
    date,
    calendarYear,
    period,
    cashAndCashEquivalents,
    shortTermInvestments,
    cashAndShortTermInvestments,
    netReceivables,
    inventory,
    otherCurrentAssets,
    totalCurrentAssets,
    propertyPlantEquipmentNet,
    goodwill,
    intangibleAssets,
    goodwillAndIntangibleAssets,
    longTermInvestments,
    taxAssets,
    otherNonCurrentAssets,
    totalNonCurrentAssets,
    otherAssets,
    totalAssets,
    accountPayables,
    shortTermDebt,
    taxPayables,
    deferredRevenue,
    otherCurrentLiabilities,
    totalCurrentLiabilities,
    longTermDebt,
    deferredRevenueNonCurrent,
    deferredTaxLiabilitiesNonCurrent,
    otherNonCurrentLiabilities,
    totalNonCurrentLiabilities,
    otherLiabilities,
    capitalLeaseObligations,
    totalLiabilities,
    preferredStock,
    commonStock,
    retainedEarnings,
    accumulatedOtherComprehensiveIncomeLoss,
    othertotalStockholdersEquity,
    totalStockholdersEquity,
    totalEquity,
    totalLiabilitiesAndStockholdersEquity,
    minorityInterest,
    totalLiabilitiesAndTotalEquity,
    totalInvestments,
    totalDebt,
    netDebt
  `;

  await fetchFinancials({
    res,
    next,
    company: symbol,
    fields: balanceSheetFields,
    statementType: 'balance_sheet',
    calendarYear,
  });
};

/**
 * Get cash flow statement data by symbol
 */
export const getCashFlowBySymbol = async (req, res, next) => {
  const { symbol } = req.params;
  const { calendarYear } = req.query;

  if (!symbol) {
    return res.status(400).json(
      errorResponse('Company symbol is required')
    );
  }

  const cashFlowFields = `
    symbol,
    date,
    calendarYear,
    period,
    deferredIncomeTax,
    stockBasedCompensation,
    changeInWorkingCapital,
    accountsReceivables,
    accountsPayables,
    otherWorkingCapital,
    otherNonCashItems,
    netCashProvidedByOperatingActivities,
    investmentsInPropertyPlantAndEquipment,
    acquisitionsNet,
    purchasesOfInvestments,
    salesMaturitiesOfInvestments,
    otherInvestingActivites,
    netCashUsedForInvestingActivites,
    debtRepayment,
    commonStockIssued,
    commonStockRepurchased,
    dividendsPaid,
    otherFinancingActivites,
    netCashUsedProvidedByFinancingActivities,
    effectOfForexChangesOnCash,
    netChangeInCash,
    cashAtEndOfPeriod,
    cashAtBeginningOfPeriod,
    operatingCashFlow,
    capitalExpenditure,
    freeCashFlow
  `;

  await fetchFinancials({
    res,
    next,
    company: symbol,
    fields: cashFlowFields,
    statementType: 'cash_flow',
    calendarYear,
  });
};

/**
 * Get income statement (P&L) data by symbol
 */
export const getIncomeStatementBySymbol = async (req, res, next) => {
  const { symbol } = req.params;
  const { calendarYear } = req.query;

  if (!symbol) {
    return res.status(400).json(
      errorResponse('Company symbol is required')
    );
  }

  const incomeStatementFields = `
    symbol,
    date,
    calendarYear,
    period,
    revenue,
    costOfRevenue,
    grossProfit,
    grossProfitRatio,
    researchAndDevelopmentExpenses,
    generalAndAdministrativeExpenses,
    sellingAndMarketingExpenses,
    sellingGeneralAndAdministrativeExpenses,
    otherExpenses,
    operatingExpenses,
    costAndExpenses,
    interestIncome,
    interestExpense,
    depreciationAndAmortization,
    ebitda,
    ebitdaratio,
    operatingIncome,
    operatingIncomeRatio,
    totalOtherIncomeExpensesNet,
    incomeBeforeTax,
    incomeBeforeTaxRatio,
    incomeTaxExpense,
    netIncome,
    netIncomeRatio,
    eps,
    epsdiluted,
    weightedAverageShsOut,
    weightedAverageShsOutDil
  `;

  await fetchFinancials({
    res,
    next,
    company: symbol,
    fields: incomeStatementFields,
    statementType: 'income_statement',
    calendarYear,
  });
};

/**
 * Get financial statement links by symbol
 */
export const getLinksBySymbol = async (req, res, next) => {
  const { symbol } = req.params;
  const { calendarYear } = req.query;

  if (!symbol) {
    return res.status(400).json(
      errorResponse('Company symbol is required')
    );
  }

  const linksFields = `
    symbol,
    date,
    calendarYear,
    period,
    INCOME_STATEMENT_link,
    INCOME_STATEMENT_finalLink,
    BALANCE_SHEET_link,
    BALANCE_SHEET_finalLink,
    CASH_FLOW_link,
    CASH_FLOW_finalLink
  `;

  await fetchFinancials({
    res,
    next,
    company: symbol,
    fields: linksFields,
    statementType: 'financial_links',
    calendarYear,
  });
};

/**
 * Get financial ratios by symbol
 */
export const getRatiosBySymbol = async (req, res, next) => {
  const { symbol } = req.params;
  const { calendarYear } = req.query;

  if (!symbol) {
    return res.status(400).json(
      errorResponse('Company symbol is required')
    );
  }

  const ratiosFields = `
    symbol,
    date,
    calendarYear,
    period,
    grossProfitRatio,
    ebitdaratio,
    operatingIncomeRatio,
    incomeBeforeTaxRatio,
    netIncomeRatio,
    grossProfitMargin,
    epsRatio
  `;

  await fetchFinancials({
    res,
    next,
    company: symbol,
    fields: ratiosFields,
    statementType: 'financial_ratios',
    calendarYear,
  });
};