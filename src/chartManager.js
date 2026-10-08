import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  CrosshairMode,
  LineStyle
} from 'lightweight-charts';

export class ChartManager {
  constructor(container, onCrosshairMove) {
    this.container = container;
    this.onCrosshairMove = onCrosshairMove;
    this.chart = null;
    this.mainSeries = null;
    this.currentChartType = 'candlestick';
    this.volumeSeries = null;
    this.ema50Series = null;
    this.ema200Series = null;
    this.vwapSeries = null;

    // Oscillator series
    this.rsiSeries = null;
    this.adxSeries = null;
    this.diPlusSeries = null;
    this.diMinusSeries = null;
    this.mfiSeries = null;
    this.msiSeries = null;

    this.cacheData = {
      candles: [],
      ema50: [],
      ema200: [],
      vwap: [],
      volume: [],
      rsi: [],
      adx: { adx: [], diPlus: [], diMinus: [] },
      mfi: [],
      msi: []
    };

    this.visibility = {
      ema50: true,
      ema200: true,
      vwap: true,
      volume: true,
      rsi: true,   // Default on in dedicated sub-pane below chart
      adx: true,   // Default on in dedicated sub-pane below chart
      mfi: false,  // Available on demand in sub-pane
      msi: false   // Available on demand in sub-pane
    };

    this.oscillatorMode = 'split'; // TradingView separate sub-panes below chart
    this.resizeObserver = null;
    this.init();
  }

