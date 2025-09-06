# AC_API_SERVER

AC_API_SERVER is a secure backend API server designed to manage and serve company financial data for the AC application. It features JWT-based authentication and provides protected endpoints for retrieving balance sheets, cash flow statements, P&L statements, financial links, and ratios.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- 🔐 JWT-based authentication system
- 📊 Comprehensive financial data API
- 🛡️ Protected routes with middleware
- 🚀 RESTful API design
- 📝 Comprehensive error handling
- 🎯 Public and private endpoint separation
- 🔄 CORS support for frontend integration

---

## Project Structure

```
AC_API_SERVER/
├── app.js                          # Main application file
├── package.json                    # Dependencies and scripts
├── .env.example                    # Environment variables template
├── config/
│   └── supabaseClient.js          # Supabase configuration
├── middleware/
│   ├── errorHandler.js            # Global error handling
│   └── authMiddleware.js          # JWT authentication middleware
├── src/
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   └── companyController.js   # Company data logic
│   ├── routes/
│   │   ├── authRoutes.js          # Authentication routes
│   │   └── companyRoutes.js       # Company data routes
│   └── utils/
│       ├── authUtils.js           # Authentication utilities
│       ├── responseFormatter.js   # Response formatting
│       ├── routeLists.js          # Route documentation
│       └── expressError.js        # Custom error class
└── database/
    └── users_table.sql            # Database schema
```

---

## Setup

1. **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd AC_API_SERVER
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Configure environment variables:**
    ```bash
    cp .env.example .env
    ```
    
    Update the `.env` file with your configuration:
    ```env
    PORT=5000
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_API_KEY=your_supabase_anon_key
    JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
    JWT_EXPIRES_IN=7d
    ```

4. **Set up database:**
    - Run the SQL script in `database/users_table.sql` in your Supabase SQL editor
    - Ensure your `COMPANY_FINANCIALS` table exists with the required fields

5. **Start the server:**
    ```bash
    npm start
    ```

---

## Authentication

The API uses JWT (JSON Web Token) authentication for protected routes.

### Registration
```bash
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

### Using Protected Routes
Include the JWT token in the Authorization header:
```bash
Authorization: Bearer your_jwt_token_here
```

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/profile` | Get user profile | Yes |
| PUT | `/auth/profile` | Update user profile | Yes |
| PUT | `/auth/change-password` | Change password | Yes |

### Company Data Endpoints
All endpoints are prefixed with `/server` and accept an optional `calendarYear` query parameter.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/server/company/:symbol` | Get all financials for a company | No |
| GET | `/server/company/balancesheet/:company` | Get balance sheet data | Yes |
| GET | `/server/company/cfs/:company` | Get cash flow statement | Yes |
| GET | `/server/company/pnl/:company` | Get P&L (income statement) | Yes |
| GET | `/server/company/links/:company` | Get financial document links | Yes |
| GET | `/server/company/ratios/:company` | Get financial ratios | Yes |

### Utility Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | API documentation and route list | No |
| GET | `/health` | Health check endpoint | No |

---

## Usage Examples

### Register and Login
```javascript
// Register
const registerResponse = await fetch('/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'SecurePassword123!'
  })
});

const { data: { token } } = await registerResponse.json();

// Use token for protected routes
const balanceSheetResponse = await fetch('/server/company/balancesheet/AAPL?calendarYear=2023', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Public Route (No Auth Required)
```bash
GET /server/company/AAPL
# Returns all financial data for Apple Inc.
```

### Protected Route (Auth Required)
```bash
GET /server/company/balancesheet/AAPL?calendarYear=2023
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Error Handling

The API returns consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "data": null
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate user)
- `500` - Internal Server Error

---

## Security

- Passwords are hashed using bcrypt with 12 salt rounds
- JWT tokens are signed and verified
- Input validation on all endpoints
- CORS headers configured
- Row Level Security (RLS) enabled on users table
- Environment variables for sensitive data

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## License

ISC License