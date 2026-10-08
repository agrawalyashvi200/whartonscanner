/**
 * Indicator Calculation Engine for TradingView Lightweight Charts
 * 
 * Supports:
 * - 50 EMA (Exponential Moving Average)
 * - 200 EMA (Exponential Moving Average)
 * - 1-Year Rolling VWAP (Volume-Weighted Average Price over 365 calendar days / 252 sessions)
 * - RSI (Relative Strength Index, Wilder's 14-period)
 * - ADX (Average Directional Index with +DI / -DI, Wilder's 14-period)
 * - MFI (Money Flow Index, Volume-Weighted RSI 14-period)
 * - MSI (Market Strength Indicator, ATR & Volume-Weighted Momentum Oscillator)
 */

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array<{time: string|number, close: number}>} data 
 * @param {number} period 
 * @returns {Array<{time: string|number, value: number}>}
 */
export function calculateEMA(data, period = 50) {
  if (!data || data.length === 0) return [];
  if (data.length < 2) return [];

  const k = 2 / (period + 1);
  const emaData = [];

  // Compute initial SMA as starting point for smoother early convergence
  let sum = 0;
  const initialWindow = Math.min(period, data.length);
  for (let i = 0; i < initialWindow; i++) {
    sum += data[i].close;
  }
  let currentEMA = sum / initialWindow;

  for (let i = 0; i < data.length; i++) {
    const close = data[i].close;
    if (i === 0) {
      currentEMA = close;
    } else {
      currentEMA = close * k + currentEMA * (1 - k);
    }

    // Keep precision clean
    emaData.push({
      time: data[i].time,
      value: Number(currentEMA.toFixed(currentEMA < 1 ? 5 : 2))
    });
  }

  return emaData;
}

/**
 * Convert time string or timestamp into milliseconds timestamp
 * @param {string|number} time 
 * @returns {number}
 */
function parseTimeToMs(time) {
  if (typeof time === 'number') {
    return time < 1e11 ? time * 1000 : time;
  }
  if (typeof time === 'string') {
    return new Date(time).getTime();
  }
  if (time && typeof time === 'object' && time.year) {
    return new Date(Date.UTC(time.year, time.month - 1, time.day)).getTime();
  }
  return 0;
}

/**
 * Calculate 1-Year Rolling VWAP (Volume-Weighted Average Price)
 * 
 * In institutional analysis, 1-Year Rolling VWAP represents the average price weighted
 * by volume over a trailing 365-day rolling calendar window (or trailing 252 daily bars).
 * 
 * VWAP = sum(Typical_Price * Volume) / sum(Volume)
 * Typical Price = (High + Low + Close) / 3
 * 
 * @param {Array<{time: string|number, high: number, low: number, close: number, volume: number}>} data 
 * @param {string} timeframe - '1D', '1W', '1M'
 * @returns {Array<{time: string|number, value: number}>}
 */
export function calculateRollingVWAP(data, timeframe = '1D') {
  if (!data || data.length === 0) return [];

  const ONE_YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;
  const vwapData = [];

  const maxLookbackBars = timeframe === '1M' ? 12 : timeframe === '1W' ? 52 : 252;

  for (let i = 0; i < data.length; i++) {
    const currentBar = data[i];
    const currentMs = parseTimeToMs(currentBar.time);

    let cumulativeTPV = 0;
    let cumulativeVol = 0;
    let fallbackSumPrice = 0;
    let fallbackCount = 0;

    for (let j = i; j >= 0; j--) {
      const prevBar = data[j];
      const prevMs = parseTimeToMs(prevBar.time);

      const isWithinTimeWindow = currentMs && prevMs ? (currentMs - prevMs) <= ONE_YEAR_MS : true;
      const isWithinBarWindow = (i - j) < maxLookbackBars;

      if (!isWithinTimeWindow && !isWithinBarWindow) {
        break;
      }

      const high = prevBar.high ?? prevBar.close;
      const low = prevBar.low ?? prevBar.close;
      const close = prevBar.close;
      const typicalPrice = (high + low + close) / 3;
      const volume = prevBar.volume || 0;

      if (volume > 0) {
        cumulativeTPV += typicalPrice * volume;
        cumulativeVol += volume;
      }
      fallbackSumPrice += typicalPrice;
      fallbackCount++;
    }

    let vwapValue;
    if (cumulativeVol > 0) {
      vwapValue = cumulativeTPV / cumulativeVol;
    } else if (fallbackCount > 0) {
      vwapValue = fallbackSumPrice / fallbackCount;
    } else {
      vwapValue = currentBar.close;
    }

    vwapData.push({
      time: currentBar.time,
      value: Number(vwapValue.toFixed(vwapValue < 1 ? 5 : 2))
    });
  }

  return vwapData;
}

