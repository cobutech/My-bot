import React, { useState } from 'react';
import {
  X,
  Shield,
  Sliders,
  AlertTriangle,
  Check,
  RefreshCw,
  Zap,
  Lock,
  Layers,
} from 'lucide-react';
import { RiskSettings } from '../types';
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
        maxOpenPositions: 4,
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
        maxOpenPositions: 3,
      }));
    } else {
      // Default GOLD_CRYPTO_QUANT
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
        maxOpenPositions: 4,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#12151f] border border-[#232938] rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#161a25] border-b border-[#232938]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Manual Risk Management & Execution Control</h2>
              <p className="text-[11px] text-[#94a3b8]">
                Configure automated position sizing, stop loss protocols, and portfolio circuit breakers
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

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-200">
          {/* Strategy Presets */}
          <div className="bg-[#151924] p-3.5 rounded-lg border border-[#232938]">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-2">
              Algorithmic Strategy Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'GOLD_CRYPTO_QUANT', label: 'Gold/Crypto Quant', desc: 'Balanced ECN' },
                { id: 'SCALPER_PRO', label: 'Scalper Pro', desc: 'Fast M1/M5' },
                { id: 'TREND_MOMENTUM', label: 'Trend Swing', desc: 'EMA/MACD' },
                { id: 'INSTITUTIONAL_SWING', label: 'Inst. Swing', desc: 'High R:R' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id as any)}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    settings.strategyPreset === p.id
                      ? 'bg-blue-950 border-blue-500 text-blue-300 font-bold'
                      : 'bg-[#0f121a] border-[#1e2330] text-slate-300 hover:bg-[#1a1f2c]'
                  }`}
                >
                  <span className="block text-xs font-mono">{p.label}</span>
                  <span className="block text-[10px] text-[#64748b]">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Master Execution Switch */}
          <div className="flex items-center justify-between p-3.5 bg-[#151924] rounded-lg border border-[#232938]">
            <div>
              <span className="font-bold text-slate-100 block">MT5 Auto-Trading Master Switch</span>
              <span className="text-[11px] text-[#94a3b8]">
                When enabled, high-conviction signals automatically trigger instant market orders
              </span>
            </div>

            <button
              onClick={() => setSettings((s) => ({ ...s, autoTradingEnabled: !s.autoTradingEnabled }))}
              className={`px-4 py-1.5 rounded-lg font-bold font-mono text-xs transition-colors ${
                settings.autoTradingEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {settings.autoTradingEnabled ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
            </button>
          </div>

          {/* Sizing & Risk Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Position Sizing Mode */}
            <div className="bg-[#151924] p-3.5 rounded-lg border border-[#232938] space-y-3">
              <span className="font-bold text-slate-100 block">Position Sizing Protocol</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSettings((s) => ({ ...s, riskMode: 'PERCENT_EQUITY' }))}
                  className={`flex-1 py-1.5 rounded text-xs font-medium border ${
                    settings.riskMode === 'PERCENT_EQUITY'
                      ? 'bg-blue-950 border-blue-500 text-blue-300 font-bold'
                      : 'bg-[#0f121a] border-[#1e2330] text-[#94a3b8]'
                  }`}
                >
                  % Equity Risk (Recommended)
                </button>
                <button
                  onClick={() => setSettings((s) => ({ ...s, riskMode: 'FIXED_LOT' }))}
                  className={`flex-1 py-1.5 rounded text-xs font-medium border ${
                    settings.riskMode === 'FIXED_LOT'
                      ? 'bg-blue-950 border-blue-500 text-blue-300 font-bold'
                      : 'bg-[#0f121a] border-[#1e2330] text-[#94a3b8]'
                  }`}
                >
                  Fixed Lot Size
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
                  <span className="text-[10px] text-[#64748b]">
                    Lots are dynamically calculated from distance to Stop Loss.
                  </span>
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

            {/* Stop Loss & Take Profit Target */}
            <div className="bg-[#151924] p-3.5 rounded-lg border border-[#232938] space-y-3">
              <span className="font-bold text-slate-100 block">SL & Take Profit Protocol</span>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-mono">
                  <span className="text-[#94a3b8]">Dynamic Stop Loss (ATR Multiplier):</span>
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

          {/* Trailing Stop Settings */}
          <div className="bg-[#151924] p-3.5 rounded-lg border border-[#232938] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-100 block">Dynamic Trailing Stop Loss</span>
                <span className="text-[11px] text-[#94a3b8]">
                  Locks in profits by automatically sliding SL in the trade direction as price moves favorably
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.trailingStop}
                onChange={(e) => setSettings((s) => ({ ...s, trailingStop: e.target.checked }))}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0"
              />
            </div>

            {settings.trailingStop && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1e2330] font-mono">
                <div>
                  <span className="text-[10px] text-[#64748b] block mb-1">ACTIVATION DISTANCE</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={settings.trailingActivationPips}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, trailingActivationPips: parseInt(e.target.value) || 10 }))
                      }
                      className="w-20 bg-[#0d0f15] border border-[#232938] px-2 py-1 rounded text-white"
                    />
                    <span className="text-[#94a3b8]">pips profit</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748b] block mb-1">TRAILING STEP DISTANCE</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={settings.trailingStepPips}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, trailingStepPips: parseInt(e.target.value) || 10 }))
                      }
                      className="w-20 bg-[#0d0f15] border border-[#232938] px-2 py-1 rounded text-white"
                    />
                    <span className="text-[#94a3b8]">pips step</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Circuit Breakers & Asset Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Drawdown breaker */}
            <div className="bg-[#151924] p-3.5 rounded-lg border border-[#232938] space-y-2">
              <span className="font-bold text-slate-100 block">Daily Drawdown Circuit Breaker</span>
              <p className="text-[11px] text-[#94a3b8]">
                Auto-pauses bot if session equity drawdown reaches threshold
              </p>
              <div className="flex items-center gap-2 font-mono">
                <input
                  type="number"
                  min="2"
                  max="15"
                  value={settings.maxDailyDrawdownPercent}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, maxDailyDrawdownPercent: parseFloat(e.target.value) || 5 }))
                  }
                  className="w-16 bg-[#0d0f15] border border-[#232938] px-2 py-1 rounded text-red-400 font-bold"
                />
                <span className="text-slate-300">% max equity drop</span>
              </div>
            </div>

            {/* Max concurrent positions */}
            <div className="bg-[#151924] p-3.5 rounded-lg border border-[#232938] space-y-2">
              <span className="font-bold text-slate-100 block">Max Concurrent Open Positions</span>
              <p className="text-[11px] text-[#94a3b8]">
                Caps exposure to prevent margin exhaustion across pairs
              </p>
              <div className="flex items-center gap-2 font-mono">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxOpenPositions}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, maxOpenPositions: parseInt(e.target.value) || 4 }))
                  }
                  className="w-16 bg-[#0d0f15] border border-[#232938] px-2 py-1 rounded text-amber-400 font-bold"
                />
                <span className="text-slate-300">positions maximum</span>
              </div>
            </div>
          </div>

          {/* Active Asset Whitelist */}
          <div className="bg-[#151924] p-3.5 rounded-lg border border-[#232938]">
            <span className="font-bold text-slate-100 block mb-2">Automated Trading Asset Whitelist</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(SUPPORTED_SYMBOLS).map((item) => {
                const isActive = settings.activeSymbols[item.symbol] !== false;
                const isGold = item.symbol === 'XAUUSD';

                return (
                  <label
                    key={item.symbol}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer font-mono text-xs ${
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

          {/* Portfolio Reset Section */}
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

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#161a25] border-t border-[#232938]">
          <span className="text-[11px] text-[#64748b] font-mono">
            Modifications apply immediately to algorithmic execution loop.
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
                <span>Save Risk Settings</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
