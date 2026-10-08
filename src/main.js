/**
 * Main Application Orchestrator for Apex Charts
 */

import { ChartManager } from './chartManager.js';
import {
  calculateEMA,
  calculateRollingVWAP,
  calculateRSI,
  calculateADX,
  calculateMFI,
  calculateMSI,
  analyzeSignals
} from './indicators.js';
import {
  CURATED_SYMBOLS,
  MARKET_CATEGORIES,
  searchSymbols,
  fetchHistoricalData
} from './dataService.js';
import { ICONS } from './icons.js';

// Application State
const state = {
  currentSymbol: CURATED_SYMBOLS[0], // BTC-USD
  currentTimeframe: '1D', // Default Daily
  activeSearchCategory: MARKET_CATEGORIES.ALL,
  currentBars: [],
  currentEMA50: [],
  currentEMA200: [],
  currentVWAP: [],
  currentRSI: [],
  currentADX: { adx: [], diPlus: [], diMinus: [] },
  currentMFI: [],
  currentMSI: [],
  oscillatorMode: 'split',
  selectedSearchIndex: 0,
  searchResults: [],
  isWatchlistOpen: true
};

let chartManager = null;
let searchDebounceTimer = null;

// DOM Elements holder
const elements = {};

function initElements() {
  elements.chartContainer = document.getElementById('chart-container');
  elements.loader = document.getElementById('chart-loader');
  elements.loaderMsg = document.getElementById('loader-msg');
  elements.hudDate = document.getElementById('hud-date');
  elements.hudOpen = document.getElementById('hud-open');
  elements.hudHigh = document.getElementById('hud-high');
  elements.hudLow = document.getElementById('hud-low');
  elements.hudClose = document.getElementById('hud-close');
  elements.hudVolume = document.getElementById('hud-volume');
  elements.hudEma50 = document.getElementById('hud-ema50');
  elements.hudEma200 = document.getElementById('hud-ema200');
  elements.hudVwap = document.getElementById('hud-vwap');

  elements.hudRowOscillators = document.getElementById('hud-row-oscillators');
  elements.hudRsi = document.getElementById('hud-rsi');
  elements.hudAdx = document.getElementById('hud-adx');
  elements.hudAdxDi = document.getElementById('hud-adx-di');
  elements.hudMfi = document.getElementById('hud-mfi');
  elements.hudMsi = document.getElementById('hud-msi');
  elements.hudItemRsi = document.getElementById('hud-item-rsi');
  elements.hudItemAdx = document.getElementById('hud-item-adx');
  elements.hudItemMfi = document.getElementById('hud-item-mfi');
  elements.hudItemMsi = document.getElementById('hud-item-msi');

  elements.stripSymbol = document.getElementById('strip-symbol');
  elements.stripBadge = document.getElementById('strip-badge');
  elements.stripName = document.getElementById('strip-name');
  elements.stripPrice = document.getElementById('strip-price');
  elements.stripChange = document.getElementById('strip-change');
  elements.stripHigh = document.getElementById('strip-high');
  elements.stripLow = document.getElementById('strip-low');
  elements.stripVolume = document.getElementById('strip-volume');
  elements.stripSignal = document.getElementById('strip-signal');

  elements.searchModal = document.getElementById('search-modal');
  elements.searchTriggerBtn = document.getElementById('btn-search-trigger');
  elements.searchCloseBtn = document.getElementById('btn-close-search');
  elements.searchInput = document.getElementById('search-modal-input');
  elements.searchResultsList = document.getElementById('search-results-list');
  elements.searchCatTabs = document.getElementById('modal-category-tabs');

  elements.tfButtons = document.querySelectorAll('.tf-btn');

  elements.btnToggleEma50 = document.getElementById('btn-toggle-ema50');
  elements.btnToggleEma200 = document.getElementById('btn-toggle-ema200');
  elements.btnToggleVwap = document.getElementById('btn-toggle-vwap');
  elements.iconEma50State = document.getElementById('icon-ema50-state');
  elements.iconEma200State = document.getElementById('icon-ema200-state');
  elements.iconVwapState = document.getElementById('icon-vwap-state');

  elements.btnToggleRsi = document.getElementById('btn-toggle-rsi');
  elements.btnToggleAdx = document.getElementById('btn-toggle-adx');
  elements.btnToggleMfi = document.getElementById('btn-toggle-mfi');
  elements.btnToggleMsi = document.getElementById('btn-toggle-msi');
  elements.iconRsiState = document.getElementById('icon-rsi-state');
  elements.iconAdxState = document.getElementById('icon-adx-state');
  elements.iconMfiState = document.getElementById('icon-mfi-state');
  elements.iconMsiState = document.getElementById('icon-msi-state');

  elements.btnOscMode = document.getElementById('btn-osc-mode');
  elements.oscModeText = document.getElementById('osc-mode-text');

  elements.watchlistSidebar = document.getElementById('watchlist-sidebar');
  elements.watchlistList = document.getElementById('watchlist-list');
  elements.btnToggleWatchlist = document.getElementById('btn-toggle-watchlist');
  elements.chartTypeSelect = document.getElementById('chart-type-select');
  elements.btnFitChart = document.getElementById('btn-fit-chart');
  elements.btnScreenshot = document.getElementById('btn-screenshot');
  elements.btnIndicatorInfo = document.getElementById('btn-indicator-info');
  elements.infoModal = document.getElementById('info-modal');
  elements.btnCloseInfo = document.getElementById('btn-close-info');
  elements.toastMsg = document.getElementById('toast-msg');
}

