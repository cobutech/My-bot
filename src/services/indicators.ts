import { Candle, IndicatorValues, TradeSignal, SignalType } from '../types';

export function calculateEMA(data: number[], period: number): number[] {
  if (data.length === 0) return [];
  const k = 2 / (period + 1);
  const emaArray: number[] = new Array(data.length);
  
  // Start with SMA for first 'period' elements
  let sum = 0;
  const initialPeriod = Math.min(period, data.length);
  for (let i = 0; i < initialPeriod; i++) {
    sum += data[i];
  }
  let currentEma = sum / initialPeriod;
  for (let i = 0; i < initialPeriod; i++) {
    emaArray[i] = currentEma;
  }

  for (let i = initialPeriod; i < data.length; i++) {
    currentEma = data[i] * k + currentEma * (1 - k);
    emaArray[i] = currentEma;
  }

  return emaArray;
}

export function calculateRSI(closes: number[], period: number = 14): number[] {
  if (closes.length <= period) return new Array(closes.length).fill(50);
  const rsi: number[] = new Array(closes.length).fill(50);

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi[period] = 100 - (100 / (1 + rs));

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi[i] = 100 - (100 / (1 + rs));
  }

  return rsi;
}

export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const macdLine: number[] = closes.map((_, i) => fastEMA[i] - slowEMA[i]);
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram: number[] = macdLine.map((val, i) => val - signalLine[i]);

  return { macd: macdLine, signal: signalLine, histogram };
}

export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: number[]; middle: number[]; lower: number[]; bandwidth: number[] } {
  const middle: number[] = [];
  const upper: number[] = [];
  const lower: number[] = [];
  const bandwidth: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      middle.push(closes[i]);
      upper.push(closes[i]);
      lower.push(closes[i]);
      bandwidth.push(0);
      continue;
    }

    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((acc, v) => acc + v, 0) / period;
    const variance = slice.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    const up = mean + stdDevMultiplier * stdDev;
    const low = mean - stdDevMultiplier * stdDev;
    middle.push(mean);
    upper.push(up);
    lower.push(low);
    bandwidth.push(mean === 0 ? 0 : ((up - low) / mean) * 100);
  }

  return { upper, middle, lower, bandwidth };
}

export function calculateATR(candles: Candle[], period: number = 14): number[] {
  if (candles.length === 0) return [];
  const tr: number[] = [candles[0].high - candles[0].low];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const trCurrent = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    tr.push(trCurrent);
  }

  return calculateEMA(tr, period);
}

export function computeIndicators(candles: Candle[]): IndicatorValues {
  if (candles.length === 0) {
    return {
      rsi: 50,
      emaFast: 0,
      emaSlow: 0,
      macd: { macd: 0, signal: 0, histogram: 0 },
      bollinger: { upper: 0, middle: 0, lower: 0, bandwidth: 0 },
      atr: 1,
    };
  }

  const closes = candles.map((c) => c.close);
  const rsiArr = calculateRSI(closes, 14);
  const emaFastArr = calculateEMA(closes, 20);
  const emaSlowArr = calculateEMA(closes, 50);
  const ema200Arr = calculateEMA(closes, 200);
  const macdData = calculateMACD(closes, 12, 26, 9);
  const bbData = calculateBollingerBands(closes, 20, 2);
  const atrArr = calculateATR(candles, 14);

  const lastIdx = closes.length - 1;

  return {
    rsi: Number(rsiArr[lastIdx].toFixed(2)),
    emaFast: Number(emaFastArr[lastIdx].toFixed(2)),
    emaSlow: Number(emaSlowArr[lastIdx].toFixed(2)),
    ema200: Number(ema200Arr[lastIdx].toFixed(2)),
    macd: {
      macd: Number(macdData.macd[lastIdx].toFixed(3)),
      signal: Number(macdData.signal[lastIdx].toFixed(3)),
      histogram: Number(macdData.histogram[lastIdx].toFixed(3)),
    },
    bollinger: {
      upper: Number(bbData.upper[lastIdx].toFixed(2)),
      middle: Number(bbData.middle[lastIdx].toFixed(2)),
      lower: Number(bbData.lower[lastIdx].toFixed(2)),
      bandwidth: Number(bbData.bandwidth[lastIdx].toFixed(2)),
    },
    atr: Number(atrArr[lastIdx].toFixed(2)),
  };
}

