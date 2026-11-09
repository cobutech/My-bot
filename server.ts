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

// In-Memory Python MT5 Bridge State
interface BridgeState {
  connected: boolean;
  mode: 'PYTHON_MT5' | 'EMULATED_BRIDGE';
  brokerName: string;
  accountNumber: string;
  brokerServer: string;
  password?: string;
  accountType: string;
  environment: string;
  balance: number;
  equity: number;
  pingMs: number;
  leverage: number;
  lastHeartbeat: string;
  pendingOrders: any[];
  executedOrders: any[];
}

const bridgeState: BridgeState = {
  connected: true,
  mode: 'EMULATED_BRIDGE',
  brokerName: 'IC Markets Global',
  accountNumber: '839210',
  brokerServer: 'ICMarketsSC-Live',
  password: '••••••••',
  accountType: 'HEDGING',
  environment: 'REAL',
  balance: 25000.0,
  equity: 25000.0,
  pingMs: 1.4,
  leverage: 100,
  lastHeartbeat: new Date().toISOString(),
  pendingOrders: [],
  executedOrders: [],
};

// Handle Broker Login Submission
app.post('/api/bridge/login', (req, res) => {
  const { broker, server, login, password, accountType, environment, leverage } = req.body;
  if (broker) bridgeState.brokerName = String(broker);
  if (server) bridgeState.brokerServer = String(server);
  if (login) bridgeState.accountNumber = String(login);
  if (password) bridgeState.password = String(password);
  if (accountType) bridgeState.accountType = String(accountType);
  if (environment) bridgeState.environment = String(environment);
  if (leverage) bridgeState.leverage = Number(leverage);

  bridgeState.connected = true;
  bridgeState.mode = 'PYTHON_MT5';
  bridgeState.lastHeartbeat = new Date().toISOString();
  bridgeState.pingMs = Number((Math.random() * 1.5 + 0.8).toFixed(1));

  console.log(`[Bridge Login] Connected to Broker: ${bridgeState.brokerName} | Server: ${bridgeState.brokerServer} | Login: #${bridgeState.accountNumber}`);

  res.json({
    status: 'AUTHENTICATED',
    message: `Connected to MT5 account #${bridgeState.accountNumber} on ${bridgeState.brokerServer}`,
    account: {
      accountNumber: bridgeState.accountNumber,
      brokerName: bridgeState.brokerName,
      server: bridgeState.brokerServer,
      balance: bridgeState.balance,
      equity: bridgeState.equity,
      leverage: bridgeState.leverage,
      environment: bridgeState.environment,
      accountType: bridgeState.accountType,
      pingMs: bridgeState.pingMs,
    },
  });
});

// Python Bridge Status Endpoint
app.get('/api/bridge/status', (req, res) => {
  res.json({
    connected: bridgeState.connected,
    mode: bridgeState.mode,
    accountNumber: bridgeState.accountNumber,
    brokerServer: bridgeState.brokerServer,
    brokerName: bridgeState.brokerName,
    balance: bridgeState.balance,
    equity: bridgeState.equity,
    pingMs: bridgeState.pingMs,
    lastHeartbeat: bridgeState.lastHeartbeat,
    pendingCount: bridgeState.pendingOrders.length,
    executedCount: bridgeState.executedOrders.length,
  });
});

// Endpoint for Python MT5 Worker to send Heartbeat
app.post('/api/bridge/heartbeat', (req, res) => {
  const { account, server, balance, equity, ping } = req.body;
  bridgeState.connected = true;
  bridgeState.mode = 'PYTHON_MT5';
  if (account) bridgeState.accountNumber = String(account);
  if (server) bridgeState.brokerServer = String(server);
  if (balance !== undefined) bridgeState.balance = Number(balance);
  if (equity !== undefined) bridgeState.equity = Number(equity);
  if (ping !== undefined) bridgeState.pingMs = Number(ping);
  bridgeState.lastHeartbeat = new Date().toISOString();

  res.json({ status: 'ACK', serverTime: new Date().toISOString() });
});

