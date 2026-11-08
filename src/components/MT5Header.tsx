import React, { useState } from 'react';
import {
  Play,
  Square,
  BarChart2,
  TrendingUp,
  Sliders,
  Code2,
  Maximize2,
  Minimize2,
  Layers,
  ChevronDown,
  PlusCircle,
  Activity,
  Cpu,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { RiskSettings, AccountInfo, PythonBridgeStatus, BotOperationMode, ExecutionMode } from '../types';

interface MT5HeaderProps {
  activeSymbol: string;
  activeTimeframe: string;
  onTimeframeChange: (tf: string) => void;
  chartType: 'CANDLE' | 'BAR' | 'LINE';
  onChartTypeChange: (type: 'CANDLE' | 'BAR' | 'LINE') => void;
  riskSettings: RiskSettings;
  onToggleAutoTrading: () => void;
  onChangeBotMode: (mode: BotOperationMode) => void;
  onChangeExecutionMode: (mode: ExecutionMode) => void;
  account: AccountInfo;
  bridgeStatus: PythonBridgeStatus;
  onOpenSignalDashboard: () => void;
  onOpenRiskSettings: () => void;
  onOpenPythonBridge: () => void;
  onOpenNewOrder: () => void;
  indicatorsConfig: {
    showEma: boolean;
    showBollinger: boolean;
    showRsi: boolean;
    showMacd: boolean;
  };
  onToggleIndicator: (key: 'showEma' | 'showBollinger' | 'showRsi' | 'showMacd') => void;
}

export const MT5Header: React.FC<MT5HeaderProps> = ({
  activeSymbol,
  activeTimeframe,
  onTimeframeChange,
  chartType,
  onChartTypeChange,
  riskSettings,
  onToggleAutoTrading,
  onChangeBotMode,
  onChangeExecutionMode,
  account,
  bridgeStatus,
  onOpenSignalDashboard,
  onOpenRiskSettings,
  onOpenPythonBridge,
  onOpenNewOrder,
  indicatorsConfig,
  onToggleIndicator,
}) => {
  const [showIndicatorsMenu, setShowIndicatorsMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="flex flex-col bg-[#141722] border-b border-[#232938] text-xs select-none">
      {/* Top Menu Bar */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-[#1e2330] text-[#94a3b8] text-[11px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-semibold text-slate-100 tracking-tight text-xs">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>MetaTrader 5</span>
            <span className="text-[#64748b] font-normal text-[10px]">· Python ECN Bridge & QuantBot</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-[#94a3b8]">
            <span className="hover:text-slate-200 cursor-pointer">File</span>
            <span className="hover:text-slate-200 cursor-pointer">View</span>
            <span className="hover:text-slate-200 cursor-pointer">Insert</span>
            <span className="hover:text-slate-200 cursor-pointer">Charts</span>
            <span className="hover:text-slate-200 cursor-pointer">Tools</span>
            <span className="hover:text-slate-200 cursor-pointer">Window</span>
            <span className="hover:text-slate-200 cursor-pointer">Help</span>
          </div>
        </div>

        {/* Python Bridge Telemetry Pill & Account Info */}
        <div className="flex items-center gap-2.5 font-mono text-[11px] tabular-nums">
          {/* Python MT5 Bridge Status Pill */}
          <button
            onClick={onOpenPythonBridge}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800 text-purple-300 hover:bg-purple-900 transition-colors"
            title="Click to view Python MT5 Connection & Script"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Cpu className="w-3 h-3 text-purple-400" />
            <span className="font-bold">Python MT5: {bridgeStatus.connected ? 'Connected' : 'Standby'}</span>
            <span className="text-[#94a3b8] text-[10px]">({bridgeStatus.pingMs}ms)</span>
          </button>

          <span className="hidden sm:inline text-slate-300">
            Account: <strong className="text-white">{account.accountNumber}</strong>
          </span>
          <span className="hidden lg:inline text-[#64748b]">·</span>
          <span className="hidden lg:inline text-[#94a3b8]">
            Server: <span className="text-slate-300">{account.server}</span>
          </span>
        </div>
      </div>

      {/* Primary Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 gap-2 overflow-x-auto">
        {/* Left Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* New Order Button */}
          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors whitespace-nowrap shadow-sm"
            title="Open Order Placement Dialog (F9)"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Order</span>
          </button>

          {/* Autonomous / Custom Risk / Manual Mode Selector */}
          <div className="flex items-center bg-[#0d0f15] p-0.5 rounded border border-[#232938]">
            <button
              onClick={() => onChangeBotMode('AUTONOMOUS')}
              className={`px-2.5 py-1 font-bold rounded flex items-center gap-1 text-[11px] transition-colors ${
                riskSettings.botMode === 'AUTONOMOUS'
                  ? 'bg-gradient-to-r from-purple-900 to-indigo-900 text-purple-200 border border-purple-600 shadow-sm'
                  : 'text-[#94a3b8] hover:text-slate-200'
              }`}
              title="Autonomous Auto-Pilot: Bot decides regime, position sizing, SL/TP without manual tuning"
            >
              <Cpu className="w-3 h-3 text-purple-400" />
              <span>Autonomous AI Pilot</span>
            </button>

            <button
              onClick={() => onChangeBotMode('MANUAL_RISK')}
              className={`px-2.5 py-1 font-medium rounded text-[11px] transition-colors ${
                riskSettings.botMode === 'MANUAL_RISK'
                  ? 'bg-[#2a3245] text-amber-300 font-bold border border-amber-600/50'
                  : 'text-[#94a3b8] hover:text-slate-200'
              }`}
              title="Rule-Based: Uses your custom manual risk parameters"
            >
              <span>Custom Risk</span>
            </button>

            <button
              onClick={() => onChangeBotMode('OFF')}
              className={`px-2 py-1 font-medium rounded text-[11px] transition-colors ${
                riskSettings.botMode === 'OFF'
                  ? 'bg-slate-800 text-slate-300 font-bold'
                  : 'text-[#64748b] hover:text-slate-200'
              }`}
              title="Manual Only: Automated execution disabled"
            >
              <span>Manual</span>
            </button>
          </div>

          {/* Execution Mode: Automatic vs Manual Confirmation */}
          {riskSettings.botMode !== 'OFF' && (
            <div className="flex items-center bg-[#0d0f15] p-0.5 rounded border border-[#232938]">
              <button
                onClick={() => onChangeExecutionMode('AUTOMATIC')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  riskSettings.executionMode === 'AUTOMATIC'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'text-[#64748b] hover:text-slate-300'
                }`}
                title="Automatically executes orders upon signal confirmation"
              >
                Auto Execute
              </button>
              <button
                onClick={() => onChangeExecutionMode('MANUAL_CONFIRM')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  riskSettings.executionMode === 'MANUAL_CONFIRM'
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'text-[#64748b] hover:text-slate-300'
                }`}
                title="Bot decides and presents 1-click execution cards"
              >
                Manual Confirm
              </button>
            </div>
          )}

          <div className="h-4 w-[1px] bg-[#232938] mx-0.5" />

          {/* Timeframe Switcher */}
          <div className="flex items-center bg-[#0d0f15] p-0.5 rounded border border-[#232938]">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2 py-0.5 font-mono text-[11px] rounded transition-colors ${
                  activeTimeframe === tf
                    ? 'bg-[#2a3245] text-amber-300 font-bold'
                    : 'text-[#94a3b8] hover:text-slate-200 hover:bg-[#1a1f2c]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-[#232938] mx-0.5" />

          {/* Chart Style Toggle */}
          <div className="flex items-center bg-[#0d0f15] p-0.5 rounded border border-[#232938]">
            <button
              onClick={() => onChartTypeChange('BAR')}
              className={`p-1 rounded text-[11px] ${
                chartType === 'BAR' ? 'bg-[#2a3245] text-amber-300' : 'text-[#94a3b8] hover:text-slate-200'
              }`}
              title="Bar Chart"
            >
              <BarChart2 className="w-3.5 h-3.5 rotate-90" />
            </button>
            <button
              onClick={() => onChartTypeChange('CANDLE')}
              className={`p-1 rounded text-[11px] ${
                chartType === 'CANDLE' ? 'bg-[#2a3245] text-amber-300' : 'text-[#94a3b8] hover:text-slate-200'
              }`}
              title="Candlestick Chart"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChartTypeChange('LINE')}
              className={`p-1 rounded text-[11px] ${
                chartType === 'LINE' ? 'bg-[#2a3245] text-amber-300' : 'text-[#94a3b8] hover:text-slate-200'
              }`}
              title="Line Chart"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Indicators Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowIndicatorsMenu(!showIndicatorsMenu)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#1a1f2c] hover:bg-[#242b3d] text-slate-300 rounded border border-[#2a3245] transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Indicators</span>
              <ChevronDown className="w-3 h-3 text-[#94a3b8]" />
            </button>

            {showIndicatorsMenu && (
              <div
                className="absolute top-full left-0 mt-1 w-48 bg-[#181c27] border border-[#2a3245] rounded shadow-xl py-1 z-50 text-slate-200"
                onMouseLeave={() => setShowIndicatorsMenu(false)}
              >
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#64748b] font-semibold">
                  Technical Overlays
                </div>
                <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#232938] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={indicatorsConfig.showEma}
                    onChange={() => onToggleIndicator('showEma')}
                    className="rounded border-[#3b4459] bg-[#0d0f15] text-blue-500 focus:ring-0"
                  />
                  <span>EMA 20 & 50 Cross</span>
                </label>
                <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#232938] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={indicatorsConfig.showBollinger}
                    onChange={() => onToggleIndicator('showBollinger')}
                    className="rounded border-[#3b4459] bg-[#0d0f15] text-blue-500 focus:ring-0"
                  />
                  <span>Bollinger Bands (20, 2)</span>
                </label>
                <div className="h-[1px] bg-[#232938] my-1" />
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#64748b] font-semibold">
                  Oscillators (Sub-window)
                </div>
                <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#232938] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={indicatorsConfig.showRsi}
                    onChange={() => onToggleIndicator('showRsi')}
                    className="rounded border-[#3b4459] bg-[#0d0f15] text-blue-500 focus:ring-0"
                  />
                  <span>RSI (14) Momentum</span>
                </label>
                <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#232938] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={indicatorsConfig.showMacd}
                    onChange={() => onToggleIndicator('showMacd')}
                    className="rounded border-[#3b4459] bg-[#0d0f15] text-blue-500 focus:ring-0"
                  />
                  <span>MACD (12, 26, 9)</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Group */}
        <div className="flex items-center gap-2">
          {/* Signal Dashboard */}
          <button
            onClick={onOpenSignalDashboard}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded font-medium transition-colors whitespace-nowrap"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Signal Dashboard</span>
          </button>

          {/* Risk Settings Button */}
          <button
            onClick={onOpenRiskSettings}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1f2c] hover:bg-[#242b3d] text-slate-300 border border-[#2a3245] rounded transition-colors whitespace-nowrap"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Risk Controls</span>
          </button>

          {/* Python MT5 Bridge Modal Button */}
          <button
            onClick={onOpenPythonBridge}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800 rounded transition-colors whitespace-nowrap"
            title="Download / View Python MT5 Bridge Worker"
          >
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Python MT5</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1 text-[#94a3b8] hover:text-slate-200 bg-[#1a1f2c] rounded border border-[#2a3245]"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
