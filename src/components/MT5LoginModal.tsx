import React, { useState } from 'react';
import {
  X,
  Lock,
  Server,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  Building,
  ShieldCheck,
  Cpu,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { BrokerLoginCredentials, AccountInfo, PythonBridgeStatus } from '../types';

interface MT5LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: AccountInfo;
  bridgeStatus: PythonBridgeStatus;
  onLoginSubmit: (creds: BrokerLoginCredentials) => Promise<void>;
  onOpenPythonBridge: () => void;
}

const POPULAR_BROKERS = [
  { name: 'IC Markets Global', defaultServer: 'ICMarketsSC-Live', type: 'ECN / Raw Spread' },
  { name: 'Exness', defaultServer: 'Exness-Real12', type: 'Zero Spread' },
  { name: 'Pepperstone', defaultServer: 'Pepperstone-Edge-01', type: 'Razor ECN' },
  { name: 'MetaQuotes Software', defaultServer: 'MetaQuotes-Demo', type: 'Official Demo Server' },
  { name: 'FTMO / Prop Firm', defaultServer: 'FTMO-Server', type: 'Prop Trading' },
  { name: 'XM Global', defaultServer: 'XMGlobal-Real 55', type: 'Ultra Low' },
  { name: 'Custom Broker', defaultServer: '', type: 'Custom Server' },
];

