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
import { sendWebPush, sendNotificationMessage } from './services/notifications';
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
    updatePrice
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
            notificationProvider: data.notificationProvider || useTradingStore.getState().notificationProvider,
            discordWebhookUrl: data.discordWebhookUrl || useTradingStore.getState().discordWebhookUrl,
            telegramBotToken: data.telegramBotToken || useTradingStore.getState().telegramBotToken,
            telegramChatId: data.telegramChatId || useTradingStore.getState().telegramChatId,
            timezone: data.timezone || useTradingStore.getState().timezone,
            reportConfig: data.reportConfig || useTradingStore.getState().reportConfig,
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
      setDataCountdown(dataInterval);
    }
  }, [dataCountdown, autoTradingActive, dataInterval]);

  // AI Analysis & Execution Loop
  useEffect(() => {
    if (!autoTradingActive) return;

    if (analysisCountdown <= 0) {
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
    <div className="flex flex-col md:flex-row h-screen w-full bg-black text-zinc-100 overflow-hidden font-sans">
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
