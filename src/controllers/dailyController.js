import supabase from "../../config/supabaseClient.js";
import formatResponse from "../utils/responseFormatter.js";

const clamp = (num, min, max) => Math.max(min, Math.min(num, max));

export const get52WeekData = async (req, res, next) => {
  try {
    let typeParam = (req.query.type || "").toLowerCase();
    let type;
    if (typeParam === "low") {
      type = "52_WEEK_LOW";
    } else if (typeParam === "high" || typeParam === "") {
      type = "52_WEEK_HIGH";
    } else {
      // Invalid type: default and note usage
      type = "52_WEEK_HIGH";
    }

    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit <= 0) limit = 10;
    limit = clamp(limit, 1, 100);

    const sortOrder = type === "52_WEEK_HIGH" ? { ascending: false } : { ascending: true };

    const { data, error } = await supabase
      .from("daily52weekHL")
      .select("category, symbol, series, company_name, new_52w_level, change_percent")
      .eq("category", type)
      .order("new_52w_level", sortOrder)
      .limit(limit);

    if (error) {
      return res.status(503).json(formatResponse("error", "Database failure", { error: error.message }));
    }

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json(formatResponse("not_found", `No records found for ${type}`));
    }

    res.json(formatResponse("success", `${type} records retrieved successfully`, { records: data }));
  } catch (err) {
    next(err);
  }
};

export const getGLData = async (req, res, next) => {
  try {
    let typeParam = (req.query.type || "").toLowerCase();
    let type;
    if (typeParam === "gainers") {
      type = "GAINER";
    } else if (typeParam === "losers") {
      type = "LOSER";
    } else {
      type = "GAINER";
    }

    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit <= 0) limit = 10;
    limit = clamp(limit, 1, 100);

    const { data, error } = await supabase
      .from("dailyGainersLoosers")
      .select("category,symbol,last_price,previous_close,change_percent,volume,avg_price")
      .eq("category", type)
      .order("change_percent", { ascending: type === "LOSER" })
      .limit(limit);

    if (error) {
      return res.status(503).json(formatResponse("error", "Database failure", { error: error.message }));
    }

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json(formatResponse("not_found", `No records found for ${type}`));
    }

    res.json(formatResponse("success", `${type} records retrieved successfully`, { records: data }));
  } catch (err) {
    next(err);
  }
};
