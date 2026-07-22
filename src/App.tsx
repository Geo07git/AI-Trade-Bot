import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ViewState } from './types';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AIAnalyst } from './components/AIAnalyst';
import { TradeLogs } from './components/TradeLogs';
import { Strategies } from './components/Strategies';
import { Alerts } from './components/Alerts';
import { UserGuide } from './components/UserGuide';
import { Backtesting } from './components/Backtesting';
import { Settings } from './components/Settings';
import { useTradingStore } from './store';
import { sendWebPush, sendWebhookMessage } from './services/notifications';
import { generateSignal } from './services/ml';
import { fetchLivePrice } from './services/api';
import { Menu } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { 
    balance, 
    setBalance, 
    autoTradingActive, 
    dataInterval,
    analysisInterval, 
    setAutoTradingActive, 
    updatePrice,
    webhookUrl
  } = useTradingStore();


  const [dataCountdown, setDataCountdown] = useState(dataInterval);
  const [analysisCountdown, setAnalysisCountdown] = useState(analysisInterval);

  // Poll server background bot engine state every 3 seconds
  useEffect(() => {
    const fetchServerBotState = async () => {
      try {
        const res = await fetch('/api/bot/state');
        if (res.ok) {
          const data = await res.json();
          // Sync server state to Zustand store
          useTradingStore.setState({
            balance: data.balance,
            positions: data.positions,
            logs: data.logs,
            watchlist: data.watchlist,
            autoTradingActive: data.autoTradingActive,
            webhookUrl: data.webhookUrl || useTradingStore.getState().webhookUrl,
          });
        }
      } catch (err) {
        console.debug('Server state sync error:', err);
      }
    };

    fetchServerBotState();
    const interval = setInterval(fetchServerBotState, 3000);
    return () => clearInterval(interval);
  }, []);

  // Tick countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDataCountdown((prev) => prev - 1);
      if (autoTradingActive) {
        setAnalysisCountdown((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [autoTradingActive]);

  // Data Update Loop (Prices & Indicators)
  useEffect(() => {
    if (dataCountdown <= 0) {
      const state = useTradingStore.getState();
      
      const fetchPrices = async () => {
        for (const item of state.watchlist) {
          const price = await fetchLivePrice(item.symbol);
          if (price) {
            state.updatePrice(item.symbol, price);
            
            // Check Stop Loss / Take Profit conditions dynamically here
            if (autoTradingActive) {
              const position = state.positions.find(p => p.symbol === item.symbol);
              if (position && position.amount > 0) {
                const pnlPercent = ((price - position.entryPrice) / position.entryPrice) * 100;
                if (pnlPercent <= -5) {
                  state.executeTrade(item.symbol, 'SELL', price, position.amount);
                  state.addLog(`[Stop Loss] Ieșire din ${item.symbol} la prețul de ${price} ($${(price * position.amount).toFixed(2)})`, 'warning');
                  sendWebPush('Stop Loss Executat', `Activ: ${item.symbol}\nPreț: $${price}\nMotiv: PNL a atins -5%`);
                  if (webhookUrl) sendWebhookMessage(webhookUrl, `🚨 **Stop Loss Executat**\nActiv: ${item.symbol}\nPreț: $${price}\nMotiv: PNL a atins -5%`);
                } else if (pnlPercent >= 10) {
                  state.executeTrade(item.symbol, 'SELL', price, position.amount);
                  state.addLog(`[Take Profit] Ieșire din ${item.symbol} la prețul de ${price} ($${(price * position.amount).toFixed(2)})`, 'success');
                  sendWebPush('Take Profit Executat', `Activ: ${item.symbol}\nPreț: $${price}\nMotiv: PNL a atins +10%`);
                  if (webhookUrl) sendWebhookMessage(webhookUrl, `✅ **Take Profit Executat**\nActiv: ${item.symbol}\nPreț: $${price}\nMotiv: PNL a atins +10%`);
                }
              }
            }
          }
        }
      };

      fetchPrices();
      setDataCountdown(dataInterval);
    }
  }, [dataCountdown, autoTradingActive, dataInterval]);

  // AI Analysis & Execution Loop
  useEffect(() => {
    if (!autoTradingActive) return;

    if (analysisCountdown <= 0) {
      const state = useTradingStore.getState();
      const activeItems = state.watchlist.filter(w => w.active);

      if (activeItems.length > 0) {
        state.addLog(`[Calcul Automat AI] Se evaluează contextul de piață...`, 'info');

        activeItems.forEach((item) => {
          if (!item.price) return;

          const signal = generateSignal(item.symbol, item.price);
          // Only log if the signal is strong or changed? We update it silently to UI.
          state.updateSignal(item.symbol, signal);

          const position = state.positions.find(p => p.symbol === item.symbol);
          const isHolding = position && position.amount > 0;

          if (signal.action === 'BUY' && signal.prob >= 60) {
            if (!isHolding) {
              const amountToBuy = parseFloat((1000 / item.price).toFixed(6));
              state.addLog(`[Calcul Automat] ${item.symbol}: Semnal ${signal.action} (${signal.prob}% probabilitate). Executăm intrare.`, 'info');
              state.executeTrade(item.symbol, 'BUY', item.price, amountToBuy);
              sendWebPush('Semnal AI Automat: CUMPĂRĂ', `Activ: ${item.symbol}\nPreț: $${item.price}`);
              if (webhookUrl) sendWebhookMessage(webhookUrl, `🟢 **Semnal AI Automat: CUMPĂRĂ**\nActiv: ${item.symbol}\nPreț: $${item.price}`);
            }
          } else if (signal.action === 'SELL' && signal.prob >= 60) {
            if (isHolding) {
              state.addLog(`[Calcul Automat] ${item.symbol}: Semnal ${signal.action} (${signal.prob}% probabilitate). Executăm ieșire.`, 'info');
              state.executeTrade(item.symbol, 'SELL', item.price, position.amount);
              sendWebPush('Semnal AI Automat: VÂNZARE', `Activ: ${item.symbol}\nPreț: $${item.price}`);
              if (webhookUrl) sendWebhookMessage(webhookUrl, `🔴 **Semnal AI Automat: VÂNZARE**\nActiv: ${item.symbol}\nPreț: $${item.price}`);
            }
          }
        });
      }

      setAnalysisCountdown(analysisInterval);
    }
  }, [analysisCountdown, autoTradingActive, analysisInterval]);

  // Reset countdown if interval configuration changes
  useEffect(() => {
    setDataCountdown(dataInterval);
  }, [dataInterval]);

  useEffect(() => {
    setAnalysisCountdown(analysisInterval);
  }, [analysisInterval]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505] text-zinc-100 overflow-hidden font-sans">
      {/* Mobile Top Header */}
      <header className="md:hidden h-14 bg-zinc-900/90 border-b border-white/5 flex items-center justify-between px-3 shrink-0 z-30">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 text-zinc-300 hover:text-white rounded-lg bg-zinc-800/50 border border-white/5"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif italic text-base text-white font-semibold">AI.TRADE</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoTradingActive(!autoTradingActive)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer",
              autoTradingActive
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/40 text-rose-400"
            )}
            title="Pornire / Oprire tranzacționare server"
          >
            <span className={cn("w-2 h-2 rounded-full", autoTradingActive ? "bg-emerald-400 animate-pulse" : "bg-rose-500")}></span>
            <span>{autoTradingActive ? "24/7 ACTIV" : "24/7 OPRIT"}</span>
          </button>
        </div>
      </header>

      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="flex-1 h-full overflow-hidden relative">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'strategies' && <Strategies />}
        {currentView === 'analyst' && <AIAnalyst />}
        {currentView === 'alerts' && <Alerts />}
        {currentView === 'logs' && <TradeLogs />}
        {currentView === 'settings' && <Settings />}
        {currentView === 'guide' && <UserGuide />}
        
        {/* Backtesting Module */}
        {currentView === 'backtesting' && <Backtesting />}

      </main>
    </div>
  );
}
