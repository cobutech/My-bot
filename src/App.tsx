import React, { useState, useEffect, useCallback } from 'react';
import { MT5Header } from './components/MT5Header';
import { MarketWatch } from './components/MarketWatch';
import { MT5Chart } from './components/MT5Chart';
import { MT5Toolbox } from './components/MT5Toolbox';
import { SignalDashboardModal } from './components/SignalDashboardModal';
import { RiskSettingsModal } from './components/RiskSettingsModal';
import { NewOrderModal } from './components/NewOrderModal';
import { marketData, SUPPORTED_SYMBOLS, Tick } from './services/marketData';
import { botEngine } from './services/botEngine';
import { generateSignal } from './services/indicators';
import {
  AccountInfo,
  Candle,
  JournalLog,
  Order,
  PerformanceStats,
  RiskSettings,
  TradeSignal,
} from './types';

// Web Audio API helper for authentic MT5 execution sounds
function playAudioChime(type: 'ORDER_OPEN' | 'ORDER_CLOSE' | 'SIGNAL_ALERT') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'ORDER_OPEN') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'ORDER_CLOSE') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else {
      osc.frequency.setValueAtTime(740, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

export default function App() {
  // Navigation & Viewport State
  const [activeSymbol, setActiveSymbol] = useState<string>('XAUUSD');
  const [activeTimeframe, setActiveTimeframe] = useState<string>('M5');
  const [chartType, setChartType] = useState<'CANDLE' | 'BAR' | 'LINE'>('CANDLE');

  // Indicators Configuration
  const [indicatorsConfig, setIndicatorsConfig] = useState({
    showEma: true,
    showBollinger: true,
    showRsi: true,
    showMacd: false,
  });

  // Real-time market state
  const [ticks, setTicks] = useState<Record<string, Tick>>(() => marketData.getAllTicks());
  const [candles, setCandles] = useState<Candle[]>(() =>
    marketData.getCandles('XAUUSD', 'M5')
  );

  // Bot Engine State
  const [account, setAccount] = useState<AccountInfo>(() => botEngine.getAccount());
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(() => botEngine.getRiskSettings());
  const [openOrders, setOpenOrders] = useState<Order[]>(() => botEngine.getOpenOrders());
  const [closedOrders, setClosedOrders] = useState<Order[]>(() => botEngine.getClosedOrders());
  const [journalLogs, setJournalLogs] = useState<JournalLog[]>(() => botEngine.getJournalLogs());
  const [equityCurve, setEquityCurve] = useState(() => botEngine.getEquityCurve());
  const [stats, setStats] = useState<PerformanceStats>(() => botEngine.getPerformanceStats());

  // Quantitative Signals Map across symbols
  const [signals, setSignals] = useState<Record<string, TradeSignal>>({});

  // Modals
  const [isSignalDashboardOpen, setIsSignalDashboardOpen] = useState<boolean>(false);
  const [isRiskSettingsOpen, setIsRiskSettingsOpen] = useState<boolean>(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState<boolean>(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'SUCCESS' | 'WARN' | 'INFO' } | null>(null);

  const showToast = (message: string, type: 'SUCCESS' | 'WARN' | 'INFO' = 'INFO') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync BotEngine subscriptions
  useEffect(() => {
    const unsubscribeBot = botEngine.subscribe(() => {
      setAccount(botEngine.getAccount());
      setRiskSettings(botEngine.getRiskSettings());
      setOpenOrders(botEngine.getOpenOrders());
      setClosedOrders(botEngine.getClosedOrders());
      setJournalLogs(botEngine.getJournalLogs());
      setEquityCurve(botEngine.getEquityCurve());
      setStats(botEngine.getPerformanceStats());
    });

    return () => unsubscribeBot();
  }, []);

  // Sync real-time MarketData subscriptions
  useEffect(() => {
    const unsubTick = marketData.onTick((newTick) => {
      setTicks((prev) => ({ ...prev, [newTick.symbol]: newTick }));
    });

    const unsubCandle = marketData.onCandleUpdate((sym, tf, updatedCandles) => {
      if (sym === activeSymbol && tf === activeTimeframe) {
        setCandles(updatedCandles);
      }
    });

    return () => {
      unsubTick();
      unsubCandle();
    };
  }, [activeSymbol, activeTimeframe]);

  // When active symbol or timeframe changes, refresh chart candles
  useEffect(() => {
    setCandles(marketData.getCandles(activeSymbol, activeTimeframe));
  }, [activeSymbol, activeTimeframe]);

  // Periodic Signal generation & automated bot evaluation loop
  useEffect(() => {
    const evaluateSignals = () => {
      const newSignals: Record<string, TradeSignal> = {};
      const symbols = Object.keys(SUPPORTED_SYMBOLS);

      for (const sym of symbols) {
        const symCandles = marketData.getCandles(sym, activeTimeframe);
        const info = SUPPORTED_SYMBOLS[sym];
        const sig = generateSignal(
          sym,
          symCandles,
          info.digits,
          riskSettings.atrMultiplier,
          riskSettings.takeProfitRatio
        );
        newSignals[sym] = sig;

        // Feed to Bot Engine for automated trade execution
        if (riskSettings.autoTradingEnabled) {
          botEngine.evaluateSignalForExecution(sig);
        }
      }

      setSignals(newSignals);
    };

    evaluateSignals();
    const interval = setInterval(evaluateSignals, 2500);
    return () => clearInterval(interval);
  }, [activeTimeframe, riskSettings]);

  // Execution Handlers
  const handleExecuteTrade = useCallback(
    (params: { symbol: string; type: 'BUY' | 'SELL'; volume: number; sl?: number; tp?: number }) => {
      const order = botEngine.executeOrder({
        symbol: params.symbol,
        type: params.type,
        volume: params.volume,
        sl: params.sl,
        tp: params.tp,
        isBotExecuted: false,
      });
      playAudioChime('ORDER_OPEN');
      showToast(`Order #${order.ticket} ${order.type} ${order.volume} ${order.symbol} Executed`, 'SUCCESS');
    },
    []
  );

  const handleCloseOrder = useCallback((ticket: number) => {
    const success = botEngine.closeOrder(ticket, 'MANUAL');
    if (success) {
      playAudioChime('ORDER_CLOSE');
      showToast(`Order #${ticket} Closed successfully`, 'INFO');
    }
  }, []);

  const handleCloseAll = useCallback(() => {
    botEngine.closeAllPositions();
    playAudioChime('ORDER_CLOSE');
    showToast(`All open positions closed`, 'WARN');
  }, []);

  const handleToggleAutoTrading = useCallback(() => {
    const newState = !riskSettings.autoTradingEnabled;
    botEngine.updateRiskSettings({ autoTradingEnabled: newState });
    showToast(`MT5 Algo Trading ${newState ? 'Activated (ON)' : 'Deactivated (OFF)'}`, newState ? 'SUCCESS' : 'WARN');
  }, [riskSettings.autoTradingEnabled]);

  const handleSaveRiskSettings = useCallback((newSettings: Partial<RiskSettings>) => {
    botEngine.updateRiskSettings(newSettings);
    showToast(`Manual Risk Settings Updated`, 'SUCCESS');
  }, []);

  const handleResetAccount = useCallback((balance: number) => {
    botEngine.resetAccount(balance);
    showToast(`Account Reset to $${balance.toLocaleString()} USD`, 'INFO');
  }, []);

  const handleExecuteSignal = useCallback(
    (signal: TradeSignal) => {
      const orderType = signal.type.includes('BUY') ? 'BUY' : 'SELL';
      botEngine.executeOrder({
        symbol: signal.symbol,
        type: orderType,
        volume: riskSettings.fixedLotSize,
        openPrice: signal.entryPrice,
        sl: signal.stopLoss,
        tp: signal.takeProfit,
        isBotExecuted: false,
        reasonNote: `Manual Signal Exec: ${signal.type} (${signal.confidence}%)`,
      });
      playAudioChime('ORDER_OPEN');
      showToast(`Signal Order #${signal.symbol} ${orderType} Executed`, 'SUCCESS');
    },
    [riskSettings.fixedLotSize]
  );

  const handleToggleIndicator = (key: 'showEma' | 'showBollinger' | 'showRsi' | 'showMacd') => {
    setIndicatorsConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentTick = ticks[activeSymbol] || {
    symbol: activeSymbol,
    bid: 2736.45,
    ask: 2736.73,
    spread: 0.28,
    time: Date.now(),
    change24h: 0.85,
    high24h: 2750.0,
    low24h: 2715.0,
    tickDirection: 'SAME',
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0d0f15] text-[#e2e8f0]">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-12 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-2xl border font-mono text-xs transition-all animate-in fade-in slide-in-from-top-2 bg-[#161a25] border-[#2a3245] text-slate-100">
          <span
            className={`w-2 h-2 rounded-full ${
              toast.type === 'SUCCESS' ? 'bg-emerald-400' : toast.type === 'WARN' ? 'bg-amber-400' : 'bg-blue-400'
            }`}
          />
          <span>{toast.message}</span>
        </div>
      )}

      {/* MT5 Top Header & Toolbars */}
      <MT5Header
        activeSymbol={activeSymbol}
        activeTimeframe={activeTimeframe}
        onTimeframeChange={setActiveTimeframe}
        chartType={chartType}
        onChartTypeChange={setChartType}
        riskSettings={riskSettings}
        onToggleAutoTrading={handleToggleAutoTrading}
        account={account}
        onOpenSignalDashboard={() => setIsSignalDashboardOpen(true)}
        onOpenRiskSettings={() => setIsRiskSettingsOpen(true)}
        onOpenMQL5Bridge={() => setIsSignalDashboardOpen(true)}
        onOpenNewOrder={() => setIsNewOrderOpen(true)}
        indicatorsConfig={indicatorsConfig}
        onToggleIndicator={handleToggleIndicator}
      />

      {/* Main Workspace: Left Market Watch + Center Interactive MT5 Chart */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Market Watch */}
        <MarketWatch
          activeSymbol={activeSymbol}
          onSelectSymbol={setActiveSymbol}
          ticks={ticks}
          onQuickTrade={(sym, type) => handleExecuteTrade({ symbol: sym, type, volume: riskSettings.fixedLotSize })}
        />

        {/* Center: MT5 Canvas Chart */}
        <MT5Chart
          symbol={activeSymbol}
          timeframe={activeTimeframe}
          candles={candles}
          tick={currentTick}
          openOrders={openOrders}
          chartType={chartType}
          indicatorsConfig={indicatorsConfig}
          onExecuteTrade={handleExecuteTrade}
        />
      </div>

      {/* Bottom Dock: MT5 Toolbox Terminal (Trade, Exposure, History, Signals, Journal, MQL5) */}
      <MT5Toolbox
        account={account}
        openOrders={openOrders}
        closedOrders={closedOrders}
        signals={signals}
        journalLogs={journalLogs}
        onCloseOrder={handleCloseOrder}
        onCloseAll={handleCloseAll}
        onExecuteSignal={handleExecuteSignal}
        onClearLogs={() => setJournalLogs([])}
        activeSymbol={activeSymbol}
      />

      {/* Modals */}
      <SignalDashboardModal
        isOpen={isSignalDashboardOpen}
        onClose={() => setIsSignalDashboardOpen(false)}
        stats={stats}
        equityCurve={equityCurve}
        signals={signals}
        riskSettings={riskSettings}
        activeSymbol={activeSymbol}
        onSelectSymbol={(sym) => {
          setActiveSymbol(sym);
          setIsSignalDashboardOpen(false);
        }}
        onExecuteSignal={handleExecuteSignal}
        onOpenRiskSettings={() => {
          setIsSignalDashboardOpen(false);
          setIsRiskSettingsOpen(true);
        }}
      />

      <RiskSettingsModal
        isOpen={isRiskSettingsOpen}
        onClose={() => setIsRiskSettingsOpen(false)}
        currentSettings={riskSettings}
        onSave={handleSaveRiskSettings}
        onResetAccount={handleResetAccount}
      />

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        activeSymbol={activeSymbol}
        ticks={ticks}
        onExecute={handleExecuteTrade}
      />
    </div>
  );
}
