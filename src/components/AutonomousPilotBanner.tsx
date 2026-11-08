import React from 'react';
import { Cpu, Zap, CheckCircle2, Play, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TradeSignal, RiskSettings } from '../types';
import { SUPPORTED_SYMBOLS } from '../services/marketData';

interface AutonomousPilotBannerProps {
  riskSettings: RiskSettings;
  pendingApprovals: TradeSignal[];
  onApproveOrder: (signal: TradeSignal) => void;
  onDismissApproval: (symbol: string) => void;
  onOpenSignalDashboard: () => void;
}

export const AutonomousPilotBanner: React.FC<AutonomousPilotBannerProps> = ({
  riskSettings,
  pendingApprovals,
  onApproveOrder,
  onDismissApproval,
  onOpenSignalDashboard,
}) => {
  if (riskSettings.botMode !== 'AUTONOMOUS') return null;

  return (
    <div className="bg-[#121622] border-b border-[#232938] px-3 py-1.5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs select-none">
      {/* Left: Autonomous Engine Status */}
      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-bold text-[11px] whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>AUTONOMOUS ENGINE: SCANNING 22 MARKETS</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#94a3b8] font-mono">
          <span>·</span>
          <span>Regime Detection: <strong className="text-emerald-400">Multi-Asset Volatility Scaling</strong></span>
          <span>·</span>
          <span>Execution: <strong className="text-white">{riskSettings.executionMode}</strong></span>
        </div>
      </div>

      {/* Right: Pending Autonomous Approvals (if in Manual Confirm Mode) */}
      {pendingApprovals.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto justify-end">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider whitespace-nowrap">
            1-Click Approval:
          </span>
          {pendingApprovals.slice(0, 2).map((sig) => {
            const sym = SUPPORTED_SYMBOLS[sig.symbol] || SUPPORTED_SYMBOLS.XAUUSD;
            const isBuy = sig.type.includes('BUY');
            const autoLots = sig.autonomousDecision?.autoLotSize || 0.15;

            return (
              <div
                key={sig.symbol}
                className="flex items-center gap-1.5 bg-[#1a1f2c] border border-amber-500/50 rounded px-2 py-0.5 font-mono text-[11px]"
              >
                <span className="font-bold text-white">{sig.symbol}</span>
                <span className={isBuy ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {isBuy ? 'BUY' : 'SELL'} {autoLots}L
                </span>
                <button
                  onClick={() => onApproveOrder(sig)}
                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[10px] transition-colors flex items-center gap-0.5"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Execute</span>
                </button>
                <button
                  onClick={() => onDismissApproval(sig.symbol)}
                  className="p-0.5 text-[#64748b] hover:text-red-400 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-[#64748b]">
          <span>Gold, Crypto, Forex & Indices continuous tick stream evaluated</span>
          <button
            onClick={onOpenSignalDashboard}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Inspect Autonomous Decisions
          </button>
        </div>
      )}
    </div>
  );
};
