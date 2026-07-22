import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AIAnalyst } from './components/AIAnalyst';
import { TradeLogs } from './components/TradeLogs';
import { Strategies } from './components/Strategies';
import { Alerts } from './components/Alerts';
import { UserGuide } from './components/UserGuide';
import { Backtesting } from './components/Backtesting';
import { useTradingStore } from './store';
import { requestNotificationPermission, sendWebPush } from './services/notifications';
import { generateSignal } from './services/ml';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const { 
    balance, 
    setBalance, 
    autoTradingActive, 
    autoTradingInterval, 
    setAutoTradingActive, 
    setAutoTradingInterval 
  } = useTradingStore();

  const [countdown, setCountdown] = useState(autoTradingInterval);

  const handleEnablePush = async () => {
    await requestNotificationPermission();
  };

  // Tick countdown timer
  useEffect(() => {
    if (!autoTradingActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [autoTradingActive]);

  // Execute automatic calculations and trading on trigger
  useEffect(() => {
    if (!autoTradingActive) return;

    if (countdown <= 0) {
      // Trigger automatic inference & trading on the absolute freshest state
      const state = useTradingStore.getState();
      const activeItems = state.watchlist.filter(w => w.active);

      if (activeItems.length > 0) {
        state.addLog(`[Calcul Automat] Se rulează modelul de inferență ML automat...`, 'info');

        activeItems.forEach((item) => {
          if (!item.price) return;

          const signal = generateSignal(item.symbol, item.price);
          state.updateSignal(item.symbol, signal);

          state.addLog(`[Calcul Automat] ${item.symbol}: Semnal ${signal.action} (${signal.prob}%)`, 'info');

          if (signal.action === 'BUY' && signal.prob >= 60) {
            const amountToBuy = parseFloat((1000 / item.price).toFixed(6));
            state.executeTrade(item.symbol, 'BUY', item.price, amountToBuy);
            sendWebPush('Semnal AI Automat: CUMPĂRĂ', `Activ: ${item.symbol}\nPreț: $${item.price}\nTranzacție virtuală automată executată.`);
          } else if (signal.action === 'SELL' && signal.prob >= 60) {
            const amountToSell = parseFloat((1000 / item.price).toFixed(6));
            state.executeTrade(item.symbol, 'SELL', item.price, amountToSell);
            sendWebPush('Semnal AI Automat: VÂNZARE', `Activ: ${item.symbol}\nPreț: $${item.price}\nTranzacție virtuală automată executată.`);
          }
        });
      } else {
        state.addLog(`[Calcul Automat] Nu există active setate ca "Activ" pentru calcul automat.`, 'warning');
      }

      setCountdown(autoTradingInterval);
    }
  }, [countdown, autoTradingActive, autoTradingInterval]);

  // Reset countdown if interval configuration changes
  useEffect(() => {
    setCountdown(autoTradingInterval);
  }, [autoTradingInterval]);

  return (
    <div className="flex h-screen w-full bg-[#050505] text-zinc-100 overflow-hidden font-sans">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 h-full overflow-hidden relative">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'strategies' && <Strategies />}
        {currentView === 'analyst' && <AIAnalyst />}
        {currentView === 'alerts' && <Alerts />}
        {currentView === 'logs' && <TradeLogs />}
        {currentView === 'guide' && <UserGuide />}
        
        {/* Backtesting Module */}
        {currentView === 'backtesting' && <Backtesting />}

        {/* Placeholder for Settings */}
        {currentView === 'settings' && (
          <div className="p-8 h-full overflow-y-auto max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-serif text-zinc-100">Setări Platformă</h2>
            
            <div className="w-full space-y-6">
              {/* Auto-Trading Setup Card */}
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-serif text-zinc-200">Automatizare Calcul (Auto-Trading AI)</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">{autoTradingActive ? `Activ (ticking în ${countdown}s)` : 'Oprit'}</span>
                    <button 
                      onClick={() => setAutoTradingActive(!autoTradingActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autoTradingActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoTradingActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-zinc-400 mb-6">
                  Sistemul rulează modelele de Machine Learning local în browser la intervale regulate pentru a genera semnale și a efectua tranzacții automate pentru activele marcate ca <strong>"Activ"</strong>.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-sans">Interval Execuție Calcul</label>
                    <div className="flex gap-2">
                      {[
                        { label: '15s', value: 15 },
                        { label: '30s', value: 30 },
                        { label: '1 min', value: 60 },
                        { label: '5 min', value: 300 },
                        { label: '15 min', value: 900 },
                        { label: '1 oră', value: 3600 }
                      ].map((item) => (
                        <button
                          key={item.value}
                          onClick={() => {
                            setAutoTradingInterval(item.value);
                            setCountdown(item.value);
                          }}
                          className={`px-3 py-1.5 rounded text-xs font-mono border transition-all ${autoTradingInterval === item.value ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold' : 'bg-zinc-800/40 border-white/5 text-zinc-400 hover:text-zinc-200'}`}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-serif text-zinc-200 mb-4">Paper Trading Setup</h3>
                <p className="text-sm text-zinc-400 mb-4">Sistemul rulează 100% offline pentru execuție (fără API-uri de brokeri reali). Setările de mai jos definesc capitalul tău virtual de test.</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setBalance(10000)}
                      className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium rounded-md transition-colors text-sm border border-rose-500/20">
                      Resetare Portofoliu (la $10,000)
                    </button>
                    <span className="text-xs text-zinc-500">Toate pozițiile curente vor fi închise și istoricul logurilor va fi șters.</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-serif text-zinc-200 mb-4">Notificări & Alerte (Push & Email)</h3>
                <p className="text-sm text-zinc-400 mb-4">Botul rulează local și generează semnale de cumpărare/vânzare. Alege cum vrei să fii notificat (pe desktop/telefon).</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-800/40 border border-white/5 rounded-lg">
                    <div>
                      <div className="text-sm text-white font-medium mb-1">Web Push Notifications</div>
                      <div className="text-xs text-zinc-400">Primești alerte direct pe telefon sau desktop via browser (fără alte aplicații).</div>
                    </div>
                    <button 
                      onClick={handleEnablePush}
                      className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium rounded-md transition-colors text-xs border border-emerald-500/20">
                      Activează Push
                    </button>
                  </div>
                  
                  <div className="pt-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Gmail Integration (App Password)</label>
                    <input type="email" placeholder="email@gmail.com" className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm mb-2" />
                    <input type="password" placeholder="Gmail App Password" className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm" />
                  </div>
                  
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 font-medium rounded-md transition-colors mt-4 text-sm border border-white/5">
                    Salvează Integrările
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
