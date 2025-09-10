import supabase from "../../config/supabaseClient.js";
import formatResponse from "../utils/responseFormatter.js";
const metricsList = [ 'date' , 'description' , 'price_movement']

export const getNewsByTicker = async (req, res) => {
  const { ticker } = req.params;
  const { data, error } = await supabase
      .from('NEWS')
      .select(metricsList.join(','))
      .eq('ticker', ticker)
    
    if (error) {
        return res.status(500).json(formatResponse('error', 'Database query failed', { error: error.message }));
    }
    res.json(formatResponse('success', `News for ticker ${ticker}`, { news: data }));
    }
