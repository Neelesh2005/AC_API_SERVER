import supabase from "../../config/supabaseClient.js";
import formatResponse from "../utils/responseFormatter.js";

// Define available metrics for comparison
const VALID_METRICS = {
  // Revenue metrics
  revenue: { column: 'revenue', order: 'desc', type: 'bigint' },
  grossProfit: { column: 'grossProfit', order: 'desc', type: 'bigint' },
  netIncome: { column: 'netIncome', order: 'desc', type: 'bigint' },
  operatingIncome: { column: 'operatingIncome', order: 'desc', type: 'bigint' },
  ebitda: { column: 'ebitda', order: 'desc', type: 'text' },

  // Ratio metrics
  grossProfitRatio: { column: 'grossProfitRatio', order: 'desc', type: 'double precision' },
  netIncomeRatio: { column: 'netIncomeRatio', order: 'desc', type: 'double precision' },
  operatingIncomeRatio: { column: 'operatingIncomeRatio', order: 'desc', type: 'double precision' },
  ebitdaratio: { column: 'ebitdaratio', order: 'desc', type: 'text' },
  epsRatio: { column: 'epsRatio', order: 'desc', type: 'text' },

  // Balance sheet metrics
  totalAssets: { column: 'totalAssets', order: 'desc', type: 'bigint' },
  totalEquity: { column: 'totalEquity', order: 'desc', type: 'bigint' },
  marketCapitalization: { column: 'marketCapitalization', order: 'desc', type: 'bigint' },
  enterpriseValue: { column: 'enterpriseValue', order: 'desc', type: 'bigint' },

  // Cash flow metrics
  operatingCashFlow: { column: 'operatingCashFlow', order: 'desc', type: 'text' },
  freeCashFlow: { column: 'freeCashFlow', order: 'desc', type: 'text' },

  // Per share metrics
  eps: { column: 'eps', order: 'desc', type: 'double precision' },
  epsdiluted: { column: 'epsdiluted', order: 'desc', type: 'double precision' },
};

const DEFAULT_METRIC = 'marketCapitalization';

const validateSector = (sector) => {
  if (!sector || typeof sector !== 'string') {
    return {
      isValid: false,
      error: formatResponse("bad_request", "Sector parameter is required and must be a string"),
    };
  }
  return { isValid: true, value: sector.trim() };
};

const validateMetric = (metric) => {
  if (!metric) return { isValid: true, value: DEFAULT_METRIC };

  if (!VALID_METRICS[metric]) {
    const availableMetrics = Object.keys(VALID_METRICS).join(', ');
    return {
      isValid: false,
      error: formatResponse(
        "bad_request",
        `Invalid metric '${metric}'. Available metrics: ${availableMetrics}`
      ),
    };
  }

  return { isValid: true, value: metric };
};

const validateCalendarYear = (year) => {
  if (!year) return { isValid: true, value: null };

  const parsed = parseInt(year);
  if (isNaN(parsed) || parsed < 2020 || parsed > 2025) {
    return {
      isValid: false,
      error: formatResponse("bad_request", "Calendar year must be between 2020 and 2025"),
    };
  }
  return { isValid: true, value: parsed };
};

// ---------- 🔁 Helper for Fallback Search ----------
async function queryFinancialsTable(table, sector, selectedMetric, yearValidation, limitValue) {
  let query = supabase
    .from(table)
    .select(`
      symbol,
      sector,
      date,
      calendarYear,
      period,
      ${selectedMetric.column},
      revenue,
      netIncome,
      marketCapitalization,
      grossProfitRatio,
      netIncomeRatio,
      eps,
      totalAssets
    `)
    .eq("sector", sector)
    .not(selectedMetric.column, "is", null);

  if (yearValidation.value) {
    query = query.eq("calendarYear", yearValidation.value);
  }

  return query;
}

