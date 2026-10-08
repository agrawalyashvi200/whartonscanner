# Wharton Stock Scanner & Multi-Market Trading Terminal

A professional investment analysis suite combining algorithmic multi-market technical charting (TradingView Lightweight Charts) and the Wharton Portfolio Investment Model.

---

## 🚀 Features

### 1. Multi-Market Technical Terminal (`Apex Charts`)
- **Interactive Candlestick & Volume Charts**: Powered by TradingView Lightweight Charts.
- **7 Integrated Technical Indicators**:
  - **50 EMA**: Dynamic short-to-medium term trend baseline.
  - **200 EMA**: Long-term structural trend and regime filter.
  - **1-Year Rolling VWAP**: Continuous volume-weighted anchor with standard deviation valuation bands.
  - **RSI (14)**: Relative Strength Index with overbought/oversold boundaries.
  - **ADX (14)**: Average Directional Index with directional movement (+DI / -DI) and trend strength filter.
  - **MFI (14)**: Money Flow Index capturing volume-weighted momentum.
  - **MSI (20)**: Market Sentiment Index identifying institutional accumulation vs. distribution.
- **Dual-Axis Overlay**:
  - Independent dual scales (Left 0–100 oscillator scale, Right asset price scale) for clean candlestick overlay or split sub-panes.
- **Global Coverage**:
  - Global Equities (AAPL, NVDA, MSFT, GOOGL, TSLA, etc.)
  - Indian Markets (NSE / BSE: RELIANCE.NS, TCS.NS, INFY.NS, HDFCBANK.NS, etc.)
  - Cryptocurrencies (BTCUSDT, ETHUSDT, SOLUSDT, BNBUSDT)
  - Forex & Macro Commodities (EURUSD, USDINR, Gold, Crude Oil)
- **Timeframes**: 1D (Daily), 1W (Weekly), 1M (Monthly).

### 2. Wharton Investment Model & Stock Scanner
- **56-Stock Fundamental & Technical Screening**: Complete equity evaluation against strict investment criteria.
- **Automated Portfolio Model Generator**: `generate_sheets.py` generates dynamic financial spreadsheets and models (`Wharton_Investment_Model_Laura_Gao.xlsx`).
- **Interactive Reports & Documentation**:
  - `WHARTON_ALL_56_STOCKS_SCREENING_REPORT.html`
  - `LAURA_GAO_WHARTON_PORTFOLIO_DOC.html`
  - `SHORTLISTED_APPROVED_STOCKS_DOC.html`
  - `INVESTMENT_ANALYSIS_REPORT.md`

---

## 🛠️ Quick Start

### Prerequisites
- Node.js (v18+)
- Python 3.9+ (for portfolio model generation)

### Installation
```bash
# Clone the repository
git clone https://github.com/agrawalyashvi200/whartonscanner.git

# Navigate to project directory
cd whartonscanner

# Install dependencies
npm install
```

### Running the Local Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
```bash
npm run build
```
Production assets are generated in the `dist/` directory.

### Running Test Suite
```bash
node test_runner.js
```

---

## 📂 Project Structure

```
├── public/                 # Static public assets & icons
├── src/
│   ├── chartManager.js     # Lightweight Charts setup, dual-scale overlay, series management
│   ├── dataService.js      # Multi-market data fetching (Yahoo Finance, Binance API)
│   ├── indicators.js       # Mathematical computation for EMA, VWAP, RSI, ADX, MFI, MSI
│   ├── main.js             # Terminal application orchestration, state, UI listeners
│   └── style.css           # Terminal dark-mode design system
├── generate_sheets.py      # Wharton portfolio Excel generator
├── index.html              # Main terminal HTML entry point
├── test_runner.js          # Unit and integration test runner for indicators
├── vite.config.js          # Vite configuration with proxy rules
└── package.json            # Project dependencies & scripts
```

---

## 📄 License
MIT License
