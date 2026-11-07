import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  Activity,
  ShieldCheck,
  Zap,
  Sparkles,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  ChevronRight,
  Target,
} from 'lucide-react';
import {
  EquityPoint,
  PerformanceStats,
  RiskSettings,
  TradeSignal,
} from '../types';
import { SUPPORTED_SYMBOLS } from '../services/marketData';

interface SignalDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PerformanceStats;
  equityCurve: EquityPoint[];
  signals: Record<string, TradeSignal>;
  riskSettings: RiskSettings;
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onExecuteSignal: (signal: TradeSignal) => void;
  onOpenRiskSettings: () => void;
}

export const SignalDashboardModal: React.FC<SignalDashboardModalProps> = ({
  isOpen,
  onClose,
  stats,
  equityCurve,
  signals,
  riskSettings,
  activeSymbol,
  onSelectSymbol,
  onExecuteSignal,
  onOpenRiskSettings,
}) => {
  const [selectedDashboardSymbol, setSelectedDashboardSymbol] = useState<string>(activeSymbol);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSignal = signals[selectedDashboardSymbol] || signals['XAUUSD'];
  const symInfo = SUPPORTED_SYMBOLS[selectedDashboardSymbol] || SUPPORTED_SYMBOLS.XAUUSD;

  // Request AI Quant Analysis from backend
  const requestAiAnalysis = async () => {
    if (!currentSignal) return;
    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: currentSignal.symbol,
          timeframe: 'M5 / H1 Confluence',
          price: currentSignal.entryPrice,
          rsi: currentSignal.indicators.rsi,
          macd: currentSignal.indicators.macd,
          trend: currentSignal.indicators.emaFast > currentSignal.indicators.emaSlow ? 'BULLISH' : 'BEARISH',
          emaFast: currentSignal.indicators.emaFast,
          emaSlow: currentSignal.indicators.emaSlow,
          atr: currentSignal.indicators.atr,
          session: currentSignal.symbol.includes('XAU') ? 'London & New York Overlap' : '24/7 Global Crypto',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setAiAnalysis(data);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setAiError(err?.message || 'Failed to generate AI analysis');
    } finally {
      setAiLoading(false);
    }
  };

  // Render SVG Equity Curve
  const renderEquityCurve = () => {
    if (equityCurve.length < 2) {
      return (
        <div className="h-44 flex items-center justify-center text-[#64748b] text-xs font-mono">
          Accumulating equity tick data...
        </div>
      );
    }

    const width = 640;
    const height = 160;
    const padding = 24;

    const equities = equityCurve.map((p) => p.equity);
    const minVal = Math.min(...equities) * 0.998;
    const maxVal = Math.max(...equities) * 1.002;
    const valRange = maxVal - minVal || 1;

    const points = equityCurve
      .map((p, idx) => {
        const x = padding + (idx / (equityCurve.length - 1)) * (width - padding * 2);
        const y = height - padding - ((p.equity - minVal) / valRange) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(' ');

    const lastEquity = equityCurve[equityCurve.length - 1]?.equity || 25000;
    const firstEquity = equityCurve[0]?.equity || 25000;
    const isUp = lastEquity >= firstEquity;

    return (
      <div className="relative w-full overflow-hidden bg-[#0a0c12] p-2 rounded border border-[#1e2330]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
          {/* Subtle grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#181c27" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#181c27" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#181c27" />

          {/* Line */}
          <polyline fill="none" stroke={isUp ? '#10b981' : '#f43f5e'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={points} />
        </svg>

        <div className="flex justify-between items-center px-2 text-[10px] font-mono text-[#64748b]">
          <span>Min: ${minVal.toFixed(0)}</span>
          <span className="text-slate-300">Equity Progression</span>
          <span className={isUp ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
            Current: ${lastEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#12151f] border border-[#232938] rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#161a25] border-b border-[#232938]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Algorithmic Signal Command Center</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  MT5 Quant v4.2
                </span>
              </h2>
              <p className="text-[11px] text-[#94a3b8]">
                Real-time technical confluence scoring, risk settings audit, and institutional trade execution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenRiskSettings}
              className="px-3 py-1 bg-[#1e2433] hover:bg-[#283144] text-slate-200 border border-[#2a3245] rounded text-xs font-medium transition-colors"
            >
              Adjust Risk Settings
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#232938] text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Top Performance KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="bg-[#151924] p-3 rounded-lg border border-[#232938]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                Net Profit
              </span>
              <span
                className={`font-mono text-base font-extrabold tabular-nums ${
                  stats.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {stats.netProfit >= 0 ? `+$${stats.netProfit.toFixed(2)}` : `-$${Math.abs(stats.netProfit).toFixed(2)}`}
              </span>
            </div>

            <div className="bg-[#151924] p-3 rounded-lg border border-[#232938]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                Win Rate
              </span>
              <span className="font-mono text-base font-extrabold text-blue-400 tabular-nums">
                {stats.winRate}%
              </span>
              <span className="text-[9px] text-[#64748b] block font-mono">
                {stats.winningTrades}W / {stats.losingTrades}L
              </span>
            </div>

            <div className="bg-[#151924] p-3 rounded-lg border border-[#232938]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                Profit Factor
              </span>
              <span className="font-mono text-base font-extrabold text-amber-400 tabular-nums">
                {stats.profitFactor}
              </span>
            </div>

            <div className="bg-[#151924] p-3 rounded-lg border border-[#232938]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                Sharpe Ratio
              </span>
              <span className="font-mono text-base font-extrabold text-purple-400 tabular-nums">
                {stats.sharpeRatio}
              </span>
            </div>

            <div className="bg-[#151924] p-3 rounded-lg border border-[#232938]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                Max Drawdown
              </span>
              <span className="font-mono text-base font-extrabold text-red-400 tabular-nums">
                {stats.maxDrawdownPercent}%
              </span>
              <span className="text-[9px] text-[#64748b] block font-mono">Cap: {riskSettings.maxDailyDrawdownPercent}%</span>
            </div>

            <div className="bg-[#151924] p-3 rounded-lg border border-[#232938]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                Bot Status
              </span>
              <span
                className={`inline-block font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  riskSettings.autoTradingEnabled
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-red-950 text-red-300 border border-red-800'
                }`}
              >
                {riskSettings.autoTradingEnabled ? 'AUTOTRADE ON' : 'PAUSED'}
              </span>
            </div>
          </div>

          {/* Equity Progression Chart */}
          <div className="bg-[#151924] p-4 rounded-lg border border-[#232938]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Portfolio Balance & Equity Progression
              </span>
              <span className="text-[11px] text-[#94a3b8] font-mono">
                Model: {riskSettings.strategyPreset} · Risk: {riskSettings.riskPercent}%/trade
              </span>
            </div>
            {renderEquityCurve()}
          </div>

          {/* Symbol Selector Pill Bar */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Asset Technical Confluence Scopes
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {Object.values(SUPPORTED_SYMBOLS).map((item) => {
                const isSelected = selectedDashboardSymbol === item.symbol;
                const sig = signals[item.symbol];
                const isGold = item.symbol === 'XAUUSD';

                return (
                  <button
                    key={item.symbol}
                    onClick={() => {
                      setSelectedDashboardSymbol(item.symbol);
                      setAiAnalysis(null);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all whitespace-nowrap ${
                      isSelected
                        ? isGold
                          ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                          : 'bg-blue-950/80 border-blue-500 text-blue-300 font-bold'
                        : 'bg-[#151924] border-[#232938] text-slate-300 hover:bg-[#1c2230]'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.symbol}</span>
                    {sig && (
                      <span
                        className={`text-[9px] px-1 rounded font-bold ${
                          sig.type.includes('BUY')
                            ? 'text-emerald-400 bg-emerald-950'
                            : sig.type.includes('SELL')
                            ? 'text-red-400 bg-red-950'
                            : 'text-slate-400 bg-slate-800'
                        }`}
                      >
                        {sig.type}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Signal Breakdown & Execution Box */}
          {currentSignal && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left 2 Cols: Signal Breakdown & Indicator Checklist */}
              <div className="lg:col-span-2 bg-[#151924] p-4 rounded-lg border border-[#232938] space-y-4">
                <div className="flex items-center justify-between border-b border-[#232938] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{symInfo.icon}</span>
                    <div>
                      <h3 className="font-bold text-slate-100 font-mono text-sm">
                        {currentSignal.symbol} — {symInfo.name}
                      </h3>
                      <span className="text-[11px] text-[#94a3b8]">
                        Current Price: <strong className="text-white">${currentSignal.entryPrice.toFixed(symInfo.digits)}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div
                      className={`text-sm font-black px-2.5 py-1 rounded inline-block ${
                        currentSignal.type.includes('BUY')
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : currentSignal.type.includes('SELL')
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {currentSignal.type}
                    </div>
                    <div className="text-[10px] text-amber-400 font-bold mt-0.5">
                      Confidence: {currentSignal.confidence}%
                    </div>
                  </div>
                </div>

                {/* Quantitative Indicator Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="bg-[#0f121a] p-2.5 rounded border border-[#1e2330]">
                    <span className="text-[10px] text-[#64748b] block">RSI (14) MOMENTUM</span>
                    <span
                      className={`text-sm font-bold ${
                        currentSignal.indicators.rsi < 35
                          ? 'text-emerald-400'
                          : currentSignal.indicators.rsi > 65
                          ? 'text-red-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {currentSignal.indicators.rsi}
                    </span>
                    <span className="text-[9px] text-[#64748b] block">
                      {currentSignal.indicators.rsi < 30 ? 'Oversold Spring' : currentSignal.indicators.rsi > 70 ? 'Overbought Pullback' : 'Balanced Flow'}
                    </span>
                  </div>

                  <div className="bg-[#0f121a] p-2.5 rounded border border-[#1e2330]">
                    <span className="text-[10px] text-[#64748b] block">EMA 20 / 50 CONFLUENCE</span>
                    <span
                      className={`text-sm font-bold ${
                        currentSignal.indicators.emaFast > currentSignal.indicators.emaSlow
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {currentSignal.indicators.emaFast > currentSignal.indicators.emaSlow ? 'GOLDEN CROSS' : 'DEATH CROSS'}
                    </span>
                    <span className="text-[9px] text-[#64748b] block">
                      Fast: {currentSignal.indicators.emaFast}
                    </span>
                  </div>

                  <div className="bg-[#0f121a] p-2.5 rounded border border-[#1e2330]">
                    <span className="text-[10px] text-[#64748b] block">MACD HISTOGRAM</span>
                    <span
                      className={`text-sm font-bold ${
                        currentSignal.indicators.macd.histogram >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {currentSignal.indicators.macd.histogram >= 0 ? '+' : ''}
                      {currentSignal.indicators.macd.histogram.toFixed(3)}
                    </span>
                    <span className="text-[9px] text-[#64748b] block">
                      Signal: {currentSignal.indicators.macd.signal.toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-[#0f121a] p-2.5 rounded border border-[#1e2330]">
                    <span className="text-[10px] text-[#64748b] block">BOLLINGER BAND SQUEEZE</span>
                    <span className="text-sm font-bold text-indigo-400">
                      {currentSignal.indicators.bollinger.bandwidth.toFixed(2)}%
                    </span>
                    <span className="text-[9px] text-[#64748b] block">
                      Lower: {currentSignal.indicators.bollinger.lower.toFixed(symInfo.digits)}
                    </span>
                  </div>

                  <div className="bg-[#0f121a] p-2.5 rounded border border-[#1e2330]">
                    <span className="text-[10px] text-[#64748b] block">VOLATILITY (ATR 14)</span>
                    <span className="text-sm font-bold text-amber-400">
                      {currentSignal.indicators.atr.toFixed(symInfo.digits)} pts
                    </span>
                    <span className="text-[9px] text-[#64748b] block">Dynamic SL Multiplier: 1.5x</span>
                  </div>

                  <div className="bg-[#0f121a] p-2.5 rounded border border-[#1e2330]">
                    <span className="text-[10px] text-[#64748b] block">RISK-REWARD RATIO</span>
                    <span className="text-sm font-bold text-emerald-400">1:{currentSignal.riskReward}</span>
                    <span className="text-[9px] text-[#64748b] block">Asymmetric Edge</span>
                  </div>
                </div>

                {/* Signal Confluence Rationale */}
                <div>
                  <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                    Confluence Audit Trail:
                  </span>
                  <div className="space-y-1">
                    {currentSignal.reasons.map((reason, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Proposed Trade Plan & 1-Click Execution */}
              <div className="bg-[#151924] p-4 rounded-lg border border-[#232938] flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
                      Proposed Trade Plan
                    </h4>
                  </div>

                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="flex justify-between items-center bg-[#0f121a] p-2 rounded border border-[#1e2330]">
                      <span className="text-[#64748b]">Entry Level:</span>
                      <strong className="text-white text-sm">
                        {currentSignal.entryPrice.toFixed(symInfo.digits)}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center bg-[#0f121a] p-2 rounded border border-red-950/60">
                      <span className="text-red-400 font-bold">Stop Loss (Invalidation):</span>
                      <strong className="text-red-400">
                        {currentSignal.stopLoss.toFixed(symInfo.digits)}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center bg-[#0f121a] p-2 rounded border border-emerald-950/60">
                      <span className="text-emerald-400 font-bold">Take Profit (Target 1):</span>
                      <strong className="text-emerald-400">
                        {currentSignal.takeProfit.toFixed(symInfo.digits)}
                      </strong>
                    </div>

                    <div className="p-2 bg-[#1a1f2c] rounded text-[10px] text-[#94a3b8] leading-relaxed font-sans">
                      Position size auto-calculated at{' '}
                      <strong className="text-white">{riskSettings.riskPercent}%</strong> of account equity ($
                      {((stats.netProfit + 25000) * (riskSettings.riskPercent / 100)).toFixed(0)} max risk).
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onExecuteSignal(currentSignal);
                      onClose();
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Execute Trade Plan Now</span>
                  </button>

                  <button
                    onClick={() => onSelectSymbol(currentSignal.symbol)}
                    className="w-full py-1.5 bg-[#1e2433] hover:bg-[#283144] text-slate-300 rounded text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <span>View on MT5 Chart</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Quant Institutional Deep Dive (Gemini 3.8 Flash Powered) */}
          <div className="bg-[#151924] p-4 rounded-lg border border-[#232938]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
                  AI Quant Market Intelligence Deep Dive
                </h4>
              </div>

              <button
                onClick={requestAiAnalysis}
                disabled={aiLoading}
                className="flex items-center gap-1.5 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                <span>{aiLoading ? 'Analyzing...' : 'Run Institutional Analysis'}</span>
              </button>
            </div>

            {aiAnalysis ? (
              <div className="space-y-3 font-sans text-xs text-slate-300">
                <div className="p-3 bg-[#0e111a] rounded border border-[#1e2330] leading-relaxed">
                  <span className="font-bold text-purple-400 block mb-1">
                    Hedge Fund Sentiment: {aiAnalysis.sentiment || aiAnalysis.recommendation} ({aiAnalysis.confidence || 82}% Conviction)
                  </span>
                  <p>{aiAnalysis.rationale || aiAnalysis.analysis}</p>
                </div>

                {aiAnalysis.keyLevels && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                    <div className="bg-[#0e111a] p-2 rounded border border-[#1e2330]">
                      <span className="text-[#64748b] block text-[10px]">KEY SUPPORT</span>
                      <span className="text-emerald-400 font-bold">{aiAnalysis.keyLevels.support}</span>
                    </div>
                    <div className="bg-[#0e111a] p-2 rounded border border-[#1e2330]">
                      <span className="text-[#64748b] block text-[10px]">KEY RESISTANCE</span>
                      <span className="text-red-400 font-bold">{aiAnalysis.keyLevels.resistance}</span>
                    </div>
                    <div className="bg-[#0e111a] p-2 rounded border border-[#1e2330]">
                      <span className="text-[#64748b] block text-[10px]">SUGGESTED SL</span>
                      <span className="text-white font-bold">{aiAnalysis.keyLevels.stopLoss}</span>
                    </div>
                    <div className="bg-[#0e111a] p-2 rounded border border-[#1e2330]">
                      <span className="text-[#64748b] block text-[10px]">SUGGESTED TP</span>
                      <span className="text-white font-bold">{aiAnalysis.keyLevels.takeProfit}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-[#64748b]">
                Click "Run Institutional Analysis" to synthesize order book depth, liquidity levels, and algorithmic confluence using Gemini Quant Intelligence.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
