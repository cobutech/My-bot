import { Candle, SymbolInfo } from '../types';

export const SUPPORTED_SYMBOLS: Record<string, SymbolInfo> = {
  EURUSD: {
    symbol: 'EURUSD',
    name: 'EUR/USD',
    assetClass: 'FOREX',
    digits: 5,
    pipSize: 0.0001,
    spreadPoints: 8,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 1.0542,
    icon: '💶',
    category: 'Forex',
  },
  XAUUSD: {
    symbol: 'XAUUSD',
    name: 'XAU/USD',
    assetClass: 'GOLD',
    digits: 2,
    pipSize: 0.1,
    spreadPoints: 24,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100,
    basePrice: 2736.45,
    icon: '🥇',
    category: 'Commodities',
  },
  USDJPY: {
    symbol: 'USDJPY',
    name: 'USD/JPY',
    assetClass: 'FOREX',
    digits: 3,
    pipSize: 0.01,
    spreadPoints: 9,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 153.4,
    icon: '💴',
    category: 'Forex',
  },
  GBPUSD: {
    symbol: 'GBPUSD',
    name: 'GBP/USD',
    assetClass: 'FOREX',
    digits: 5,
    pipSize: 0.0001,
    spreadPoints: 11,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 1.2685,
    icon: '💷',
    category: 'Forex',
  },
  AUDUSD: {
    symbol: 'AUDUSD',
    name: 'AUD/USD',
    assetClass: 'FOREX',
    digits: 5,
    pipSize: 0.0001,
    spreadPoints: 10,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 0.648,
    icon: '🇦🇺',
    category: 'Forex',
  },
  USDCAD: {
    symbol: 'USDCAD',
    name: 'USD/CAD',
    assetClass: 'FOREX',
    digits: 5,
    pipSize: 0.0001,
    spreadPoints: 12,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 1.402,
    icon: '🇨🇦',
    category: 'Forex',
  },
  USDCHF: {
    symbol: 'USDCHF',
    name: 'USD/CHF',
    assetClass: 'FOREX',
    digits: 5,
    pipSize: 0.0001,
    spreadPoints: 13,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 0.887,
    icon: '🇨🇭',
    category: 'Forex',
  },
  NZDUSD: {
    symbol: 'NZDUSD',
    name: 'NZD/USD',
    assetClass: 'FOREX',
    digits: 5,
    pipSize: 0.0001,
    spreadPoints: 12,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 0.589,
    icon: '🇳🇿',
    category: 'Forex',
  },
  EURGBP: {
    symbol: 'EURGBP',
    name: 'EUR/GBP',
    assetClass: 'FOREX',
    digits: 5,
    pipSize: 0.0001,
    spreadPoints: 10,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 0.831,
    icon: '🇪🇺',
    category: 'Forex',
  },
  EURJPY: {
    symbol: 'EURJPY',
    name: 'EUR/JPY',
    assetClass: 'FOREX',
    digits: 3,
    pipSize: 0.01,
    spreadPoints: 11,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 161.7,
    icon: '🇪🇺',
    category: 'Forex',
  },
  GBPJPY: {
    symbol: 'GBPJPY',
    name: 'GBP/JPY',
    assetClass: 'FOREX',
    digits: 3,
    pipSize: 0.01,
    spreadPoints: 16,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 194.5,
    icon: '🐉',
    category: 'Forex',
  },
  AUDJPY: {
    symbol: 'AUDJPY',
    name: 'AUD/JPY',
    assetClass: 'FOREX',
    digits: 3,
    pipSize: 0.01,
    spreadPoints: 12,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 99.4,
    icon: '🇦🇺',
    category: 'Forex',
  },
  EURAUD: {
    symbol: 'EURAUD',
    name: 'EUR/AUD',
    assetClass: 'FOREX',
    digits: 5,
    pipSize: 0.0001,
    spreadPoints: 14,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 1.627,
    icon: '🇪🇺',
    category: 'Forex',
  },
  GBPCAD: {
    symbol: 'GBPCAD',
    name: 'GBP/CAD',
    assetClass: 'FOREX',
    digits: 5,
    pipSize: 0.0001,
    spreadPoints: 15,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 1.778,
    icon: '💷',
    category: 'Forex',
  },
  EURCHF: {
    symbol: 'EURCHF',
    name: 'EUR/CHF',
    assetClass: 'FOREX',
    digits: 5,
    pipSize: 0.0001,
    spreadPoints: 12,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 0.935,
    icon: '🇪🇺',
    category: 'Forex',
  },
  USDMXN: {
    symbol: 'USDMXN',
    name: 'USD/MXN',
    assetClass: 'FOREX',
    digits: 4,
    pipSize: 0.0001,
    spreadPoints: 45,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 20.35,
    icon: '🇲🇽',
    category: 'Forex',
  },
  USDCNH: {
    symbol: 'USDCNH',
    name: 'USD/CNH',
    assetClass: 'FOREX',
    digits: 4,
    pipSize: 0.0001,
    spreadPoints: 20,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 7.235,
    icon: '🇨🇳',
    category: 'Forex',
  },
  USDSGD: {
    symbol: 'USDSGD',
    name: 'USD/SGD',
    assetClass: 'FOREX',
    digits: 4,
    pipSize: 0.0001,
    spreadPoints: 15,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 1.332,
    icon: '🇸🇬',
    category: 'Forex',
  },
  USDKRW: {
    symbol: 'USDKRW',
    name: 'USD/KRW',
    assetClass: 'FOREX',
    digits: 2,
    pipSize: 1.0,
    spreadPoints: 60,
    minLot: 0.1,
    maxLot: 100.0,
    lotStep: 0.1,
    contractSize: 1000,
    basePrice: 1395.5,
    icon: '🇰🇷',
    category: 'Forex',
  },
  AUDCAD: {
    symbol: 'AUDCAD',
    name: 'AUD/CAD',
    assetClass: 'FOREX',
    digits: 5,
    pipSize: 0.0001,
    spreadPoints: 11,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100000,
    basePrice: 0.9085,
    icon: '🇦🇺',
    category: 'Forex',
  },
};

