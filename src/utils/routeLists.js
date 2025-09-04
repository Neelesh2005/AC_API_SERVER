const routesList = [

  { method: "GET", path: "/server/company//:symbol", description: "Get financials (no auth)" },
  { method: "GET", path: "/server/company/:symbol", description: "Get financials (protected)" },
  { method: "GET", path: "/server/company/balancesheet/:company", description: "Get balance sheet" },
  { method: "GET", path: "/server/company/cfs/:company", description: "Get cash flow statement" },
  { method: "GET", path: "/server/company/pnl/:company", description: "Get P&L (income statement)" },
  { method: "GET", path: "/server/company/ratios/:company", description: "Get Ratios" },
    { method: "GET", path: "/server/company/links/:company", description: "Get Links" },
];

export default routesList;
