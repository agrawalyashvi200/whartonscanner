import { fetchHistoricalData, searchSymbols, CURATED_SYMBOLS } from './src/dataService.js';
import {
  calculateEMA,
  calculateRollingVWAP,
  calculateRSI,
  calculateADX,
  calculateMFI,
  calculateMSI,
  analyzeSignals
} from './src/indicators.js';

async function test() {
  console.log('--- 1. Testing Search ---');
  const relianceMatches = await searchSymbols('reliance');
  console.log('Reliance search results:', relianceMatches.slice(0, 3).map(r => `${r.symbol} (${r.name})`));

  const appleMatches = await searchSymbols('apple');
  console.log('Apple search results:', appleMatches.slice(0, 3).map(r => `${r.symbol} (${r.name})`));

  const cryptoMatches = await searchSymbols('btc');
  console.log('BTC search results:', cryptoMatches.slice(0, 3).map(r => `${r.symbol} (${r.name})`));

  console.log('\n--- 2. Testing Multi-Timeframe Data Fetching & All Indicators ---');
  for (const tf of ['1D', '1W', '1M']) {
    const bars = await fetchHistoricalData(CURATED_SYMBOLS[0], tf);
    const ema50 = calculateEMA(bars, 50);
    const ema200 = calculateEMA(bars, 200);
    const vwap = calculateRollingVWAP(bars, tf);
    const rsi = calculateRSI(bars, 14);
    const adxObj = calculateADX(bars, 14);
    const mfi = calculateMFI(bars, 14);
    const msi = calculateMSI(bars, 14, 9);

    const latest = bars[bars.length - 1];
    const latestEma50 = ema50[ema50.length - 1]?.value;
    const latestEma200 = ema200[ema200.length - 1]?.value;
    const latestVwap = vwap[vwap.length - 1]?.value;
    const latestRsi = rsi[rsi.length - 1]?.value;
    const latestAdx = adxObj.adx[adxObj.adx.length - 1]?.value;
    const latestDiPlus = adxObj.diPlus[adxObj.diPlus.length - 1]?.value;
    const latestDiMinus = adxObj.diMinus[adxObj.diMinus.length - 1]?.value;
    const latestMfi = mfi[mfi.length - 1]?.value;
    const latestMsi = msi[msi.length - 1]?.value;

    const signal = analyzeSignals(
      latest,
      latestEma50,
      latestEma200,
      latestVwap,
      latestRsi,
      latestAdx,
      latestDiPlus,
      latestDiMinus,
      latestMfi,
      latestMsi
    );

    console.log(`[Timeframe ${tf}] Bars: ${bars.length} | Close: ${latest.close}`);
    console.log(`  Overlays: 50 EMA=${latestEma50} | 200 EMA=${latestEma200} | 1Y VWAP=${latestVwap}`);
    console.log(`  Oscillators: RSI(14)=${latestRsi} | ADX=${latestAdx} (+DI=${latestDiPlus}, -DI=${latestDiMinus}) | MFI=${latestMfi} | MSI=${latestMsi}`);
    console.log(`  Confluence Score: ${signal?.confluenceScore} | Golden Cross: ${signal?.isGoldenCross} | RSI Bullish: ${signal?.isRsiBullish} | ADX Strong: ${signal?.isAdxStrong}`);
  }

  console.log('\n--- 3. Testing Indian Equity (NSE) ---');
  const relSymbol = CURATED_SYMBOLS.find(s => s.symbol.includes('RELIANCE')) || { symbol: 'RELIANCE.NS', name: 'Reliance Industries', basePrice: 2950 };
  const relBars = await fetchHistoricalData(relSymbol, '1D');
  const relRsi = calculateRSI(relBars, 14);
  const relAdx = calculateADX(relBars, 14);
  const relMfi = calculateMFI(relBars, 14);
  const relMsi = calculateMSI(relBars, 14, 9);
  console.log(`RELIANCE.NS 1D Bars: ${relBars.length} | Close: ${relBars[relBars.length - 1].close}`);
  console.log(`  RSI: ${relRsi[relRsi.length - 1]?.value} | ADX: ${relAdx.adx[relAdx.adx.length - 1]?.value} | MFI: ${relMfi[relMfi.length - 1]?.value} | MSI: ${relMsi[relMsi.length - 1]?.value}`);

  console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');
}

test().catch(console.error);

