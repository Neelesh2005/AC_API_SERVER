import supabase from "../../config/supabaseClient.js";
import formatResponse from "../utils/responseFormatter.js";


export const getFinancialsBySymbol = async (req, res, next) => {
  try {
    const { symbol } = req.params;

    const { data, error } = await supabase
      .from("COMPANY_FINANCIALS")
      .select("*")
      .eq("symbol", symbol);

    if (error) return next(error);

    if (!data || data.length === 0) {
      return res.status(404).json(
        formatResponse("not_found", `No financials found for symbol: ${symbol}`)
      );
    }

    res.setHeader("Content-Type", "application/json"); 
    res.send(JSON.stringify({ status: "success", data }, null, 2));
  } catch (err) {
    next(err);
  }
};
