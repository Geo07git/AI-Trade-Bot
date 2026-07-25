import React, { useState } from 'react';
import { useTradingStore } from '../store';
import { Download, Trash2, Database, Search, HardDrive, RefreshCw } from 'lucide-react';

export function TradeLogs() {
  const { logs, maxLogs, setMaxLogs, clearLogs } = useTradingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'success' | 'warning' | 'info'>('all');

  const logLimitOptions = [
    { value: 100, label: '100 Loguri (Standard)' },
    { value: 250, label: '250 Loguri' },
    { value: 500, label: '500 Loguri' },
    { value: 1000, label: '1.000 Loguri (Recomandat)' },
    { value: 2500, label: '2.500 Loguri (VPS Medium)' },
    { value: 5000, label: '5.000 Loguri (VPS Pro)' },
    { value: 10000, label: '10.000 Loguri (VPS Max)' },
  ];

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Ora', 'Tip', 'Mesaj', 'Portofoliu ($)'];
    const rows = logs.map(l => [
      `"${l.time || ''}"`,
      `"${l.type || ''}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      `"${l.equity !== undefined ? l.equity.toFixed(2) : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ai_trade_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportServerJSON = async () => {
    try {
      const res = await fetch('/api/bot/state');
      if (!res.ok) throw new Error('Nu s-a putut obține starea de pe server');
      const data = await res.json();
      
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const link = document.createElement('a');
      link.setAttribute('href', jsonString);
      link.setAttribute('download', `ai_trade_server_full_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Eroare la descărcarea datelor de pe server.');
    }
  };

  const handleClearLogs = () => {
    if (window.confirm('Sigur dorești să ștergi toate logurile din memorie și de pe server?')) {
      clearLogs();
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchesFilter = filterType === 'all' || l.type === filterType;
    const matchesSearch = searchTerm === '' || l.message.toLowerCase().includes(searchTerm.toLowerCase()) || l.time.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-black">
      <header className="py-4 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-900/10 backdrop-blur-md shrink-0 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl text-white">Decision Journal</h1>
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              VPS Ready
            </span>
          </div>
          <p className="text-[10px] uppercase text-zinc-500 tracking-wider mt-0.5">Jurnal sincronizat live cu serverul 24/7</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Capacity Selector */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">Capacitate Loguri:</span>
            <select
              value={maxLogs || 1000}
              onChange={(e) => setMaxLogs(Number(e.target.value))}
              className="bg-black text-xs text-emerald-400 font-mono font-semibold focus:outline-none cursor-pointer border border-emerald-500/30 rounded px-2 py-0.5"
            >
              {logLimitOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleClearLogs}
            title="Șterge toate logurile"
            className="text-[10px] uppercase tracking-widest text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors flex items-center gap-1 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Șterge
          </button>

          <button 
            onClick={handleExportCSV}
            className="text-[10px] uppercase tracking-widest text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5 font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>

          <button 
            onClick={handleExportServerJSON}
            className="text-[10px] uppercase tracking-widest text-zinc-300 border border-white/10 px-3.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1.5"
          >
            Backup JSON
          </button>
        </div>
      </header>

      <div className="p-8 overflow-y-auto flex-1 space-y-4">
        {/* Filter and Search Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap bg-zinc-900/60 border border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px] bg-black border border-white/10 rounded-lg px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Caută în loguri (tranzacție, simbol, timp)..."
              className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-500 text-[11px] mr-1">Filtru:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterType === 'all' ? 'bg-white/10 text-white border border-white/20' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Toate ({logs.length})
            </button>
            <button
              onClick={() => setFilterType('success')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterType === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-zinc-400 hover:text-emerald-400'
              }`}
            >
              Achiziții ({logs.filter(l => l.type === 'success').length})
            </button>
            <button
              onClick={() => setFilterType('warning')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterType === 'warning' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-zinc-400 hover:text-rose-400'
              }`}
            >
              Vânzări/Avertizări ({logs.filter(l => l.type === 'warning').length})
            </button>
            <button
              onClick={() => setFilterType('info')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterType === 'info' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-zinc-400 hover:text-blue-400'
              }`}
            >
              Info ({logs.filter(l => l.type === 'info').length})
            </button>
          </div>

          <div className="text-[11px] font-mono text-zinc-400 bg-black/50 border border-white/5 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Salvate: <strong className="text-emerald-400">{logs.length}</strong> / <span className="text-zinc-400">{maxLogs || 1000}</span> max
          </div>
        </div>

        {/* Terminal Window */}
        <div className="bg-[#1e1e1e] rounded-xl border border-white/10 p-4 font-mono text-xs overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between gap-2 mb-4 text-zinc-500 border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              <span className="ml-2 uppercase tracking-widest text-[9px]">Server Inference Engine Console</span>
            </div>
            <div className="text-[10px] text-zinc-500 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
              <span>Sincronizat 24/7 (Server Cloud / VPS)</span>
            </div>
          </div>
          
          <div className="space-y-2 text-zinc-300 max-h-[600px] overflow-y-auto pr-2">
            {filteredLogs.length === 0 ? (
              <div className="text-zinc-500 py-8 text-center">
                {logs.length === 0 ? 'Așteptare execuții model AI...' : 'Niciun log nu corespunde filtrelor selectate.'}
              </div>
            ) : (
              filteredLogs.map((log, i) => (
                <div key={i} className="flex gap-4 hover:bg-white/[0.02] p-1 rounded transition-colors">
                  <span className="text-zinc-500 shrink-0 select-none">[{log.time}]</span>
                  <span className={`
                    ${log.type === 'success' ? 'text-emerald-400 font-bold' : ''}
                    ${log.type === 'warning' ? 'text-rose-400 font-bold' : ''}
                    ${log.type === 'info' ? 'text-blue-400' : ''}
                  `}>
                    {log.message}
                    {log.equity !== undefined && (
                      <span className="text-zinc-400 font-normal ml-2 bg-white/5 px-2 py-0.5 rounded text-[11px]">
                        Portofoliu: ${log.equity.toFixed(2)}
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
