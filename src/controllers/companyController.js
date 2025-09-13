import supabase from "../../config/supabaseClient.js";
import formatResponse from "../utils/responseFormatter.js";

const validateCalendarYear = (year) => {
  if (!year) return { isValid: true, value: null };
  
  const parsed = parseInt(year);
  if (isNaN(parsed) || parsed < 2022 || parsed > 2025) {
    return {
      isValid: false,
      error: formatResponse(
        "bad_request",
        "Calendar year must be between 2021 and 2025"
      ),
    };
  }
  return { isValid: true, value: parsed };
};
function getTableFromSuffix(suffix) {
  switch (suffix.toUpperCase()) {
    case 'NS':
      return 'COMPANY_FINANCIALS';   // replace with your actual NSE table name
    case 'BO':
      return 'BSE_COMPANY_FINANCIALS';   // replace with your actual BSE table name
    default:
      return null;
  }
}
const fetchFinancials = async ({
  res,
  next,
  company,
  fields,
  statementType,
  calendarYear,
}) => {
  try {
    const yearValidation = validateCalendarYear(calendarYear);
    if (!yearValidation.isValid) {
      return res.status(400).json(yearValidation.error);
    }
    
    // FIX: The error here was using 'query' which was not defined yet.
    // Instead, we use the 'company' variable which is passed to the function.
    const [symbol, suffix] = company.split('.');
    const tableName = getTableFromSuffix(suffix);
    
    if (!tableName) {
      return res
        .status(400)
        .json(formatResponse("bad_request", "Invalid company symbol suffix."));
    }

    let queryBuilder = supabase
      .from(tableName)
      .select(fields)
      .eq("symbol", company); // Use the destructured 'symbol' variable

    if (yearValidation.value) {
      queryBuilder = queryBuilder.eq("calendarYear", yearValidation.value);
    }

    const { data, error } = await queryBuilder.order("date", { ascending: false });

    if (error) return next(error);

    if (!data || data.length === 0) {
      const yearFilter = calendarYear ? ` for year ${calendarYear}` : "";
      return res
        .status(404)
        .json(
          formatResponse(
            "not_found",
            `No ${statementType.replace("_", " ")} data found for symbol: ${company}${yearFilter}`
          )
        );
    }

    res.setHeader("Content-Type", "application/json");
    res.send(
      JSON.stringify(
        {
          status: "success",
          data: {
            symbol: company,
            statement_type: statementType,
            calendar_year: calendarYear || "all_years",
            records: data,
          },
        },
        null,
        2
      )
    );
  } catch (err) {
    next(err);
  }
};



export const getFinancialsBySymbol = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { calendarYear } = req.query;

    // FIX: The error here was also using 'query' which was not defined yet.
    // We use 'symbol' from req.params instead.
    const [company_name, suffix] = symbol.split('.');
    const tableName = getTableFromSuffix(suffix);

    if (!tableName) {
      return res
        .status(400)
        .json(formatResponse("bad_request", "Invalid company symbol suffix."));
    }

    let queryBuilder = supabase
      .from(tableName)
      .select("*")
      .eq("symbol", symbol);

    if (calendarYear) {
      queryBuilder = queryBuilder.eq("calendarYear", calendarYear);
    }

    const { data, error } = await queryBuilder;

    if (error) return next(error);

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json(formatResponse("not_found", `No financials found for symbol: ${symbol}`));
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify({
      status: "success",
      data,
    },null,2));
  } catch (err) {
    next(err);
  }
};

// ---------- Balance Sheet Controller ----------
export const getBalanceSheetBySymbol = async (req, res, next) => {
  const { company } = req.params;
  const { calendarYear } = req.query;

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
    company,
    fields: balanceSheetFields,
    statementType: "balance_sheet",
    calendarYear,
  });
};

// ---------- Cash Flow Controller ----------
export const getCashFlowBySymbol = async (req, res, next) => {
  const { company } = req.params;
  const { calendarYear } = req.query;

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
    company,
    fields: cashFlowFields,
    statementType: "cash_flow",
    calendarYear,
  });
};

// ---------- P&L Controller ----------
export const getPnLBySymbol = async (req, res, next) => {
  const { company } = req.params;
  const { calendarYear } = req.query;

  const pnlFields = `
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
    company,
    fields: pnlFields,
    statementType: "income_statement",
    calendarYear,
  });
};

export const getLinksBySymbol = async (req, res, next) => {
  const { company } = req.params;
  const { calendarYear } = req.query;

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
    company,
    fields: linksFields,
    statementType: "financial_links",
    calendarYear,
  });
};

export const getRatiosBySymbol = async (req, res, next) => {
  const { company } = req.params;
  const { calendarYear } = req.query;

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
    company,
    fields: ratiosFields,
    statementType: "financial_ratios",
    calendarYear,
  });
};