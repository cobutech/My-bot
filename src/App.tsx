import React, { useState, useEffect, useCallback } from 'react';
import { MT5Header } from './components/MT5Header';
import { MarketWatch } from './components/MarketWatch';
import { MT5Chart } from './components/MT5Chart';
import { MT5Toolbox } from './components/MT5Toolbox';
import { SignalDashboardModal } from './components/SignalDashboardModal';
import { RiskSettingsModal } from './components/RiskSettingsModal';
import { NewOrderModal } from './components/NewOrderModal';
import { PythonBridgeModal } from './components/PythonBridgeModal';
import { MT5LoginModal } from './components/MT5LoginModal';
import { AutonomousPilotBanner } from './components/AutonomousPilotBanner';
import { marketData, SUPPORTED_SYMBOLS, Tick } from './services/marketData';
import { botEngine } from './services/botEngine';
import { generateSignal } from './services/indicators';
import {
  AccountInfo,
  Candle,
  JournalLog,
  Order,
  PerformanceStats,
  PythonBridgeStatus,
  RiskSettings,
  TradeSignal,
  BotOperationMode,
  ExecutionMode,
  BrokerLoginCredentials,
} from './types';

function playAudioChime(type: 'ORDER_OPEN' | 'ORDER_CLOSE' | 'SIGNAL_ALERT') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'ORDER_OPEN') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
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
    // restricted until gesture
  }
}

