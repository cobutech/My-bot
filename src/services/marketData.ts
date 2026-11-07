import { Candle, SymbolInfo } from '../types';

export const SUPPORTED_SYMBOLS: Record<string, SymbolInfo> = {
  XAUUSD: {
    symbol: 'XAUUSD',
    name: 'Gold Spot / US Dollar',
    assetClass: 'GOLD',
    digits: 2,
    pipSize: 0.1, // 1 pip = 0.10 ($10 per standard lot)
    spreadPoints: 28, // 0.28 spread
    minLot: 0.01,
    maxLot: 50.0,
    lotStep: 0.01,
    contractSize: 100, // 100 oz
    basePrice: 2736.45,
    icon: '🥇',
  },
  BTCUSDT: {
    symbol: 'BTCUSDT',
    name: 'Bitcoin / Tether USD',
    assetClass: 'CRYPTO',
    digits: 2,
    pipSize: 1.0,
    spreadPoints: 50, // $0.50 spread
    minLot: 0.01,
    maxLot: 100.0,
    lotStep: 0.01,
    contractSize: 1, // 1 BTC
    basePrice: 94820.0,
    icon: '₿',
  },
  ETHUSDT: {
    symbol: 'ETHUSDT',
    name: 'Ethereum / Tether USD',
    assetClass: 'CRYPTO',
    digits: 2,
    pipSize: 0.1,
    spreadPoints: 25,
    minLot: 0.01,
    maxLot: 200.0,
    lotStep: 0.01,
    contractSize: 1, // 1 ETH
    basePrice: 3385.2,
    icon: 'Ξ',
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
    contractSize: 1, // 1 SOL
    basePrice: 192.4,
    icon: '◎',
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
  },
  XRPUSDT: {
    symbol: 'XRPUSDT',
    name: 'Ripple XRP / Tether USD',
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
  const volatility = symbol.includes('XAU') ? 0.0018 : symbol.includes('BTC') ? 0.0022 : 0.0035;
  const intervalMs = timeframeMinutes * 60 * 1000;
  const now = Date.now();
  const startTime = now - count * intervalMs;

  const candles: Candle[] = [];
  let prevClose = base * (1 - (Math.random() * 0.04 - 0.02));

  for (let i = 0; i < count; i++) {
    const time = startTime + i * intervalMs;
    const change = prevClose * (Math.random() * 2 - 0.99) * volatility;
    const open = prevClose;
    const close = Number((open + change).toFixed(symInfo.digits));
    const wickHigh = Math.abs(Math.random() * volatility * prevClose * 1.5);
    const wickLow = Math.abs(Math.random() * volatility * prevClose * 1.5);
    const high = Number((Math.max(open, close) + wickHigh).toFixed(symInfo.digits));
    const low = Number((Math.min(open, close) - wickLow).toFixed(symInfo.digits));
    const volume = Math.floor(Math.random() * 450 + 50);

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
      const spreadVal = (info.spreadPoints * info.pipSize * (sym.includes('XAU') ? 0.1 : 0.01));
      const bid = lastCandle.close;
      const ask = Number((bid + spreadVal).toFixed(info.digits));

      this.ticksMap[sym] = {
        symbol: sym,
        bid,
        ask,
        spread: Number(spreadVal.toFixed(info.digits)),
        time: Date.now(),
        change24h: Number((Math.random() * 3.6 - 1.2).toFixed(2)),
        high24h: Number((bid * 1.018).toFixed(info.digits)),
        low24h: Number((bid * 0.984).toFixed(info.digits)),
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

    // High frequency tick loop (every 750ms simulates live interbank ECN feed)
    this.intervalId = setInterval(() => {
      this.simulateTickWave();
    }, 750);
  }

  private simulateTickWave() {
    const symbols = Object.keys(SUPPORTED_SYMBOLS);

    // Pick 1-3 symbols per tick wave for realistic async tick intervals
    const countToUpdate = Math.floor(Math.random() * 2) + 1;
    for (let c = 0; c < countToUpdate; c++) {
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      const info = SUPPORTED_SYMBOLS[sym];
      const prevTick = this.ticksMap[sym];
      if (!prevTick) continue;

      // Realistic tick delta with mean-reverting drift
      const vol = sym.includes('XAU') ? 0.15 : sym.includes('BTC') ? 4.5 : sym.includes('ETH') ? 0.45 : 0.08;
      const step = (Math.random() * 2 - 0.98) * vol;
      const newBid = Number(Math.max(1, prevTick.bid + step).toFixed(info.digits));
      
      const spreadVal = info.spreadPoints * (sym.includes('XAU') ? 0.01 : info.pipSize * 0.05);
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

          // Check if current candle period has completed
          if (now - lastCandle.time >= tfDurationMs) {
            // Push new candle
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
            // Update active candle in real-time
            lastCandle.close = newBid;
            lastCandle.high = Math.max(lastCandle.high, newBid);
            lastCandle.low = Math.min(lastCandle.low, newBid);
            lastCandle.volume += 1;
          }

          // Notify candle listeners
          this.candleListeners.forEach((l) => l(sym, tf.label, [...candles]));
        }
      }

      // Notify tick listeners
      this.tickListeners.forEach((l) => l(updatedTick));
    }
  }

  public stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}

export const marketData = new MarketDataService();
