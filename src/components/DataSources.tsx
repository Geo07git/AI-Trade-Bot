import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function DataSources() {
  return (
    <div className="flex flex-col h-full bg-[#050505]">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-900/10 backdrop-blur-md shrink-0">
        <div>
          <h1 className="font-serif text-xl text-white">Alternative Data Sources</h1>
          <p className="text-[10px] uppercase text-zinc-500 tracking-wider mt-0.5">Integrate non-traditional market signals</p>
        </div>
      </header>

      <div className="p-8 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Twitter (X) Sentiment Analysis</h3>
                <p className="text-xs text-zinc-400">Real-time NLP sentiment scoring of cashtags.</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
            </div>
            
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">API Bearer Token</label>
                <input type="password" placeholder="••••••••••••••••" value="mock-token-abc" readOnly className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 font-mono text-sm opacity-50" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Tracked Assets</label>
                <input type="text" defaultValue="$BTC, $ETH, $NVDA, $TSLA" className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm" />
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">Current Aggregated Sentiment</span>
                <span className="text-[10px] text-emerald-400 font-mono">+0.68 (BULLISH)</span>
              </div>
              <button className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 font-medium rounded-md transition-colors text-sm border border-white/5 mt-2">
                Configure Stream
              </button>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Financial News API</h3>
                <p className="text-xs text-zinc-400">Aggregated headlines from Bloomberg, Reuters, WSJ.</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
            </div>
            
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">API Key</label>
                <input type="password" placeholder="••••••••••••••••" value="mock-key-123" readOnly className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 font-mono text-sm opacity-50" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Relevance Threshold</label>
                <input type="range" min="0" max="100" defaultValue="75" className="w-full accent-emerald-500" />
                <div className="text-right text-[10px] text-zinc-500 font-mono mt-1">High Relevance Only</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5">
               <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">Latest Impact Event</span>
                <span className="text-[10px] text-zinc-300 font-mono">Fed Rate Pause (High Impact)</span>
              </div>
              <button className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 font-medium rounded-md transition-colors text-sm border border-white/5 mt-2">
                Configure Feeds
              </button>
            </div>
          </div>

           <div className="bg-zinc-900/50 border border-emerald-500/20 rounded-2xl p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold tracking-wider uppercase rounded-bl-lg">100% Free</div>
            <div className="flex items-start justify-between mb-4 mt-2">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Surse Publice & Deschise</h3>
                <p className="text-xs text-zinc-400">Date istorice CSV, fluxuri RSS și API-uri fără autentificare.</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
            </div>
            
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Tip Sursă</label>
                <select className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm">
                  <option>Yahoo Finance (Date Istorice CSV)</option>
                  <option>CoinDesk / Crypto News (RSS)</option>
                  <option>FRED (Economic Data CSV)</option>
                  <option>Fișier Local (Incarcă .csv)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">URL sau Ticker</label>
                <input type="text" defaultValue="NVDA" className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm" />
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">Status Sincronizare</span>
                <span className="text-[10px] text-emerald-400 font-mono">Actualizat (2.4MB)</span>
              </div>
              <button className="w-full px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium rounded-md transition-colors text-sm border border-emerald-500/20 mt-2">
                Descarcă & Sincronizează Local
              </button>
            </div>
          </div>

           <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col opacity-60">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Google Trends</h3>
                <p className="text-xs text-zinc-400">Search volume indices for retail interest measurement.</p>
              </div>
              <div className="px-2 py-0.5 bg-white/10 rounded text-[10px] text-zinc-400 uppercase tracking-widest">Disconnected</div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-white/5">
              <button className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-md transition-colors text-sm">
                Connect Source
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
