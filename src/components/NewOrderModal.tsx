import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ShieldAlert, DollarSign } from 'lucide-react';
import { SUPPORTED_SYMBOLS, Tick } from '../services/marketData';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSymbol: string;
  ticks: Record<string, Tick>;
  onExecute: (params: {
    symbol: string;
    type: 'BUY' | 'SELL';
    volume: number;
    sl?: number;
    tp?: number;
  }) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  activeSymbol,
  ticks,
  onExecute,
}) => {
  const [symbol, setSymbol] = useState<string>(activeSymbol);
  const [volume, setVolume] = useState<number>(0.1);
  const [slPips, setSlPips] = useState<number>(30);
  const [tpPips, setTpPips] = useState<number>(60);
  const [useSl, setUseSl] = useState<boolean>(true);
  const [useTp, setUseTp] = useState<boolean>(true);

  if (!isOpen) return null;

  const symInfo = SUPPORTED_SYMBOLS[symbol] || SUPPORTED_SYMBOLS.XAUUSD;
  const currentTick = ticks[symbol] || { bid: symInfo.basePrice, ask: symInfo.basePrice + 0.5 };

  // Calculate actual SL / TP prices
  const slDist = slPips * symInfo.pipSize;
  const tpDist = tpPips * symInfo.pipSize;

  const buySl = Number((currentTick.ask - slDist).toFixed(symInfo.digits));
  const buyTp = Number((currentTick.ask + tpDist).toFixed(symInfo.digits));
  const sellSl = Number((currentTick.bid + slDist).toFixed(symInfo.digits));
  const sellTp = Number((currentTick.bid - tpDist).toFixed(symInfo.digits));

  // Risk and Reward approximations ($)
  const estRisk = (slDist * volume * symInfo.contractSize).toFixed(2);
  const estReward = (tpDist * volume * symInfo.contractSize).toFixed(2);

  const handleExecute = (type: 'BUY' | 'SELL') => {
    const sl = useSl ? (type === 'BUY' ? buySl : sellSl) : 0;
    const tp = useTp ? (type === 'BUY' ? buyTp : sellTp) : 0;

    onExecute({
      symbol,
      type,
      volume,
      sl,
      tp,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto select-none">
      <div className="relative w-full max-w-md bg-[#131620] border border-[#232938] rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#171b26] border-b border-[#232938]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 text-sm">Order Execution (F9)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              Instant ECN
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#232938] text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs font-mono">
          {/* Symbol Select */}
          <div>
            <label className="text-[10px] text-[#64748b] uppercase tracking-wider block mb-1">
              Symbol Asset:
            </label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-[#0d0f15] border border-[#232938] px-3 py-2 rounded text-slate-100 font-bold focus:outline-none focus:border-blue-500"
            >
              {Object.values(SUPPORTED_SYMBOLS).map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.icon} {s.symbol} — {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Volume / Lots */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] text-[#64748b] uppercase tracking-wider">
                Volume (Lots):
              </label>
              <span className="text-[10px] text-[#94a3b8]">
                Min: {symInfo.minLot} · Max: {symInfo.maxLot}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {['0.01', '0.05', '0.10', '0.50', '1.00'].map((lot) => (
                <button
                  key={lot}
                  type="button"
                  onClick={() => setVolume(parseFloat(lot))}
                  className={`flex-1 py-1 text-[11px] rounded border ${
                    volume === parseFloat(lot)
                      ? 'bg-blue-950 border-blue-500 text-blue-300 font-bold'
                      : 'bg-[#0f121a] border-[#1e2330] text-[#94a3b8]'
                  }`}
                >
                  {lot}
                </button>
              ))}
            </div>
            <input
              type="number"
              step={symInfo.lotStep}
              min={symInfo.minLot}
              max={symInfo.maxLot}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value) || symInfo.minLot)}
              className="w-full mt-2 bg-[#0d0f15] border border-[#232938] px-3 py-1.5 rounded text-white font-bold text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Stop Loss & Take Profit */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 bg-[#0f121a] rounded border border-[#1e2330]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-red-400 font-bold text-[11px]">Stop Loss</span>
                <input
                  type="checkbox"
                  checked={useSl}
                  onChange={(e) => setUseSl(e.target.checked)}
                  className="rounded text-red-500"
                />
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="5"
                  max="500"
                  disabled={!useSl}
                  value={slPips}
                  onChange={(e) => setSlPips(parseInt(e.target.value) || 10)}
                  className="w-16 bg-[#161a25] border border-[#232938] px-2 py-1 rounded text-white text-xs disabled:opacity-40"
                />
                <span className="text-[#64748b] text-[10px]">pips</span>
              </div>
              <span className="text-[10px] text-red-400 block mt-1">Est. Risk: -${estRisk}</span>
            </div>

            <div className="p-2.5 bg-[#0f121a] rounded border border-[#1e2330]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-emerald-400 font-bold text-[11px]">Take Profit</span>
                <input
                  type="checkbox"
                  checked={useTp}
                  onChange={(e) => setUseTp(e.target.checked)}
                  className="rounded text-emerald-500"
                />
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="5"
                  max="1000"
                  disabled={!useTp}
                  value={tpPips}
                  onChange={(e) => setTpPips(parseInt(e.target.value) || 20)}
                  className="w-16 bg-[#161a25] border border-[#232938] px-2 py-1 rounded text-white text-xs disabled:opacity-40"
                />
                <span className="text-[#64748b] text-[10px]">pips</span>
              </div>
              <span className="text-[10px] text-emerald-400 block mt-1">Est. Profit: +${estReward}</span>
            </div>
          </div>

          {/* Live Price Display & Execution Buttons */}
          <div className="pt-2">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center p-2 bg-[#1a1318] rounded border border-red-950/80">
                <span className="text-[9px] text-[#94a3b8] block">BID PRICE</span>
                <span className="text-base font-bold text-red-400 tabular-nums">
                  {currentTick.bid.toFixed(symInfo.digits)}
                </span>
              </div>
              <div className="text-center p-2 bg-[#101b16] rounded border border-emerald-950/80">
                <span className="text-[9px] text-[#94a3b8] block">ASK PRICE</span>
                <span className="text-base font-bold text-emerald-400 tabular-nums">
                  {currentTick.ask.toFixed(symInfo.digits)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleExecute('SELL')}
                className="py-3 px-3 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-bold rounded-lg transition-all flex flex-col items-center justify-center shadow-lg"
              >
                <div className="flex items-center gap-1 text-sm font-extrabold">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>SELL by Market</span>
                </div>
                <span className="text-[10px] text-red-200 mt-0.5">
                  {volume} {symbol}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleExecute('BUY')}
                className="py-3 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold rounded-lg transition-all flex flex-col items-center justify-center shadow-lg"
              >
                <div className="flex items-center gap-1 text-sm font-extrabold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>BUY by Market</span>
                </div>
                <span className="text-[10px] text-emerald-200 mt-0.5">
                  {volume} {symbol}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
