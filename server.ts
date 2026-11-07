import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint for AI Quant Market Analysis
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { symbol, timeframe, price, rsi, macd, trend, emaFast, emaSlow, atr, session } = req.body;

    if (!ai) {
      // Deterministic fallback if API key is not yet set
      return res.json({
        analysis: `Technical overview for ${symbol} on ${timeframe}: Price currently testing key liquidity zone near ${price}. RSI (${rsi}) indicates ${Number(rsi) > 60 ? 'bullish momentum' : Number(rsi) < 40 ? 'oversold conditions' : 'consolidation'}. MACD is showing ${macd.histogram > 0 ? 'expanding positive histogram' : 'negative pressure'}. Recommended risk: Strict S/L at 1.5x ATR (${(Number(atr) * 1.5).toFixed(2)} pts) with a minimum 1:2 R:R target.`,
        recommendation: Number(rsi) > 55 && macd.histogram > 0 ? 'BULLISH_BIAS' : Number(rsi) < 45 && macd.histogram < 0 ? 'BEARISH_BIAS' : 'NEUTRAL_RANGE',
        keyLevels: {
          support: (Number(price) * 0.992).toFixed(symbol.includes('XAU') ? 2 : 1),
          resistance: (Number(price) * 1.008).toFixed(symbol.includes('XAU') ? 2 : 1),
          stopLoss: (Number(price) - Number(atr) * 1.5).toFixed(symbol.includes('XAU') ? 2 : 1),
          takeProfit: (Number(price) + Number(atr) * 3).toFixed(symbol.includes('XAU') ? 2 : 1),
        },
      });
    }

    const prompt = `You are an elite quantitative hedge fund trader and algorithmic MT5 Expert Advisor architect.
Analyze the following real-time technical setup:
Asset: ${symbol} (${symbol.includes('XAU') ? 'Gold Spot / USD' : 'Cryptocurrency'})
Timeframe: ${timeframe}
Current Price: ${price}
RSI (14): ${rsi}
MACD Histogram: ${macd?.histogram ?? 0}
Trend Bias: ${trend}
EMA 20: ${emaFast} | EMA 50: ${emaSlow}
ATR (14): ${atr}
Active Trading Session: ${session || 'London/New York overlap'}

Provide a concise, professional institutional trade brief in valid JSON format with the following keys:
- "sentiment": "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL"
- "confidence": integer between 50 and 96
- "rationale": 2-3 concise sentences explaining the technical confluence (order flow, indicator confluence, liquidity sweeps).
- "support": estimated key support price
- "resistance": estimated key resistance price
- "suggestedSL": suggested stop loss level
- "suggestedTP": suggested take profit level
- "riskAdvice": one sentence on position sizing and drawdown prevention.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini analysis error:', error);
    return res.status(500).json({
      error: 'Failed to generate AI analysis',
      message: error?.message || 'Internal server error',
    });
  }
});

// Endpoint for MT5 Webhook signals (enables simulated or real desktop MT5 bridge)
app.post('/api/mt5/webhook', (req, res) => {
  const signal = req.body;
  console.log('[MT5 Webhook Received]:', signal);
  return res.json({
    status: 'ACCEPTED',
    receivedAt: new Date().toISOString(),
    ticket: Math.floor(100000 + Math.random() * 900000),
    data: signal,
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), platform: 'MT5 Quant Engine' });
});

// Setup Vite in Dev or Static in Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MT5 QuantBot Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