  init() {
    this.chart = createChart(this.container, {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
      layout: {
        background: { color: '#090d16' },
        textColor: '#94a3b8',
        fontSize: 12,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      },
      grid: {
        vertLines: { color: '#131b2a', style: 1 },
        horzLines: { color: '#131b2a', style: 1 }
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#38bdf866',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b'
        },
        horzLine: {
          color: '#38bdf866',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b'
        }
      },
      leftPriceScale: {
        borderColor: '#1e293b',
        visible: false,
        autoScale: true
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        visible: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.22
        }
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 10,
        minBarSpacing: 3
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true
      }
    });

    // 1. Volume Series (independent overlay bottom of Pane 0)
    this.volumeSeries = this.chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      lastValueVisible: false,
      priceLineVisible: false
    });

    this.chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.82,
        bottom: 0
      }
    });

    // 2. Main Price Series (Default Candlestick in Pane 0)
    this.createMainSeries('candlestick');

    // 3. 50 EMA Series (Sky Blue)
    this.ema50Series = this.chart.addSeries(LineSeries, {
      color: '#38bdf8',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      title: '50 EMA'
    });

    // 4. 200 EMA Series (Vibrant Violet/Purple)
    this.ema200Series = this.chart.addSeries(LineSeries, {
      color: '#a855f7',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      title: '200 EMA'
    });

    // 5. 1-Year Rolling VWAP Series (Amber Gold)
    this.vwapSeries = this.chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2.5,
      priceLineVisible: false,
      lastValueVisible: true,
      title: '1Y VWAP'
    });

    // Setup Crosshair movement handler across all panes
    this.chart.subscribeCrosshairMove(param => {
      if (!this.onCrosshairMove) return;

      if (!param || !param.time || !param.seriesData) {
        this.onCrosshairMove(null);
        return;
      }

      const mainData = param.seriesData.get(this.mainSeries);
      const ema50Data = param.seriesData.get(this.ema50Series);
      const ema200Data = param.seriesData.get(this.ema200Series);
      const vwapData = param.seriesData.get(this.vwapSeries);
      const volData = param.seriesData.get(this.volumeSeries);

      const rsiData = this.rsiSeries ? param.seriesData.get(this.rsiSeries) : null;
      const adxData = this.adxSeries ? param.seriesData.get(this.adxSeries) : null;
      const diPlusData = this.diPlusSeries ? param.seriesData.get(this.diPlusSeries) : null;
      const diMinusData = this.diMinusSeries ? param.seriesData.get(this.diMinusSeries) : null;
      const mfiData = this.mfiSeries ? param.seriesData.get(this.mfiSeries) : null;
      const msiData = this.msiSeries ? param.seriesData.get(this.msiSeries) : null;

      this.onCrosshairMove({
        time: param.time,
        candle: mainData || null,
        ema50: ema50Data ? ema50Data.value : null,
        ema200: ema200Data ? ema200Data.value : null,
        vwap: vwapData ? vwapData.value : null,
        volume: volData ? volData.value : null,
        rsi: rsiData ? rsiData.value : null,
        adx: adxData ? adxData.value : null,
        diPlus: diPlusData ? diPlusData.value : null,
        diMinus: diMinusData ? diMinusData.value : null,
        mfi: mfiData ? mfiData.value : null,
        msi: msiData ? msiData.value : null
      });
    });

    // Auto-resize handler
    this.resizeObserver = new ResizeObserver(() => {
      if (this.chart && this.container) {
        this.chart.applyOptions({
          width: this.container.clientWidth,
          height: this.container.clientHeight
        });
        this.adjustPaneHeights();
      }
    });
    this.resizeObserver.observe(this.container);
  }

  createMainSeries(type) {
    if (this.mainSeries) {
      this.chart.removeSeries(this.mainSeries);
    }
    this.currentChartType = type;

    if (type === 'candlestick') {
      this.mainSeries = this.chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderUpColor: '#10b981',
        borderDownColor: '#f43f5e',
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e'
      });
    } else if (type === 'line') {
      this.mainSeries = this.chart.addSeries(LineSeries, {
        color: '#38bdf8',
        lineWidth: 2
      });
    } else if (type === 'area') {
      this.mainSeries = this.chart.addSeries(AreaSeries, {
        topColor: 'rgba(56, 189, 248, 0.4)',
        bottomColor: 'rgba(56, 189, 248, 0.0)',
        lineColor: '#38bdf8',
        lineWidth: 2
      });
    }

    if (this.cacheData.candles.length > 0) {
      this.applyMainSeriesData();
    }
  }

  applyMainSeriesData() {
    if (!this.mainSeries) return;
    if (this.currentChartType === 'candlestick') {
      this.mainSeries.setData(this.cacheData.candles);
    } else {
      const lineData = this.cacheData.candles.map(c => ({
        time: c.time,
        value: c.close
      }));
      this.mainSeries.setData(lineData);
    }
  }

  /**
   * Rebuild sub-pane oscillators dynamically
   */
  rebuildOscillators() {
    const visibleRange = this.chart.timeScale().getVisibleLogicalRange();

    // 1. Remove existing oscillator series safely
    if (this.rsiSeries) {
      this.chart.removeSeries(this.rsiSeries);
      this.rsiSeries = null;
    }
    if (this.adxSeries) {
      this.chart.removeSeries(this.adxSeries);
      this.adxSeries = null;
    }
    if (this.diPlusSeries) {
      this.chart.removeSeries(this.diPlusSeries);
      this.diPlusSeries = null;
    }
    if (this.diMinusSeries) {
      this.chart.removeSeries(this.diMinusSeries);
      this.diMinusSeries = null;
    }
    if (this.mfiSeries) {
      this.chart.removeSeries(this.mfiSeries);
      this.mfiSeries = null;
    }
    if (this.msiSeries) {
      this.chart.removeSeries(this.msiSeries);
      this.msiSeries = null;
    }

    const hasActiveOscillators = this.visibility.rsi || this.visibility.adx || this.visibility.mfi || this.visibility.msi;

    if (this.oscillatorMode === 'overlay') {
      // MODE 1: DIRECTLY ON CANDLESTICKS (Pane 0 with Left Price Scale)
      this.chart.priceScale('left').applyOptions({
        visible: hasActiveOscillators,
        borderColor: '#1e293b',
        textColor: '#94a3b8',
        autoScale: true,
        scaleMargins: {
          top: 0.2,
          bottom: 0.16
        }
      });

      if (this.visibility.rsi) {
        this.rsiSeries = this.chart.addSeries(LineSeries, {
          color: '#818cf8',
          lineWidth: 2,
          priceScaleId: 'left',
          priceLineVisible: false,
          lastValueVisible: true,
          title: 'RSI'
        }, 0);
        this.rsiSeries.setData(this.cacheData.rsi || []);
      }

      if (this.visibility.adx) {
        this.adxSeries = this.chart.addSeries(LineSeries, {
          color: '#f59e0b',
          lineWidth: 2.5,
          priceScaleId: 'left',
          priceLineVisible: false,
          lastValueVisible: true,
          title: 'ADX'
        }, 0);

        this.diPlusSeries = this.chart.addSeries(LineSeries, {
          color: '#10b981',
          lineWidth: 1.5,
          priceScaleId: 'left',
          priceLineVisible: false,
          lastValueVisible: true,
          title: '+DI'
        }, 0);

        this.diMinusSeries = this.chart.addSeries(LineSeries, {
          color: '#f43f5e',
          lineWidth: 1.5,
          priceScaleId: 'left',
          priceLineVisible: false,
          lastValueVisible: true,
          title: '-DI'
        }, 0);

        this.adxSeries.setData(this.cacheData.adx.adx || []);
        this.diPlusSeries.setData(this.cacheData.adx.diPlus || []);
        this.diMinusSeries.setData(this.cacheData.adx.diMinus || []);
      }

      if (this.visibility.mfi) {
        this.mfiSeries = this.chart.addSeries(LineSeries, {
          color: '#06b6d4',
          lineWidth: 2,
          priceScaleId: 'left',
          priceLineVisible: false,
          lastValueVisible: true,
          title: 'MFI'
        }, 0);
        this.mfiSeries.setData(this.cacheData.mfi || []);
      }

      if (this.visibility.msi) {
        this.msiSeries = this.chart.addSeries(LineSeries, {
          color: '#ec4899',
          lineWidth: 2,
          priceScaleId: 'left',
          priceLineVisible: false,
          lastValueVisible: true,
          title: 'MSI'
        }, 0);
        this.msiSeries.setData(this.cacheData.msi || []);
      }

    } else {
      // MODE 2: SEPARATE SUB-PANES
      this.chart.priceScale('left').applyOptions({ visible: false });

      if (!hasActiveOscillators) {
        if (visibleRange) this.chart.timeScale().setVisibleLogicalRange(visibleRange);
        return;
      }

      let currentPaneIndex = 1;

      // --- RSI Sub-Pane ---
      if (this.visibility.rsi) {
        const pane = currentPaneIndex++;
        this.rsiSeries = this.chart.addSeries(LineSeries, {
          color: '#818cf8',
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
          title: 'RSI (14)',
          autoscaleInfoProvider: (original) => {
            const res = original ? original() : null;
            const min = res ? Math.min(20, res.priceRange.minValue) : 20;
            const max = res ? Math.max(80, res.priceRange.maxValue) : 80;
            return {
              priceRange: {
                minValue: Math.max(0, min - 5),
                maxValue: Math.min(100, max + 5)
              }
            };
          }
        }, pane);

        this.rsiSeries.createPriceLine({
          price: 70,
          color: 'rgba(244, 63, 94, 0.75)',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: '70 OB'
        });
        this.rsiSeries.createPriceLine({
          price: 50,
          color: 'rgba(148, 163, 184, 0.4)',
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: false,
          title: '50'
        });
        this.rsiSeries.createPriceLine({
          price: 30,
          color: 'rgba(16, 185, 129, 0.75)',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: '30 OS'
        });

        this.rsiSeries.setData(this.cacheData.rsi || []);
      }

      // --- ADX Sub-Pane ---
      if (this.visibility.adx) {
        const pane = currentPaneIndex++;
        this.adxSeries = this.chart.addSeries(LineSeries, {
          color: '#f59e0b',
          lineWidth: 2.5,
          priceLineVisible: false,
          lastValueVisible: true,
          title: 'ADX (14)',
          autoscaleInfoProvider: (original) => {
            const res = original ? original() : null;
            const max = res ? Math.max(50, res.priceRange.maxValue) : 50;
            return {
              priceRange: {
                minValue: 0,
                maxValue: Math.min(100, max + 5)
              }
            };
          }
        }, pane);

        this.diPlusSeries = this.chart.addSeries(LineSeries, {
          color: '#10b981',
          lineWidth: 1.5,
          priceLineVisible: false,
          lastValueVisible: true,
          title: '+DI'
        }, pane);

        this.diMinusSeries = this.chart.addSeries(LineSeries, {
          color: '#f43f5e',
          lineWidth: 1.5,
          priceLineVisible: false,
          lastValueVisible: true,
          title: '-DI'
        }, pane);

        this.adxSeries.createPriceLine({
          price: 25,
          color: 'rgba(234, 179, 8, 0.85)',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: '25 Trend'
        });
        this.adxSeries.createPriceLine({
          price: 20,
          color: 'rgba(148, 163, 184, 0.4)',
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: false,
          title: '20'
        });

        this.adxSeries.setData(this.cacheData.adx.adx || []);
        this.diPlusSeries.setData(this.cacheData.adx.diPlus || []);
        this.diMinusSeries.setData(this.cacheData.adx.diMinus || []);
      }

      // --- MFI Sub-Pane ---
      if (this.visibility.mfi) {
        const pane = currentPaneIndex++;
        this.mfiSeries = this.chart.addSeries(LineSeries, {
          color: '#06b6d4',
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
          title: 'MFI (14)'
        }, pane);

        this.mfiSeries.createPriceLine({
          price: 80,
          color: 'rgba(244, 63, 94, 0.75)',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: '80 OB'
        });
        this.mfiSeries.createPriceLine({
          price: 50,
          color: 'rgba(148, 163, 184, 0.4)',
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: false,
          title: '50'
        });
        this.mfiSeries.createPriceLine({
          price: 20,
          color: 'rgba(16, 185, 129, 0.75)',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: '20 OS'
        });

        this.mfiSeries.setData(this.cacheData.mfi || []);
      }

      // --- MSI Sub-Pane ---
      if (this.visibility.msi) {
        const pane = currentPaneIndex++;
        this.msiSeries = this.chart.addSeries(LineSeries, {
          color: '#ec4899',
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
          title: 'MSI (20)'
        }, pane);

        this.msiSeries.createPriceLine({
          price: 75,
          color: 'rgba(16, 185, 129, 0.75)',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: '75 Bull'
        });
        this.msiSeries.createPriceLine({
          price: 50,
          color: 'rgba(255, 255, 255, 0.55)',
          lineWidth: 1,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: false,
          title: '50 Eq'
        });
        this.msiSeries.createPriceLine({
          price: 25,
          color: 'rgba(244, 63, 94, 0.75)',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: '25 Bear'
        });

        this.msiSeries.setData(this.cacheData.msi || []);
      }

      this.adjustPaneHeights();
    }

    if (visibleRange) {
      this.chart.timeScale().setVisibleLogicalRange(visibleRange);
    }
  }

  /**
   * Adjust sub-pane heights cleanly so main chart always retains adequate proportion
   */
  adjustPaneHeights() {
    if (!this.chart || !this.container) return;
    const panes = this.chart.panes();
    if (panes.length <= 1) return;

    const totalHeight = this.container.clientHeight;
    const subPaneCount = panes.length - 1;

    // Allocate 60-72% for main candlestick pane, rest distributed evenly among subpanes
    const mainRatio = subPaneCount === 1 ? 0.72 : subPaneCount === 2 ? 0.62 : 0.52;
    const availableForSubPanes = totalHeight * (1 - mainRatio);
    const targetHeight = Math.max(90, Math.floor(availableForSubPanes / subPaneCount));

    for (let i = 1; i < panes.length; i++) {
      panes[i].setHeight(targetHeight);
    }
  }

  /**
   * Set data for all chart layers and sub-panes
   */
  updateChartData({ candles, ema50, ema200, vwap, rsi, adx, mfi, msi }) {
    this.cacheData.candles = candles || [];
    this.cacheData.ema50 = ema50 || [];
    this.cacheData.ema200 = ema200 || [];
    this.cacheData.vwap = vwap || [];
    this.cacheData.rsi = rsi || [];
    this.cacheData.adx = adx || { adx: [], diPlus: [], diMinus: [] };
    this.cacheData.mfi = mfi || [];
    this.cacheData.msi = msi || [];

    // Volume with matching candle colors
    const volumeData = this.cacheData.candles.map(c => {
      const isUp = c.close >= c.open;
      return {
        time: c.time,
        value: c.volume || 0,
        color: isUp ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'
      };
    });
    this.cacheData.volume = volumeData;

    this.applyMainSeriesData();

    if (this.volumeSeries) {
      this.volumeSeries.setData(this.visibility.volume ? volumeData : []);
    }

    if (this.ema50Series) {
      this.ema50Series.setData(this.visibility.ema50 ? this.cacheData.ema50 : []);
    }

    if (this.ema200Series) {
      this.ema200Series.setData(this.visibility.ema200 ? this.cacheData.ema200 : []);
    }

    if (this.vwapSeries) {
      this.vwapSeries.setData(this.visibility.vwap ? this.cacheData.vwap : []);
    }

    this.rebuildOscillators();
    this.chart.timeScale().fitContent();
  }

  /**
   * Toggle visibility of specific indicators
   */
  toggleIndicator(name) {
    if (this.visibility[name] === undefined) return;
    this.visibility[name] = !this.visibility[name];

    if (name === 'ema50' && this.ema50Series) {
      this.ema50Series.setData(this.visibility.ema50 ? this.cacheData.ema50 : []);
    } else if (name === 'ema200' && this.ema200Series) {
      this.ema200Series.setData(this.visibility.ema200 ? this.cacheData.ema200 : []);
    } else if (name === 'vwap' && this.vwapSeries) {
      this.vwapSeries.setData(this.visibility.vwap ? this.cacheData.vwap : []);
    } else if (name === 'volume' && this.volumeSeries) {
      this.volumeSeries.setData(this.visibility.volume ? this.cacheData.volume : []);
    } else if (['rsi', 'adx', 'mfi', 'msi'].includes(name)) {
      this.rebuildOscillators();
    }

    return this.visibility[name];
  }

  /**
   * Toggle between split sub-panes and unified combined sub-pane
   */
  setOscillatorMode(mode) {
    if (this.oscillatorMode === mode) return;
    this.oscillatorMode = mode;
    this.rebuildOscillators();
  }

  /**
   * Switch chart style (candlestick, line, area)
   */
  setChartType(type) {
    if (this.currentChartType === type) return;
    this.createMainSeries(type);
  }

  /**
   * Auto fit timescale content
   */
  fitContent() {
    if (this.chart) {
      this.chart.timeScale().fitContent();
    }
  }

  /**
   * Take a high-resolution screenshot of the chart
   */
  takeScreenshot() {
    if (!this.chart) return null;
    return this.chart.takeScreenshot();
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.chart) {
      this.chart.remove();
    }
  }
}