export const MT5LoginModal: React.FC<MT5LoginModalProps> = ({
  isOpen,
  onClose,
  currentAccount,
  bridgeStatus,
  onLoginSubmit,
  onOpenPythonBridge,
}) => {
  const [broker, setBroker] = useState<string>('IC Markets Global');
  const [server, setServer] = useState<string>(bridgeStatus.brokerServer || 'ICMarketsSC-Live');
  const [login, setLogin] = useState<string>(currentAccount.accountNumber || '839210');
  const [password, setPassword] = useState<string>('••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [environment, setEnvironment] = useState<'REAL' | 'DEMO'>('REAL');
  const [accountType, setAccountType] = useState<'HEDGING' | 'NETTING'>('HEDGING');
  const [leverage, setLeverage] = useState<number>(currentAccount.leverage || 100);
  const [saveCredentials, setSaveCredentials] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBrokerChange = (bName: string) => {
    setBroker(bName);
    const matched = POPULAR_BROKERS.find((b) => b.name === bName);
    if (matched && matched.defaultServer) {
      setServer(matched.defaultServer);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage(null);

    try {
      await onLoginSubmit({
        broker,
        server,
        login,
        password,
        accountType,
        environment,
        leverage,
      });

      setSuccessMessage(`Account #${login} connected on ${server}`);
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 1000);
    } catch {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setBroker('MetaQuotes Software');
    setServer('MetaQuotes-Demo');
    setLogin(String(Math.floor(800000 + Math.random() * 90000)));
    setPassword('DemoPass2026!');
    setEnvironment('DEMO');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto select-none">
      <div className="relative w-full max-w-lg bg-[#12151f] border border-[#232938] rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#161a25] border-b border-[#232938]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Login to MT5 Trade Account</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Direct Bridge
                </span>
              </h2>
              <p className="text-[11px] text-[#94a3b8]">
                Authenticate with your MetaTrader 5 broker credentials for automated Python trade execution
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Quick Demo Pre-fill prompt */}
          <div className="flex items-center justify-between p-2.5 bg-[#171b28] rounded-lg border border-[#232938] text-[11px]">
            <span className="text-[#94a3b8]">Want to test with a standard ECN demo account?</span>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-amber-400 hover:text-amber-300 font-bold underline font-mono"
            >
              Fill Demo Server
            </button>
          </div>

          {/* Broker Selection */}
          <div>
            <label className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider block mb-1">
              Broker / Brokerage Type:
            </label>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {POPULAR_BROKERS.slice(0, 4).map((b) => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => handleBrokerChange(b.name)}
                  className={`p-2 rounded border text-left transition-colors font-mono text-[11px] ${
                    broker === b.name
                      ? 'bg-blue-950 border-blue-500 text-blue-300 font-bold'
                      : 'bg-[#0f121a] border-[#1e2330] text-[#94a3b8] hover:text-slate-200'
                  }`}
                >
                  <span className="block truncate">{b.name}</span>
                  <span className="block text-[9px] text-[#64748b]">{b.type}</span>
                </button>
              ))}
            </div>

            <div className="relative">
              <Building className="w-4 h-4 absolute left-3 top-2.5 text-[#64748b]" />
              <input
                type="text"
                required
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                placeholder="Enter or select broker (e.g. IC Markets, Exness, Pepperstone)"
                className="w-full bg-[#0d0f15] border border-[#232938] pl-9 pr-3 py-2 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Server Name */}
          <div>
            <label className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider block mb-1">
              Broker Server Name:
            </label>
            <div className="relative">
              <Server className="w-4 h-4 absolute left-3 top-2.5 text-[#64748b]" />
              <input
                type="text"
                required
                value={server}
                onChange={(e) => setServer(e.target.value)}
                placeholder="e.g. ICMarketsSC-Live, Exness-Real12, MetaQuotes-Demo"
                className="w-full bg-[#0d0f15] border border-[#232938] pl-9 pr-3 py-2 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-[10px] text-[#64748b] mt-1 block">
              Match the exact server name shown on your broker's MT5 login email.
            </span>
          </div>

          {/* Login ID and Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider block mb-1">
                MT5 Login ID / Account #:
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-[#64748b]" />
                <input
                  type="text"
                  required
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="e.g. 839210"
                  className="w-full bg-[#0d0f15] border border-[#232938] pl-9 pr-3 py-2 rounded text-white font-mono text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider block mb-1">
                Trader Password:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#64748b]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter MT5 Master Password"
                  className="w-full bg-[#0d0f15] border border-[#232938] pl-9 pr-10 py-2 rounded text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#64748b] hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Account Mode, Accounting System, and Leverage */}
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
            <div>
              <label className="text-[9px] text-[#64748b] uppercase block mb-1">Type</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className="w-full bg-[#0d0f15] border border-[#232938] px-2 py-1.5 rounded text-slate-200 focus:outline-none"
              >
                <option value="REAL">Real / Live</option>
                <option value="DEMO">Demo</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] text-[#64748b] uppercase block mb-1">Mode</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as any)}
                className="w-full bg-[#0d0f15] border border-[#232938] px-2 py-1.5 rounded text-slate-200 focus:outline-none"
              >
                <option value="HEDGING">Hedging (EA)</option>
                <option value="NETTING">Netting</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] text-[#64748b] uppercase block mb-1">Leverage</label>
              <select
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full bg-[#0d0f15] border border-[#232938] px-2 py-1.5 rounded text-slate-200 focus:outline-none"
              >
                <option value={30}>1:30</option>
                <option value={50}>1:50</option>
                <option value={100}>1:100</option>
                <option value={200}>1:200</option>
                <option value={500}>1:500</option>
              </select>
            </div>
          </div>

          {/* Save checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#94a3b8]">
              <input
                type="checkbox"
                checked={saveCredentials}
                onChange={(e) => setSaveCredentials(e.target.checked)}
                className="rounded border-[#3b4459] bg-[#0d0f15] text-blue-500 focus:ring-0"
              />
              <span>Save password and credentials for Python Bridge</span>
            </label>

            <button
              type="button"
              onClick={onOpenPythonBridge}
              className="text-purple-400 hover:text-purple-300 font-mono text-[11px] underline flex items-center gap-1"
            >
              <Cpu className="w-3 h-3" />
              <span>Inspect Python Bridge</span>
            </button>
          </div>

          {/* Success / Error Message Banner */}
          {successMessage && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-600 rounded text-emerald-300 flex items-center gap-2 font-mono text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#232938]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1e2433] hover:bg-[#283144] text-slate-300 rounded font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-2 transition-colors shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Login & Connect MT5</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
