export const routesList = {
  auth: {
    base: '/api/auth',
    endpoints: {
      register: {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Register a new user',
        auth_required: false,
        body: {
          username: 'string (required)',
          email: 'string (required)',
          password: 'string (required)'
        }
      },
      login: {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Login user',
        auth_required: false,
        body: {
          email: 'string (required)',
          password: 'string (required)'
        }
      },
      profile: {
        method: 'GET',
        path: '/api/auth/profile',
        description: 'Get user profile',
        auth_required: true,
        headers: {
          Authorization: 'Bearer <token>'
        }
      },
      updateProfile: {
        method: 'PUT',
        path: '/api/auth/profile',
        description: 'Update user profile',
        auth_required: true,
        headers: {
          Authorization: 'Bearer <token>'
        },
        body: {
          username: 'string (optional)'
        }
      },
      changePassword: {
        method: 'PUT',
        path: '/api/auth/change-password',
        description: 'Change user password',
        auth_required: true,
        headers: {
          Authorization: 'Bearer <token>'
        },
        body: {
          currentPassword: 'string (required)',
          newPassword: 'string (required)'
        }
      }
    }
  },
  company: {
    base: '/api/company',
    endpoints: {
      getAllFinancials: {
        method: 'GET',
        path: '/api/company/:symbol',
        description: 'Get all financial data for a company',
        auth_required: false,
        params: {
          symbol: 'string (company symbol, e.g., AAPL)'
        }
      },
      getBalanceSheet: {
        method: 'GET',
        path: '/api/company/balance-sheet/:symbol',
        description: 'Get balance sheet data',
        auth_required: false,
        params: {
          symbol: 'string (company symbol)'
        },
        query: {
          calendarYear: 'number (optional, e.g., 2023)'
        }
      },
      getCashFlow: {
        method: 'GET',
        path: '/api/company/cash-flow/:symbol',
        description: 'Get cash flow statement data',
        auth_required: false,
        params: {
          symbol: 'string (company symbol)'
        },
        query: {
          calendarYear: 'number (optional)'
        }
      },
      getIncomeStatement: {
        method: 'GET',
        path: '/api/company/income-statement/:symbol',
        description: 'Get income statement data',
        auth_required: false,
        params: {
          symbol: 'string (company symbol)'
        },
        query: {
          calendarYear: 'number (optional)'
        }
      },
      getLinks: {
        method: 'GET',
        path: '/api/company/links/:symbol',
        description: 'Get financial statement links',
        auth_required: false,
        params: {
          symbol: 'string (company symbol)'
        },
        query: {
          calendarYear: 'number (optional)'
        }
      },
      getRatios: {
        method: 'GET',
        path: '/api/company/ratios/:symbol',
        description: 'Get financial ratios',
        auth_required: false,
        params: {
          symbol: 'string (company symbol)'
        },
        query: {
          calendarYear: 'number (optional)'
        }
      }
    }
  },
  system: {
    base: '/',
    endpoints: {
      root: {
        method: 'GET',
        path: '/',
        description: 'API welcome message and route information',
        auth_required: false
      },
      health: {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint',
        auth_required: false
      }
    }
  }
};

export default routesList;