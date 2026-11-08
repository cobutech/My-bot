import { Candle, SymbolInfo } from '../types';

export const SUPPORTED_SYMBOLS: Record<string, SymbolInfo> = {
  // Commodities & Precious Metals (4)
  XAUUSD: {
    symbol: 'XAUUSD',
    name: 'Gold Spot / US Dollar',
    assetClass: 'GOLD',
    digits: 2,
    pipSize: 0.1, // 1 pip = 0.10 ($10 per standard lot)
    spreadPoints: 24,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100, // 100 oz
    basePrice: 2736.45,
    icon: '🥇',
    category: 'Commodities',
  },
  XAGUSD: {
    symbol: 'XAGUSD',
    name: 'Silver Spot / US Dollar',
    assetClass: 'COMMODITY',
    digits: 3,
    pipSize: 0.01,
    spreadPoints: 18,
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 5000, // 5000 oz
    basePrice: 31.85,
    icon: '🥈',
    category: 'Commodities',
  },
  USOIL: {
    symbol: 'USOIL',
    name: 'WTI Crude Oil',
    assetClass: 'COMMODITY',
    digits: 2,
    pipSize: 0.01,
    spreadPoints: 28,
    minLot: 0.1,
    maxLot: 100.0,
    lotStep: 0.1,
    contractSize: 1000, // 1000 barrels
    basePrice: 71.4,
    icon: '🛢️',
    category: 'Commodities',
  },
  XPTUSD: {
    symbol: 'XPTUSD',
    name: 'Platinum Spot / USD',
    assetClass: 'COMMODITY',
    digits: 2,
    pipSize: 0.1,
    spreadPoints: 35,
    minLot: 0.01,
    maxLot: 20.0,
    lotStep: 0.01,
    contractSize: 100,
    basePrice: 988.5,
    icon: '⚪',
    category: 'Commodities',
  },

  // Cryptocurrencies (8)
  BTCUSDT: {
    symbol: 'BTCUSDT',
    name: 'Bitcoin / Tether USD',
    assetClass: 'CRYPTO',
    digits: 2,
    pipSize: 1.0,
    spreadPoints: 45,
    minLot: 0.01,
    maxLot: 100.0,
    lotStep: 0.01,
    contractSize: 1,
    basePrice: 94820.0,
    icon: '₿',
    category: 'Crypto',
  },
  ETHUSDT: {
    symbol: 'ETHUSDT',
    name: 'Ethereum / Tether USD',
    assetClass: 'CRYPTO',
    digits: 2,
    pipSize: 0.1,
    spreadPoints: 22,
    minLot: 0.01,
    maxLot: 200.0,
    lotStep: 0.01,
    contractSize: 1,
    basePrice: 3385.2,
    icon: 'Ξ',
    category: 'Crypto',
  },
  SOLUSDT: {
    symbol: 'SOLUSDT',
    name: 'Solana / Tether USD',
    assetClass: 'CRYPTO',
    digits: 2,
    pipSize: 0.01,
    spreadPoints: 15,
    minLot: 0.1,
    maxLot: 500.0,
    lotStep: 0.1,
    contractSize: 1,
    basePrice: 192.4,
    icon: '◎',
    category: 'Crypto',
  },
  BNBUSDT: {
    symbol: 'BNBUSDT',
    name: 'BNB / Tether USD',
    assetClass: 'CRYPTO',
    digits: 2,
    pipSize: 0.1,
    spreadPoints: 20,
    minLot: 0.01,
    maxLot: 200.0,
    lotStep: 0.01,
    contractSize: 1,
    basePrice: 652.8,
    icon: '🟡',
    category: 'Crypto',
  },
  XRPUSDT: {
    symbol: 'XRPUSDT',
    name: 'Ripple XRP / USD',
    assetClass: 'CRYPTO',
    digits: 4,
    pipSize: 0.0001,
    spreadPoints: 12,
    minLot: 10.0,
    maxLot: 50000.0,
    lotStep: 10.0,
    contractSize: 1,
    basePrice: 2.1845,
    icon: '✕',
    category: 'Crypto',
  },
  ADAUSDT: {
    symbol: 'ADAUSDT',
    name: 'Cardano / USD',
    assetClass: 'CRYPTO',
    digits: 4,
    pipSize: 0.0001,
    spreadPoints: 10,
    minLot: 10.0,
    maxLot: 50000.0,
    lotStep: 10.0,
    contractSize: 1,
    basePrice: 0.785,
    icon: '₳',
    category: 'Crypto',
  },
  DOGEUSDT: {
    symbol: 'DOGEUSDT',
    name: 'Dogecoin / USD',
    assetClass: 'CRYPTO',
    digits: 4,
    pipSize: 0.0001,
    spreadPoints: 8,
    minLot: 10.0,
    maxLot: 100000.0,
    lotStep: 10.0,
    contractSize: 1,
    basePrice: 0.245,
    icon: '🐕',
    category: 'Crypto',
  },
  AVAXUSDT: {
    symbol: 'AVAXUSDT',
    name: 'Avalanche / USD',
    assetClass: 'CRYPTO',
    digits: 2,
    pipSize: 0.01,
    spreadPoints: 16,
    minLot: 0.1,
    maxLot: 1000.0,
    lotStep: 0.1,
    contractSize: 1,
    basePrice: 34.2,
    icon: '🔺',
    category: 'Crypto',
  },

  // Forex Majors (6)
  EURUSD: {
    symbol: 'EURUSD',
    name: 'Euro / US Dollar',
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
  GBPUSD: {
    symbol: 'GBPUSD',
    name: 'British Pound / US Dollar',
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
  USDJPY: {
    symbol: 'USDJPY',
    name: 'US Dollar / Japanese Yen',
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
  AUDUSD: {
    symbol: 'AUDUSD',
    name: 'Australian Dollar / USD',
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
    name: 'US Dollar / Canadian Dollar',
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
    name: 'US Dollar / Swiss Franc',
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

  // Major Global Equity Indices (4)
  US30: {
    symbol: 'US30',
    name: 'Wall Street 30 (Dow Jones)',
    assetClass: 'INDEX',
    digits: 1,
    pipSize: 1.0,
    spreadPoints: 18,
    minLot: 0.1,
    maxLot: 100.0,
    lotStep: 0.1,
    contractSize: 1,
    basePrice: 43850.0,
    icon: '🏛️',
    category: 'Indices',
  },
  NAS100: {
    symbol: 'NAS100',
    name: 'US Tech 100 (Nasdaq)',
    assetClass: 'INDEX',
    digits: 1,
    pipSize: 1.0,
    spreadPoints: 15,
    minLot: 0.1,
    maxLot: 100.0,
    lotStep: 0.1,
    contractSize: 1,
    basePrice: 20950.0,
    icon: '💻',
    category: 'Indices',
  },
  SPX500: {
    symbol: 'SPX500',
    name: 'S&P 500 Index',
    assetClass: 'INDEX',
    digits: 1,
    pipSize: 0.1,
    spreadPoints: 10,
    minLot: 0.1,
    maxLot: 100.0,
    lotStep: 0.1,
    contractSize: 10,
    basePrice: 5960.0,
    icon: '📈',
    category: 'Indices',
  },
  GER40: {
    symbol: 'GER40',
    name: 'Germany 40 (DAX)',
    assetClass: 'INDEX',
    digits: 1,
    pipSize: 1.0,
    spreadPoints: 12,
    minLot: 0.1,
    maxLot: 50.0,
    lotStep: 0.1,
    contractSize: 1,
    basePrice: 19320.0,
    icon: '🇩🇪',
    category: 'Indices',
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
  const isIndex = symInfo.category === 'Indices';
  const isForex = symInfo.category === 'Forex';
  const isCrypto = symInfo.category === 'Crypto';

  const volatility = isForex ? 0.0006 : isIndex ? 0.0012 : isCrypto ? 0.0025 : 0.0016;
  const intervalMs = timeframeMinutes * 60 * 1000;
  const now = Date.now();
  const startTime = now - count * intervalMs;

  const candles: Candle[] = [];
  let prevClose = base * (1 - (Math.random() * 0.02 - 0.01));

  for (let i = 0; i < count; i++) {
    const time = startTime + i * intervalMs;
    const change = prevClose * (Math.random() * 2 - 0.99) * volatility;
    const open = prevClose;
    const close = Number((open + change).toFixed(symInfo.digits));
    const wickHigh = Math.abs(Math.random() * volatility * prevClose * 1.4);
    const wickLow = Math.abs(Math.random() * volatility * prevClose * 1.4);
    const high = Number((Math.max(open, close) + wickHigh).toFixed(symInfo.digits));
    const low = Number((Math.min(open, close) - wickLow).toFixed(symInfo.digits));
    const volume = Math.floor(Math.random() * 350 + 40);

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
        change24h: Number((Math.random() * 3.2 - 1.1).toFixed(2)),
        high24h: Number((bid * 1.015).toFixed(info.digits)),
        low24h: Number((bid * 0.985).toFixed(info.digits)),
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

    // Multi-symbol high frequency tick wave every 600ms
    this.intervalId = setInterval(() => {
      this.simulateTickWave();
    }, 600);
  }

  private simulateTickWave() {
    const symbols = Object.keys(SUPPORTED_SYMBOLS);

    // Update 2-4 symbols per tick pulse for lively market feeling across the 22 markets
    const countToUpdate = Math.floor(Math.random() * 3) + 2;
    for (let c = 0; c < countToUpdate; c++) {
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      const info = SUPPORTED_SYMBOLS[sym];
      const prevTick = this.ticksMap[sym];
      if (!prevTick) continue;

      let step = 0;
      if (sym.includes('XAU')) step = (Math.random() * 2 - 0.98) * 0.18;
      else if (sym.includes('BTC')) step = (Math.random() * 2 - 0.98) * 5.2;
      else if (sym.includes('ETH')) step = (Math.random() * 2 - 0.98) * 0.45;
      else if (info.category === 'Indices') step = (Math.random() * 2 - 0.98) * 1.5;
      else if (info.category === 'Forex') step = (Math.random() * 2 - 0.98) * 0.00015;
      else step = (Math.random() * 2 - 0.98) * 0.05;

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

      // Update current candle across active timeframes
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