export default function App() {
  // Navigation & Viewport State
  const [activeSymbol, setActiveSymbol] = useState<string>('EURUSD');
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
    marketData.getCandles('EURUSD', 'M5')
  );

  // Bot Engine State
  const [account, setAccount] = useState<AccountInfo>(() => botEngine.getAccount());
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(() => botEngine.getRiskSettings());
  const [openOrders, setOpenOrders] = useState<Order[]>(() => botEngine.getOpenOrders());
  const [closedOrders, setClosedOrders] = useState<Order[]>(() => botEngine.getClosedOrders());
  const [journalLogs, setJournalLogs] = useState<JournalLog[]>(() => botEngine.getJournalLogs());
  const [equityCurve, setEquityCurve] = useState(() => botEngine.getEquityCurve());
  const [stats, setStats] = useState<PerformanceStats>(() => botEngine.getPerformanceStats());
  const [bridgeStatus, setBridgeStatus] = useState<PythonBridgeStatus>(() => botEngine.getBridgeStatus());
  const [pendingApprovals, setPendingApprovals] = useState<TradeSignal[]>(() => botEngine.getPendingApprovals());

  // Quantitative Signals Map across all 20 symbols
  const [signals, setSignals] = useState<Record<string, TradeSignal>>({});

  // Modals
  const [isSignalDashboardOpen, setIsSignalDashboardOpen] = useState<boolean>(false);
  const [isRiskSettingsOpen, setIsRiskSettingsOpen] = useState<boolean>(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState<boolean>(false);
  const [isPythonBridgeOpen, setIsPythonBridgeOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'SUCCESS' | 'WARN' | 'INFO' } | null>(null);

  const showToast = (message: string, type: 'SUCCESS' | 'WARN' | 'INFO' = 'INFO') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync BotEngine state
  useEffect(() => {
    const unsubscribeBot = botEngine.subscribe(() => {
      setAccount(botEngine.getAccount());
      setRiskSettings(botEngine.getRiskSettings());
      setOpenOrders(botEngine.getOpenOrders());
      setClosedOrders(botEngine.getClosedOrders());
      setJournalLogs(botEngine.getJournalLogs());
      setEquityCurve(botEngine.getEquityCurve());
      setStats(botEngine.getPerformanceStats());
      setBridgeStatus(botEngine.getBridgeStatus());
      setPendingApprovals(botEngine.getPendingApprovals());
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

  useEffect(() => {
    setCandles(marketData.getCandles(activeSymbol, activeTimeframe));
  }, [activeSymbol, activeTimeframe]);

  // Periodic Signal generation & automated bot evaluation loop across 20 markets
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

        // Feed to Bot Engine for Autonomous or Rule-based trade execution
        if (riskSettings.botMode !== 'OFF') {
          botEngine.evaluateSignalForExecution(sig);
        }
      }

      setSignals(newSignals);
    };

    evaluateSignals();
    const interval = setInterval(evaluateSignals, 2200);
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
      showToast(`Order #${order.ticket} ${order.type} ${order.volume} ${order.symbol} Dispatched to MT5`, 'SUCCESS');
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

  const handleChangeBotMode = useCallback((mode: BotOperationMode) => {
    botEngine.updateRiskSettings({ botMode: mode, autoTradingEnabled: mode !== 'OFF' });
    showToast(
      mode === 'AUTONOMOUS'
        ? 'Autonomous AI Pilot Activated (Scanning 20 Markets)'
        : mode === 'MANUAL_RISK'
        ? 'Custom Risk Mode Enabled'
        : 'Bot Paused (Manual Trading Only)',
      'SUCCESS'
    );
  }, []);

  const handleChangeExecutionMode = useCallback((mode: ExecutionMode) => {
    botEngine.updateRiskSettings({ executionMode: mode });
    showToast(`Execution Mode: ${mode === 'AUTOMATIC' ? 'Instant Auto-Execution' : '1-Click Manual Confirm'}`, 'INFO');
  }, []);

  const handleSaveRiskSettings = useCallback((newSettings: Partial<RiskSettings>) => {
    botEngine.updateRiskSettings(newSettings);
    showToast(`Risk Controls & Whitelist Saved`, 'SUCCESS');
  }, []);

  const handleResetAccount = useCallback((balance: number) => {
    botEngine.resetAccount(balance);
    showToast(`Account Reset to $${balance.toLocaleString()} USD`, 'INFO');
  }, []);

  const handleExecuteSignal = useCallback(
    (signal: TradeSignal) => {
      const orderType = signal.type.includes('BUY') ? 'BUY' : 'SELL';
      const volume =
        riskSettings.botMode === 'AUTONOMOUS'
          ? signal.autonomousDecision?.autoLotSize || 0.1
          : riskSettings.fixedLotSize;

      botEngine.executeOrder({
        symbol: signal.symbol,
        type: orderType,
        volume,
        openPrice: signal.entryPrice,
        sl: signal.stopLoss,
        tp: signal.takeProfit,
        isBotExecuted: false,
        reasonNote: `Signal Execution: ${signal.type} (${signal.confidence}%)`,
      });
      playAudioChime('ORDER_OPEN');
      showToast(`Order #${signal.symbol} ${orderType} ${volume}L Dispatched to MT5`, 'SUCCESS');
    },
    [riskSettings.botMode, riskSettings.fixedLotSize]
  );

  const handleApproveOrder = useCallback(
    (signal: TradeSignal) => {
      handleExecuteSignal(signal);
      botEngine.dismissPendingApproval(signal.symbol);
    },
    [handleExecuteSignal]
  );

  const handleToggleIndicator = (key: 'showEma' | 'showBollinger' | 'showRsi' | 'showMacd') => {
    setIndicatorsConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSimulateBridgeConnect = async () => {
    try {
      await fetch('/api/bridge/toggle-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'PYTHON_MT5' }),
      });
      playAudioChime('SIGNAL_ALERT');
      showToast('Python MT5 Bridge Connection Ping Verified (1.2ms)', 'SUCCESS');
    } catch {
      showToast('Bridge ping simulated', 'INFO');
    }
  };

  // Submit broker login credentials
  const handleLoginSubmit = async (creds: BrokerLoginCredentials) => {
    try {
      const res = await fetch('/api/bridge/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });

      if (!res.ok) {
        throw new Error('Login failed');
      }

      botEngine.updateAccountCredentials({
        broker: creds.broker,
        server: creds.server,
        login: creds.login,
        leverage: creds.leverage,
      });

      playAudioChime('SIGNAL_ALERT');
      showToast(`Logged into MT5 #${creds.login} on ${creds.server}`, 'SUCCESS');
    } catch (e) {
      showToast('Login failed. Please check broker server and credentials.', 'WARN');
    }
  };

  const currentTick = ticks[activeSymbol] || {
    symbol: activeSymbol,
    bid: 1.0542,
    ask: 1.05428,
    spread: 0.00008,
    time: Date.now(),
    change24h: 0.25,
    high24h: 1.058,
    low24h: 1.051,
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
        onChangeBotMode={handleChangeBotMode}
        onChangeExecutionMode={handleChangeExecutionMode}
        account={account}
        bridgeStatus={bridgeStatus}
        onOpenSignalDashboard={() => setIsSignalDashboardOpen(true)}
        onOpenRiskSettings={() => setIsRiskSettingsOpen(true)}
        onOpenPythonBridge={() => setIsPythonBridgeOpen(true)}
        onOpenNewOrder={() => setIsNewOrderOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        indicatorsConfig={indicatorsConfig}
        onToggleIndicator={handleToggleIndicator}
      />

      {/* Autonomous Bot Banner & Pending Approvals Strip */}
      <AutonomousPilotBanner
        riskSettings={riskSettings}
        pendingApprovals={pendingApprovals}
        onApproveOrder={handleApproveOrder}
        onDismissApproval={(sym) => botEngine.dismissPendingApproval(sym)}
        onOpenSignalDashboard={() => setIsSignalDashboardOpen(true)}
      />

      {/* Main Workspace: Left Market Watch (20 clean symbols) + Center Interactive MT5 Chart */}
      <div className="flex-1 flex overflow-hidden">
        <MarketWatch
          activeSymbol={activeSymbol}
          onSelectSymbol={setActiveSymbol}
          ticks={ticks}
          onQuickTrade={(sym, type) => handleExecuteTrade({ symbol: sym, type, volume: riskSettings.fixedLotSize })}
        />

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

      {/* Bottom Dock: MT5 Toolbox Terminal (Trade, Exposure, History, Signals, Journal, Python Bridge) */}
      <MT5Toolbox
        account={account}
        openOrders={openOrders}
        closedOrders={closedOrders}
        signals={signals}
        journalLogs={journalLogs}
        bridgeStatus={bridgeStatus}
        onCloseOrder={handleCloseOrder}
        onCloseAll={handleCloseAll}
        onExecuteSignal={handleExecuteSignal}
        onClearLogs={() => setJournalLogs([])}
        onOpenPythonBridge={() => setIsPythonBridgeOpen(true)}
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

      <PythonBridgeModal
        isOpen={isPythonBridgeOpen}
        onClose={() => setIsPythonBridgeOpen(false)}
        bridgeStatus={bridgeStatus}
        onSimulateConnect={handleSimulateBridgeConnect}
      />

      <MT5LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentAccount={account}
        bridgeStatus={bridgeStatus}
        onLoginSubmit={handleLoginSubmit}
        onOpenPythonBridge={() => {
          setIsLoginModalOpen(false);
          setIsPythonBridgeOpen(true);
        }}
      />
    </div>
  );
}
