import React from 'react';
import { ViewState } from '../types';
import { X, Power } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTradingStore } from '../store';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ currentView, onViewChange, isOpenMobile, onCloseMobile }: SidebarProps) {
  const { autoTradingActive, setAutoTradingActive } = useTradingStore();
  const navItems: { id: ViewState; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'strategies', label: 'ML Strategies' },
    { id: 'backtesting', label: 'Backtesting' },
    { id: 'analyst', label: 'AI Analyst' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'logs', label: 'Trade Logs' },
    { id: 'settings', label: 'Settings' },
    { id: 'guide', label: 'User Guide (RO)' },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside className={cn(
        "w-64 border-r border-white/5 bg-[#0a0a0c] flex flex-col h-full z-50 transition-transform duration-300 ease-in-out shrink-0",
        "fixed inset-y-0 left-0 md:static md:translate-x-0",
        isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-white/5 md:border-none">
          <div>
            <h1 className="font-serif italic text-2xl tracking-tight text-white">AI.TRADE Bot</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1">Algorithmic Trading</p>
          </div>
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="p-2 text-zinc-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors text-left",
                currentView === item.id 
                  ? "bg-white/10 text-white font-medium" 
                  : "text-zinc-400 hover:text-white"
              )}
            >
              {currentView === item.id ? (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
              ) : (
                 <div className="w-1.5 h-1.5 shrink-0 opacity-0"></div>
              )}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-3">
          {/* Server 24/7 Control Button in Sidebar */}
          <button
            onClick={() => setAutoTradingActive(!autoTradingActive)}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer",
              autoTradingActive
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", autoTradingActive ? "bg-emerald-400 animate-pulse" : "bg-rose-500")}></span>
              <span>{autoTradingActive ? "Server 24/7: ACTIV" : "Server 24/7: OPRIT"}</span>
            </div>
            <Power className="w-4 h-4 opacity-75" />
          </button>

          <div className="bg-zinc-800/40 rounded-lg p-3 border border-white/5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">API Status</span>
              <span className="text-[10px] text-emerald-400 font-mono">CONNECTED</span>
            </div>
            <div className="text-xs text-zinc-300">Paper Trading</div>
          </div>
        </div>
      </aside>
    </>
  );
}