// Endpoint for Python MT5 Worker to fetch pending orders
app.get('/api/bridge/pending-orders', (req, res) => {
  const orders = [...bridgeState.pendingOrders];
  bridgeState.pendingOrders = []; // Drain queue
  res.json({ orders });
});

// Endpoint for Node.js Bot to queue an order to the Python MT5 worker
app.post('/api/bridge/queue-order', (req, res) => {
  const order = req.body;
  bridgeState.pendingOrders.push(order);
  console.log(`[Bridge] Order queued for MT5 execution: #${order.ticket} ${order.symbol} ${order.type} ${order.volume} lots`);
  res.json({ status: 'QUEUED', ticket: order.ticket });
});

// Endpoint for Python MT5 Worker to report execution result
app.post('/api/bridge/report-execution', (req, res) => {
  const result = req.body;
  bridgeState.executedOrders.unshift({
    ...result,
    reportedAt: new Date().toISOString(),
  });
  if (bridgeState.executedOrders.length > 100) bridgeState.executedOrders.pop();
  console.log(`[Bridge] Python reported execution: ticket #${result.ticket} -> MT5 order #${result.mt5Ticket}`);
  res.json({ status: 'CONFIRMED' });
});

// Simulate Python Bridge connection toggle
app.post('/api/bridge/toggle-simulate', (req, res) => {
  const { mode } = req.body;
  bridgeState.mode = mode || 'PYTHON_MT5';
  bridgeState.connected = true;
  bridgeState.lastHeartbeat = new Date().toISOString();
  bridgeState.pingMs = Number((Math.random() * 2 + 0.8).toFixed(1));
  res.json({ status: 'OK', bridgeState });
});

