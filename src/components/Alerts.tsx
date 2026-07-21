import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { requestNotificationPermission, sendWebPush } from '../services/notifications';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function Alerts() {
  const handleTestPush = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      sendWebPush('Test Notificare AI', 'Sistemul de notificări desktop este activat. Vei primi semnalele de tranzacționare direct aici.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-900/10 backdrop-blur-md shrink-0">
        <div>
          <h1 className="font-serif text-xl text-white">Notificări & Alerte</h1>
          <p className="text-[10px] uppercase text-zinc-500 tracking-wider mt-0.5">Semnale trimise prin Web Push (Browser) și Gmail API</p>
        </div>
        <button 
          onClick={handleTestPush}
          className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium rounded-md transition-colors text-sm border border-emerald-500/20">
          Testează Push Notification
        </button>
      </header>

      <div className="p-8 overflow-y-auto flex-1">
        <div className="max-w-4xl space-y-4">
          
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <h3 className="font-serif text-lg text-white">Semnal de Tranzacționare XGBoost</h3>
               </div>
               <div className="flex items-center gap-2">
                 <span className="px-2 py-1 bg-[#ea4335]/20 border border-[#ea4335]/50 text-[#ea4335] rounded text-[10px] font-bold">Gmail</span>
                 <span className="px-2 py-1 bg-white/10 border border-white/20 text-white rounded text-[10px] font-bold">Web Push</span>
               </div>
            </div>
            <div className="flex items-center gap-4 text-sm font-mono text-zinc-300">
               <span className="px-3 py-1.5 bg-zinc-800/80 rounded-lg border border-white/5">Dacă Probabilitate BUY (Model)</span>
               <span className="text-zinc-500">&gt;=</span>
               <span className="px-3 py-1.5 bg-zinc-800/80 rounded-lg border border-white/5 text-emerald-400">90%</span>
               <span className="text-zinc-500">ATUNCI</span>
               <span className="px-3 py-1.5 bg-zinc-800/80 rounded-lg border border-white/5 text-emerald-400">Notifică Desktop/Telefon</span>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_blue]"></div>
                 <h3 className="font-serif text-lg text-white">Raport Profit Paper Trading</h3>
               </div>
               <div className="flex items-center gap-2">
                 <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-zinc-400">Email</span>
                 <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-zinc-400">Push Android</span>
               </div>
            </div>
            <div className="flex items-center gap-4 text-sm font-mono text-zinc-300 flex-wrap">
               <span className="px-3 py-1.5 bg-zinc-800/80 rounded-lg border border-white/5">Zilnic la ora 16:00 EST</span>
               <span className="text-zinc-500">TRIMITE</span>
               <span className="px-3 py-1.5 bg-zinc-800/80 rounded-lg border border-white/5 text-emerald-400">P&L Virtual</span>
               <span className="text-zinc-500">PENTRU</span>
               <span className="px-3 py-1.5 bg-zinc-800/80 rounded-lg border border-white/5 text-zinc-300">Portofoliul curent</span>
            </div>
          </div>

           <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                 <h3 className="font-serif text-lg text-white">Macro Event Volatility Spike</h3>
               </div>
               <div className="flex items-center gap-2">
                 <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-zinc-400">Email</span>
               </div>
            </div>
             <div className="flex items-center gap-4 text-sm font-mono text-zinc-300 flex-wrap">
               <span className="px-3 py-1.5 bg-zinc-800/80 rounded-lg border border-white/5">IF News API Keyword</span>
               <span className="text-zinc-500">MATCHES</span>
               <span className="px-3 py-1.5 bg-zinc-800/80 rounded-lg border border-white/5 text-amber-400">"Fed Rate", "CPI"</span>
               <span className="text-zinc-500">THEN</span>
               <span className="px-3 py-1.5 bg-zinc-800/80 rounded-lg border border-white/5 text-emerald-400">Pause Auto-Trading & Notify</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
