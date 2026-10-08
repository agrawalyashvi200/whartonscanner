/**
 * Unified Market Data Service
 * 
 * Provides live multi-market data for:
 * - US Stocks & ETFs
 * - Indian Equities & Indices (NSE / BSE)
 * - Cryptocurrencies
 * - Forex pairs
 * - Commodities & Global Indices
 * 
 * Features:
 * - Universal search (combining curated catalog + live global market search)
 * - Fetching historical daily, weekly, and monthly candlestick + volume data
 * - High-fidelity fallback generation if offline or rate-limited
 */

export const MARKET_CATEGORIES = {
  ALL: 'all',
  STOCKS: 'stocks',
  INDIAN: 'indian',
  CRYPTO: 'crypto',
  FOREX: 'forex',
  COMMODITIES: 'commodities'
};

const API_PREFIX = typeof window !== 'undefined' ? '' : 'http://localhost:5173';

export const CURATED_SYMBOLS = [
  // Crypto
  { symbol: 'BTC-USD', binanceSymbol: 'BTCUSDT', name: 'Bitcoin', category: MARKET_CATEGORIES.CRYPTO, exchange: 'Crypto', badge: 'CRYPTO', currency: '$', basePrice: 66000 },
  { symbol: 'ETH-USD', binanceSymbol: 'ETHUSDT', name: 'Ethereum', category: MARKET_CATEGORIES.CRYPTO, exchange: 'Crypto', badge: 'CRYPTO', currency: '$', basePrice: 2650 },
  { symbol: 'SOL-USD', binanceSymbol: 'SOLUSDT', name: 'Solana', category: MARKET_CATEGORIES.CRYPTO, exchange: 'Crypto', badge: 'CRYPTO', currency: '$', basePrice: 155 },
  { symbol: 'BNB-USD', binanceSymbol: 'BNBUSDT', name: 'BNB', category: MARKET_CATEGORIES.CRYPTO, exchange: 'Crypto', badge: 'CRYPTO', currency: '$', basePrice: 580 },
  { symbol: 'XRP-USD', binanceSymbol: 'XRPUSDT', name: 'XRP', category: MARKET_CATEGORIES.CRYPTO, exchange: 'Crypto', badge: 'CRYPTO', currency: '$', basePrice: 0.58 },

  // US Equities
  { symbol: 'AAPL', name: 'Apple Inc.', category: MARKET_CATEGORIES.STOCKS, exchange: 'NASDAQ', badge: 'US TECH', currency: '$', basePrice: 228 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: MARKET_CATEGORIES.STOCKS, exchange: 'NASDAQ', badge: 'US TECH', currency: '$', basePrice: 122 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', category: MARKET_CATEGORIES.STOCKS, exchange: 'NASDAQ', badge: 'US AUTO', currency: '$', basePrice: 250 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', category: MARKET_CATEGORIES.STOCKS, exchange: 'NASDAQ', badge: 'US TECH', currency: '$', basePrice: 420 },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', category: MARKET_CATEGORIES.STOCKS, exchange: 'NASDAQ', badge: 'US TECH', currency: '$', basePrice: 185 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: MARKET_CATEGORIES.STOCKS, exchange: 'NASDAQ', badge: 'US TECH', currency: '$', basePrice: 165 },
  { symbol: 'META', name: 'Meta Platforms, Inc.', category: MARKET_CATEGORIES.STOCKS, exchange: 'NASDAQ', badge: 'US TECH', currency: '$', basePrice: 590 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', category: MARKET_CATEGORIES.STOCKS, exchange: 'NASDAQ', badge: 'US CHIPS', currency: '$', basePrice: 160 },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', category: MARKET_CATEGORIES.STOCKS, exchange: 'NYSE', badge: 'ETF', currency: '$', basePrice: 572 },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', category: MARKET_CATEGORIES.STOCKS, exchange: 'NASDAQ', badge: 'ETF', currency: '$', basePrice: 486 },

  // Indian Equities & Indices (NSE)
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', category: MARKET_CATEGORIES.INDIAN, exchange: 'NSE', badge: 'INDIA', currency: 'â‚¹', basePrice: 2950 },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', category: MARKET_CATEGORIES.INDIAN, exchange: 'NSE', badge: 'INDIA', currency: 'â‚¹', basePrice: 4250 },
  { symbol: 'INFY.NS', name: 'Infosys Limited', category: MARKET_CATEGORIES.INDIAN, exchange: 'NSE', badge: 'INDIA', currency: 'â‚¹', basePrice: 1920 },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', category: MARKET_CATEGORIES.INDIAN, exchange: 'NSE', badge: 'INDIA', currency: 'â‚¹', basePrice: 1680 },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Limited', category: MARKET_CATEGORIES.INDIAN, exchange: 'NSE', badge: 'INDIA', currency: 'â‚¹', basePrice: 1240 },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Limited', category: MARKET_CATEGORIES.INDIAN, exchange: 'NSE', badge: 'INDIA', currency: 'â‚¹', basePrice: 960 },
  { symbol: 'SBIN.NS', name: 'State Bank of India', category: MARKET_CATEGORIES.INDIAN, exchange: 'NSE', badge: 'INDIA', currency: 'â‚¹', basePrice: 795 },
  { symbol: 'ITC.NS', name: 'ITC Limited', category: MARKET_CATEGORIES.INDIAN, exchange: 'NSE', badge: 'INDIA', currency: 'â‚¹', basePrice: 510 },
  { symbol: '^NSEI', name: 'NIFTY 50 Index', category: MARKET_CATEGORIES.INDIAN, exchange: 'NSE', badge: 'INDEX', currency: 'â‚¹', basePrice: 25100 },
  { symbol: '^NSEBANK', name: 'NIFTY Bank Index', category: MARKET_CATEGORIES.INDIAN, exchange: 'NSE', badge: 'INDEX', currency: 'â‚¹', basePrice: 51800 },

  // Commodities & Global Indices
  { symbol: 'GC=F', name: 'Gold Futures', category: MARKET_CATEGORIES.COMMODITIES, exchange: 'COMEX', badge: 'COMMODITY', currency: '$', basePrice: 2660 },
  { symbol: 'SI=F', name: 'Silver Futures', category: MARKET_CATEGORIES.COMMODITIES, exchange: 'COMEX', badge: 'COMMODITY', currency: '$', basePrice: 32.2 },
  { symbol: 'CL=F', name: 'Crude Oil WTI', category: MARKET_CATEGORIES.COMMODITIES, exchange: 'NYMEX', badge: 'COMMODITY', currency: '$', basePrice: 74.5 },
  { symbol: '^GSPC', name: 'S&P 500 Index', category: MARKET_CATEGORIES.COMMODITIES, exchange: 'INDEX', badge: 'INDEX', currency: '$', basePrice: 5750 },
  { symbol: '^IXIC', name: 'NASDAQ Composite', category: MARKET_CATEGORIES.COMMODITIES, exchange: 'INDEX', badge: 'INDEX', currency: '$', basePrice: 18150 },
  { symbol: '^DJI', name: 'Dow Jones Industrial Average', category: MARKET_CATEGORIES.COMMODITIES, exchange: 'INDEX', badge: 'INDEX', currency: '$', basePrice: 42300 },

  // Forex
  { symbol: 'EURUSD=X', name: 'EUR / USD', category: MARKET_CATEGORIES.FOREX, exchange: 'FX', badge: 'FOREX', currency: '', basePrice: 1.096 },
  { symbol: 'GBPUSD=X', name: 'GBP / USD', category: MARKET_CATEGORIES.FOREX, exchange: 'FX', badge: 'FOREX', currency: '', basePrice: 1.312 },
  { symbol: 'USDJPY=X', name: 'USD / JPY', category: MARKET_CATEGORIES.FOREX, exchange: 'FX', badge: 'FOREX', currency: 'Â¥', basePrice: 148.5 },
  { symbol: 'USDINR=X', name: 'USD / INR', category: MARKET_CATEGORIES.FOREX, exchange: 'FX', badge: 'FOREX', currency: 'â‚¹', basePrice: 83.95 },
  { symbol: 'AUDUSD=X', name: 'AUD / USD', category: MARKET_CATEGORIES.FOREX, exchange: 'FX', badge: 'FOREX', currency: '', basePrice: 0.68 }
];