// Formatting Utilities
function formatNumber(num, currency = '$', maxDecimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return '---';
  let prefix = '$';
  if (!currency) prefix = '';
  else if (currency === '₹' || currency === 'INR' || currency.includes('â')) prefix = '₹';
  else if (currency === '¥' || currency === 'JPY') prefix = '¥';
  else if (currency === '$' || currency === 'USD') prefix = '$';
  else prefix = currency + ' ';
  const decimals = num < 1 ? 4 : maxDecimals;
  return prefix + Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatVolume(val) {
  if (!val || isNaN(val)) return '---';
  if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
  if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
  if (val >= 1e3) return (val / 1e3).toFixed(2) + 'K';
  return val.toLocaleString();
}

function showToast(message) {
  if (!elements.toastMsg) return;
  elements.toastMsg.textContent = message;
  elements.toastMsg.classList.add('show');
  setTimeout(() => {
    elements.toastMsg.classList.remove('show');
  }, 2400);
}

/**
 * Update the Top-Left HUD (Heads-Up Display)
 */
function updateHUD(data) {
  if (!data) {
    // Revert to latest candle in currentBars
    if (state.currentBars.length === 0) return;
    const latest = state.currentBars[state.currentBars.length - 1];
    const latestEma50 = state.currentEMA50[state.currentEMA50.length - 1]?.value;
    const latestEma200 = state.currentEMA200[state.currentEMA200.length - 1]?.value;
    const latestVwap = state.currentVWAP[state.currentVWAP.length - 1]?.value;

    const latestRsi = state.currentRSI.length > 0 ? state.currentRSI[state.currentRSI.length - 1]?.value : null;
    const latestAdx = state.currentADX.adx?.length > 0 ? state.currentADX.adx[state.currentADX.adx.length - 1]?.value : null;
    const latestDiPlus = state.currentADX.diPlus?.length > 0 ? state.currentADX.diPlus[state.currentADX.diPlus.length - 1]?.value : null;
    const latestDiMinus = state.currentADX.diMinus?.length > 0 ? state.currentADX.diMinus[state.currentADX.diMinus.length - 1]?.value : null;
    const latestMfi = state.currentMFI.length > 0 ? state.currentMFI[state.currentMFI.length - 1]?.value : null;
    const latestMsi = state.currentMSI.length > 0 ? state.currentMSI[state.currentMSI.length - 1]?.value : null;

    renderHUDValues(
      latest.time,
      latest,
      latestEma50,
      latestEma200,
      latestVwap,
      latest.volume,
      latestRsi,
      latestAdx,
      latestDiPlus,
      latestDiMinus,
      latestMfi,
      latestMsi
    );
    return;
  }

  const { time, candle, ema50, ema200, vwap, volume, rsi, adx, diPlus, diMinus, mfi, msi } = data;
  renderHUDValues(time, candle, ema50, ema200, vwap, volume, rsi, adx, diPlus, diMinus, mfi, msi);
}

function renderHUDValues(time, candle, ema50, ema200, vwap, volume, rsi, adx, diPlus, diMinus, mfi, msi) {
  elements.hudDate.textContent = time ? String(time) : '---';

  if (candle) {
    const isUp = (candle.close ?? candle.value) >= (candle.open ?? candle.value);
    const cls = isUp ? 'up' : 'down';
    const curr = state.currentSymbol.currency || '$';

    if (candle.open !== undefined) {
      elements.hudOpen.textContent = formatNumber(candle.open, curr);
      elements.hudOpen.className = cls;
      elements.hudHigh.textContent = formatNumber(candle.high, curr);
      elements.hudHigh.className = cls;
      elements.hudLow.textContent = formatNumber(candle.low, curr);
      elements.hudLow.className = cls;
      elements.hudClose.textContent = formatNumber(candle.close, curr);
      elements.hudClose.className = cls;
    } else if (candle.value !== undefined) {
      elements.hudClose.textContent = formatNumber(candle.value, curr);
      elements.hudClose.className = cls;
    }
  }

  elements.hudVolume.textContent = formatVolume(volume);

  const curr = state.currentSymbol.currency || '$';
  elements.hudEma50.textContent = ema50 ? formatNumber(ema50, curr) : '---';
  elements.hudEma200.textContent = ema200 ? formatNumber(ema200, curr) : '---';
  elements.hudVwap.textContent = vwap ? formatNumber(vwap, curr) : '---';

  // Active Oscillators in HUD
  if (elements.hudItemRsi) {
    elements.hudItemRsi.style.display = chartManager?.visibility.rsi ? 'flex' : 'none';
    elements.hudRsi.textContent = (rsi !== null && rsi !== undefined) ? rsi : '---';
  }

  if (elements.hudItemAdx) {
    elements.hudItemAdx.style.display = chartManager?.visibility.adx ? 'flex' : 'none';
    elements.hudAdx.textContent = (adx !== null && adx !== undefined) ? adx : '---';
    if (diPlus !== null && diMinus !== null && diPlus !== undefined && diMinus !== undefined) {
      elements.hudAdxDi.textContent = `(+${diPlus} / -${diMinus})`;
    } else {
      elements.hudAdxDi.textContent = '';
    }
  }

  if (elements.hudItemMfi) {
    elements.hudItemMfi.style.display = chartManager?.visibility.mfi ? 'flex' : 'none';
    elements.hudMfi.textContent = (mfi !== null && mfi !== undefined) ? mfi : '---';
  }

  if (elements.hudItemMsi) {
    elements.hudItemMsi.style.display = chartManager?.visibility.msi ? 'flex' : 'none';
    elements.hudMsi.textContent = (msi !== null && msi !== undefined) ? (msi >= 50 ? `+${msi}` : `${msi}`) : '---';
  }
}

/**
 * Update the Market Info Header Strip
 */
function updateMarketStrip(bars, ema50, ema200, vwap, rsi, adxObj, mfi, msi) {
  const sym = state.currentSymbol;
  elements.stripSymbol.textContent = sym.symbol;
  elements.stripName.textContent = sym.name;
  elements.stripBadge.textContent = sym.badge || 'EQUITY';

  // Badge CSS
  elements.stripBadge.className = 'market-badge ' + (
    sym.category === MARKET_CATEGORIES.CRYPTO ? 'crypto' :
    sym.category === MARKET_CATEGORIES.INDIAN ? 'india' :
    sym.category === MARKET_CATEGORIES.FOREX ? 'forex' : 'tech'
  );

  if (!bars || bars.length === 0) return;

  const latest = bars[bars.length - 1];
  const prev = bars.length > 1 ? bars[bars.length - 2] : latest;

  const currentPrice = latest.close;
  const changeNominal = currentPrice - prev.close;
  const changePercent = (changeNominal / prev.close) * 100;
  const isBullish = changeNominal >= 0;

  const curr = sym.currency || '$';
  elements.stripPrice.textContent = formatNumber(currentPrice, curr);

  const sign = isBullish ? '+' : '';
  elements.stripChange.textContent = `${sign}${changePercent.toFixed(2)}% (${sign}${formatNumber(changeNominal, curr)})`;
  elements.stripChange.className = `change-pill ${isBullish ? 'bullish' : 'bearish'}`;

  // 24h High, Low, Volume
  elements.stripHigh.textContent = formatNumber(latest.high, curr);
  elements.stripLow.textContent = formatNumber(latest.low, curr);
  elements.stripVolume.textContent = formatVolume(latest.volume);

  // Multi-Factor Signals Analysis
  const lastEma50 = ema50.length > 0 ? ema50[ema50.length - 1].value : null;
  const lastEma200 = ema200.length > 0 ? ema200[ema200.length - 1].value : null;
  const lastVwap = vwap.length > 0 ? vwap[vwap.length - 1].value : null;
  const lastRsi = rsi.length > 0 ? rsi[rsi.length - 1].value : null;
  const lastAdx = adxObj.adx?.length > 0 ? adxObj.adx[adxObj.adx.length - 1].value : null;
  const lastDiPlus = adxObj.diPlus?.length > 0 ? adxObj.diPlus[adxObj.diPlus.length - 1].value : null;
  const lastDiMinus = adxObj.diMinus?.length > 0 ? adxObj.diMinus[adxObj.diMinus.length - 1].value : null;
  const lastMfi = mfi.length > 0 ? mfi[mfi.length - 1].value : null;
  const lastMsi = msi.length > 0 ? msi[msi.length - 1].value : null;

  const signals = analyzeSignals(
    latest,
    lastEma50,
    lastEma200,
    lastVwap,
    lastRsi,
    lastAdx,
    lastDiPlus,
    lastDiMinus,
    lastMfi,
    lastMsi
  );

  if (signals) {
    if (signals.isRsiOverbought) {
      elements.stripSignal.textContent = `⚠ RSI Overbought (${signals.rsiVal})`;
      elements.stripSignal.className = 'signal-chip bearish';
    } else if (signals.isRsiOversold) {
      elements.stripSignal.textContent = `⚡ RSI Oversold Bounce (${signals.rsiVal})`;
      elements.stripSignal.className = 'signal-chip bullish';
    } else if (signals.confluenceScore >= 4) {
      elements.stripSignal.textContent = `★ Bullish Confluence (+${signals.confluenceScore}) | ADX ${signals.adxVal}`;
      elements.stripSignal.className = 'signal-chip bullish';
    } else if (signals.confluenceScore <= -4) {
      elements.stripSignal.textContent = `▼ Bearish Confluence (${signals.confluenceScore})`;
      elements.stripSignal.className = 'signal-chip bearish';
    } else if (signals.aboveVWAP && signals.isGoldenCross) {
      elements.stripSignal.textContent = '★ Golden Cross & Above 1Y VWAP';
      elements.stripSignal.className = 'signal-chip bullish';
    } else if (signals.aboveVWAP) {
      elements.stripSignal.textContent = `● Above 1Y VWAP (+${signals.priceVsVWAPDiff}%)`;
      elements.stripSignal.className = 'signal-chip bullish';
    } else if (signals.isDeathCross) {
      elements.stripSignal.textContent = '▼ Death Cross Active';
      elements.stripSignal.className = 'signal-chip bearish';
    } else if (!signals.aboveVWAP && signals.priceVsVWAPDiff !== null) {
      elements.stripSignal.textContent = `● Below 1Y VWAP (${signals.priceVsVWAPDiff}%)`;
      elements.stripSignal.className = 'signal-chip bearish';
    } else {
      elements.stripSignal.textContent = '● Neutral Market Bias';
      elements.stripSignal.className = 'signal-chip';
    }
  }
}

/**
 * Load Market Data & Compute Indicators
 */
async function loadMarketData(symbolInfo, timeframe = state.currentTimeframe) {
  state.currentSymbol = symbolInfo;
  state.currentTimeframe = timeframe;

  // Show loader
  elements.loader.style.display = 'flex';
  elements.loaderMsg.textContent = `Fetching ${symbolInfo.symbol} (${timeframe}) & calculating EMA, VWAP, RSI, ADX, MFI, MSI...`;

  try {
    const bars = await fetchHistoricalData(symbolInfo, timeframe);
    state.currentBars = bars;

    // Calculate All Indicators
    state.currentEMA50 = calculateEMA(bars, 50);
    state.currentEMA200 = calculateEMA(bars, 200);
    state.currentVWAP = calculateRollingVWAP(bars, timeframe);
    state.currentRSI = calculateRSI(bars, 14);
    state.currentADX = calculateADX(bars, 14);
    state.currentMFI = calculateMFI(bars, 14);
    state.currentMSI = calculateMSI(bars, 14, 9);

    // Update Chart Layers and Panes
    chartManager.updateChartData({
      candles: state.currentBars,
      ema50: state.currentEMA50,
      ema200: state.currentEMA200,
      vwap: state.currentVWAP,
      rsi: state.currentRSI,
      adx: state.currentADX,
      mfi: state.currentMFI,
      msi: state.currentMSI
    });

    // Update Market Strip & Default HUD
    updateMarketStrip(
      state.currentBars,
      state.currentEMA50,
      state.currentEMA200,
      state.currentVWAP,
      state.currentRSI,
      state.currentADX,
      state.currentMFI,
      state.currentMSI
    );
    updateHUD(null);
    updateWatchlistActiveState();

  } catch (err) {
    console.error('Failed to load chart data:', err);
    showToast(`Error loading ${symbolInfo.symbol}: ${err.message}`);
  } finally {
    elements.loader.style.display = 'none';
  }
}

/**
 * Setup Watchlist Sidebar
 */
function initWatchlist() {
  elements.watchlistList.innerHTML = '';

  CURATED_SYMBOLS.slice(0, 12).forEach(item => {
    const li = document.createElement('li');
    li.className = 'watchlist-item';
    li.dataset.symbol = item.symbol;

    li.innerHTML = `
      <div class="wl-sym-col">
        <span class="wl-symbol">${item.symbol}</span>
        <span class="wl-name">${item.name}</span>
      </div>
      <div class="wl-price-col">
        <span class="wl-price">${formatNumber(item.basePrice, item.currency)}</span>
        <span class="wl-change up">${item.badge}</span>
      </div>
    `;

    li.addEventListener('click', () => {
      loadMarketData(item, state.currentTimeframe);
    });

    elements.watchlistList.appendChild(li);
  });
}

function updateWatchlistActiveState() {
  const items = elements.watchlistList.querySelectorAll('.watchlist-item');
  items.forEach(li => {
    if (li.dataset.symbol === state.currentSymbol.symbol) {
      li.classList.add('active');
    } else {
      li.classList.remove('active');
    }
  });
}

/**
 * Universal Search Modal Logic
 */
function openSearchModal() {
  elements.searchModal.classList.add('open');
  elements.searchInput.value = '';
  state.selectedSearchIndex = 0;
  performSearch('');
  setTimeout(() => elements.searchInput.focus(), 50);
}

function closeSearchModal() {
  elements.searchModal.classList.remove('open');
  elements.searchInput.blur();
}

async function performSearch(query) {
  elements.searchResultsList.innerHTML = `
    <li style="padding: 16px; text-align: center; color: #64748b; font-size: 13px;">
      Searching market symbols across global exchanges...
    </li>
  `;

  const results = await searchSymbols(query, state.activeSearchCategory);
  state.searchResults = results;
  state.selectedSearchIndex = 0;
  renderSearchResults();
}

function renderSearchResults() {
  elements.searchResultsList.innerHTML = '';

  if (state.searchResults.length === 0) {
    elements.searchResultsList.innerHTML = `
      <li style="padding: 24px; text-align: center; color: #64748b; font-size: 13px;">
        No market symbols found matching your search.
      </li>
    `;
    return;
  }

  state.searchResults.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'search-item' + (index === state.selectedSearchIndex ? ' highlighted' : '');
    li.dataset.index = index;

    const isDirect = !!item.isDirectAction;
    const badgeClass = isDirect ? 'search-sym-badge direct' : 'search-sym-badge';
    const badgeText = isDirect ? 'DIRECT' : (item.badge || 'TICKER');

    li.innerHTML = `
      <div class="search-item-left">
        <span class="${badgeClass}">${badgeText}</span>
        <div class="search-sym-info">
          <span class="search-sym-title">${item.symbol}</span>
          <span class="search-sym-name">${item.name}</span>
        </div>
      </div>
      <div class="search-item-right">
        <span class="search-exchange-tag">${item.exchange || 'Market'}</span>
        <span class="search-open-action">Open Chart ↵</span>
      </div>
    `;

    li.addEventListener('click', () => {
      selectSearchResult(index);
    });

    li.addEventListener('mouseenter', () => {
      state.selectedSearchIndex = index;
      highlightSearchItem();
    });

    elements.searchResultsList.appendChild(li);
  });
}

