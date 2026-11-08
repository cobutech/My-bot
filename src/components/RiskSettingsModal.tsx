import React, { useState } from 'react';
import {
  X,
  Shield,
  Sliders,
  Check,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';
import { RiskSettings, BotOperationMode, ExecutionMode } from '../types';
import { SUPPORTED_SYMBOLS } from '../services/marketData';

interface RiskSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: RiskSettings;
  onSave: (newSettings: Partial<RiskSettings>) => void;
  onResetAccount: (balance: number) => void;
}

export const RiskSettingsModal: React.FC<RiskSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSave,
  onResetAccount,
}) => {
  const [settings, setSettings] = useState<RiskSettings>({ ...currentSettings });
  const [resetAmount, setResetAmount] = useState<number>(25000);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const handleToggleSymbol = (symbol: string) => {
    setSettings((prev) => ({
      ...prev,
      activeSymbols: {
        ...prev.activeSymbols,
        [symbol]: !prev.activeSymbols[symbol],
      },
    }));
  };

  const handleApplyPreset = (preset: RiskSettings['strategyPreset']) => {
    if (preset === 'SCALPER_PRO') {
      setSettings((prev) => ({
        ...prev,
        strategyPreset: preset,
        minSignalConfidence: 68,
        riskPercent: 1.0,
        stopLossMode: 'FIXED_PIPS',
        fixedSlPips: 20,
        takeProfitRatio: 1.5,
        trailingStop: true,
        trailingActivationPips: 12,
        trailingStepPips: 8,
        maxOpenPositions: 6,
      }));
    } else if (preset === 'TREND_MOMENTUM') {
      setSettings((prev) => ({
        ...prev,
        strategyPreset: preset,
        minSignalConfidence: 75,
        riskPercent: 1.8,
        stopLossMode: 'ATR_DYNAMIC',
        atrMultiplier: 1.8,
        takeProfitRatio: 2.5,
        trailingStop: true,
        trailingActivationPips: 25,
        trailingStepPips: 18,
        maxOpenPositions: 5,
      }));
    } else if (preset === 'INSTITUTIONAL_SWING') {
      setSettings((prev) => ({
        ...prev,
        strategyPreset: preset,
        minSignalConfidence: 82,
        riskPercent: 2.5,
        stopLossMode: 'ATR_DYNAMIC',
        atrMultiplier: 2.0,
        takeProfitRatio: 3.0,
        trailingStop: false,
        maxOpenPositions: 4,
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        strategyPreset: 'GOLD_CRYPTO_QUANT',
        minSignalConfidence: 75,
        riskPercent: 1.5,
        stopLossMode: 'ATR_DYNAMIC',
        atrMultiplier: 1.5,
        takeProfitRatio: 2.0,
        trailingStop: true,
        trailingActivationPips: 20,
        trailingStepPips: 15,
        maxOpenPositions: 5,
      }));
    }
  };

  const handleSave = () => {
    onSave(settings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const symbolsList = Object.values(SUPPORTED_SYMBOLS).filter(
    (s) => categoryFilter === 'ALL' || s.category === categoryFilter
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto select-none">
      <div className="relative w-full max-w-2xl bg-[#12151f] border border-[#232938] rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#161a25] border-b border-[#232938]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Bot Intelligence & Risk Parameters</h2>
              <p className="text-[11px] text-[#94a3b8]">
                Switch between Autonomous AI Auto-Pilot and Custom manual risk parameters across 22 markets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#232938] text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-200">
          {/* Autonomous vs Manual Mode Selector */}
          <div className="bg-[#151924] p-4 rounded-lg border border-[#232938] space-y-3">
            <span className="font-bold text-slate-100 block">Bot Operation Mode</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, botMode: 'AUTONOMOUS' }))}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  settings.botMode === 'AUTONOMOUS'
                    ? 'bg-gradient-to-r from-purple-950 to-indigo-950 border-purple-500 text-purple-200 font-bold shadow-md'
                    : 'bg-[#0f121a] border-[#1e2330] text-slate-300 hover:bg-[#1a1f2c]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Autonomous AI Pilot</span>
                </div>
                <p className="text-[10px] text-[#94a3b8] font-normal">
                  No manual settings required. Bot analyzes regimes, sizes lots dynamically, and manages SL/TP automatically.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, botMode: 'MANUAL_RISK' }))}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  settings.botMode === 'MANUAL_RISK'
                    ? 'bg-blue-950 border-blue-500 text-blue-200 font-bold shadow-md'
                    : 'bg-[#0f121a] border-[#1e2330] text-slate-300 hover:bg-[#1a1f2c]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span>Custom Risk Mode</span>
                </div>
                <p className="text-[10px] text-[#94a3b8] font-normal">
                  Strictly enforces your custom lot sizes, ATR multipliers, fixed pips, and whitelist filters.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, botMode: 'OFF' }))}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  settings.botMode === 'OFF'
                    ? 'bg-slate-800 border-slate-600 text-white font-bold'
                    : 'bg-[#0f121a] border-[#1e2330] text-[#64748b] hover:bg-[#1a1f2c]'
                }`}
              >
                <div className="font-bold text-xs mb-1">Manual Trading Only</div>
                <p className="text-[10px] text-[#64748b] font-normal">
                  Automated execution paused. Market watch and manual orders only.
                </p>
              </button>
            </div>
          </div>

          {/* Execution Mode (Auto vs Manual Confirm) */}
          <div className="bg-[#151924] p-3.5 rounded-lg border border-[#232938] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-100 block">Trade Execution Mode</span>
              <span className="text-[11px] text-[#94a3b8]">
                Choose whether signals dispatch instantly or require 1-click confirmation
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, executionMode: 'AUTOMATIC' }))}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold border ${
                  settings.executionMode === 'AUTOMATIC'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-[#0f121a] border-[#1e2330] text-[#94a3b8]'
                }`}
              >
                Auto Execute
              </button>
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, executionMode: 'MANUAL_CONFIRM' }))}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold border ${
                  settings.executionMode === 'MANUAL_CONFIRM'
                    ? 'bg-amber-950 border-amber-500 text-amber-300'
                    : 'bg-[#0f121a] border-[#1e2330] text-[#94a3b8]'
                }`}
              >
                Manual Confirm (1-Click)
              </button>
            </div>
          </div>

          {/* Sizing & Risk Controls (Custom Risk Mode) */}
          {settings.botMode === 'MANUAL_RISK' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#151924] p-3.5 rounded-lg border border-[#232938] space-y-3">
                <span className="font-bold text-slate-100 block">Position Sizing Protocol</span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, riskMode: 'PERCENT_EQUITY' }))}
                    className={`flex-1 py-1 rounded text-xs font-medium border ${
                      settings.riskMode === 'PERCENT_EQUITY'
                        ? 'bg-blue-950 border-blue-500 text-blue-300 font-bold'
                        : 'bg-[#0f121a] border-[#1e2330] text-[#94a3b8]'
                    }`}
                  >
                    % Equity Risk
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, riskMode: 'FIXED_LOT' }))}
                    className={`flex-1 py-1 rounded text-xs font-medium border ${
                      settings.riskMode === 'FIXED_LOT'
                        ? 'bg-blue-950 border-blue-500 text-blue-300 font-bold'
                        : 'bg-[#0f121a] border-[#1e2330] text-[#94a3b8]'
                    }`}
                  >
                    Fixed Lot
                  </button>
                </div>

                {settings.riskMode === 'PERCENT_EQUITY' ? (
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono">
                      <span className="text-[#94a3b8]">Max Risk Per Trade:</span>
                      <strong className="text-amber-400">{settings.riskPercent}%</strong>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="5.0"
                      step="0.25"
                      value={settings.riskPercent}
                      onChange={(e) => setSettings((s) => ({ ...s, riskPercent: parseFloat(e.target.value) }))}
                      className="w-full accent-blue-500"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono">
                      <span className="text-[#94a3b8]">Fixed Order Lots:</span>
                      <strong className="text-amber-400">{settings.fixedLotSize.toFixed(2)} Lots</strong>
                    </div>
                    <input
                      type="number"
                      min="0.01"
                      max="10.0"
                      step="0.05"
                      value={settings.fixedLotSize}
                      onChange={(e) => setSettings((s) => ({ ...s, fixedLotSize: parseFloat(e.target.value) || 0.01 }))}
                      className="w-full bg-[#0d0f15] border border-[#232938] px-2.5 py-1.5 rounded text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="bg-[#151924] p-3.5 rounded-lg border border-[#232938] space-y-3">
                <span className="font-bold text-slate-100 block">SL & Take Profit Targets</span>

                <div>
                  <div className="flex justify-between text-[11px] mb-1 font-mono">
                    <span className="text-[#94a3b8]">Dynamic Stop Loss (ATR):</span>
                    <strong className="text-red-400">{settings.atrMultiplier}x ATR</strong>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.25"
                    value={settings.atrMultiplier}
                    onChange={(e) => setSettings((s) => ({ ...s, atrMultiplier: parseFloat(e.target.value) }))}
                    className="w-full accent-red-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1 font-mono">
                    <span className="text-[#94a3b8]">Target Risk-Reward Ratio:</span>
                    <strong className="text-emerald-400">1:{settings.takeProfitRatio}</strong>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
                    {[1.5, 2.0, 2.5, 3.0].map((rr) => (
                      <button
                        key={rr}
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, takeProfitRatio: rr }))}
                        className={`py-1 rounded border ${
                          settings.takeProfitRatio === rr
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-[#0f121a] border-[#1e2330] text-[#94a3b8]'
                        }`}
                      >
                        1:{rr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Asset Whitelist across 22 Markets */}
          <div className="bg-[#151924] p-3.5 rounded-lg border border-[#232938]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-100 block">22-Market Asset Whitelist</span>
              <div className="flex items-center gap-1 text-[10px]">
                {['ALL', 'Commodities', 'Crypto', 'Forex', 'Indices'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategoryFilter(c)}
                    className={`px-2 py-0.5 rounded ${
                      categoryFilter === c ? 'bg-[#2a3245] text-white font-bold' : 'text-[#64748b]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {symbolsList.map((item) => {
                const isActive = settings.activeSymbols[item.symbol] !== false;
                const isGold = item.symbol === 'XAUUSD';

                return (
                  <label
                    key={item.symbol}
                    className={`flex items-center gap-2 p-1.5 rounded border cursor-pointer font-mono text-[11px] ${
                      isActive
                        ? isGold
                          ? 'bg-amber-950/60 border-amber-600/80 text-amber-300'
                          : 'bg-[#1e2433] border-blue-600/80 text-blue-300'
                        : 'bg-[#0f121a] border-[#1e2330] text-[#64748b]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleToggleSymbol(item.symbol)}
                      className="rounded border-[#3b4459] bg-[#0d0f15] text-blue-500 focus:ring-0"
                    />
                    <span>{item.icon}</span>
                    <span className="font-bold">{item.symbol}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Portfolio Reset */}
          <div className="bg-[#151924] p-3.5 rounded-lg border border-[#232938] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-100 block">Reset Account Portfolio</span>
              <span className="text-[11px] text-[#94a3b8]">
                Clear trade history and restart simulation with clean balance
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={resetAmount}
                onChange={(e) => setResetAmount(parseInt(e.target.value))}
                className="bg-[#0d0f15] border border-[#232938] px-2.5 py-1.5 rounded text-slate-200 font-mono text-xs focus:outline-none"
              >
                <option value={10000}>$10,000 USD</option>
                <option value={25000}>$25,000 USD</option>
                <option value={50000}>$50,000 USD</option>
                <option value={100000}>$100,000 USD</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  if (confirm(`Reset account simulation to $${resetAmount.toLocaleString()}?`)) {
                    onResetAccount(resetAmount);
                  }
                }}
                className="px-3 py-1.5 bg-[#232938] hover:bg-red-950 text-slate-300 hover:text-red-300 border border-[#2a3245] rounded text-xs transition-colors flex items-center gap-1 font-mono"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#161a25] border-t border-[#232938]">
          <span className="text-[11px] text-[#64748b] font-mono">
            {settings.botMode === 'AUTONOMOUS'
              ? 'Autonomous AI Pilot active across 22 markets.'
              : 'Custom rule constraints active.'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#1e2433] hover:bg-[#283144] text-slate-300 rounded text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