/**
 * Format a number as date string 'YYYY-MM-DD'
 */
function formatDate(date) {
  const d = new Date(date);
  const month = '' + (d.getUTCMonth() + 1);
  const day = '' + d.getUTCDate();
  const year = d.getUTCFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
}

/**
 * Universal Search across all markets
 * Combines instant curated fuzzy matches and live Yahoo Finance search
 */
export async function searchSymbols(query, category = MARKET_CATEGORIES.ALL) {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();

  // Filter curated symbols
  let curatedMatches = CURATED_SYMBOLS.filter(item => {
    const matchesCategory = category === MARKET_CATEGORIES.ALL || item.category === category;
    if (!matchesCategory) return false;

    if (!lower) return true;
    return (
      item.symbol.toLowerCase().includes(lower) ||
      item.name.toLowerCase().includes(lower) ||
      (item.binanceSymbol && item.binanceSymbol.toLowerCase().includes(lower))
    );
  });

  if (!trimmed) {
    return curatedMatches;
  }

  // If query is present, also trigger live search via Yahoo finance API proxy
  let liveResults = [];
  try {
    const response = await fetch(`${API_PREFIX}/api/yahoo/v1/finance/search?q=${encodeURIComponent(trimmed)}&quotesCount=10&newsCount=0`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.quotes) {
        liveResults = data.quotes
          .filter(q => q.symbol && (q.shortname || q.longname))
          .map(q => {
            const sym = q.symbol;
            let cat = MARKET_CATEGORIES.STOCKS;
            let badge = 'EQUITY';

            if (q.quoteType === 'CRYPTOCURRENCY' || sym.endsWith('-USD')) {
              cat = MARKET_CATEGORIES.CRYPTO;
              badge = 'CRYPTO';
            } else if (q.quoteType === 'CURRENCY' || sym.endsWith('=X')) {
              cat = MARKET_CATEGORIES.FOREX;
              badge = 'FOREX';
            } else if (q.quoteType === 'FUTURE' || q.quoteType === 'INDEX' || sym.startsWith('^') || sym.endsWith('=F')) {
              cat = MARKET_CATEGORIES.COMMODITIES;
              badge = q.quoteType === 'FUTURE' ? 'COMMODITY' : 'INDEX';
            } else if (sym.endsWith('.NS') || sym.endsWith('.BO')) {
              cat = MARKET_CATEGORIES.INDIAN;
              badge = 'NSE/BSE';
            }

            return {
              symbol: sym,
              name: q.shortname || q.longname || sym,
              exchange: q.exchange || q.dispExchange || 'Global',
              category: cat,
              badge: badge,
              currency: q.currency ? (q.currency === 'USD' ? '$' : q.currency === 'INR' ? 'â‚¹' : q.currency) : '$',
              basePrice: 100
            };
          })
          .filter(item => category === MARKET_CATEGORIES.ALL || item.category === category);
      }
    }
  } catch (err) {
    console.warn('Live search fallback to curated:', err);
  }

  // Deduplicate and merge results (curated first, then live results)
  const seen = new Set();
  const merged = [];

  for (const item of curatedMatches) {
    if (!seen.has(item.symbol)) {
      seen.add(item.symbol);
      merged.push(item);
    }
  }

  for (const item of liveResults) {
    if (!seen.has(item.symbol)) {
      seen.add(item.symbol);
      merged.push(item);
    }
  }

  return merged;
}