/**
 * Calculate RSI (Relative Strength Index) using Welles Wilder's Smoothing
 * 
 * Standard Period: 14
 * Overbought: >= 70, Oversold: <= 30
 * 
 * @param {Array<{time: string|number, close: number}>} data 
 * @param {number} period 
 * @returns {Array<{time: string|number, value: number}>}
 */
export function calculateRSI(data, period = 14) {
  if (!data || data.length < period + 1) return [];

  const rsiData = [];
  let gains = 0;
  let losses = 0;

  // First period simple average of gains and losses
  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - (100 / (1 + rs));

  rsiData.push({
    time: data[period].time,
    value: Number(rsi.toFixed(2))
  });

  // Subsequent periods use Wilder's exponential smoothing
  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));

    rsiData.push({
      time: data[i].time,
      value: Number(rsi.toFixed(2))
    });
  }

  return rsiData;
}

/**
 * Calculate ADX (Average Directional Index) with +DI and -DI lines
 * 
 * Standard Welles Wilder Directional Movement System:
 * - ADX measures trend strength (>= 25 indicates strong trending market)
 * - +DI measures upward directional movement
 * - -DI measures downward directional movement
 * 
 * @param {Array<{time: string|number, high: number, low: number, close: number}>} data 
 * @param {number} period 
 * @returns {{adx: Array<{time, value}>, diPlus: Array<{time, value}>, diMinus: Array<{time, value}>}}
 */
export function calculateADX(data, period = 14) {
  if (!data || data.length < period * 2) {
    return { adx: [], diPlus: [], diMinus: [] };
  }

  const n = data.length;
  const tr = new Array(n).fill(0);
  const dmPlus = new Array(n).fill(0);
  const dmMinus = new Array(n).fill(0);

  for (let i = 1; i < n; i++) {
    const cur = data[i];
    const prev = data[i - 1];
    const h = cur.high ?? cur.close;
    const l = cur.low ?? cur.close;
    const ph = prev.high ?? prev.close;
    const pl = prev.low ?? prev.close;
    const pc = prev.close;

    tr[i] = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
    const up = h - ph;
    const down = pl - l;
    dmPlus[i] = (up > down && up > 0) ? up : 0;
    dmMinus[i] = (down > up && down > 0) ? down : 0;
  }

  // Initial sum for first 14 periods (from index 1 to period)
  let trSmooth = 0;
  let dmPSmooth = 0;
  let dmMSmooth = 0;
  for (let i = 1; i <= period; i++) {
    trSmooth += tr[i];
    dmPSmooth += dmPlus[i];
    dmMSmooth += dmMinus[i];
  }

  const diPlusData = [];
  const diMinusData = [];
  const dxValues = [];

  let pDI = trSmooth > 0 ? (dmPSmooth / trSmooth) * 100 : 0;
  let mDI = trSmooth > 0 ? (dmMSmooth / trSmooth) * 100 : 0;
  let dx = (pDI + mDI) > 0 ? (Math.abs(pDI - mDI) / (pDI + mDI)) * 100 : 0;

  diPlusData.push({ time: data[period].time, value: Number(pDI.toFixed(2)) });
  diMinusData.push({ time: data[period].time, value: Number(mDI.toFixed(2)) });
  dxValues.push({ time: data[period].time, index: period, dx });

  // Wilder's smoothing for subsequent bars
  for (let i = period + 1; i < n; i++) {
    trSmooth = trSmooth - (trSmooth / period) + tr[i];
    dmPSmooth = dmPSmooth - (dmPSmooth / period) + dmPlus[i];
    dmMSmooth = dmMSmooth - (dmMSmooth / period) + dmMinus[i];

    pDI = trSmooth > 0 ? (dmPSmooth / trSmooth) * 100 : 0;
    mDI = trSmooth > 0 ? (dmMSmooth / trSmooth) * 100 : 0;
    dx = (pDI + mDI) > 0 ? (Math.abs(pDI - mDI) / (pDI + mDI)) * 100 : 0;

    diPlusData.push({ time: data[i].time, value: Number(pDI.toFixed(2)) });
    diMinusData.push({ time: data[i].time, value: Number(mDI.toFixed(2)) });
    dxValues.push({ time: data[i].time, index: i, dx });
  }

  // Calculate smoothed ADX
  // First ADX is simple average of first period DX values (from index 0 to period - 1 of dxValues)
  let dxSum = 0;
  for (let i = 0; i < period; i++) {
    dxSum += dxValues[i].dx;
  }
  let currentADX = dxSum / period;
  const adxData = [];
  const firstAdxBarIndex = dxValues[period - 1].index;
  adxData.push({
    time: data[firstAdxBarIndex].time,
    value: Number(currentADX.toFixed(2))
  });

  for (let i = period; i < dxValues.length; i++) {
    currentADX = (currentADX * (period - 1) + dxValues[i].dx) / period;
    adxData.push({
      time: data[dxValues[i].index].time,
      value: Number(currentADX.toFixed(2))
    });
  }

  return { adx: adxData, diPlus: diPlusData, diMinus: diMinusData };
}

