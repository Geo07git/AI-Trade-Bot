import React from 'react';
import { useTradingStore } from '../store';
import { requestNotificationPermission } from '../services/notifications';

export function Settings() {
  const { 
    dataInterval, 
    analysisInterval, 
    setDataInterval, 
    setAnalysisInterval, 
    autoTradingActive, 
    setAutoTradingActive, 
    setBalance,
    apiKey,
    apiSecret,
    setApiKey,
    setApiSecret
  } = useTradingStore();

  const handleEnablePush = async () => {
    await requestNotificationPermission();
  };

  return (
    <div className="p-8 h-full overflow-y-auto max-w-2xl mx-auto">
      <div className="mb-10">
        <h2 className="text-2xl font-serif text-white tracking-tight">Setări Platformă</h2>
        <p className="text-zinc-400 mt-2 text-sm">Configurare parametri aplicație și intervale de timp.</p>
      </div>

      <div className="max-w-2xl space-y-8">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-serif text-zinc-200">Automatizare Calcul (Auto-Trading AI)</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">{autoTradingActive ? `Activ` : 'Oprit'}</span>
              <button 
                onClick={() => setAutoTradingActive(!autoTradingActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autoTradingActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoTradingActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-zinc-400 mb-6">
            Sistemul rulează modelele de AI pentru a genera semnale și a efectua tranzacții automate pentru activele marcate ca <strong>"Activ"</strong>.
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="font-serif text-lg mb-4 text-white">Interval Actualizare Date & Prețuri</h3>
          <p className="text-sm text-zinc-400 mb-6">
            Frecvența cu care se actualizează prețurile de pe piață, se verifică Stop Loss / Take Profit și se reîmprospătează interfața (Dashboard).
          </p>
          
          <div className="flex gap-4 flex-wrap">
            {[10, 30, 60, 300].map(val => (
              <button
                key={val}
                onClick={() => setDataInterval(val)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors border ${
                  dataInterval === val 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-zinc-800/40 text-zinc-300 border-white/5 hover:bg-white/5'
                }`}
              >
                {val === 300 ? '5 min' : val === 60 ? '1 min' : `${val} sec`}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="font-serif text-lg mb-4 text-white">Interval Analiză AI & Execuție Semnale</h3>
          <p className="text-sm text-zinc-400 mb-6">
            Frecvența cu care se apelează modelul AI (LLM / Model ML) pentru a recalcula probabilitățile, a genera semnale (BUY/SELL) și a lua decizii de execuție. Un interval mai mare economisește apeluri API.
          </p>
          
          <div className="flex gap-4 flex-wrap">
            {[30, 60, 120, 300, 900].map(val => (
              <button
                key={val}
                onClick={() => setAnalysisInterval(val)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors border ${
                  analysisInterval === val 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-zinc-800/40 text-zinc-300 border-white/5 hover:bg-white/5'
                }`}
              >
                {val >= 60 ? `${val / 60} min` : `${val} sec`}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-serif text-zinc-200 mb-4">Conectare Exchange (API Keys)</h3>
          <p className="text-sm text-zinc-400 mb-4">Introdu cheile API pentru a permite botului să execute tranzacții reale pe bursa ta. Pentru moment, cheile sunt stocate doar local în browser.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">API Key</label>
              <input 
                type="text" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Introdu API Key..." 
                className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm" 
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">API Secret</label>
              <input 
                type="password" 
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Introdu API Secret..." 
                className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm" 
              />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-serif text-zinc-200 mb-4">Paper Trading Setup</h3>
          <p className="text-sm text-zinc-400 mb-4">Sistemul rulează 100% offline pentru execuție (fără API-uri de brokeri reali). Setările de mai jos definesc capitalul tău virtual de test.</p>
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
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
          <h3 className="text-lg font-serif text-zinc-200 mb-4">Notificări Push Desktop</h3>
          <p className="text-sm text-zinc-400 mb-4">Primește notificări push direct pe desktop atunci când AI-ul execută o tranzacție automată de cumpărare sau vânzare.</p>
          <button 
            onClick={handleEnablePush}
            className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 font-semibold rounded-lg text-sm transition-colors">
            Activează Notificările
          </button>
        </div>
      </div>
    </div>
  );
}
