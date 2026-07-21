import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, LineChart, BrainCircuit, Activity, Settings, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const navItems: { id: ViewState; label: string; icon?: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'strategies', label: 'ML Strategies' },
    { id: 'data_sources', label: 'Data Sources' },
    { id: 'backtesting', label: 'Backtesting' },
    { id: 'analyst', label: 'AI Analyst' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'logs', label: 'Trade Logs' },
    { id: 'settings', label: 'Settings' },
    { id: 'guide', label: 'User Guide (RO)' },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-zinc-900/30 flex flex-col h-full">
      <div className="p-8">
        <h1 className="font-serif italic text-2xl tracking-tight text-white">AI.TRADE</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1">Algorithmic Trading</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors text-left",
              currentView === item.id 
                ? "bg-white/5 text-white" 
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

      <div className="p-6 border-t border-white/5">
        <div className="bg-zinc-800/40 rounded-lg p-4 border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">API Status</span>
            <span className="text-[10px] text-emerald-400 font-mono">CONNECTED</span>
          </div>
          <div className="text-xs text-zinc-300">Paper Trading</div>
        </div>
      </div>
    </aside>
  );
}