/**
 * Calculate MFI (Money Flow Index) - Volume-Weighted Momentum Oscillator
 * 
 * Known as "Volume-Weighted RSI".
 * Overbought: >= 80, Oversold: <= 20, Centerline: 50
 * 
 * @param {Array<{time: string|number, high: number, low: number, close: number, volume: number}>} data 
 * @param {number} period 
 * @returns {Array<{time: string|number, value: number}>}
 */
export function calculateMFI(data, period = 14) {
  if (!data || data.length < period + 1) return [];

  const mfiData = [];
  const tpList = data.map(b => ((b.high ?? b.close) + (b.low ?? b.close) + b.close) / 3);
  const rmfList = data.map((b, idx) => tpList[idx] * (b.volume || 1));

  for (let i = period; i < data.length; i++) {
    let posFlow = 0;
    let negFlow = 0;

    for (let j = i - period + 1; j <= i; j++) {
      if (tpList[j] > tpList[j - 1]) {
        posFlow += rmfList[j];
      } else if (tpList[j] < tpList[j - 1]) {
        negFlow += rmfList[j];
      }
    }

    let mfi;
    if (negFlow === 0) {
      mfi = 100;
    } else {
      const mr = posFlow / negFlow;
      mfi = 100 - (100 / (1 + mr));
    }

    mfiData.push({
      time: data[i].time,
      value: Number(mfi.toFixed(2))
    });
  }

  return mfiData;
}

/**
 * Calculate MSI (Market Strength Indicator)
 * 
 * Evaluates market momentum relative to volatility (ATR) and Volume flow:
 * Normalized True Range price momentum weighted by relative trading volume,
 * smoothed with an exponential moving average.
 * 
 * Scaled 0 to 100 for unified multi-oscillator alignment:
 * - > 75: Strong Bullish Dominance
 * - > 50: Bullish Momentum Bias
 * - = 50: Equilibrium / Neutral
 * - < 50: Bearish Pressure Bias
 * - < 25: Strong Bearish Dominance
 * 
 * @param {Array<{time: string|number, high: number, low: number, close: number, volume: number}>} data 
 * @param {number} period - Momentum lookback (default 14)
 * @param {number} smooth - Smoothing EMA (default 9)
 * @returns {Array<{time: string|number, value: number, rawValue: number}>}
 */
