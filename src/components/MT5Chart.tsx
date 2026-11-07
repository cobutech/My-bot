import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Candle, Order, IndicatorValues } from '../types';
import { SUPPORTED_SYMBOLS, Tick } from '../services/marketData';
import {
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
} from '../services/indicators';
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp } from 'lucide-react';

interface MT5ChartProps {
  symbol: string;
  timeframe: string;
  candles: Candle[];
  tick: Tick;
  openOrders: Order[];
  chartType: 'CANDLE' | 'BAR' | 'LINE';
  indicatorsConfig: {
    showEma: boolean;
    showBollinger: boolean;
    showRsi: boolean;
    showMacd: boolean;
  };
  onExecuteTrade: (params: { symbol: string; type: 'BUY' | 'SELL'; volume: number }) => void;
}

export const MT5Chart: React.FC<MT5ChartProps> = ({
  symbol,
  timeframe,
  candles,
  tick,
  openOrders,
  chartType,
  indicatorsConfig,
  onExecuteTrade,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Chart view state: zoom and pan offset
  const [visibleCount, setVisibleCount] = useState<number>(60);
  const [panOffset, setPanOffset] = useState<number>(0); // 0 means pinned to most recent candle
  const [crosshair, setCrosshair] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  // One-click trading widget state
  const [lotSize, setLotSize] = useState<number>(0.1);
  const [showOneClick, setShowOneClick] = useState<boolean>(true);

  // Dragging state for pan
  const isDragging = useRef<boolean>(false);
  const dragStartX = useRef<number>(0);
  const initialPanOffset = useRef<number>(0);

  const symInfo = SUPPORTED_SYMBOLS[symbol] || SUPPORTED_SYMBOLS.XAUUSD;

  // Compute indicators over the full dataset
  const indicatorSeries = useMemo(() => {
    if (candles.length < 5) return null;
    const closes = candles.map((c) => c.close);
    const ema20 = calculateEMA(closes, 20);
    const ema50 = calculateEMA(closes, 50);
    const bb = calculateBollingerBands(closes, 20, 2);
    const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes, 12, 26, 9);

    return { ema20, ema50, bb, rsi, macd };
  }, [candles]);

  // Adjust visible range
  const totalCandles = candles.length;
  const startIndex = Math.max(0, totalCandles - visibleCount - panOffset);
  const endIndex = Math.min(totalCandles, startIndex + visibleCount);
  const visibleCandles = candles.slice(startIndex, endIndex);

  // Selected candle under crosshair (or latest)
  const hoveredCandleIndex = useMemo(() => {
    if (!crosshair.active || visibleCandles.length === 0 || !canvasRef.current) {
      return visibleCandles.length - 1;
    }
    const canvas = canvasRef.current;
    const chartWidth = canvas.clientWidth - 70; // 70px right price axis
    const candleWidth = chartWidth / visibleCandles.length;
    const idx = Math.floor(crosshair.x / candleWidth);
    return Math.max(0, Math.min(visibleCandles.length - 1, idx));
  }, [crosshair, visibleCandles]);

  const activeHoveredCandle = visibleCandles[hoveredCandleIndex] || visibleCandles[visibleCandles.length - 1];

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || visibleCandles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Layout partitioning: Main Chart (75% height) + Subwindow (25% height if RSI/MACD enabled)
    const hasSubwindow = indicatorsConfig.showRsi || indicatorsConfig.showMacd;
    const subwindowHeight = hasSubwindow ? Math.min(130, height * 0.28) : 0;
    const mainChartHeight = height - subwindowHeight - 22; // 22px for time axis
    const priceAxisWidth = 72;
    const chartWidth = width - priceAxisWidth;

    // Clear canvas
    ctx.fillStyle = '#10131b';
    ctx.fillRect(0, 0, width, height);

    // Compute Min & Max price in visible window
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (const c of visibleCandles) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    }

    // Include indicators in price bounds if enabled
    if (indicatorSeries) {
      for (let i = startIndex; i < endIndex; i++) {
        if (indicatorsConfig.showEma) {
          if (indicatorSeries.ema20[i]) {
            minPrice = Math.min(minPrice, indicatorSeries.ema20[i]);
            maxPrice = Math.max(maxPrice, indicatorSeries.ema20[i]);
          }
          if (indicatorSeries.ema50[i]) {
            minPrice = Math.min(minPrice, indicatorSeries.ema50[i]);
            maxPrice = Math.max(maxPrice, indicatorSeries.ema50[i]);
          }
        }
        if (indicatorsConfig.showBollinger && indicatorSeries.bb.lower[i]) {
          minPrice = Math.min(minPrice, indicatorSeries.bb.lower[i]);
          maxPrice = Math.max(maxPrice, indicatorSeries.bb.upper[i]);
        }
      }
    }

    // Add 8% vertical padding
    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;
    const adjustedRange = maxPrice - minPrice;

    // Helper functions for coordinates
    const priceToY = (price: number) => {
      return mainChartHeight - ((price - minPrice) / adjustedRange) * mainChartHeight;
    };
    const yToPrice = (y: number) => {
      return minPrice + ((mainChartHeight - y) / mainChartHeight) * adjustedRange;
    };
    const candleWidth = chartWidth / visibleCandles.length;
    const candleBodyWidth = Math.max(1, candleWidth * 0.72);

    // 1. Draw Background Grid Lines
    ctx.strokeStyle = '#1b202c';
    ctx.lineWidth = 1;

    // Horizontal Price Grid & Labels
    const gridSteps = 7;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';

    for (let i = 0; i <= gridSteps; i++) {
      const y = (mainChartHeight / gridSteps) * i;
      const price = yToPrice(y);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Right axis price label
      ctx.fillText(price.toFixed(symInfo.digits), chartWidth + 6, y + 3);
    }

    // Vertical Time Grid
    const timeSteps = Math.min(8, visibleCandles.length);
    const stepInterval = Math.floor(visibleCandles.length / timeSteps) || 1;

    ctx.textAlign = 'center';
    for (let i = 0; i < visibleCandles.length; i += stepInterval) {
      const x = i * candleWidth + candleWidth / 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - 22);
      ctx.stroke();

      const d = new Date(visibleCandles[i].time);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      ctx.fillText(timeStr, x, height - 8);
    }

    // 2. Draw Bollinger Bands Area & Lines
    if (indicatorsConfig.showBollinger && indicatorSeries) {
      ctx.beginPath();
      // Upper band
      for (let i = 0; i < visibleCandles.length; i++) {
        const fullIdx = startIndex + i;
        const x = i * candleWidth + candleWidth / 2;
        const y = priceToY(indicatorSeries.bb.upper[fullIdx]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Lower band
      ctx.beginPath();
      for (let i = 0; i < visibleCandles.length; i++) {
        const fullIdx = startIndex + i;
        const x = i * candleWidth + candleWidth / 2;
        const y = priceToY(indicatorSeries.bb.lower[fullIdx]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.stroke();

      // Middle band
      ctx.beginPath();
      for (let i = 0; i < visibleCandles.length; i++) {
        const fullIdx = startIndex + i;
        const x = i * candleWidth + candleWidth / 2;
        const y = priceToY(indicatorSeries.bb.middle[fullIdx]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.3)';
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Draw EMA Lines
    if (indicatorsConfig.showEma && indicatorSeries) {
      // EMA 20 (Cyan)
      ctx.beginPath();
      for (let i = 0; i < visibleCandles.length; i++) {
        const fullIdx = startIndex + i;
        const x = i * candleWidth + candleWidth / 2;
        const y = priceToY(indicatorSeries.ema20[fullIdx]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#00d2ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // EMA 50 (Gold/Yellow)
      ctx.beginPath();
      for (let i = 0; i < visibleCandles.length; i++) {
        const fullIdx = startIndex + i;
        const x = i * candleWidth + candleWidth / 2;
        const y = priceToY(indicatorSeries.ema50[fullIdx]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 4. Draw Candlesticks / Bars
    for (let i = 0; i < visibleCandles.length; i++) {
      const c = visibleCandles[i];
      const x = i * candleWidth + candleWidth / 2;
      const isBull = c.close >= c.open;
      const color = isBull ? '#00c076' : '#ff3b69';

      const openY = priceToY(c.open);
      const closeY = priceToY(c.close);
      const highY = priceToY(c.high);
      const lowY = priceToY(c.low);

      if (chartType === 'CANDLE') {
        // Wick line
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Body rectangle
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
        ctx.fillStyle = isBull ? '#00c076' : '#ff3b69';
        ctx.fillRect(x - candleBodyWidth / 2, bodyTop, candleBodyWidth, bodyHeight);
      } else if (chartType === 'BAR') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        // High to Low spine
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        // Open left tick
        ctx.moveTo(x - candleBodyWidth / 2, openY);
        ctx.lineTo(x, openY);
        // Close right tick
        ctx.moveTo(x, closeY);
        ctx.lineTo(x + candleBodyWidth / 2, closeY);
        ctx.stroke();
      } else {
        // LINE CHART
        if (i === 0) {
          ctx.beginPath();
          ctx.moveTo(x, closeY);
        } else {
          ctx.lineTo(x, closeY);
        }
        if (i === visibleCandles.length - 1) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    // 5. Draw Active Orders Overlay Lines
    const symbolOrders = openOrders.filter((o) => o.symbol === symbol && o.status === 'OPEN');
    for (const order of symbolOrders) {
      const entryY = priceToY(order.openPrice);
      const isBuy = order.type === 'BUY';
      const orderColor = isBuy ? '#10b981' : '#f43f5e';

      // Entry line
      ctx.strokeStyle = orderColor;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, entryY);
      ctx.lineTo(chartWidth, entryY);
      ctx.stroke();

      // Entry Tag
      ctx.fillStyle = orderColor;
      ctx.fillRect(chartWidth, entryY - 9, priceAxisWidth - 2, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${order.type} ${order.volume}`, chartWidth + 4, entryY + 3);

      // Stop Loss Line
      if (order.sl > 0) {
        const slY = priceToY(order.sl);
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(0, slY);
        ctx.lineTo(chartWidth, slY);
        ctx.stroke();

        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(chartWidth, slY - 9, priceAxisWidth - 2, 18);
        ctx.fillStyle = '#fca5a5';
        ctx.fillText(`SL ${order.sl.toFixed(symInfo.digits)}`, chartWidth + 4, slY + 3);
      }

      // Take Profit Line
      if (order.tp > 0) {
        const tpY = priceToY(order.tp);
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(0, tpY);
        ctx.lineTo(chartWidth, tpY);
        ctx.stroke();

        ctx.fillStyle = '#064e3b';
        ctx.fillRect(chartWidth, tpY - 9, priceAxisWidth - 2, 18);
        ctx.fillStyle = '#6ee7b7';
        ctx.fillText(`TP ${order.tp.toFixed(symInfo.digits)}`, chartWidth + 4, tpY + 3);
      }

      ctx.setLineDash([]);
    }

    // 6. Draw Current Bid / Ask Horizontal Price Rays
    const bidY = priceToY(tick.bid);
    const askY = priceToY(tick.ask);

    // Bid line (Red)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, bidY);
    ctx.lineTo(chartWidth, bidY);
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(chartWidth, bidY - 9, priceAxisWidth, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(tick.bid.toFixed(symInfo.digits), chartWidth + 4, bidY + 4);

    // Ask line (Blue/Cyan)
    ctx.strokeStyle = '#38bdf8';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, askY);
    ctx.lineTo(chartWidth, askY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 7. Draw Sub-window (RSI or MACD)
    if (hasSubwindow && indicatorSeries) {
      const subTop = mainChartHeight;
      const subBottom = height - 22;

      // Divider line
      ctx.strokeStyle = '#232938';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, subTop);
      ctx.lineTo(width, subTop);
      ctx.stroke();

      ctx.fillStyle = '#0f121a';
      ctx.fillRect(0, subTop, width, subwindowHeight);

      if (indicatorsConfig.showRsi) {
        // RSI sub-window
        const rsiToY = (val: number) => subTop + (1 - val / 100) * subwindowHeight;

        // RSI 70 & 30 guide lines
        ctx.strokeStyle = '#333b4d';
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(0, rsiToY(70));
        ctx.lineTo(chartWidth, rsiToY(70));
        ctx.moveTo(0, rsiToY(30));
        ctx.lineTo(chartWidth, rsiToY(30));
        ctx.stroke();
        ctx.setLineDash([]);

        // RSI line
        ctx.beginPath();
        for (let i = 0; i < visibleCandles.length; i++) {
          const fullIdx = startIndex + i;
          const x = i * candleWidth + candleWidth / 2;
          const rsiVal = indicatorSeries.rsi[fullIdx] ?? 50;
          const y = rsiToY(rsiVal);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // RSI Sub-window label
        const currentRsi = indicatorSeries.rsi[endIndex - 1] ?? 50;
        ctx.fillStyle = '#c084fc';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`RSI(14): ${currentRsi.toFixed(1)}`, 8, subTop + 14);
        ctx.fillStyle = '#64748b';
        ctx.fillText('70', chartWidth + 6, rsiToY(70) + 3);
        ctx.fillText('30', chartWidth + 6, rsiToY(30) + 3);
      } else if (indicatorsConfig.showMacd) {
        // MACD Histogram Subwindow
        const macdArr = indicatorSeries.macd;
        let maxHist = 0.001;
        for (let i = startIndex; i < endIndex; i++) {
          if (Math.abs(macdArr.histogram[i]) > maxHist) maxHist = Math.abs(macdArr.histogram[i]);
        }
        const zeroY = subTop + subwindowHeight / 2;

        for (let i = 0; i < visibleCandles.length; i++) {
          const fullIdx = startIndex + i;
          const x = i * candleWidth + candleWidth / 2;
          const hist = macdArr.histogram[fullIdx];
          const barHeight = (hist / maxHist) * (subwindowHeight / 2.2);

          ctx.fillStyle = hist >= 0 ? '#00c076' : '#ff3b69';
          ctx.fillRect(x - candleBodyWidth / 2, zeroY, candleBodyWidth, -barHeight);
        }

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText('MACD (12, 26, 9)', 8, subTop + 14);
      }
    }

    // 8. Crosshair Cursor lines & Readouts
    if (crosshair.active && crosshair.x < chartWidth && crosshair.y < mainChartHeight) {
      ctx.strokeStyle = '#475569';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(crosshair.x, 0);
      ctx.lineTo(crosshair.x, height - 22);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, crosshair.y);
      ctx.lineTo(chartWidth, crosshair.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price tag on right axis
      const hoverPrice = yToPrice(crosshair.y);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(chartWidth, crosshair.y - 9, priceAxisWidth, 18);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(hoverPrice.toFixed(symInfo.digits), chartWidth + 4, crosshair.y + 3);

      // Time tag on bottom axis
      if (activeHoveredCandle) {
        const timeStr = new Date(activeHoveredCandle.time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(crosshair.x - 30, height - 20, 60, 18);
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(timeStr, crosshair.x, height - 8);
      }
    }

    ctx.restore();
  }, [
    visibleCandles,
    chartType,
    indicatorsConfig,
    indicatorSeries,
    tick,
    openOrders,
    crosshair,
    startIndex,
    endIndex,
    symInfo,
    activeHoveredCandle,
  ]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // Zoom in
      setVisibleCount((prev) => Math.max(20, prev - 4));
    } else {
      // Zoom out
      setVisibleCount((prev) => Math.min(180, prev + 4));
    }
  };

  // Drag pan
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    initialPanOffset.current = panOffset;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCrosshair({ x, y, active: true });

    if (isDragging.current) {
      const deltaX = e.clientX - dragStartX.current;
      const candleWidth = (canvas.clientWidth - 72) / visibleCount;
      const shiftCandles = Math.round(deltaX / candleWidth);
      setPanOffset(Math.max(0, Math.min(candles.length - visibleCount, initialPanOffset.current + shiftCandles)));
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    setCrosshair((prev) => ({ ...prev, active: false }));
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 flex flex-col h-full bg-[#10131b] overflow-hidden select-none"
    >
      {/* Chart Top Legend & OHLCV Readout */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#141722] border-b border-[#1e2330] text-[11px] font-mono tabular-nums text-slate-300">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="font-bold text-amber-400 flex items-center gap-1">
            <span>{symInfo.icon}</span>
            {symbol}, {timeframe}
          </span>
          {activeHoveredCandle && (
            <div className="flex items-center gap-2 text-[#94a3b8]">
              <span>
                O: <strong className="text-slate-200">{activeHoveredCandle.open.toFixed(symInfo.digits)}</strong>
              </span>
              <span>
                H: <strong className="text-emerald-400">{activeHoveredCandle.high.toFixed(symInfo.digits)}</strong>
              </span>
              <span>
                L: <strong className="text-red-400">{activeHoveredCandle.low.toFixed(symInfo.digits)}</strong>
              </span>
              <span>
                C: <strong className="text-slate-200">{activeHoveredCandle.close.toFixed(symInfo.digits)}</strong>
              </span>
              <span>
                Vol: <strong className="text-slate-300">{activeHoveredCandle.volume}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Indicator Values readout */}
        {indicatorSeries && (
          <div className="hidden lg:flex items-center gap-3 text-[10px]">
            {indicatorsConfig.showEma && (
              <>
                <span className="text-[#00d2ff]">EMA20: {indicatorSeries.ema20[endIndex - 1]?.toFixed(symInfo.digits)}</span>
                <span className="text-[#f59e0b]">EMA50: {indicatorSeries.ema50[endIndex - 1]?.toFixed(symInfo.digits)}</span>
              </>
            )}
            {indicatorsConfig.showRsi && (
              <span className="text-[#c084fc]">RSI: {indicatorSeries.rsi[endIndex - 1]?.toFixed(1)}</span>
            )}
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 w-full h-full">
        <canvas
          ref={canvasRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full crosshair-cursor block"
        />

        {/* MT5 Authentic One-Click Trading Top-Left Widget */}
        <div className="absolute top-2 left-2 z-20">
          {showOneClick ? (
            <div className="flex items-center bg-[#151924]/95 backdrop-blur-sm border border-[#2a3245] rounded shadow-2xl p-1 gap-1 text-xs">
              <button
                onClick={() => setShowOneClick(false)}
                className="p-1 hover:bg-[#232938] rounded text-[#94a3b8]"
                title="Collapse One-Click Panel"
              >
                <ChevronUp className="w-3 h-3" />
              </button>

              {/* Quick SELL */}
              <button
                onClick={() => onExecuteTrade({ symbol, type: 'SELL', volume: lotSize })}
                className="flex flex-col items-center justify-center px-2.5 py-1 bg-red-600/90 hover:bg-red-500 text-white rounded transition-colors active:scale-95 shadow-sm"
              >
                <span className="text-[9px] uppercase font-bold text-red-200">SELL</span>
                <span className="font-mono font-bold text-[11px] tabular-nums">
                  {tick.bid.toFixed(symInfo.digits)}
                </span>
              </button>

              {/* Volume / Lots Input */}
              <div className="flex flex-col items-center px-1">
                <span className="text-[8px] text-[#64748b] font-semibold uppercase">Volume</span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => setLotSize((v) => Math.max(symInfo.minLot, Number((v - symInfo.lotStep).toFixed(2))))}
                    className="px-1 py-0.5 bg-[#232938] hover:bg-[#30384d] text-slate-200 rounded text-[10px]"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step={symInfo.lotStep}
                    min={symInfo.minLot}
                    max={symInfo.maxLot}
                    value={lotSize}
                    onChange={(e) => setLotSize(parseFloat(e.target.value) || symInfo.minLot)}
                    className="w-12 bg-[#0d0f15] border border-[#2a3245] text-center font-mono text-[11px] py-0.5 rounded text-amber-300 font-bold focus:outline-none"
                  />
                  <button
                    onClick={() => setLotSize((v) => Math.min(symInfo.maxLot, Number((v + symInfo.lotStep).toFixed(2))))}
                    className="px-1 py-0.5 bg-[#232938] hover:bg-[#30384d] text-slate-200 rounded text-[10px]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick BUY */}
              <button
                onClick={() => onExecuteTrade({ symbol, type: 'BUY', volume: lotSize })}
                className="flex flex-col items-center justify-center px-2.5 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded transition-colors active:scale-95 shadow-sm"
              >
                <span className="text-[9px] uppercase font-bold text-emerald-200">BUY</span>
                <span className="font-mono font-bold text-[11px] tabular-nums">
                  {tick.ask.toFixed(symInfo.digits)}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowOneClick(true)}
              className="flex items-center gap-1 px-2 py-1 bg-[#151924]/90 hover:bg-[#232938] border border-[#2a3245] rounded text-[10px] text-amber-400 font-medium"
            >
              <ChevronDown className="w-3 h-3" />
              <span>One-Click Trading</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
