export type AssetClass = 'GOLD' | 'COMMODITY' | 'CRYPTO' | 'FOREX' | 'INDEX';

export interface SymbolInfo {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  digits: number;
  pipSize: number;
  spreadPoints: number;
  minLot: number;
  maxLot: number;
  lotStep: number;
  contractSize: number;
  basePrice: number;
  icon: string;
  category: 'Commodities' | 'Crypto' | 'Forex' | 'Indices';
}

export interface Candle {
  time: number; // Unix timestamp in ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorValues {
  rsi: number;
  emaFast: number; // EMA 20
  emaSlow: number; // EMA 50
  ema200?: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
  };
  atr: number;
}

export type SignalType = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export interface TradeSignal {
  id: string;
  symbol: string;
  time: number;
  type: SignalType;
  score: number; // -100 (extreme bear) to +100 (extreme bull)
  confidence: number; // 0 to 100%
  reasons: string[];
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  indicators: IndicatorValues;
  autonomousDecision?: {
    regime: 'TREND_EXPANSION' | 'MEAN_REVERSION' | 'LIQUIDITY_BREAKOUT' | 'VOLATILITY_SQUEEZE';
    autoLotSize: number;
    riskCapital: number;
    recommendedAction: string;
  };
}

export type OrderType = 'BUY' | 'SELL';
export type OrderStatus = 'OPEN' | 'CLOSED';
export type CloseReason = 'TAKE_PROFIT' | 'STOP_LOSS' | 'MANUAL' | 'TRAILING_STOP' | 'CIRCUIT_BREAKER' | 'AUTO_BOT';

export interface Order {
  ticket: number;
  time: string;
  timestamp: number;
  symbol: string;
  type: OrderType;
  volume: number; // lots
  openPrice: number;
  currentPrice: number;
  sl: number;
  tp: number;
  commission: number;
  swap: number;
  profit: number;
  status: OrderStatus;
  closePrice?: number;
  closeTime?: string;
  closeReason?: CloseReason;
  highestPrice?: number; // for trailing stop tracking
  lowestPrice?: number; // for trailing stop tracking
  isBotExecuted?: boolean;
  executedViaBridge?: 'NODE_LOCAL' | 'PYTHON_MT5';
}

export interface AccountInfo {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  currency: string;
  leverage: number;
  server: string;
  accountNumber: string;
}

export type BotOperationMode = 'AUTONOMOUS' | 'MANUAL_RISK' | 'OFF';
export type ExecutionMode = 'AUTOMATIC' | 'MANUAL_CONFIRM';

export interface RiskSettings {
  botMode: BotOperationMode; // 'AUTONOMOUS' (no settings needed, bot decides) vs 'MANUAL_RISK' vs 'OFF'
  executionMode: ExecutionMode; // 'AUTOMATIC' (fires immediately) vs 'MANUAL_CONFIRM' (prompts 1-click confirmation)
  autoTradingEnabled: boolean;
  minSignalConfidence: number; // e.g. 75%
  riskMode: 'FIXED_LOT' | 'PERCENT_EQUITY';
  fixedLotSize: number; // e.g. 0.10
  riskPercent: number; // e.g. 1.5%
  stopLossMode: 'ATR_DYNAMIC' | 'FIXED_PIPS';
  atrMultiplier: number; // e.g. 1.5
  fixedSlPips: number; // e.g. 30
  takeProfitRatio: number; // e.g. 2.0 (1:2 R:R)
  trailingStop: boolean;
  trailingActivationPips: number;
  trailingStepPips: number;
  maxOpenPositions: number;
  maxDailyDrawdownPercent: number;
  strategyPreset: 'GOLD_CRYPTO_QUANT' | 'SCALPER_PRO' | 'TREND_MOMENTUM' | 'INSTITUTIONAL_SWING';
  activeSymbols: Record<string, boolean>;
}

export interface BrokerLoginCredentials {
  broker: string;
  server: string;
  login: string;
  password?: string;
  accountType: 'HEDGING' | 'NETTING';
  environment: 'DEMO' | 'REAL';
  leverage: number;
}

export interface PythonBridgeStatus {
  connected: boolean;
  mode: 'PYTHON_MT5' | 'EMULATED_BRIDGE';
  accountNumber: string;
  brokerServer: string;
  brokerName?: string;
  balance: number;
  equity: number;
  pingMs: number;
  lastHeartbeat: string;
  pendingOrdersCount: number;
  executedOrdersCount: number;
}

export interface JournalLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'TRADE' | 'SIGNAL' | 'WARN' | 'ERROR';
  message: string;
}

export interface EquityPoint {
  time: string;
  balance: number;
  equity: number;
}

export interface PerformanceStats {
  netProfit: number;
  profitFactor: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
}