// Serve ready-to-run Python MT5 Bridge script with pre-configured account credentials
app.get('/api/bridge/script', (req, res) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const serverUrl = `${protocol}://${host}`;

  const pythonScript = `"""
MT5 Python Account Bridge for QuantBot
Broker: ${bridgeState.brokerName}
Server: ${bridgeState.brokerServer}
Account Login: ${bridgeState.accountNumber}
"""

import time
import requests
import json
try:
    import MetaTrader5 as mt5
except ImportError:
    print("MetaTrader5 library not found. Install via: pip install MetaTrader5 requests")
    mt5 = None

SERVER_URL = "${serverUrl}"
POLL_INTERVAL_SECONDS = 0.5

# Pre-configured broker credentials from QuantBot Web Terminal
MT5_LOGIN = ${bridgeState.accountNumber || '839210'}
MT5_PASSWORD = "${bridgeState.password || 'YOUR_PASSWORD'}"
MT5_SERVER = "${bridgeState.brokerServer || 'MetaQuotes-Demo'}"

def init_mt5(login=MT5_LOGIN, password=MT5_PASSWORD, server=MT5_SERVER):
    if not mt5:
        print("[ERROR] MetaTrader5 package is required to connect to desktop MT5.")
        return False
    
    if not mt5.initialize():
        print(f"[ERROR] mt5.initialize() failed, error code = {mt5.last_error()}")
        return False
    
    if login and password and server:
        authorized = mt5.login(login=int(login), password=password, server=server)
        if not authorized:
            print(f"[ERROR] Failed to login to MT5 account #{login} on {server}, error = {mt5.last_error()}")
            print("[INFO] Attempting to attach to currently active terminal session...")
            
    account_info = mt5.account_info()
    if account_info:
        print(f"[SUCCESS] Connected to MT5 Account #{account_info.login} on {account_info.server}")
        print(f"Balance: \${account_info.balance:.2f} | Equity: \${account_info.equity:.2f} | Leverage: 1:{account_info.leverage}")
    return True

def send_heartbeat():
    if not mt5:
        return
    acc = mt5.account_info()
    if not acc:
        return
    try:
        payload = {
            "account": acc.login,
            "server": acc.server,
            "balance": acc.balance,
            "equity": acc.equity,
            "ping": 1.2
        }
        requests.post(f"{SERVER_URL}/api/bridge/heartbeat", json=payload, timeout=2)
    except Exception as e:
        print(f"[Bridge] Heartbeat failed: {e}")

def execute_mt5_order(order):
    if not mt5:
        return
    symbol = order.get("symbol", "EURUSD")
    order_type = order.get("type", "BUY")
    volume = float(order.get("volume", 0.1))
    sl = float(order.get("sl", 0.0))
    tp = float(order.get("tp", 0.0))
    ticket = order.get("ticket")

    mt5.symbol_select(symbol, True)
    tick = mt5.symbol_info_tick(symbol)
    if not tick:
        print(f"[ERROR] Cannot get price tick for {symbol}")
        return

    price = tick.ask if order_type == "BUY" else tick.bid
    mt5_action = mt5.ORDER_TYPE_BUY if order_type == "BUY" else mt5.ORDER_TYPE_SELL

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": volume,
        "type": mt5_action,
        "price": price,
        "sl": sl,
        "tp": tp,
        "deviation": 25,
        "magic": 839210,
        "comment": "QuantBot Node Bridge",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }

    print(f"[EXEC] Dispatching to MT5: {order_type} {volume} {symbol} at {price} (SL: {sl}, TP: {tp})...")
    result = mt5.order_send(request)
    
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        print(f"[FAILED] MT5 Order error: retcode={result.retcode}, comment={result.comment}")
    else:
        print(f"[SUCCESS] MT5 Order executed! Deal Ticket #{result.order} at {result.price}")
        try:
            requests.post(f"{SERVER_URL}/api/bridge/report-execution", json={
                "ticket": ticket,
                "mt5Ticket": result.order,
                "executedPrice": result.price,
                "retcode": result.retcode,
            }, timeout=2)
        except Exception:
            pass

def poll_bridge_loop():
    print(f"[Bridge] Polling {SERVER_URL} for incoming trade signals...")
    last_hb = 0
    while True:
        try:
            now = time.time()
            if now - last_hb > 3.0:
                send_heartbeat()
                last_hb = now

            res = requests.get(f"{SERVER_URL}/api/bridge/pending-orders", timeout=3)
            if res.status_code == 200:
                data = res.json()
                orders = data.get("orders", [])
                for order in orders:
                    execute_mt5_order(order)
        except Exception as e:
            pass
        time.sleep(POLL_INTERVAL_SECONDS)

if __name__ == "__main__":
    print("=" * 60)
    print("  QuantBot Python-MT5 Bridge Worker")
    print(f"  Target Server: {SERVER_URL}")
    print(f"  Target Account: #{MT5_LOGIN} on {MT5_SERVER}")
    print("=" * 60)
    
    init_mt5()
    poll_bridge_loop()
`;

  res.setHeader('Content-Type', 'text/x-python');
  res.setHeader('Content-Disposition', 'attachment; filename="mt5_python_bridge.py"');
  res.send(pythonScript);
});

// Endpoint for AI Quant Market Analysis
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { symbol, timeframe, price, rsi, macd, trend, emaFast, emaSlow, atr, session } = req.body;

    if (!ai) {
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
Analyze the following real-time technical setup across 22 multi-asset markets:
Asset: ${symbol}
Timeframe: ${timeframe}
Current Price: ${price}
RSI (14): ${rsi}
MACD Histogram: ${macd?.histogram ?? 0}
Trend Bias: ${trend}
EMA 20: ${emaFast} | EMA 50: ${emaSlow}
ATR (14): ${atr}
Active Trading Session: ${session || 'Global Liquid Session'}

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

// Endpoint for MT5 Webhook signals
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
  res.json({ status: 'ok', time: new Date().toISOString(), platform: 'MT5 Quant Python-Node Bridge' });
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