// ---------- Main Controller ----------
export const getTopStocksBySector = async (req, res, next) => {
  try {
    const { sector } = req.params;
    const { metric, calendarYear, limit = 10 } = req.query;

    const sectorValidation = validateSector(sector);
    if (!sectorValidation.isValid)
      return res.status(400).json(sectorValidation.error);

    const metricValidation = validateMetric(metric);
    if (!metricValidation.isValid)
      return res.status(400).json(metricValidation.error);

    const yearValidation = validateCalendarYear(calendarYear);
    if (!yearValidation.isValid)
      return res.status(400).json(yearValidation.error);

    const selectedMetric = VALID_METRICS[metricValidation.value];
    const limitValue = Math.min(parseInt(limit) || 10, 50);

    // Try primary (NSE) first
    let query = await queryFinancialsTable(
      "COMPANY_FINANCIALS",
      sectorValidation.value,
      selectedMetric,
      yearValidation,
      limitValue
    );

    const { data: nseData, error: nseError } = await query;

    if (nseError) return next(nseError);

    // If data found in NSE
    if (nseData && nseData.length > 0) {
      const processed = processMetricData(nseData, selectedMetric, limitValue);
      return res.json(formatSectorResponse(processed, sectorValidation.value, metricValidation.value, yearValidation.value, limitValue, "COMPANY_FINANCIALS"));
    }

    // Otherwise, fallback to BSE
    let fallbackQuery = await queryFinancialsTable(
      "BSE_COMPANY_FINANCIALS",
      sectorValidation.value,
      selectedMetric,
      yearValidation,
      limitValue
    );

    const { data: bseData, error: bseError } = await fallbackQuery;

    if (bseError) return next(bseError);

    if (bseData && bseData.length > 0) {
      const processed = processMetricData(bseData, selectedMetric, limitValue);
      return res.json(formatSectorResponse(processed, sectorValidation.value, metricValidation.value, yearValidation.value, limitValue, "BSE_COMPANY_FINANCIALS", true));
    }

    // If no data at all
    const yearFilter = calendarYear ? ` for year ${calendarYear}` : "";
    return res.status(404).json(
      formatResponse(
        "not_found",
        `No companies found in sector '${sector}'${yearFilter} (checked both NSE and BSE)`
      )
    );
  } catch (err) {
    next(err);
  }
};

// ---------- Helper for Sorting & Formatting ----------
function processMetricData(data, selectedMetric, limitValue) {
  if (selectedMetric.type === "text") {
    return data
      .filter((item) => {
        const val = item[selectedMetric.column];
        return val && !isNaN(parseFloat(val));
      })
      .sort((a, b) => {
        const aVal = parseFloat(a[selectedMetric.column]) || 0;
        const bVal = parseFloat(b[selectedMetric.column]) || 0;
        return selectedMetric.order === "desc" ? bVal - aVal : aVal - bVal;
      })
      .slice(0, limitValue);
  } else {
    return data.sort((a, b) => {
      const aVal = a[selectedMetric.column] || 0;
      const bVal = b[selectedMetric.column] || 0;
      return selectedMetric.order === "desc" ? bVal - aVal : aVal - bVal;
    });
  }
}

function formatSectorResponse(data, sector, metric, calendarYear, limit, table, redirected = false) {
  return {
    status: "success",
    redirected: redirected ? true : false,
    source_table: table,
    data: {
      sector,
      metric,
      calendar_year: calendarYear || "all_years",
      limit,
      total_found: data.length,
      companies: data,
    },
  };
}

// ---------- Available Metrics ----------
export const getAvailableMetrics = async (req, res) => {
  const metrics = Object.keys(VALID_METRICS).map((key) => ({
    metric: key,
    column: VALID_METRICS[key].column,
    type: VALID_METRICS[key].type,
    order: VALID_METRICS[key].order,
  }));

  res.json(
    formatResponse("success", "Available metrics for sector comparison", {
      default_metric: DEFAULT_METRIC,
      metrics: metrics,
    })
  );
};

// ---------- Available Sectors (with fallback) ----------
export const getAvailableSectors = async (req, res, next) => {
  try {
    // Try NSE first
    let { data, error } = await supabase
      .from("COMPANY_FINANCIALS")
      .select("sector")
      .not("sector", "is", null);

    if (error) return next(error);

    if (!data || data.length === 0) {
      // fallback to BSE
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("BSE_COMPANY_FINANCIALS")
        .select("sector")
        .not("sector", "is", null);

      if (fallbackError) return next(fallbackError);

      data = fallbackData || [];
    }

    const uniqueSectors = [...new Set(data.map((item) => item.sector))].sort();

    res.json(
      formatResponse("success", "Available sectors", {
        total_sectors: uniqueSectors.length,
        sectors: uniqueSectors,
      })
    );
  } catch (err) {
    next(err);
  }
};
