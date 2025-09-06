# AC_API_SERVER

AC_API_SERVER is a backend API server designed to manage and serve company financial data for the AC application. It is built with Node.js, Express, and Supabase, and provides endpoints for retrieving balance sheets, cash flow statements, P&L statements, financial links, and ratios.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Setup](#setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Controllers Overview](#controllers-overview)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)

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
    - Copy `.env.example` to `.env` and update values as needed.

4. **Run database migrations (if applicable):**
    ```bash
    npm run migrate
    ```

5. **Start the server:**
    ```bash
    npm start
    ```

---

## Usage

- The API server runs on the port specified in `.env` (default: 5000).
- Access endpoints via `http://localhost:<PORT>/server/...`.
- The root endpoint `/` returns a welcome message and a list of available routes.

---

## API Endpoints

All endpoints are prefixed with `/server`.

| Method | Endpoint                                         | Description                                 |
|--------|--------------------------------------------------|---------------------------------------------|
| GET    | `/company/:symbol`                               | Get all financials for a company            |
| GET    | `/company/balancesheet/:company`                 | Get balance sheet data                      |
| GET    | `/company/cfs/:company`                          | Get cash flow statement                     |
| GET    | `/company/pnl/:company`                          | Get P&L (income statement)                  |
| GET    | `/company/links/:company`                        | Get financial document links                |
| GET    | `/company/ratios/:company`                       | Get financial ratios                        |

All endpoints accept an optional `calendarYear` query parameter (e.g., `?calendarYear=2023`).

---

## Controllers Overview

### getFinancialsBySymbol
- **Route:** `GET /server/company/:symbol`
- **Description:** Fetches all financial data for a given company symbol.

### getBalanceSheetBySymbol
- **Route:** `GET /server/company/balancesheet/:company?calendarYear=YYYY`
- **Description:** Fetches balance sheet data for a given company and optional year.

### getCashFlowBySymbol
- **Route:** `GET /server/company/cfs/:company?calendarYear=YYYY`
- **Description:** Fetches cash flow statement data for a given company and optional year.

### getPnLBySymbol
- **Route:** `GET /server/company/pnl/:company?calendarYear=YYYY`
- **Description:** Fetches profit and loss (income statement) data for a given company and optional year.

### getLinksBySymbol
- **Route:** `GET /server/company/links/:company?calendarYear=YYYY`
- **Description:** Fetches links to financial documents for a given company and optional year.

### getRatiosBySymbol
- **Route:** `GET /server/company/ratios/:company?calendarYear=YYYY`
- **Description:** Fetches financial ratios for a given company and optional year.

---

## Error Handling

- Returns `404` if no data is found for the requested symbol/year.
- Returns `400` if the calendar year is invalid (must be between 2022 and 2025).
- Uses a custom response formatter for consistent API responses.
- All errors are handled by the centralized `errorHandler` middleware.

---

## Example Request

```http
GET /server/company/balancesheet/AAPL?calendarYear=2023