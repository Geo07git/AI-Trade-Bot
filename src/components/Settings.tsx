import React from 'react';
import { useTradingStore } from '../store';
import { requestNotificationPermission } from '../services/notifications';
import { NotificationDiagnostic } from './NotificationDiagnostic';

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
    setApiSecret,
    geminiApiKey,
    setGeminiApiKey,
    notificationProvider,
    setNotificationProvider,
    discordWebhookUrl,
    setDiscordWebhookUrl,
    telegramBotToken,
    setTelegramBotToken,
    telegramChatId,
    setTelegramChatId,
    binanceMode,
    setBinanceMode,
    maxLogs,
    setMaxLogs,
    clearLogs
  } = useTradingStore();

  const handleEnablePush = async () => {
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        alert("Notificările sunt acum activate!");
      } else {
        alert("Nu s-a putut obține permisiunea pentru notificări.\n\nNOTĂ: Dacă te afli în preview-ul integrat, browserele blochează deseori ferestrele pop-up pentru notificări din iframe-uri.\n\nTe rog să deschizi aplicația într-un tab nou (folosind butonul de 'Open in new tab' din dreapta sus) și să încerci din nou.");
      }
    } catch (err) {
      alert("Eroare la solicitarea notificărilor. Te rog deschide aplicația într-un tab nou și încearcă din nou.");
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto max-w-2xl mx-auto pb-32">
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
          <p className="text-sm text-zinc-400 mb-4">Introdu cheile API pentru a permite botului să execute tranzacții. Pentru siguranță, dezactivează permisiunile de Withdraw (retragere).</p>
          
          <div className="mb-6">
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-sans">Mod de Funcționare</label>
            <div className="flex gap-2">
              {(['paper', 'testnet', 'live'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setBinanceMode(mode)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors border ${
                    binanceMode === mode 
                    ? (mode === 'live' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30') 
                    : 'bg-zinc-800/40 text-zinc-300 border-white/5 hover:bg-white/5'
                  }`}
                >
                  {mode === 'paper' ? 'Paper Trading (Demo Local)' : mode === 'testnet' ? 'Binance Testnet' : 'Binance Real (LIVE)'}
                </button>
              ))}
            </div>
            {binanceMode === 'live' && (
              <p className="text-xs text-red-400 mt-2 bg-red-500/10 p-2 rounded border border-red-500/20">
                Atenție: Ești în modul LIVE. Tranzacțiile vor fi efectuate cu fonduri reale pe Binance! Începe cu sume mici!
              </p>
            )}
          </div>

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
          <h3 className="text-lg font-serif text-zinc-200 mb-4">Google Gemini (AI Analyst)</h3>
          <p className="text-sm text-zinc-400 mb-4">Introdu propria ta cheie API Gemini pentru a debloca capabilitățile AI Analyst. Cheia este stocată local și folosită pentru a genera rapoarte și semnale.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Gemini API Key</label>
              <input 
                type="password" 
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..." 
                className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm" 
              />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-serif text-zinc-200 mb-4">Notificări (Discord / Telegram)</h3>
          <p className="text-sm text-zinc-400 mb-4">Primește semnalele de tranzacționare direct pe telefon. Alege platforma preferată și configurează detaliile.</p>
          <div className="space-y-6">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="provider" 
                  value="discord"
                  checked={notificationProvider === 'discord'}
                  onChange={() => setNotificationProvider('discord')}
                  className="accent-emerald-500"
                />
                <span className="text-sm text-zinc-300">Discord</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="provider" 
                  value="telegram"
                  checked={notificationProvider === 'telegram'}
                  onChange={() => setNotificationProvider('telegram')}
                  className="accent-emerald-500"
                />
                <span className="text-sm text-zinc-300">Telegram</span>
              </label>
            </div>

            {notificationProvider === 'discord' && (
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Discord Webhook URL</label>
                <input 
                  type="text" 
                  value={discordWebhookUrl}
                  onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..." 
                  className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm" 
                />
              </div>
            )}

            {notificationProvider === 'telegram' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Telegram Bot Token</label>
                  <input 
                    type="password" 
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    placeholder="Ex: 123456789:ABCdefGHIjklMNOpqrs..." 
                    className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Chat ID</label>
                  <input 
                    type="text" 
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="Ex: 123456789" 
                    className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm" 
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-serif text-zinc-200 mb-2">Capacitate Stocare Loguri (Server / VPS)</h3>
          <p className="text-sm text-zinc-400 mb-4">Setează numărul maxim de loguri păstrate în memorie și pe server. Ideal pentru găzduire continuă pe un VPS.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-sans">Număr Maxim Loguri Salvate</label>
              <div className="flex items-center gap-2 flex-wrap">
                {[100, 250, 500, 1000, 2500, 5000, 10000].map(limit => (
                  <button
                    key={limit}
                    onClick={() => setMaxLogs(limit)}
                    className={`px-3.5 py-2 font-medium rounded-lg text-xs transition-colors border ${
                      (maxLogs || 1000) === limit
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                        : 'bg-zinc-800/40 text-zinc-300 border-white/5 hover:bg-zinc-800'
                    }`}
                  >
                    {limit >= 1000 ? `${limit / 1000}k` : limit} {limit === 1000 ? '(Recomandat)' : limit >= 2500 ? '(VPS)' : ''}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-white/5">
              <span className="text-xs text-zinc-500">Capacitate curentă selectată: <strong className="text-emerald-400">{maxLogs || 1000} loguri</strong></span>
              <button
                onClick={() => {
                  if (window.confirm('Ștergi toate logurile din memorie?')) clearLogs();
                }}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                Șterge toate logurile
              </button>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-serif text-zinc-200 mb-4">Paper Trading Setup</h3>
          <p className="text-sm text-zinc-400 mb-4">Sistemul rulează 100% offline pentru execuție (fără API-uri de brokeri reali). Setările de mai jos definesc capitalul tău virtual de test.</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              {[100, 500, 1000, 10000].map(amt => (
                <button 
                  key={amt}
                  onClick={async () => {
                    setBalance(amt);
                    try {
                      await fetch('/api/bot/reset', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ balance: amt })
                      });
                    } catch (e) {
                      console.error('Reset error:', e);
                    }
                  }}
                  className={`px-4 py-2 font-medium rounded-md transition-colors text-sm border ${
                    amt === 100
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                    : 'bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 border-white/5'
                  }`}>
                  Resetare la ${amt} {amt === 100 ? '(Recomandat)' : ''}
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-500">Toate pozițiile curente vor fi închise și soldul va fi reinițializat.</p>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-serif text-zinc-200 mb-2">Notificări Push Desktop</h3>
            <p className="text-sm text-zinc-400 mb-4">Primește notificări push direct pe desktop atunci când AI-ul execută o tranzacție automată de cumpărare sau vânzare.</p>
            <button 
              onClick={handleEnablePush}
              className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 font-semibold rounded-lg text-sm transition-colors">
              Activează Notificările
            </button>
          </div>

          <NotificationDiagnostic />
        </div>
      </div>
    </div>
  );
}
