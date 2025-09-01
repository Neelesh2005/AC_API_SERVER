import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

app.get("/company/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;

    const { data, error } = await supabase
      .from("COMPANY_FINANCIALS")
      .select("*")
      .eq("symbol", symbol);

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: "not_found",
        message: `No financial data found for symbol: ${symbol}`,
      });
    }

    // Pretty print JSON response
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ status: "success", data }, null, 2));

  } catch (err) {
    res.status(500).json({
      status: "server_error",
      message: err.message,
    });
  }
});
// app.use('/', userRoutes);
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("API is running on port " + port);
});
