import supabase from "../../config/supabaseClient.js";
import formatResponse from "../utils/responseFormatter.js";
import getTickerFallback from "../utils/tickerUtils.js"; 
export const get52WeekData = async (req, res, next) => {
  try {
    const type = req.query.type && req.query.type.toLowerCase() === "low"
      ? "52_WEEK_LOW"
      : "52_WEEK_HIGH";

    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit <= 0) {
      limit = 10;
    }

    const sortOrder = type === "52_WEEK_HIGH" ? { ascending: false } : { ascending: true };

    const { data, error } = await supabase
      .from("daily52weekHL") 
      .select("category, symbol, series, company_name, new_52w_level , change_percent")
      .eq("category", type)
      .order("new_52w_level", sortOrder)
      .limit(limit);

    if (error) {
      return next(error);
    }

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json(formatResponse("not_found", `No records found for ${type}`));
    }

    res.json(
      formatResponse("success", `${type} records retrieved successfully`, { records: data })
    );
  } catch (err) {
    next(err);
  }
};


export const getGLData = async (req, res, next) => {
  try {
    const type = req.query.type && req.query.type.toLowerCase() === "gainers"
      ? "GAINER"
      : "LOSER";
    const { data, error } = await supabase
        .from("dailyGainersLoosers")
        .select("category,symbol,last_price,previous_close,change_percent,volume,avg_price")
        .eq("category", type)
        .order("change_percent", { ascending: type === "LOSER" })
        .limit(10); 
    if (error) {
      return next(error);
    }

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json(formatResponse("not_found", `No records found for ${type}`));
    }

    res.json(
      formatResponse("success", `${type} records retrieved successfully`, { records: data })
    );
  } catch (err) {
    next(err);
  }
};