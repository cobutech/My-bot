import React, { useState } from 'react';
import {
  Briefcase,
  PieChart,
  History,
  Activity,
  FileText,
  Code2,
  X,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  Trash2,
  Play,
  Square,
} from 'lucide-react';
import { AccountInfo, JournalLog, Order, TradeSignal } from '../types';
import { SUPPORTED_SYMBOLS } from '../services/marketData';

interface MT5ToolboxProps {
  account: AccountInfo;
  openOrders: Order[];
  closedOrders: Order[];
  signals: Record<string, TradeSignal>;
  journalLogs: JournalLog[];
  onCloseOrder: (ticket: number) => void;
  onCloseAll: () => void;
  onExecuteSignal: (signal: TradeSignal) => void;
  onClearLogs: () => void;
  activeSymbol: string;
}

export const MT5Toolbox: React.FC<MT5ToolboxProps> = ({
  account,
  openOrders,
  closedOrders,
  signals,
  journalLogs,
  onCloseOrder,
  onCloseAll,
  onExecuteSignal,
  onClearLogs,
  activeSymbol,
}) => {
  const [activeTab, setActiveTab] = useState<
    'TRADE' | 'EXPOSURE' | 'HISTORY' | 'SIGNALS' | 'JOURNAL' | 'MQL5'
  >('TRADE');
  const [copiedCode, setCopiedCode] = useState(false);

  const totalFloatingProfit = openOrders.reduce((sum, o) => sum + o.profit, 0);

  // MQL5 EA Template Code
  const mql5Code = `//+------------------------------------------------------------------+
//|                                     MT5_QuantBot_Bridge.mq5       |
//|                   Copyright 2026, MT5 Quant Institutional EA     |
//|                         https://ais-gold-crypto-quant.bot        |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, MT5 Quant Systems"
#property link      "https://ais-gold-crypto-quant.bot"
#property version   "4.20"
#property strict

input string WebhookURL = "https://your-domain.app/api/mt5/webhook";
input double MaxRiskPercent = 1.5;
input double ATRMultiplier = 1.5;
input bool EnableGoldBoost = true;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("MT5 QuantBot EA initialized successfully on ", Symbol());
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // Connects to QuantBot Signal Engine via Webhook / REST Bridge
   // Realizes institutional Gold & Crypto algorithmic trade execution
}
`;

  const copyMql5 = () => {
    navigator.clipboard.writeText(mql5Code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col h-64 bg-[#11131a] border-t border-[#232938] text-xs select-none shrink-0">
      {/* Toolbox Tabs Header */}
      <div className="flex items-center justify-between px-2 bg-[#161a25] border-b border-[#232938]">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('TRADE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 font-medium transition-colors ${
              activeTab === 'TRADE'
                ? 'border-blue-500 text-blue-400 bg-[#1e2433]'
                : 'border-transparent text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Trade</span>
            {openOrders.length > 0 && (
              <span className="font-mono text-[10px] bg-blue-900/60 text-blue-300 px-1 rounded">
                {openOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('EXPOSURE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 font-medium transition-colors ${
              activeTab === 'EXPOSURE'
                ? 'border-blue-500 text-blue-400 bg-[#1e2433]'
                : 'border-transparent text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Exposure</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 font-medium transition-colors ${
              activeTab === 'HISTORY'
                ? 'border-blue-500 text-blue-400 bg-[#1e2433]'
                : 'border-transparent text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
            {closedOrders.length > 0 && (
              <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-1 rounded">
                {closedOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('SIGNALS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 font-medium transition-colors ${
              activeTab === 'SIGNALS'
                ? 'border-amber-500 text-amber-400 bg-[#1e2433]'
                : 'border-transparent text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Signals</span>
          </button>

          <button
            onClick={() => setActiveTab('JOURNAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 font-medium transition-colors ${
              activeTab === 'JOURNAL'
                ? 'border-blue-500 text-blue-400 bg-[#1e2433]'
                : 'border-transparent text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Journal</span>
          </button>

          <button
            onClick={() => setActiveTab('MQL5')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 font-medium transition-colors ${
              activeTab === 'MQL5'
                ? 'border-purple-500 text-purple-400 bg-[#1e2433]'
                : 'border-transparent text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span>MQL5 Bridge</span>
          </button>
        </div>

        {/* Action button in toolbox header */}
        {activeTab === 'TRADE' && openOrders.length > 0 && (
          <button
            onClick={onCloseAll}
            className="px-2 py-0.5 text-[11px] bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/80 rounded transition-colors"
          >
            Close All ({openOrders.length})
          </button>
        )}
        {activeTab === 'JOURNAL' && journalLogs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-[#64748b] hover:text-slate-200"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'TRADE' && (
          <div className="min-w-[850px]">
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead>
                <tr className="bg-[#141722] text-[#64748b] uppercase text-[10px] tracking-wider border-b border-[#1e2330]">
                  <th className="py-1 px-2">Ticket</th>
                  <th className="py-1 px-2">Time</th>
                  <th className="py-1 px-2">Type</th>
                  <th className="py-1 px-2 text-right">Volume</th>
                  <th className="py-1 px-2">Symbol</th>
                  <th className="py-1 px-2 text-right">Price</th>
                  <th className="py-1 px-2 text-right">S / L</th>
                  <th className="py-1 px-2 text-right">T / P</th>
                  <th className="py-1 px-2 text-right">Price</th>
                  <th className="py-1 px-2 text-right">Comm</th>
                  <th className="py-1 px-2 text-right">Swap</th>
                  <th className="py-1 px-2 text-right">Profit</th>
                  <th className="py-1 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181c27]">
                {openOrders.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-8 text-center text-[#64748b] font-sans">
                      No open positions. Use One-Click trading or enable Algo Trading to initiate automated trades.
                    </td>
                  </tr>
                ) : (
                  openOrders.map((order) => {
                    const sym = SUPPORTED_SYMBOLS[order.symbol] || SUPPORTED_SYMBOLS.XAUUSD;
                    const isProfit = order.profit >= 0;

                    return (
                      <tr key={order.ticket} className="hover:bg-[#161a25] transition-colors tabular-nums">
                        <td className="py-1.5 px-2 text-slate-300 font-bold">#{order.ticket}</td>
                        <td className="py-1.5 px-2 text-[#94a3b8]">{order.time}</td>
                        <td className="py-1.5 px-2 font-bold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              order.type === 'BUY'
                                ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                          >
                            {order.type}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-right text-slate-200">{order.volume.toFixed(2)}</td>
                        <td className="py-1.5 px-2 text-amber-300 font-bold">{order.symbol}</td>
                        <td className="py-1.5 px-2 text-right text-slate-300">
                          {order.openPrice.toFixed(sym.digits)}
                        </td>
                        <td className="py-1.5 px-2 text-right text-red-400">
                          {order.sl > 0 ? order.sl.toFixed(sym.digits) : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right text-emerald-400">
                          {order.tp > 0 ? order.tp.toFixed(sym.digits) : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right text-white font-bold">
                          {order.currentPrice.toFixed(sym.digits)}
                        </td>
                        <td className="py-1.5 px-2 text-right text-[#64748b]">-${order.commission.toFixed(2)}</td>
                        <td className="py-1.5 px-2 text-right text-[#64748b]">${order.swap.toFixed(2)}</td>
                        <td
                          className={`py-1.5 px-2 text-right font-bold ${
                            isProfit ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {isProfit ? `+$${order.profit.toFixed(2)}` : `-$${Math.abs(order.profit).toFixed(2)}`}
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <button
                            onClick={() => onCloseOrder(order.ticket)}
                            className="p-1 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded transition-colors"
                            title="Close Position (Instant Market Execution)"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'EXPOSURE' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#151924] p-3 rounded border border-[#232938]">
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider block mb-3">
                Asset Allocation Breakdown
              </span>
              <div className="space-y-3 font-mono text-xs">
                {['USD', 'XAUUSD', 'BTCUSDT', 'ETHUSDT'].map((asset) => {
                  const ordersForAsset = openOrders.filter((o) =>
                    asset === 'USD' ? true : o.symbol === asset
                  );
                  const lots = ordersForAsset.reduce((s, o) => s + o.volume, 0);
                  const pct =
                    asset === 'USD'
                      ? Math.max(10, 100 - openOrders.length * 15)
                      : openOrders.length > 0
                      ? Math.round((lots / (openOrders.reduce((s, o) => s + o.volume, 0) || 1)) * 40)
                      : 0;

                  return (
                    <div key={asset}>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span className="font-bold">{asset === 'USD' ? 'USD (Free Capital)' : asset}</span>
                        <span className="tabular-nums text-[#94a3b8]">
                          {asset === 'USD' ? `$${account.freeMargin.toLocaleString()}` : `${lots.toFixed(2)} Lots`} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#0d0f15] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            asset === 'XAUUSD'
                              ? 'bg-amber-400'
                              : asset === 'BTCUSDT'
                              ? 'bg-orange-500'
                              : asset === 'ETHUSDT'
                              ? 'bg-blue-400'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#151924] p-3 rounded border border-[#232938]">
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider block mb-3">
                Risk & Leverage Telemetry
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#0f121a] p-2 rounded border border-[#1e2330]">
                  <span className="text-[10px] text-[#64748b] block">ACCOUNT LEVERAGE</span>
                  <span className="font-bold text-white">1:{account.leverage}</span>
                </div>
                <div className="bg-[#0f121a] p-2 rounded border border-[#1e2330]">
                  <span className="text-[10px] text-[#64748b] block">MARGIN LEVEL</span>
                  <span className="font-bold text-emerald-400">
                    {account.margin > 0 ? `${account.marginLevel.toFixed(1)}%` : '∞ Safe'}
                  </span>
                </div>
                <div className="bg-[#0f121a] p-2 rounded border border-[#1e2330]">
                  <span className="text-[10px] text-[#64748b] block">USED MARGIN</span>
                  <span className="font-bold text-slate-200">${account.margin.toFixed(2)}</span>
                </div>
                <div className="bg-[#0f121a] p-2 rounded border border-[#1e2330]">
                  <span className="text-[10px] text-[#64748b] block">FREE MARGIN</span>
                  <span className="font-bold text-white">${account.freeMargin.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div className="min-w-[850px]">
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead>
                <tr className="bg-[#141722] text-[#64748b] uppercase text-[10px] tracking-wider border-b border-[#1e2330]">
                  <th className="py-1 px-2">Ticket</th>
                  <th className="py-1 px-2">Open Time</th>
                  <th className="py-1 px-2">Close Time</th>
                  <th className="py-1 px-2">Type</th>
                  <th className="py-1 px-2 text-right">Volume</th>
                  <th className="py-1 px-2">Symbol</th>
                  <th className="py-1 px-2 text-right">Open Price</th>
                  <th className="py-1 px-2 text-right">Close Price</th>
                  <th className="py-1 px-2">Exit Reason</th>
                  <th className="py-1 px-2 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181c27]">
                {closedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-[#64748b] font-sans">
                      No closed trade history recorded yet for this session.
                    </td>
                  </tr>
                ) : (
                  closedOrders.map((order) => {
                    const sym = SUPPORTED_SYMBOLS[order.symbol] || SUPPORTED_SYMBOLS.XAUUSD;
                    const isProfit = order.profit >= 0;

                    return (
                      <tr key={order.ticket} className="hover:bg-[#161a25] transition-colors tabular-nums">
                        <td className="py-1.5 px-2 text-slate-300">#{order.ticket}</td>
                        <td className="py-1.5 px-2 text-[#94a3b8]">{order.time}</td>
                        <td className="py-1.5 px-2 text-[#94a3b8]">{order.closeTime || '-'}</td>
                        <td className="py-1.5 px-2 font-bold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              order.type === 'BUY' ? 'text-blue-400' : 'text-red-400'
                            }`}
                          >
                            {order.type}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-right text-slate-200">{order.volume.toFixed(2)}</td>
                        <td className="py-1.5 px-2 text-amber-300 font-bold">{order.symbol}</td>
                        <td className="py-1.5 px-2 text-right text-slate-300">
                          {order.openPrice.toFixed(sym.digits)}
                        </td>
                        <td className="py-1.5 px-2 text-right text-white">
                          {order.closePrice ? order.closePrice.toFixed(sym.digits) : '-'}
                        </td>
                        <td className="py-1.5 px-2">
                          <span className="text-[10px] text-[#94a3b8] bg-[#1a1f2c] px-1.5 py-0.5 rounded">
                            {order.closeReason || 'CLOSED'}
                          </span>
                        </td>
                        <td
                          className={`py-1.5 px-2 text-right font-bold ${
                            isProfit ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {isProfit ? `+$${order.profit.toFixed(2)}` : `-$${Math.abs(order.profit).toFixed(2)}`}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'SIGNALS' && (
          <div className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.values(signals).map((sig) => {
                const sym = SUPPORTED_SYMBOLS[sig.symbol] || SUPPORTED_SYMBOLS.XAUUSD;
                const isBuy = sig.type.includes('BUY');
                const isSell = sig.type.includes('SELL');

                return (
                  <div
                    key={sig.id}
                    className="bg-[#151924] p-3 rounded border border-[#232938] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 font-bold font-mono text-slate-100">
                          <span>{sym.icon}</span>
                          <span className={sig.symbol === 'XAUUSD' ? 'text-amber-400 font-extrabold' : ''}>
                            {sig.symbol}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            isBuy
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : isSell
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {sig.type}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono mb-2 text-slate-300">
                        <div>
                          <span className="text-[#64748b]">Entry:</span> {sig.entryPrice.toFixed(sym.digits)}
                        </div>
                        <div>
                          <span className="text-[#64748b]">Confidence:</span>{' '}
                          <span className="text-amber-400 font-bold">{sig.confidence}%</span>
                        </div>
                        <div>
                          <span className="text-[#64748b]">SL:</span>{' '}
                          <span className="text-red-400">{sig.stopLoss.toFixed(sym.digits)}</span>
                        </div>
                        <div>
                          <span className="text-[#64748b]">TP:</span>{' '}
                          <span className="text-emerald-400">{sig.takeProfit.toFixed(sym.digits)}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-[#94a3b8] mb-3 line-clamp-2">
                        {sig.reasons.join(' · ')}
                      </div>
                    </div>

                    <button
                      onClick={() => onExecuteSignal(sig)}
                      className={`w-full py-1.5 rounded font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 ${
                        isBuy
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : isSell
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Execute Signal (1-Click)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'JOURNAL' && (
          <div className="p-2 space-y-1 font-mono text-[11px]">
            {journalLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 text-slate-300 hover:bg-[#151922] px-2 py-0.5 rounded"
              >
                <span className="text-[#64748b] whitespace-nowrap">{log.timestamp}</span>
                <span
                  className={`px-1 rounded text-[9px] font-bold uppercase whitespace-nowrap ${
                    log.level === 'TRADE'
                      ? 'bg-blue-950 text-blue-400'
                      : log.level === 'SIGNAL'
                      ? 'bg-amber-950 text-amber-400'
                      : log.level === 'WARN'
                      ? 'bg-red-950 text-red-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {log.level}
                </span>
                <span className="break-all">{log.message}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'MQL5' && (
          <div className="p-4 flex flex-col h-full gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-200">MT5 Expert Advisor (EA) Bridge</h4>
                <p className="text-[11px] text-[#94a3b8]">
                  Run this strategy directly inside desktop MetaTrader 5 via automated webhook bridge or MQL5 script.
                </p>
              </div>
              <button
                onClick={copyMql5}
                className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded font-medium"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Copied MQL5!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="flex-1 bg-[#090b10] p-3 rounded border border-[#232938] overflow-auto font-mono text-[11px] text-purple-300">
              <pre>{mql5Code}</pre>
            </div>
          </div>
        )}
      </div>

      {/* MT5 Bottom Account Summary Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#141722] border-t border-[#1e2330] font-mono text-[11px] tabular-nums text-slate-300 overflow-x-auto">
        <div className="flex items-center gap-4">
          <span>
            Balance: <strong className="text-white">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> USD
          </span>
          <span className="text-[#64748b]">·</span>
          <span>
            Equity: <strong className="text-white">${account.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </span>
          <span className="text-[#64748b]">·</span>
          <span>
            Margin: <strong className="text-slate-300">${account.margin.toFixed(2)}</strong>
          </span>
          <span className="text-[#64748b]">·</span>
          <span>
            Free Margin: <strong className="text-white">${account.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </span>
          <span className="text-[#64748b]">·</span>
          <span>
            Margin Level: <strong className="text-emerald-400">{account.margin > 0 ? `${account.marginLevel.toFixed(1)}%` : '0.00%'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span>Floating P/L:</span>
          <strong
            className={`text-xs ${
              totalFloatingProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {totalFloatingProfit >= 0
              ? `+$${totalFloatingProfit.toFixed(2)}`
              : `-$${Math.abs(totalFloatingProfit).toFixed(2)}`}
          </strong>
        </div>
      </div>
    </div>
  );
};