/**
 * Fetch Historical Market Candlesticks
 * 
 * Supports:
 * - '1D' (Daily - default)
 * - '1W' (Weekly)
 * - '1M' (Monthly)
 * 
 * Sources:
 * 1. Binance REST API for crypto (ultra high resolution & volume)
 * 2. Yahoo Finance Chart API for equities, indices, commodities, forex
 * 3. High-fidelity synthetic generator fallback for seamless stability
 */
export async function fetchHistoricalData(symbolInfo, timeframe = '1D') {
  const symbol = typeof symbolInfo === 'string' ? symbolInfo : symbolInfo.symbol;
  const isCrypto = symbolInfo.category === MARKET_CATEGORIES.CRYPTO || symbol.includes('BTC') || symbol.includes('ETH') || symbol.endsWith('-USD');
  const binanceSymbol = symbolInfo.binanceSymbol || (isCrypto ? symbol.replace('-USD', 'USDT') : null);

  let bars = null;

  // 1. Try Binance for Crypto first (fast, generous limits, 1000 bars)
  if (binanceSymbol) {
    const binanceInterval = timeframe === '1M' ? '1M' : timeframe === '1W' ? '1w' : '1d';
    try {
      const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      const binanceUrl = isLocal ? `${API_PREFIX}/api/binance/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&limit=1000` : `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&limit=1000`;
      const bRes = await fetch(binanceUrl);
      if (bRes.ok) {
        const raw = await bRes.json();
        if (Array.isArray(raw) && raw.length > 10) {
          bars = raw.map(k => {
            const timeSec = Math.floor(k[0] / 1000);
            return {
              time: formatDate(timeSec * 1000),
              open: parseFloat(k[1]),
              high: parseFloat(k[2]),
              low: parseFloat(k[3]),
              close: parseFloat(k[4]),
              volume: parseFloat(k[5])
            };
          });
        }
      }
    } catch (e) {
      console.warn('Binance fetch failed, will try Yahoo:', e);
    }
  }

  // 2. Try Yahoo Finance Chart API
  if (!bars || bars.length === 0) {
    const yahooInterval = timeframe === '1M' ? '1mo' : timeframe === '1W' ? '1wk' : '1d';
    const yahooRange = timeframe === '1M' ? '10y' : timeframe === '1W' ? '5y' : '3y';

    try {
      const url = `${API_PREFIX}/api/yahoo/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${yahooInterval}&range=${yahooRange}`;
      const yRes = await fetch(url);
      if (yRes.ok) {
        const data = await yRes.json();
        const result = data?.chart?.result?.[0];
        if (result && result.timestamp && result.indicators?.quote?.[0]) {
          const timestamps = result.timestamp;
          const quote = result.indicators.quote[0];
          const tempBars = [];

          for (let i = 0; i < timestamps.length; i++) {
            const o = quote.open?.[i];
            const h = quote.high?.[i];
            const l = quote.low?.[i];
            const c = quote.close?.[i];
            const v = quote.volume?.[i] || 0;

            // Skip null or missing points (holidays/halts)
            if (o != null && h != null && l != null && c != null && !isNaN(c)) {
              tempBars.push({
                time: formatDate(timestamps[i] * 1000),
                open: Number(o.toFixed(o < 1 ? 5 : 2)),
                high: Number(h.toFixed(h < 1 ? 5 : 2)),
                low: Number(l.toFixed(l < 1 ? 5 : 2)),
                close: Number(c.toFixed(c < 1 ? 5 : 2)),
                volume: Number(v)
              });
            }
          }

          if (tempBars.length > 5) {
            bars = tempBars;
          }
        }
      }
    } catch (e) {
      console.warn('Yahoo Finance fetch failed, fallback will be used:', e);
    }
  }

  // 3. Fallback High-Fidelity Synthetic Generator if both APIs fail or symbol is offline
  if (!bars || bars.length === 0) {
    console.info(`Generating high-fidelity fallback data for ${symbol} (${timeframe})`);
    bars = generateSyntheticData(symbolInfo, timeframe);
  }

  // Clean and ensure unique ascending timestamps
  const uniqueBars = [];
  const seenTimes = new Set();
  for (const bar of bars) {
    if (!seenTimes.has(bar.time)) {
      seenTimes.add(bar.time);
      uniqueBars.push(bar);
    }
  }

  uniqueBars.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  return uniqueBars;
}

