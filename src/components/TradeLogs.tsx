import React from 'react';
import { useTradingStore } from '../store';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function TradeLogs() {
  const { logs } = useTradingStore();

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-900/10 backdrop-blur-md shrink-0">
        <div>
          <h1 className="font-serif text-xl text-white">Decision Journal</h1>
          <p className="text-[10px] uppercase text-zinc-500 tracking-wider mt-0.5">Immutable record of AI decisions</p>
        </div>
        <button className="text-[10px] uppercase tracking-widest text-zinc-400 border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 transition-colors">Export CSV</button>
      </header>

      <div className="p-8 overflow-y-auto flex-1">
        <div className="bg-[#1e1e1e] rounded-xl border border-white/10 p-4 font-mono text-xs overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 mb-4 text-zinc-500 border-b border-white/5 pb-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="ml-2 uppercase tracking-widest text-[9px]">Local Inference Engine Terminal</span>
          </div>
          
          <div className="space-y-2 text-zinc-300">
            {logs.length === 0 ? (
              <div className="text-zinc-500 animate-pulse">Waiting for model execution...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-zinc-500 shrink-0">[{log.time}]</span>
                  <span className={`
                    ${log.type === 'success' ? 'text-emerald-400 font-bold' : ''}
                    ${log.type === 'warning' ? 'text-rose-400 font-bold' : ''}
                    ${log.type === 'info' ? 'text-blue-400' : ''}
                  `}>
                    {log.message}
                    {log.equity !== undefined && (
                      <span className="text-zinc-500 font-normal ml-2">
                        (Portofoliu: ${log.equity.toFixed(2)})
                      </span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