export const TIMEFRAMES = [
  { label: 'M1', minutes: 1 },
  { label: 'M5', minutes: 5 },
  { label: 'M15', minutes: 15 },
  { label: 'M30', minutes: 30 },
  { label: 'H1', minutes: 60 },
  { label: 'H4', minutes: 240 },
  { label: 'D1', minutes: 1440 },
] as const;

export type TimeframeKey = (typeof TIMEFRAMES)[number]['label'];

export interface Tick {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  time: number;
  change24h: number;
  high24h: number;
  low24h: number;
  tickDirection: 'UP' | 'DOWN' | 'SAME';
}

// Generates realistic initial historical bars
export function generateHistoricalCandles(
  symbol: string,
  timeframeMinutes: number = 5,
  count: number = 100
): Candle[] {
  const symInfo = SUPPORTED_SYMBOLS[symbol] || SUPPORTED_SYMBOLS.XAUUSD;
  const base = symInfo.basePrice;
  const isGold = symbol === 'XAUUSD';
  const isEmerging = ['USDMXN', 'USDCNH', 'USDSGD', 'USDKRW'].includes(symbol);

  const volatility = isGold ? 0.0018 : isEmerging ? 0.0012 : 0.0007;
  const intervalMs = timeframeMinutes * 60 * 1000;
  const now = Date.now();
  const startTime = now - count * intervalMs;

  const candles: Candle[] = [];
  let prevClose = base * (1 - (Math.random() * 0.015 - 0.0075));

  for (let i = 0; i < count; i++) {
    const time = startTime + i * intervalMs;
    const change = prevClose * (Math.random() * 2 - 0.99) * volatility;
    const open = prevClose;
    const close = Number((open + change).toFixed(symInfo.digits));
    const wickHigh = Math.abs(Math.random() * volatility * prevClose * 1.3);
    const wickLow = Math.abs(Math.random() * volatility * prevClose * 1.3);
    const high = Number((Math.max(open, close) + wickHigh).toFixed(symInfo.digits));
    const low = Number((Math.min(open, close) - wickLow).toFixed(symInfo.digits));
    const volume = Math.floor(Math.random() * 300 + 35);

    candles.push({ time, open, high, low, close, volume });
    prevClose = close;
  }

  return candles;
}

// Central Market Data Engine
class MarketDataService {
  private candlesMap: Record<string, Record<string, Candle[]>> = {};
  private ticksMap: Record<string, Tick> = {};
  private tickListeners: Array<(tick: Tick) => void> = [];
  private candleListeners: Array<(symbol: string, timeframe: string, candles: Candle[]) => void> = [];
  private intervalId: any = null;

  constructor() {
    this.initializeData();
    this.startStreaming();
  }

  private initializeData() {
    for (const sym of Object.keys(SUPPORTED_SYMBOLS)) {
      this.candlesMap[sym] = {};
      const info = SUPPORTED_SYMBOLS[sym];

      for (const tf of TIMEFRAMES) {
        this.candlesMap[sym][tf.label] = generateHistoricalCandles(sym, tf.minutes, 100);
      }

      const lastCandle = this.candlesMap[sym]['M5'][this.candlesMap[sym]['M5'].length - 1];
      const spreadVal = info.spreadPoints * (info.digits >= 4 ? 0.0001 : info.digits === 3 ? 0.001 : 0.01);
      const bid = lastCandle.close;
      const ask = Number((bid + spreadVal).toFixed(info.digits));

      this.ticksMap[sym] = {
        symbol: sym,
        bid,
        ask,
        spread: Number(spreadVal.toFixed(info.digits)),
        time: Date.now(),
        change24h: Number((Math.random() * 2.8 - 1.2).toFixed(2)),
        high24h: Number((bid * 1.012).toFixed(info.digits)),
        low24h: Number((bid * 0.988).toFixed(info.digits)),
        tickDirection: 'SAME',
      };
    }
  }