export function calculateMSI(data, period = 14, smooth = 9) {
  if (!data || data.length < period + smooth) return [];

  const trList = [0];
  for (let i = 1; i < data.length; i++) {
    const cur = data[i];
    const prev = data[i - 1];
    const h = cur.high ?? cur.close;
    const l = cur.low ?? cur.close;
    const pc = prev.close;
    trList.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
  }

  const rawMom = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rawMom.push(0);
      continue;
    }

    let trSum = 0;
    let volSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      trSum += trList[j];
      volSum += (data[j].volume || 1);
    }
    const atr = trSum / period;
    const avgVol = volSum / period;
    const priceDiff = data[i].close - data[i - period].close;
    const baseMom = atr > 0 ? (priceDiff / atr) * 25 : 0;
    const curVol = data[i].volume || avgVol;
    const volFactor = avgVol > 0 ? Math.min(Math.max(curVol / avgVol, 0.5), 2.5) : 1;

    rawMom.push(baseMom * volFactor);
  }

  // Smooth rawMom with EMA
  const k = 2 / (smooth + 1);
  let curEma = rawMom[period];
  const msiData = [];

  for (let i = period; i < data.length; i++) {
    curEma = rawMom[i] * k + curEma * (1 - k);
    const clampedRaw = Math.min(Math.max(curEma, -50), 50);
    const normalized = 50 + clampedRaw;

    msiData.push({
      time: data[i].time,
      value: Number(normalized.toFixed(2)),
      rawValue: Number(curEma.toFixed(2))
    });
  }

  return msiData;
}

/**
 * Detect multi-factor institutional signals across Trend, Volatility, Momentum & Volume
 */
export function analyzeSignals(currentCandle, ema50Val, ema200Val, vwapVal, rsiVal, adxVal, diPlusVal, diMinusVal, mfiVal, msiVal) {
  if (!currentCandle) return null;
  const close = currentCandle.close;

  const emaTrend = (ema50Val && ema200Val)
    ? (ema50Val >= ema200Val ? 'bullish' : 'bearish')
    : null;

  const vwapBias = (vwapVal)
    ? (close >= vwapVal ? 'bullish' : 'bearish')
    : null;

  const isGoldenCross = ema50Val && ema200Val && ema50Val >= ema200Val;
  const isDeathCross = ema50Val && ema200Val && ema50Val < ema200Val;
  const aboveVWAP = vwapVal ? close >= vwapVal : null;
  const priceVsVWAPDiff = vwapVal ? Number((((close - vwapVal) / vwapVal) * 100).toFixed(2)) : null;

  // Momentum & Trend evaluations
  const isRsiOverbought = rsiVal !== null && rsiVal !== undefined && rsiVal >= 70;
  const isRsiOversold = rsiVal !== null && rsiVal !== undefined && rsiVal <= 30;
  const isRsiBullish = rsiVal !== null && rsiVal !== undefined && rsiVal > 50;

  const isAdxStrong = adxVal !== null && adxVal !== undefined && adxVal >= 25;
  const isAdxBullish = diPlusVal !== null && diMinusVal !== null && diPlusVal > diMinusVal;

  const isMfiInflow = mfiVal !== null && mfiVal !== undefined && mfiVal > 50;
  const isMfiOverbought = mfiVal !== null && mfiVal !== undefined && mfiVal >= 80;
  const isMfiOversold = mfiVal !== null && mfiVal !== undefined && mfiVal <= 20;

  const isMsiBullish = msiVal !== null && msiVal !== undefined && msiVal > 50;

  // Composite Confluence Score (-5 to +5)
  let confluenceScore = 0;
  if (isGoldenCross) confluenceScore += 1;
  else if (isDeathCross) confluenceScore -= 1;

  if (aboveVWAP) confluenceScore += 1;
  else confluenceScore -= 1;

  if (isRsiBullish) confluenceScore += 1;
  else confluenceScore -= 1;

  if (isAdxBullish) confluenceScore += (isAdxStrong ? 1.5 : 0.5);
  else confluenceScore -= (isAdxStrong ? 1.5 : 0.5);

  if (isMfiInflow) confluenceScore += 0.5;
  else confluenceScore -= 0.5;

  if (isMsiBullish) confluenceScore += 1;
  else confluenceScore -= 1;

  return {
    emaTrend,
    vwapBias,
    isGoldenCross,
    isDeathCross,
    aboveVWAP,
    priceVsVWAPDiff,
    rsiVal,
    isRsiOverbought,
    isRsiOversold,
    isRsiBullish,
    adxVal,
    isAdxStrong,
    isAdxBullish,
    mfiVal,
    isMfiInflow,
    isMfiOverbought,
    isMfiOversold,
    msiVal,
    isMsiBullish,
    confluenceScore
  };
}