export function generateSignal(
  symbol: string,
  candles: Candle[],
  digits: number = 2,
  atrMultiplier: number = 1.5,
  takeProfitRatio: number = 2.0
): TradeSignal {
  if (candles.length < 30) {
    const currentPrice = candles[candles.length - 1]?.close || 100;
    return {
      id: `sig-${Date.now()}`,
      symbol,
      time: Date.now(),
      type: 'NEUTRAL',
      score: 0,
      confidence: 50,
      reasons: ['Accumulating sufficient historical candles'],
      entryPrice: currentPrice,
      stopLoss: currentPrice * 0.99,
      takeProfit: currentPrice * 1.02,
      riskReward: takeProfitRatio,
      indicators: computeIndicators(candles),
    };
  }

  const indicators = computeIndicators(candles);
  const currentPrice = candles[candles.length - 1].close;
  const reasons: string[] = [];
  let score = 0;

  // 1. RSI Evaluation (-25 to +25)
  if (indicators.rsi < 30) {
    score += 25;
    reasons.push(`RSI Oversold (${indicators.rsi}) - Mean reversion bounce probable`);
  } else if (indicators.rsi < 42) {
    score += 12;
    reasons.push(`RSI Low Zone (${indicators.rsi}) - Bullish accumulation`);
  } else if (indicators.rsi > 70) {
    score -= 25;
    reasons.push(`RSI Overbought (${indicators.rsi}) - Exhaustion pullback imminent`);
  } else if (indicators.rsi > 58) {
    score -= 12;
    reasons.push(`RSI High Zone (${indicators.rsi}) - Resistance test`);
  }

  // 2. EMA 20 / EMA 50 Confluence (-30 to +30)
  if (indicators.emaFast > indicators.emaSlow) {
    const spreadPct = ((indicators.emaFast - indicators.emaSlow) / indicators.emaSlow) * 100;
    score += spreadPct > 0.1 ? 30 : 18;
    reasons.push(`Bullish EMA Alignment (EMA 20 > EMA 50, +${spreadPct.toFixed(2)}% gap)`);
  } else {
    const spreadPct = ((indicators.emaSlow - indicators.emaFast) / indicators.emaSlow) * 100;
    score -= spreadPct > 0.1 ? 30 : 18;
    reasons.push(`Bearish EMA Alignment (EMA 20 < EMA 50, -${spreadPct.toFixed(2)}% gap)`);
  }

  // 3. Price relative to EMA 20 (-15 to +15)
  if (currentPrice > indicators.emaFast) {
    score += 15;
    reasons.push(`Price holding above Dynamic EMA 20 Support`);
  } else {
    score -= 15;
    reasons.push(`Price compressed below EMA 20 Resistance`);
  }

  // 4. MACD Momentum (-20 to +20)
  if (indicators.macd.histogram > 0) {
    score += 20;
    reasons.push(`MACD Positive Momentum Histogram (+${indicators.macd.histogram.toFixed(2)})`);
  } else {
    score -= 20;
    reasons.push(`MACD Negative Momentum Histogram (${indicators.macd.histogram.toFixed(2)})`);
  }

  // 5. Bollinger Bands Position (-15 to +15)
  const bbRange = indicators.bollinger.upper - indicators.bollinger.lower;
  if (bbRange > 0) {
    const relPos = (currentPrice - indicators.bollinger.lower) / bbRange;
    if (relPos < 0.15) {
      score += 15;
      reasons.push(`Lower Bollinger Band Tag (${indicators.bollinger.lower.toFixed(digits)}) - High probability long spring`);
    } else if (relPos > 0.85) {
      score -= 15;
      reasons.push(`Upper Bollinger Band Tag (${indicators.bollinger.upper.toFixed(digits)}) - Over-extended resistance`);
    }
  }

  // Asset-specific factor for Gold (XAUUSD)
  if (symbol.includes('XAU')) {
    const hr = new Date().getUTCHours();
    // London Fix (08:00 - 16:00 UTC) and NY Open (13:00 - 21:00 UTC)
    if (hr >= 8 && hr <= 20) {
      if (score > 10) {
        score += 8;
        reasons.push(`London/NY Session Gold Liquidity Expansion`);
      } else if (score < -10) {
        score -= 8;
        reasons.push(`Institutional Fix Session Breakdown Pressure`);
      }
    }
  }

  // Bound score [-100, 100]
  score = Math.max(-100, Math.min(100, score));

  let type: SignalType = 'NEUTRAL';
  if (score >= 60) type = 'STRONG_BUY';
  else if (score >= 25) type = 'BUY';
  else if (score <= -60) type = 'STRONG_SELL';
  else if (score <= -25) type = 'SELL';

  // Confidence mapping
  const confidence = Math.round(50 + Math.abs(score) * 0.45); // 50% to 95%

  // Target & Stop Loss Calculation using ATR
  const atrSafe = Math.max(indicators.atr, currentPrice * 0.002);
  let stopLoss: number;
  let takeProfit: number;

  if (type === 'BUY' || type === 'STRONG_BUY') {
    stopLoss = currentPrice - atrSafe * atrMultiplier;
    takeProfit = currentPrice + (currentPrice - stopLoss) * takeProfitRatio;
  } else if (type === 'SELL' || type === 'STRONG_SELL') {
    stopLoss = currentPrice + atrSafe * atrMultiplier;
    takeProfit = currentPrice - (stopLoss - currentPrice) * takeProfitRatio;
  } else {
    // Neutral fallback
    stopLoss = currentPrice - atrSafe * 1.5;
    takeProfit = currentPrice + atrSafe * 3.0;
  }

  // Autonomous Regime Classification
  let regime: 'TREND_EXPANSION' | 'MEAN_REVERSION' | 'LIQUIDITY_BREAKOUT' | 'VOLATILITY_SQUEEZE' = 'TREND_EXPANSION';
  if (indicators.bollinger.bandwidth < 1.2) {
    regime = 'VOLATILITY_SQUEEZE';
  } else if (indicators.rsi < 28 || indicators.rsi > 72) {
    regime = 'MEAN_REVERSION';
  } else if (Math.abs(score) > 55) {
    regime = 'LIQUIDITY_BREAKOUT';
  }

  // Autonomous lot suggestion for preview
  const estimatedAutoLots = Number(Math.max(0.01, (350 / (atrSafe * 100))).toFixed(2));

  return {
    id: `sig-${symbol}-${Date.now()}`,
    symbol,
    time: Date.now(),
    type,
    score,
    confidence,
    reasons,
    entryPrice: Number(currentPrice.toFixed(digits)),
    stopLoss: Number(stopLoss.toFixed(digits)),
    takeProfit: Number(takeProfit.toFixed(digits)),
    riskReward: takeProfitRatio,
    indicators,
    autonomousDecision: {
      regime,
      autoLotSize: estimatedAutoLots,
      riskCapital: 350,
      recommendedAction: `${type} ${estimatedAutoLots} Lots at ${currentPrice.toFixed(digits)} (Dynamic ${regime})`,
    },
  };
}
