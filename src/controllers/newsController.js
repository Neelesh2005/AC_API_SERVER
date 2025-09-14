import supabase from "../../config/supabaseClient.js";
import formatResponse from "../utils/responseFormatter.js";

export const getNewsByTicker = async (req, res) => {
  try {
    const rawTicker = req.params.ticker;
    const cleanTicker = rawTicker.trim();

  
    const { data, error } = await supabase
      .from("NEWS")
      .select("UID, ticker, date, description, price_movement")
      .ilike("ticker", `%${cleanTicker}%`)  // corrected here
      .order("date", { ascending: false });

    if (error) {
      return res
        .status(500)
        .json(formatResponse("error", "Database query failed", { error: error.message }));
    }

    res.json(formatResponse("success", `News for ticker ${cleanTicker}`, { news: data }));
  } catch (err) {
    res
      .status(500)
      .json(formatResponse("error", "Unexpected server error", { error: err.message }));
  }
};

