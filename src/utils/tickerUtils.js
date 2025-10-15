const getTickerFallback = (ticker) => {
  if (!ticker || typeof ticker !== "string") {
    throw new Error("Invalid ticker provided");
  }

  const [symbol, suffix] = ticker.trim().split(".");
  const upperSuffix = suffix?.toUpperCase();

  let fallbackSuffix;

  if (upperSuffix === "NS") fallbackSuffix = "BO";
  else if (upperSuffix === "BO") fallbackSuffix = "NS";
  else fallbackSuffix = null; // unknown suffix, no fallback

  const fallbackTicker = fallbackSuffix ? `${symbol}.${fallbackSuffix}` : null;

  return {
    symbol,
    primary: ticker,
    suffix: upperSuffix,
    fallback: fallbackTicker,
  };
};

export default getTickerFallback;