/**
 * Generate authentic multi-year realistic OHLCV candles
 * Uses Geometric Brownian Motion + mean reversion + momentum shocks
 */
function generateSyntheticData(symbolInfo, timeframe = '1D') {
  const basePrice = symbolInfo?.basePrice || 150;
  const barsCount = timeframe === '1M' ? 72 : timeframe === '1W' ? 260 : 750;
  const stepDays = timeframe === '1M' ? 30 : timeframe === '1W' ? 7 : 1;

  const now = new Date();
  const bars = [];
  let currentPrice = basePrice * 0.7; // Start in past slightly lower

  const volatility = symbolInfo?.category === MARKET_CATEGORIES.CRYPTO ? 0.035 : 0.015;

  for (let i = barsCount; i >= 0; i--) {
    const barDate = new Date(now.getTime() - i * stepDays * 24 * 60 * 60 * 1000);

    // Skip weekends for traditional equities/forex
    if (symbolInfo?.category !== MARKET_CATEGORIES.CRYPTO && (barDate.getUTCDay() === 0 || barDate.getUTCDay() === 6)) {
      continue;
    }

    // Drift upwards with cyclical wave
    const drift = 0.0003;
    const cycle = Math.sin(i / 30) * 0.008;
    const randomShock = (Math.random() - 0.49) * volatility;
    const changePercent = drift + cycle + randomShock;

    const open = currentPrice;
    currentPrice = Math.max(open * (1 + changePercent), 0.01);
    const close = currentPrice;

    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.8);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.8);
    const volume = Math.floor((Math.random() * 0.7 + 0.3) * (basePrice > 1000 ? 50000 : 2500000));

    bars.push({
      time: formatDate(barDate),
      open: Number(open.toFixed(open < 1 ? 5 : 2)),
      high: Number(high.toFixed(high < 1 ? 5 : 2)),
      low: Number(low.toFixed(low < 1 ? 5 : 2)),
      close: Number(close.toFixed(close < 1 ? 5 : 2)),
      volume: volume
    });
  }

  return bars;
}

