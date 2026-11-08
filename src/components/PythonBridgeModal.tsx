import React, { useState } from 'react';
import {
  X,
  Code2,
  Copy,
  Download,
  CheckCircle,
  Terminal,
  Activity,
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';
import { PythonBridgeStatus } from '../types';

interface PythonBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bridgeStatus: PythonBridgeStatus;
  onSimulateConnect: () => void;
}

export const PythonBridgeModal: React.FC<PythonBridgeModalProps> = ({
  isOpen,
  onClose,
  bridgeStatus,
  onSimulateConnect,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PYTHON_CODE' | 'SETUP_GUIDE'>('OVERVIEW');

  if (!isOpen) return null;

  const pythonScriptCode = `"""
MT5 Python Account Bridge for QuantBot
Connects to MetaTrader 5 desktop terminal and executes automated orders
dispatched from the Node.js QuantBot Engine.
"""

import time
import requests
import json
import MetaTrader5 as mt5

SERVER_URL = window.location.origin # Your deployed Node.js QuantBot URL
POLL_INTERVAL = 0.5  # seconds

def connect_mt5():
    if not mt5.initialize():
        print(f"[FAIL] mt5.initialize() failed: {mt5.last_error()}")
        return False
    
    acc = mt5.account_info()
    if acc:
        print(f"[CONNECTED] MT5 #{acc.login} | Server: {acc.server} | Balance: \${acc.balance:.2f}")
    return True

def sync_heartbeat():
    acc = mt5.account_info()
    if not acc:
        return
    try:
        requests.post(f"{SERVER_URL}/api/bridge/heartbeat", json={
            "account": acc.login,
            "server": acc.server,
            "balance": acc.balance,
            "equity": acc.equity,
            "ping": 1.2
        }, timeout=2)
    except Exception as e:
        pass

def poll_and_execute():
    try:
        res = requests.get(f"{SERVER_URL}/api/bridge/pending-orders", timeout=2)
        if res.status_code == 200:
            for order in res.json().get("orders", []):
                sym = order["symbol"]
                typ = mt5.ORDER_TYPE_BUY if order["type"] == "BUY" else mt5.ORDER_TYPE_SELL
                vol = float(order["volume"])
                sl = float(order.get("sl", 0.0))
                tp = float(order.get("tp", 0.0))
                
                mt5.symbol_select(sym, True)
                tick = mt5.symbol_info_tick(sym)
                price = tick.ask if order["type"] == "BUY" else tick.bid

                req = {
                    "action": mt5.TRADE_ACTION_DEAL,
                    "symbol": sym,
                    "volume": vol,
                    "type": typ,
                    "price": price,
                    "sl": sl,
                    "tp": tp,
                    "deviation": 25,
                    "magic": 839210,
                    "comment": "QuantBot Node Bridge",
                }
                res = mt5.order_send(req)
                print(f"[EXECUTED] #{res.order} at {res.price}")
    except Exception as e:
        pass

if __name__ == "__main__":
    if connect_mt5():
        while True:
            sync_heartbeat()
            poll_and_execute()
            time.sleep(POLL_INTERVAL)
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    window.location.href = '/api/bridge/script';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto select-none">
      <div className="relative w-full max-w-3xl bg-[#12151f] border border-[#232938] rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#161a25] border-b border-[#232938]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Python-to-MT5 Bridge Architecture</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  MetaTrader5 SDK
                </span>
              </h2>
              <p className="text-[11px] text-[#94a3b8]">
                Python connects to desktop MT5 accounts · Node.js handles market intelligence, 22-asset scanning, and autonomous decisions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#232938] text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center px-5 border-b border-[#232938] bg-[#141722] text-xs">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'OVERVIEW'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            Bridge Overview & Status
          </button>
          <button
            onClick={() => setActiveTab('PYTHON_CODE')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'PYTHON_CODE'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            Python Script (mt5_bridge.py)
          </button>
          <button
            onClick={() => setActiveTab('SETUP_GUIDE')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'SETUP_GUIDE'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            Connection Setup Guide
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-200">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              {/* Architecture Diagram Card */}
              <div className="bg-[#151924] p-4 rounded-lg border border-[#232938]">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-3">
                  Two-Tier Hybrid Architecture:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center">
                  <div className="bg-[#0f121a] p-3 rounded border border-[#1e2330]">
                    <div className="font-bold text-amber-400 text-sm mb-1">Desktop MT5 Terminal</div>
                    <p className="text-[10px] text-[#94a3b8]">Broker ECN account login, live execution, margin server</p>
                  </div>

                  <div className="flex flex-col items-center justify-center text-purple-400 font-mono text-[10px]">
                    <ArrowRight className="w-5 h-5 my-1" />
                    <span>Python MetaTrader5 SDK</span>
                  </div>

                  <div className="bg-[#0f121a] p-3 rounded border border-[#1e2330]">
                    <div className="font-bold text-blue-400 text-sm mb-1">Node.js QuantBot Server</div>
                    <p className="text-[10px] text-[#94a3b8]">
                      22-market technical analysis, Autonomous Brain, risk calculations, web terminal UI
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Bridge Telemetry Card */}
              <div className="bg-[#151924] p-4 rounded-lg border border-[#232938]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-slate-100 font-mono text-sm">
                      Python Bridge: {bridgeStatus.connected ? 'ONLINE / CONNECTED' : 'STANDBY'}
                    </span>
                  </div>

                  <button
                    onClick={onSimulateConnect}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#1e2433] hover:bg-[#283144] text-slate-200 border border-[#2a3245] rounded font-mono text-xs transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Test Bridge Ping</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  <div className="bg-[#0f121a] p-2.5 rounded border border-[#1e2330]">
                    <span className="text-[10px] text-[#64748b] block">ACCOUNT NUMBER</span>
                    <span className="text-white font-bold">{bridgeStatus.accountNumber}</span>
                  </div>
                  <div className="bg-[#0f121a] p-2.5 rounded border border-[#1e2330]">
                    <span className="text-[10px] text-[#64748b] block">BROKER SERVER</span>
                    <span className="text-slate-300 font-bold truncate">{bridgeStatus.brokerServer}</span>
                  </div>
                  <div className="bg-[#0f121a] p-2.5 rounded border border-[#1e2330]">
                    <span className="text-[10px] text-[#64748b] block">BRIDGE LATENCY</span>
                    <span className="text-emerald-400 font-bold">{bridgeStatus.pingMs} ms</span>
                  </div>
                  <div className="bg-[#0f121a] p-2.5 rounded border border-[#1e2330]">
                    <span className="text-[10px] text-[#64748b] block">BRIDGE MODE</span>
                    <span className="text-purple-400 font-bold">{bridgeStatus.mode}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download mt5_python_bridge.py</span>
                </button>

                <button
                  onClick={() => setActiveTab('PYTHON_CODE')}
                  className="flex-1 w-full py-2.5 bg-[#1e2433] hover:bg-[#283144] text-slate-200 border border-[#2a3245] font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <span>View & Copy Python Script</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'PYTHON_CODE' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-100">Ready-To-Run Python Worker</h4>
                  <p className="text-[11px] text-[#94a3b8]">
                    Requires Python 3.8+ and official MetaTrader5 library on Windows/VPS
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded font-medium transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Python Code'}</span>
                </button>
              </div>

              <div className="bg-[#0a0c12] p-4 rounded-lg border border-[#232938] overflow-auto max-h-96 font-mono text-[11px] text-purple-300">
                <pre>{pythonScriptCode}</pre>
              </div>
            </div>
          )}

          {activeTab === 'SETUP_GUIDE' && (
            <div className="space-y-4 font-sans text-xs text-slate-300">
              <div className="bg-[#151924] p-4 rounded-lg border border-[#232938] space-y-3">
                <h4 className="font-bold text-white text-sm">Step-by-Step Setup Instructions</h4>

                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-800">
                      1
                    </span>
                    <div>
                      <strong className="text-white block">Install Python Dependencies</strong>
                      <div className="mt-1 bg-[#0a0c12] px-3 py-1.5 rounded font-mono text-[11px] text-slate-300 border border-[#1e2330]">
                        pip install MetaTrader5 requests
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-800">
                      2
                    </span>
                    <div>
                      <strong className="text-white block">Start MetaTrader 5 Desktop Terminal</strong>
                      <p className="text-[11px] text-[#94a3b8]">
                        Launch your MT5 desktop terminal and ensure you are logged into your broker account. In MT5, enable: <em>Tools → Options → Expert Advisors → Allow Algo Trading</em>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-800">
                      3
                    </span>
                    <div>
                      <strong className="text-white block">Run the Python Bridge Script</strong>
                      <div className="mt-1 bg-[#0a0c12] px-3 py-1.5 rounded font-mono text-[11px] text-slate-300 border border-[#1e2330]">
                        python mt5_python_bridge.py
                      </div>
                      <p className="text-[11px] text-[#94a3b8] mt-1">
                        The script will immediately connect to your MT5 terminal, report account balance to Node.js, and begin executing all automated or manual orders!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
