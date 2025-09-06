const routesList = [
  // Authentication routes (public)
  { method: "POST", path: "/auth/register", description: "Register new user", auth: "none" },
  { method: "POST", path: "/auth/login", description: "Login user", auth: "none" },
  { method: "GET", path: "/auth/profile", description: "Get user profile", auth: "required" },
  { method: "PUT", path: "/auth/profile", description: "Update user profile", auth: "required" },
  { method: "PUT", path: "/auth/change-password", description: "Change user password", auth: "required" },

  // Company data routes
  { method: "GET", path: "/server/company/:symbol", description: "Get all financials for company", auth: "none" },
  { method: "GET", path: "/server/company/balancesheet/:company", description: "Get balance sheet data", auth: "required" },
  { method: "GET", path: "/server/company/cfs/:company", description: "Get cash flow statement", auth: "required" },
  { method: "GET", path: "/server/company/pnl/:company", description: "Get P&L (income statement)", auth: "required" },
  { method: "GET", path: "/server/company/ratios/:company", description: "Get financial ratios", auth: "required" },
  { method: "GET", path: "/server/company/links/:company", description: "Get document links", auth: "required" },

  // Utility routes
  { method: "GET", path: "/", description: "API welcome and documentation", auth: "none" },
  { method: "GET", path: "/health", description: "Health check endpoint", auth: "none" }
];

export default routesList;