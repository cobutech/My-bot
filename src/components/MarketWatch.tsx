import React, { useState, useEffect } from 'react';
import { Search, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import { SymbolInfo } from '../types';
import { SUPPORTED_SYMBOLS, Tick } from '../services/marketData';

interface MarketWatchProps {
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  ticks: Record<string, Tick>;
  onQuickTrade: (symbol: string, type: 'BUY' | 'SELL') => void;
}

type CategoryFilter = 'ALL' | 'Commodities' | 'Crypto' | 'Forex' | 'Indices';

export const MarketWatch: React.FC<MarketWatchProps> = ({
  activeSymbol,
  onSelectSymbol,
  ticks,
  onQuickTrade,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [activeTab, setActiveTab] = useState<'WATCHLIST' | 'TICK_DEPTH'>('WATCHLIST');
  const [flashStates, setFlashStates] = useState<Record<string, 'UP' | 'DOWN' | null>>({});

  const symbolsList = Object.values(SUPPORTED_SYMBOLS);

  // Monitor tick changes to trigger green/red flash effect
  useEffect(() => {
    const newFlashes: Record<string, 'UP' | 'DOWN' | null> = {};
    for (const sym of Object.keys(ticks)) {
      const dir = ticks[sym]?.tickDirection;
      if (dir === 'UP' || dir === 'DOWN') {
        newFlashes[sym] = dir;
      }
    }
    setFlashStates(newFlashes);

    const timer = setTimeout(() => {
      setFlashStates({});
    }, 380);

    return () => clearTimeout(timer);
  }, [ticks]);

  const filteredSymbols = symbolsList.filter((s) => {
    const matchesSearch =
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeTick = ticks[activeSymbol] || {
    bid: 0,
    ask: 0,
    spread: 0,
    change24h: 0,
    high24h: 0,
    low24h: 0,
  };
  const activeSymInfo = SUPPORTED_SYMBOLS[activeSymbol] || SUPPORTED_SYMBOLS.XAUUSD;

  return (
    <div className="flex flex-col h-full bg-[#11131a] border-r border-[#232938] text-xs select-none w-80 shrink-0">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161a25] border-b border-[#232938]">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <span>Market Watch</span>
          <span className="text-[10px] text-amber-400 font-mono bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
            22 Markets
          </span>
        </div>
        <div className="flex items-center text-[11px] bg-[#0d0f15] p-0.5 rounded border border-[#232938]">
          <button
            onClick={() => setActiveTab('WATCHLIST')}
            className={`px-2 py-0.5 rounded ${
              activeTab === 'WATCHLIST'
                ? 'bg-[#2a3245] text-amber-300 font-bold'
                : 'text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            Watchlist
          </button>
          <button
            onClick={() => setActiveTab('TICK_DEPTH')}
            className={`px-2 py-0.5 rounded ${
              activeTab === 'TICK_DEPTH'
                ? 'bg-[#2a3245] text-amber-300 font-bold'
                : 'text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            Depth
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-[#141722] border-b border-[#1e2330] overflow-x-auto text-[10px]">
        {(['ALL', 'Commodities', 'Crypto', 'Forex', 'Indices'] as CategoryFilter[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors font-medium ${
              categoryFilter === cat
                ? 'bg-[#2a3245] text-white font-bold'
                : 'text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            {cat === 'ALL' ? 'All (22)' : cat}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-[#1e2330]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search 22 symbols (Gold, BTC, US30)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d0f15] text-slate-200 placeholder-[#64748b] text-[11px] pl-8 pr-2.5 py-1.5 rounded border border-[#232938] focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {activeTab === 'WATCHLIST' ? (
        /* Symbols Table */
        <div className="flex-1 overflow-y-auto">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-2.5 py-1 text-[10px] font-semibold text-[#64748b] border-b border-[#1e2330] bg-[#141722] uppercase tracking-wider sticky top-0 z-10">
            <span className="col-span-4">Symbol</span>
            <span className="col-span-3 text-right">Bid</span>
            <span className="col-span-3 text-right">Ask</span>
            <span className="col-span-2 text-right">!</span>
          </div>

          <div className="divide-y divide-[#181c27]">
            {filteredSymbols.map((item) => {
              const tick = ticks[item.symbol];
              const isSelected = activeSymbol === item.symbol;
              const flash = flashStates[item.symbol];

              const bidDisplay = tick ? tick.bid.toFixed(item.digits) : item.basePrice.toFixed(item.digits);
              const askDisplay = tick ? tick.ask.toFixed(item.digits) : (item.basePrice + 0.5).toFixed(item.digits);
              const change = tick ? tick.change24h : 0;
              const isGold = item.symbol === 'XAUUSD';

              return (
                <div
                  key={item.symbol}
                  onClick={() => onSelectSymbol(item.symbol)}
                  className={`grid grid-cols-12 items-center px-2.5 py-1.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#1e2433] border-l-2 border-blue-500'
                      : 'hover:bg-[#151922]'
                  } ${
                    flash === 'UP'
                      ? 'bg-emerald-950/40 text-emerald-300'
                      : flash === 'DOWN'
                      ? 'bg-red-950/40 text-red-300'
                      : ''
                  }`}
                >
                  {/* Symbol Name & Category Tag */}
                  <div className="col-span-4 flex flex-col min-w-0 pr-1">
                    <div className="flex items-center gap-1 font-mono font-bold text-slate-200 truncate">
                      <span>{item.icon}</span>
                      <span className={isGold ? 'text-amber-400 font-extrabold' : ''}>{item.symbol}</span>
                    </div>
                    <span className="text-[9px] text-[#64748b] truncate font-sans">
                      {item.category}
                    </span>
                  </div>

                  {/* Bid */}
                  <div
                    className={`col-span-3 text-right font-mono font-medium text-[11px] tabular-nums ${
                      flash === 'UP'
                        ? 'text-emerald-400 font-bold'
                        : flash === 'DOWN'
                        ? 'text-red-400 font-bold'
                        : 'text-slate-200'
                    }`}
                  >
                    {bidDisplay}
                  </div>

                  {/* Ask */}
                  <div
                    className={`col-span-3 text-right font-mono font-medium text-[11px] tabular-nums ${
                      flash === 'UP'
                        ? 'text-emerald-400 font-bold'
                        : flash === 'DOWN'
                        ? 'text-red-400 font-bold'
                        : 'text-slate-200'
                    }`}
                  >
                    {askDisplay}
                  </div>

                  {/* 24h Change Tag */}
                  <div className="col-span-2 text-right">
                    <span
                      className={`inline-block font-mono text-[9px] tabular-nums font-semibold px-1 py-0.5 rounded ${
                        change >= 0
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50'
                          : 'bg-red-950 text-red-400 border border-red-900/50'
                      }`}
                    >
                      {change >= 0 ? `+${change}%` : `${change}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Market Depth / Quick Trade Card */
        <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto">
          <div className="p-3 bg-[#151924] rounded border border-[#232938]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200 font-mono flex items-center gap-1.5 text-sm">
                <span>{activeSymInfo.icon}</span>
                {activeSymbol}
              </span>
              <span className="text-[10px] text-[#94a3b8] font-mono">Spread: {activeSymInfo.spreadPoints} pts</span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-3">
              <div className="bg-[#10131c] p-2 rounded border border-[#1e2330] text-center">
                <span className="text-[10px] text-[#64748b] block mb-1">BID</span>
                <span className="font-mono text-base font-bold text-red-400 tabular-nums">
                  {activeTick.bid.toFixed(activeSymInfo.digits)}
                </span>
              </div>
              <div className="bg-[#10131c] p-2 rounded border border-[#1e2330] text-center">
                <span className="text-[10px] text-[#64748b] block mb-1">ASK</span>
                <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                  {activeTick.ask.toFixed(activeSymInfo.digits)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onQuickTrade(activeSymbol, 'SELL')}
                className="py-2 px-3 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-bold rounded flex items-center justify-center gap-1 transition-all shadow-sm"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>SELL</span>
              </button>
              <button
                onClick={() => onQuickTrade(activeSymbol, 'BUY')}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold rounded flex items-center justify-center gap-1 transition-all shadow-sm"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>BUY</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#151924] rounded border border-[#232938] text-[11px] font-mono">
            <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">
              Market Specifications
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Category:</span>
                <span className="text-white font-bold">{activeSymInfo.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Contract Size:</span>
                <span className="tabular-nums">{activeSymInfo.contractSize} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Min Lot:</span>
                <span className="tabular-nums">{activeSymInfo.minLot} Lots</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Bridge Routing:</span>
                <span className="text-purple-400 font-bold">Python MT5 Direct</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="px-3 py-1.5 bg-[#0f121a] border-t border-[#1e2330] text-[10px] text-[#64748b] flex justify-between font-mono">
        <span>{filteredSymbols.length} / 22 Markets Listed</span>
        <span className="text-emerald-400 font-semibold">Feed: Active</span>
      </div>
    </div>
  );
};
