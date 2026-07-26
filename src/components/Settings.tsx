import React, { useState } from 'react';
import { useTradingStore } from '../store';
import { requestNotificationPermission } from '../services/notifications';
import { NotificationDiagnostic } from './NotificationDiagnostic';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export function Settings() {
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; message: string | null; error: boolean }>(
    { loading: false, message: null, error: false }
  );
  const [binanceInspectorLoading, setBinanceInspectorLoading] = useState(false);
  const [binanceInspectorSymbol, setBinanceInspectorSymbol] = useState('BTCUSDT');
  const [binanceInspectorResult, setBinanceInspectorResult] = useState<any>(null);

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
    testnetApiKey,
    testnetApiSecret,
    setTestnetApiKey,
    setTestnetApiSecret,
    syncBinanceBalance,
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
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-serif text-zinc-200">Conectare Exchange (Binance)</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Configurează cheile API pentru Binance Testnet și Live. Pentru securitate maxima, dezactivează permisiunile de retragere (Withdrawals).
              </p>
            </div>
          </div>

          {/* Switch rapid pentru Mod Testnet */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mb-6 flex items-center justify-between">
            <div className="pr-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-amber-200 text-sm">Mod Testnet (Binance Testnet)</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                  binanceMode === 'testnet' 
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-400/30 font-bold' 
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                }`}>
                  {binanceMode === 'testnet' ? 'ACTIV' : 'INACTIV'}
                </span>
              </div>
              <p className="text-xs text-amber-300/80 mt-1">
                Lansează oricând tranzacții în mediul securizat de test <strong>testnet.binance.vision</strong> fără niciun risc pentru fondurile reale.
              </p>
            </div>
            <button 
              type="button"
              onClick={() => setBinanceMode(binanceMode === 'testnet' ? 'paper' : 'testnet')}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                binanceMode === 'testnet' ? 'bg-amber-500' : 'bg-zinc-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                binanceMode === 'testnet' ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-sans">Mod Execuție Selectat</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['paper', 'testnet', 'live'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setBinanceMode(mode)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors border text-center ${
                    binanceMode === mode 
                      ? (mode === 'live' 
                          ? 'bg-red-500/20 text-red-300 border-red-500/40 font-semibold' 
                          : mode === 'testnet' 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold' 
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold') 
                      : 'bg-zinc-800/40 text-zinc-400 border-white/5 hover:bg-white/5'
                  }`}
                >
                  {mode === 'paper' ? 'Paper (Demo Local)' : mode === 'testnet' ? 'Binance Testnet' : 'Binance Real (LIVE)'}
                </button>
              ))}
            </div>
            {binanceMode === 'live' && (
              <p className="text-xs text-red-400 mt-3 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                ⚠️ ATENȚIE: Modul LIVE este activat! Tranzacțiile vor fi trimise către API-ul Binance Real cu capitalul tău din cont.
              </p>
            )}
            {binanceMode === 'testnet' && (
              <p className="text-xs text-amber-300 mt-3 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                🟡 MOD TESTNET ACTIV: Ordinul va fi procesat pe Binance Spot Testnet (testnet.binance.vision).
              </p>
            )}
          </div>

          {/* Câmpuri Binance Testnet */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider font-mono">Binance Testnet Credentials</span>
              <a 
                href="https://testnet.binance.vision" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[11px] text-amber-400 hover:underline"
              >
                Obține Chei Testnet ↗
              </a>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-1 font-sans">Testnet API Key</label>
              <input 
                type="text" 
                value={testnetApiKey}
                onChange={(e) => setTestnetApiKey(e.target.value)}
                placeholder="Ex: 62a8f9b2c3d4..." 
                className="w-full bg-zinc-800/60 border border-amber-500/20 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-amber-500/50 font-mono text-sm" 
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-1 font-sans">Testnet Secret Key</label>
              <input 
                type="password" 
                value={testnetApiSecret}
                onChange={(e) => setTestnetApiSecret(e.target.value)}
                placeholder="Ex: 98f7e6d5c4b3..." 
                className="w-full bg-zinc-800/60 border border-amber-500/20 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-amber-500/50 font-mono text-sm" 
              />
            </div>
          </div>

          {/* Câmpuri Binance Live */}
          <div className="p-4 rounded-xl bg-zinc-800/30 border border-white/5 space-y-4">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono block">Binance Live (Real) Credentials</span>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Live Binance API Key</label>
              <input 
                type="text" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Introdu Live API Key..." 
                className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm" 
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Live Binance Secret Key</label>
              <input 
                type="password" 
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Introdu Live API Secret..." 
                className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm" 
              />
            </div>
          </div>

          {/* Test & Sync Balance Button */}
          <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <button
              type="button"
              disabled={syncStatus.loading || binanceMode === 'paper'}
              onClick={async () => {
                setSyncStatus({ loading: true, message: 'Se testează conexiunea și se descarcă balanța...', error: false });
                const res = await syncBinanceBalance();
                if (res && res.success) {
                  setSyncStatus({ 
                    loading: false, 
                    message: `Sincronizat cu succes! Balanță găsită: $${res.balance?.toFixed(2) || '0.00'} USDT`, 
                    error: false 
                  });
                } else {
                  setSyncStatus({ 
                    loading: false, 
                    message: `Eroare conexiune: ${res?.error || 'Cheile API sunt invalide sau respinse de Binance.'}`, 
                    error: true 
                  });
                }
              }}
              className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-medium rounded-lg text-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.loading ? 'animate-spin' : ''}`} />
              <span>Sincronizează Balanța din {binanceMode === 'testnet' ? 'Testnet' : binanceMode === 'live' ? 'Binance Live' : 'Exchange'}</span>
            </button>

            {syncStatus.message && (
              <div className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                syncStatus.error 
                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' 
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              }`}>
                {syncStatus.error ? <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
                <span>{syncStatus.message}</span>
              </div>
            )}
          </div>

          {/* Binance Service Inspector */}
          <div className="mt-6 pt-4 border-t border-white/5 bg-zinc-950/50 rounded-xl p-4 border border-white/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Inspector BinanceService.ts (Live Test & Interogare Directă)
            </h4>
            <p className="text-xs text-zinc-400 mb-3">
              Poți apela serviciul dedicat <code className="text-amber-300 font-mono text-[11px]">server/services/BinanceService.ts</code> direct din browser sau din cod pentru a interoga contul și tranzacțiile tale.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-3">
              <button
                type="button"
                disabled={binanceInspectorLoading || binanceMode === 'paper'}
                onClick={async () => {
                  setBinanceInspectorLoading(true);
                  try {
                    const res = await fetch('/api/binance/account');
                    const data = await res.json();
                    setBinanceInspectorResult(data);
                  } catch (err: any) {
                    setBinanceInspectorResult({ error: err?.message || 'Eroare conectare' });
                  } finally {
                    setBinanceInspectorLoading(false);
                  }
                }}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-mono border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                1. /api/binance/account (getAccountInfo)
              </button>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={binanceInspectorSymbol}
                  onChange={(e) => setBinanceInspectorSymbol(e.target.value.toUpperCase())}
                  placeholder="BTCUSDT"
                  className="w-24 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs font-mono text-zinc-200 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={binanceInspectorLoading || binanceMode === 'paper'}
                  onClick={async () => {
                    setBinanceInspectorLoading(true);
                    try {
                      const res = await fetch(`/api/binance/trades?symbol=${binanceInspectorSymbol}`);
                      const data = await res.json();
                      setBinanceInspectorResult(data);
                    } catch (err: any) {
                      setBinanceInspectorResult({ error: err?.message || 'Eroare conectare' });
                    } finally {
                      setBinanceInspectorLoading(false);
                    }
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-mono border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  2. /api/binance/trades (getMyTrades)
                </button>
              </div>
            </div>

            {binanceInspectorLoading && (
              <p className="text-xs text-amber-400 font-mono animate-pulse">Se interoghează BinanceService.ts...</p>
            )}

            {binanceInspectorResult && !binanceInspectorLoading && (
              <div className="mt-2 bg-zinc-900 border border-white/5 rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-60">
                <div className="flex justify-between items-center mb-1 text-[10px] text-zinc-500 uppercase">
                  <span>Răspuns Binance API:</span>
                  <button type="button" onClick={() => setBinanceInspectorResult(null)} className="text-zinc-400 hover:text-white">Închide</button>
                </div>
                <pre className="text-amber-300/90 text-[11px] whitespace-pre-wrap">
                  {JSON.stringify(binanceInspectorResult, null, 2)}
                </pre>
              </div>
            )}
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