function highlightSearchItem() {
  const items = elements.searchResultsList.querySelectorAll('.search-item');
  items.forEach((item, idx) => {
    if (idx === state.selectedSearchIndex) {
      item.classList.add('highlighted');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('highlighted');
    }
  });
}

function selectSearchResult(index) {
  if (state.searchResults[index]) {
    const selected = state.searchResults[index];
    closeSearchModal();
    loadMarketData(selected, state.currentTimeframe);
    showToast(`Loaded ${selected.symbol} (${selected.name})`);
  }
}

/**
 * Event Listeners Initialization
 */
function setupEventListeners() {
  // Global Shortcut: Ctrl+K or '/' to open search
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearchModal();
    } else if (e.key === '/' && document.activeElement !== elements.searchInput) {
      e.preventDefault();
      openSearchModal();
    } else if (e.key === 'Escape' && elements.searchModal.classList.contains('open')) {
      closeSearchModal();
    } else if (e.key === 'Escape' && elements.infoModal.classList.contains('open')) {
      elements.infoModal.classList.remove('open');
    }
  });

  // Search Trigger & Close Buttons
  elements.searchTriggerBtn.addEventListener('click', openSearchModal);
  elements.searchCloseBtn.addEventListener('click', closeSearchModal);
  elements.searchModal.addEventListener('click', (e) => {
    if (e.target === elements.searchModal) closeSearchModal();
  });

  // Search input typing debounce
  elements.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      performSearch(e.target.value);
    }, 180);
  });

  // Search input keyboard navigation
  elements.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (state.searchResults.length > 0) {
        state.selectedSearchIndex = (state.selectedSearchIndex + 1) % state.searchResults.length;
        highlightSearchItem();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (state.searchResults.length > 0) {
        state.selectedSearchIndex = (state.selectedSearchIndex - 1 + state.searchResults.length) % state.searchResults.length;
        highlightSearchItem();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectSearchResult(state.selectedSearchIndex);
    }
  });

  // Search category tabs
  elements.searchCatTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-tab-btn');
    if (!btn) return;
    elements.searchCatTabs.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeSearchCategory = btn.dataset.cat;
    performSearch(elements.searchInput.value);
  });

  // Timeframe Switcher (Daily default, Weekly, Monthly)
  elements.tfButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tf = btn.dataset.tf;
      if (tf === state.currentTimeframe) return;

      elements.tfButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadMarketData(state.currentSymbol, tf);
      showToast(`Switched timeframe to ${tf === '1D' ? 'Daily' : tf === '1W' ? 'Weekly' : 'Monthly'}`);
    });
  });

  // Indicator Toggles
  function updateIndicatorBtnState(btn, iconContainer, isVisible, label) {
    if (isVisible) {
      btn.classList.add('active');
      iconContainer.innerHTML = ICONS.eye;
    } else {
      btn.classList.remove('active');
      iconContainer.innerHTML = ICONS.eyeOff;
    }
    showToast(`${label} ${isVisible ? 'Enabled' : 'Hidden'}`);
  }

  // Initial icons
  elements.iconEma50State.innerHTML = ICONS.eye;
  elements.iconEma200State.innerHTML = ICONS.eye;
  elements.iconVwapState.innerHTML = ICONS.eye;
  elements.iconRsiState.innerHTML = ICONS.eye;
  elements.iconAdxState.innerHTML = ICONS.eye;
  elements.iconMfiState.innerHTML = ICONS.eyeOff;
  elements.iconMsiState.innerHTML = ICONS.eyeOff;

  elements.btnToggleEma50.addEventListener('click', () => {
    const isVisible = chartManager.toggleIndicator('ema50');
    updateIndicatorBtnState(elements.btnToggleEma50, elements.iconEma50State, isVisible, '50 EMA');
  });

  elements.btnToggleEma200.addEventListener('click', () => {
    const isVisible = chartManager.toggleIndicator('ema200');
    updateIndicatorBtnState(elements.btnToggleEma200, elements.iconEma200State, isVisible, '200 EMA');
  });

  elements.btnToggleVwap.addEventListener('click', () => {
    const isVisible = chartManager.toggleIndicator('vwap');
    updateIndicatorBtnState(elements.btnToggleVwap, elements.iconVwapState, isVisible, '1Y Rolling VWAP');
  });

  // Oscillators Toggles
  elements.btnToggleRsi.addEventListener('click', () => {
    const isVisible = chartManager.toggleIndicator('rsi');
    updateIndicatorBtnState(elements.btnToggleRsi, elements.iconRsiState, isVisible, 'RSI (14)');
    updateHUD(null);
  });

  elements.btnToggleAdx.addEventListener('click', () => {
    const isVisible = chartManager.toggleIndicator('adx');
    updateIndicatorBtnState(elements.btnToggleAdx, elements.iconAdxState, isVisible, 'ADX / DMI');
    updateHUD(null);
  });

  elements.btnToggleMfi.addEventListener('click', () => {
    const isVisible = chartManager.toggleIndicator('mfi');
    updateIndicatorBtnState(elements.btnToggleMfi, elements.iconMfiState, isVisible, 'MFI (14)');
    updateHUD(null);
  });

  elements.btnToggleMsi.addEventListener('click', () => {
    const isVisible = chartManager.toggleIndicator('msi');
    updateIndicatorBtnState(elements.btnToggleMsi, elements.iconMsiState, isVisible, 'MSI (Strength)');
    updateHUD(null);
  });

  // Indicator Layout Switcher (Separate Sub-Panes below chart vs Overlay)
  if (elements.btnOscMode) {
    if (elements.oscModeText) {
      elements.oscModeText.textContent = 'Separate Panes';
    }
    elements.btnOscMode.addEventListener('click', () => {
      state.oscillatorMode = state.oscillatorMode === 'split' ? 'overlay' : 'split';
      chartManager.setOscillatorMode(state.oscillatorMode);
      elements.oscModeText.textContent = state.oscillatorMode === 'split' ? 'Separate Panes' : 'On Candles';
      showToast(state.oscillatorMode === 'split' ? 'TradingView Sub-Panes Below Chart' : 'Indicators Overlaid on Candlesticks');
    });
  }

  // Chart Type Selector
  elements.chartTypeSelect.addEventListener('change', (e) => {
    chartManager.setChartType(e.target.value);
    showToast(`Chart style changed to ${e.target.value}`);
  });

  // Fit View
  elements.btnFitChart.addEventListener('click', () => {
    chartManager.fitContent();
    showToast('Reset chart view to fit content');
  });

  // Screenshot
  elements.btnScreenshot.addEventListener('click', () => {
    const canvas = chartManager.takeScreenshot();
    if (!canvas) {
      showToast('Failed to take screenshot');
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${state.currentSymbol.symbol}_${state.currentTimeframe}_chart.png`;
    a.click();
    showToast('Chart screenshot saved to Downloads!');
  });

  // Watchlist Sidebar Toggle
  elements.btnToggleWatchlist.addEventListener('click', () => {
    state.isWatchlistOpen = !state.isWatchlistOpen;
    elements.watchlistSidebar.classList.toggle('collapsed', !state.isWatchlistOpen);
  });

  // Indicator Info Modal
  elements.btnIndicatorInfo.addEventListener('click', () => {
    elements.infoModal.classList.add('open');
  });

  elements.btnCloseInfo.addEventListener('click', () => {
    elements.infoModal.classList.remove('open');
  });

  elements.infoModal.addEventListener('click', (e) => {
    if (e.target === elements.infoModal) {
      elements.infoModal.classList.remove('open');
    }
  });
}

// Bootstrap Application
function initApp() {
  initElements();

  chartManager = new ChartManager(elements.chartContainer, (crosshairData) => {
    updateHUD(crosshairData);
  });

  initWatchlist();
  setupEventListeners();

  // Load default market (BTC-USD, Daily timeframe)
  loadMarketData(state.currentSymbol, '1D');
}

// Start on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
