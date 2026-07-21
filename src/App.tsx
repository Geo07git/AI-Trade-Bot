import React, { useState } from 'react';
import { ViewState } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AIAnalyst } from './components/AIAnalyst';
import { TradeLogs } from './components/TradeLogs';
import { Strategies } from './components/Strategies';
import { DataSources } from './components/DataSources';
import { Alerts } from './components/Alerts';
import { UserGuide } from './components/UserGuide';
import { useTradingStore } from './store';
import { requestNotificationPermission } from './services/notifications';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const { setBalance } = useTradingStore();

  const handleEnablePush = async () => {
    await requestNotificationPermission();
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] text-zinc-100 overflow-hidden font-sans">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 h-full overflow-hidden relative">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'strategies' && <Strategies />}
        {currentView === 'data_sources' && <DataSources />}
        {currentView === 'analyst' && <AIAnalyst />}
        {currentView === 'alerts' && <Alerts />}
        {currentView === 'logs' && <TradeLogs />}
        {currentView === 'guide' && <UserGuide />}
        
        {/* Placeholder for Backtesting */}
        {currentView === 'backtesting' && (
          <div className="p-8 h-full flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-serif text-zinc-300 mb-2">Backtesting Engine</h2>
            <p className="text-zinc-500 max-w-md">
              Configure strategy parameters and run historical data simulations. This module requires a connected broker API for historical data ingestion.
            </p>
          </div>
        )}

        {/* Placeholder for Settings */}
        {currentView === 'settings' && (
          <div className="p-8 h-full flex flex-col items-start max-w-2xl mx-auto">
            <h2 className="text-2xl font-serif text-zinc-100 mb-8">Platform Integration</h2>
            
            <div className="w-full space-y-6">
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
