import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, '..', 'public', 'data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const SYMBOLS = [
  // Crypto
  'BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD',
  // US Equities
  'AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'AMD', 'SPY', 'QQQ',
  // Indian Equities & Indices (NSE)
  'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS', 'TATAMOTORS.NS', 'SBIN.NS', 'ITC.NS', '^NSEI', '^NSEBANK',
  // Commodities & Global Indices
  'GC=F', 'SI=F', 'CL=F', '^GSPC', '^IXIC', '^DJI',
  // Forex
  'EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'USDINR=X', 'AUDUSD=X'
];

function formatDate(date) {
  const d = new Date(date);
  const month = '' + (d.getUTCMonth() + 1);
  const day = '' + d.getUTCDate();
  const year = d.getUTCFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
}

async function fetchSymbol(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=3y`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
    throw new Error('Invalid JSON structure');
  }

  const timestamps = result.timestamp;
  const quote = result.indicators.quote[0];
  const meta = result.meta;
  const livePrice = meta?.regularMarketPrice;
  const liveHigh = meta?.regularMarketDayHigh;
  const liveLow = meta?.regularMarketDayLow;
  const liveVolume = meta?.regularMarketVolume;

  const bars = [];
  for (let i = 0; i < timestamps.length; i++) {
    let o = quote.open?.[i];
    let h = quote.high?.[i];
    let l = quote.low?.[i];
    let c = quote.close?.[i];
    let v = quote.volume?.[i] || 0;

    if (i === timestamps.length - 1 && livePrice != null) {
      if (c == null || isNaN(c)) c = livePrice;
      if (o == null || isNaN(o)) o = livePrice;
      if (h == null || isNaN(h)) h = liveHigh != null ? Math.max(liveHigh, c) : Math.max(o, c);
      if (l == null || isNaN(l)) l = liveLow != null ? Math.min(liveLow, c) : Math.min(o, c);
      if (!v && liveVolume) v = liveVolume;
    }

    if (o != null && h != null && l != null && c != null && !isNaN(c)) {
      bars.push({
        time: formatDate(timestamps[i] * 1000),
        open: Number(o.toFixed(o < 1 ? 5 : 2)),
        high: Number(h.toFixed(h < 1 ? 5 : 2)),
        low: Number(l.toFixed(l < 1 ? 5 : 2)),
        close: Number(c.toFixed(c < 1 ? 5 : 2)),
        volume: Number(v)
      });
    }
  }

  if (livePrice != null && bars.length > 0) {
    const lastBar = bars[bars.length - 1];
    lastBar.close = Number(livePrice.toFixed(livePrice < 1 ? 5 : 2));
    if (liveHigh != null && liveHigh > lastBar.high) lastBar.high = Number(liveHigh.toFixed(livePrice < 1 ? 5 : 2));
    if (liveLow != null && liveLow < lastBar.low) lastBar.low = Number(liveLow.toFixed(livePrice < 1 ? 5 : 2));
  }

  // Deduplicate
  const seen = new Set();
  const unique = [];
  for (const b of bars) {
    if (!seen.has(b.time)) {
      seen.add(b.time);
      unique.push(b);
    }
  }

  const safeFilename = encodeURIComponent(symbol) + '.json';
  fs.writeFileSync(path.join(outDir, safeFilename), JSON.stringify(unique, null, 2));
  console.log(`✓ ${symbol}: ${unique.length} bars saved (latest: ${unique[unique.length - 1]?.time} close: ${unique[unique.length - 1]?.close})`);
}

async function main() {
  console.log('Downloading real historical market data for all symbols...');
  for (const sym of SYMBOLS) {
    try {
      await fetchSymbol(sym);
      await new Promise(r => setTimeout(r, 200)); // slight pause to respect rate limits
    } catch (e) {
      console.warn(`✗ ${sym} failed: ${e.message}`);
    }
  }
  console.log('Done downloading real market data!');
}

main();