  public getSymbols(): SymbolInfo[] {
    return Object.values(SUPPORTED_SYMBOLS);
  }

  public getCandles(symbol: string, timeframe: string): Candle[] {
    if (!this.candlesMap[symbol]) return [];
    return this.candlesMap[symbol][timeframe] || this.candlesMap[symbol]['M5'] || [];
  }

  public getLatestTick(symbol: string): Tick {
    return (
      this.ticksMap[symbol] || {
        symbol,
        bid: 100,
        ask: 100.1,
        spread: 0.1,
        time: Date.now(),
        change24h: 0,
        high24h: 105,
        low24h: 95,
        tickDirection: 'SAME',
      }
    );
  }

  public getAllTicks(): Record<string, Tick> {
    return { ...this.ticksMap };
  }

  public onTick(listener: (tick: Tick) => void): () => void {
    this.tickListeners.push(listener);
    return () => {
      this.tickListeners = this.tickListeners.filter((l) => l !== listener);
    };
  }

  public onCandleUpdate(
    listener: (symbol: string, timeframe: string, candles: Candle[]) => void
  ): () => void {
    this.candleListeners.push(listener);
    return () => {
      this.candleListeners = this.candleListeners.filter((l) => l !== listener);
    };
  }

  private startStreaming() {
    if (this.intervalId) clearInterval(this.intervalId);

    // Tick pulse every 550ms
    this.intervalId = setInterval(() => {
      this.simulateTickWave();
    }, 550);
  }

  private simulateTickWave() {
    const symbols = Object.keys(SUPPORTED_SYMBOLS);

    // Update 2-4 symbols per tick pulse
    const countToUpdate = Math.floor(Math.random() * 3) + 2;
    for (let c = 0; c < countToUpdate; c++) {
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      const info = SUPPORTED_SYMBOLS[sym];
      const prevTick = this.ticksMap[sym];
      if (!prevTick) continue;

      let step = 0;
      if (sym === 'XAUUSD') step = (Math.random() * 2 - 0.98) * 0.2;
      else if (sym === 'USDKRW') step = (Math.random() * 2 - 0.98) * 0.8;
      else if (sym === 'GBPJPY' || sym === 'EURJPY' || sym === 'USDJPY') step = (Math.random() * 2 - 0.98) * 0.02;
      else if (sym === 'USDMXN' || sym === 'USDCNH') step = (Math.random() * 2 - 0.98) * 0.0015;
      else step = (Math.random() * 2 - 0.98) * 0.00012;

      const newBid = Number(Math.max(0.0001, prevTick.bid + step).toFixed(info.digits));
      const spreadVal = info.spreadPoints * (info.digits >= 4 ? 0.0001 : info.digits === 3 ? 0.001 : 0.01);
      const newAsk = Number((newBid + spreadVal).toFixed(info.digits));
      const direction: 'UP' | 'DOWN' | 'SAME' =
        newBid > prevTick.bid ? 'UP' : newBid < prevTick.bid ? 'DOWN' : 'SAME';

      const updatedTick: Tick = {
        ...prevTick,
        bid: newBid,
        ask: newAsk,
        time: Date.now(),
        tickDirection: direction,
        high24h: Math.max(prevTick.high24h, newBid),
        low24h: Math.min(prevTick.low24h, newBid),
      };

      this.ticksMap[sym] = updatedTick;

      for (const tf of TIMEFRAMES) {
        const candles = this.candlesMap[sym]?.[tf.label];
        if (candles && candles.length > 0) {
          const lastCandle = candles[candles.length - 1];
          const tfDurationMs = tf.minutes * 60 * 1000;
          const now = Date.now();

          if (now - lastCandle.time >= tfDurationMs) {
            candles.push({
              time: now,
              open: newBid,
              high: newBid,
              low: newBid,
              close: newBid,
              volume: 1,
            });
            if (candles.length > 250) candles.shift();
          } else {
            lastCandle.close = newBid;
            lastCandle.high = Math.max(lastCandle.high, newBid);
            lastCandle.low = Math.min(lastCandle.low, newBid);
            lastCandle.volume += 1;
          }

          this.candleListeners.forEach((l) => l(sym, tf.label, [...candles]));
        }
      }

      this.tickListeners.forEach((l) => l(updatedTick));
    }
  }

  public stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}

export const marketData = new MarketDataService();
