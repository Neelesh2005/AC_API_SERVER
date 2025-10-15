import supabase from "../../config/supabaseClient.js";
import formatResponse from "../utils/responseFormatter.js";
import getTickerFallback from "../utils/tickerUtils.js"; 

export const getNewsByTicker = async (req, res) => {
  try {
    const rawTicker = req.params.ticker?.trim();
    if (!rawTicker) {
      return res
        .status(400)
        .json(formatResponse("bad_request", "Ticker parameter is required"));
    }

    let fallbackInfo;
    try {
      fallbackInfo = getTickerFallback(rawTicker);
    } catch (e) {
      return res
        .status(400)
        .json(formatResponse("bad_request", "Invalid ticker format"));
    }

    
    let { data, error } = await supabase
      .from("NEWS")
      .select("UID, ticker, date, description, price_movement")
      .ilike("ticker", `%${fallbackInfo.primary}%`)
      .order("date", { ascending: false });

    if (error) {
      return res
        .status(500)
        .json(
          formatResponse("error", "Database query failed", { error: error.message })
        );
    }

   
    if (!data || data.length === 0) {
      if (fallbackInfo.fallback) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("NEWS")
          .select("UID, ticker, date, description, price_movement")
          .ilike("ticker", `%${fallbackInfo.fallback}%`)
          .order("date", { ascending: false });

        if (fallbackError) {
          return res
            .status(500)
            .json(
              formatResponse("error", "Database query failed", {
                error: fallbackError.message,
              })
            );
        }

        // Return fallback data if found
        if (fallbackData && fallbackData.length > 0) {
          return res.json(
            formatResponse("success", `News for ticker ${fallbackInfo.fallback}`, {
              redirected_from: fallbackInfo.primary,
              redirected_to: fallbackInfo.fallback,
              redirected: true,
              news: fallbackData,
            })
          );
        }
      }

      // Step 3: If no data even after fallback
      return res.status(404).json(
        formatResponse(
          "not_found",
          `No news found for ticker ${fallbackInfo.primary}` +
            (fallbackInfo.fallback
              ? ` (also checked ${fallbackInfo.fallback})`
              : "")
        )
      );
    }

    // Step 4: If data found initially
    res.json(
      formatResponse("success", `News for ticker ${fallbackInfo.primary}`, {
        redirected: false,
        news: data,
      })
    );
  } catch (err) {
    res
      .status(500)
      .json(
        formatResponse("error", "Unexpected server error", { error: err.message })
      );
  }
};
