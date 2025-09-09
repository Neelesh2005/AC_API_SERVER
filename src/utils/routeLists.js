const routesList = [
  {
    endpoint: "GET /",
    description: "Welcome message and API info",
    auth_required: false
  },
  {
    endpoint: "GET /health",
    description: "Health check",  
    auth_required: false
  },
  
  // Company routes
  {
    endpoint: "GET /server/company/:symbol",
    description: "Get all financial data for a symbol",
    auth_required: true,
    example: "/server/company/AAPL"
  },
  {
    endpoint: "GET /server/company/balancesheet/:company",
    description: "Get balance sheet data",
    auth_required: true,
    example: "/server/company/balancesheet/AAPL?calendarYear=2023"
  },
  {
    endpoint: "GET /server/company/cfs/:company",
    description: "Get cash flow statement data",
    auth_required: true
  },
  {
    endpoint: "GET /server/company/pnl/:company",
    description: "Get profit & loss statement data",
    auth_required: true
  },
  {
    endpoint: "GET /server/company/links/:company",
    description: "Get SEC filing links",
    auth_required: true
  },
  {
    endpoint: "GET /server/company/ratios/:company",
    description: "Get financial ratios",
    auth_required: true
  },
  
  // Comparison routes
  {
    endpoint: "GET /server/comparison/metrics",
    description: "Get available metrics for comparison",
    auth_required: true
  },
  {
    endpoint: "GET /server/comparison/sectors",
    description: "Get all available sectors",
    auth_required: true
  },
  {
    endpoint: "GET /server/comparison/sector/:sector",
    description: "Get top 10 stocks in sector by metric",
    auth_required: true,
    example: "/server/comparison/sector/Technology?metric=marketCapitalization&limit=10&calendarYear=2023"
  }
];

export default routesList;
