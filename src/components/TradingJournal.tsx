import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Cpu, 
  Calendar, 
  DollarSign, 
  Zap, 
  Percent, 
  Award, 
  Clock, 
  ShieldAlert,
  Search,
  ChevronDown,
  RefreshCw,
  BarChart2
} from 'lucide-react';
import { JournalEntry, DailySnapshot } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface JournalAnalytics {
  totalTrades: number;
  closedTrades: number;
  winRate: number;
  totalPnL: number;
  totalFees: number;
  bestModel: string;
  bestStrategy: string;
  performanceByModel: Array<{
    model: string;
    totalTrades: number;
    closedTrades: number;
    winRate: number;
    totalPnL: number;
    avgProbability: number;
  }>;
  performanceByStrategy: Array<{
    strategy: string;
    totalTrades: number;
    closedTrades: number;
    winRate: number;
    totalPnL: number;
  }>;
}

export function TradingJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([]);
  const [analytics, setAnalytics] = useState<JournalAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedSymbol, setSelectedSymbol] = useState<string>('ALL');
  const [selectedModel, setSelectedModel] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<'entries' | 'models' | 'snapshots'>('entries');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [entriesRes, snapshotsRes, analyticsRes] = await Promise.all([
        fetch('/api/journal/entries'),
        fetch('/api/journal/daily-snapshots'),
        fetch('/api/journal/analytics')
      ]);

      if (entriesRes.ok) {
        const data = await entriesRes.json();
        if (data.success) setEntries(data.entries);
      }
      if (snapshotsRes.ok) {
        const data = await snapshotsRes.json();
        if (data.success) setSnapshots(data.snapshots);
      }
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        if (data.success) setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error('Error fetching journal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uniqueSymbols = useMemo(() => {
    const symbols = new Set(entries.map(e => e.symbol));
    return ['ALL', ...Array.from(symbols)];
  }, [entries]);

  const uniqueModels = useMemo(() => {
    const models = new Set(entries.map(e => e.modelName));
    return ['ALL', ...Array.from(models)];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      if (selectedSymbol !== 'ALL' && e.symbol !== selectedSymbol) return false;
      if (selectedModel !== 'ALL' && e.modelName !== selectedModel) return false;
      if (selectedAction !== 'ALL' && e.action !== selectedAction) return false;
      if (selectedMode !== 'ALL' && e.mode !== selectedMode) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSymbol = e.symbol.toLowerCase().includes(q);
        const matchReason = e.entryReason.toLowerCase().includes(q);
        const matchModel = e.modelName.toLowerCase().includes(q);
        const matchNotes = (e.notes || '').toLowerCase().includes(q);
        if (!matchSymbol && !matchReason && !matchModel && !matchNotes) return false;
      }
      return true;
    });
  }, [entries, selectedSymbol, selectedModel, selectedAction, selectedMode, searchQuery]);

  const snapshotChartData = useMemo(() => {
    return [...snapshots].reverse().map(s => ({
      date: s.date.substring(5), // MM-DD
      equity: s.equity,
      realizedPnL: s.realizedPnL,
      winRate: s.winRate
    }));
  }, [snapshots]);

  return (
    <div className="h-full w-full bg-black overflow-y-auto p-4 md:p-8 space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="font-serif text-2xl text-white">Jurnal de Tranzacționare AI</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Istoric automatizat al ordinelor, comisioanelor și atribuirii modelelor ML
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-xs font-medium"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-emerald-400" : ""} />
            Actualizează Datele
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Tranzacții Totale</span>
            <Zap size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-serif text-white">
            {analytics?.totalTrades || 0}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {analytics?.closedTrades || 0} închise cu PnL calculat
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Rată de Câștig (Win Rate)</span>
            <Percent size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-serif text-emerald-400">
            {analytics?.winRate || 0}%
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Măsurat pe tranzacțiile închise
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">PnL Total Realizat</span>
            <DollarSign size={16} className={analytics && analytics.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"} />
          </div>
          <div className={`text-2xl font-serif ${analytics && analytics.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {analytics && analytics.totalPnL >= 0 ? '+' : ''}${analytics?.totalPnL.toFixed(2) || '0.00'}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Comisioane totale: ${analytics?.totalFees.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Cel mai bun Model ML</span>
            <Award size={16} className="text-indigo-400" />
          </div>
          <div className="text-lg font-serif text-indigo-300 truncate">
            {analytics?.bestModel || 'XGBoost Classifier'}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 truncate">
            Top strategie: {analytics?.bestStrategy || 'RSI + Momentum'}
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('entries')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'entries'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <BookOpen size={14} />
          Istoric Ordine & Tranzacții ({filteredEntries.length})
        </button>

        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'models'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Cpu size={14} />
          Performanță pe Modele ML & Strategii
        </button>

        <button
          onClick={() => setActiveTab('snapshots')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'snapshots'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Calendar size={14} />
          Rapoarte Zilnice & Evoluție Equity ({snapshots.length})
        </button>
      </div>

      {/* TAB 1: ENTRIES LIST */}
      {activeTab === 'entries' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Caută după simbol, strategie sau model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Select Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="ALL">Toate Simbolurile</option>
                {uniqueSymbols.filter(s => s !== 'ALL').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="ALL">Toate Modelele ML</option>
                {uniqueModels.filter(m => m !== 'ALL').map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="ALL">BUY & SELL</option>
                <option value="BUY">🟢 Doar BUY</option>
                <option value="SELL">🔴 Doar SELL</option>
              </select>

              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="ALL">Toate Modurile</option>
                <option value="paper">Paper Trading</option>
                <option value="testnet">Binance Testnet</option>
                <option value="live">Binance Live</option>
              </select>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/80 text-zinc-400 font-mono text-[11px] uppercase border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3">Dată & Oră</th>
                    <th className="px-5 py-3">Simbol</th>
                    <th className="px-5 py-3">Tip</th>
                    <th className="px-5 py-3 text-right">Preț Execuție</th>
                    <th className="px-5 py-3 text-right">Cantitate</th>
                    <th className="px-5 py-3 text-right">Comision</th>
                    <th className="px-5 py-3 text-right">PnL</th>
                    <th className="px-5 py-3">Probabilitate ML</th>
                    <th className="px-5 py-3">Model ML</th>
                    <th className="px-5 py-3">Motiv Intrare / Strategie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-5 py-12 text-center text-zinc-500">
                        Nicio tranzacție găsită conform filtrelor selectate.
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((e) => (
                      <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5 font-mono text-zinc-400 whitespace-nowrap">
                          {e.timestamp.replace('T', ' ').substring(0, 16)}
                        </td>

                        <td className="px-5 py-3.5 font-semibold text-white whitespace-nowrap">
                          {e.symbol}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                            e.action === 'BUY'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {e.action}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 font-mono text-right whitespace-nowrap">
                          ${e.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-right whitespace-nowrap">
                          {e.amount}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-right text-zinc-400 whitespace-nowrap">
                          ${e.fee.toFixed(4)}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-right whitespace-nowrap font-medium">
                          {e.action === 'SELL' ? (
                            <span className={e.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                              {e.pnl >= 0 ? '+' : ''}${e.pnl.toFixed(2)} ({e.pnlPercent >= 0 ? '+' : ''}{e.pnlPercent.toFixed(2)}%)
                            </span>
                          ) : (
                            <span className="text-zinc-500">-</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-12 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-emerald-400 h-full rounded-full"
                                style={{ width: `${Math.min(100, Math.max(0, e.mlProbability))}%` }}
                              />
                            </div>
                            <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                              {e.mlProbability}%
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 font-sans text-[11px]">
                            {e.modelName}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-zinc-300 max-w-xs truncate" title={e.entryReason}>
                          {e.entryReason}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden space-y-3">
            {filteredEntries.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 bg-zinc-900/40 rounded-2xl border border-white/5">
                Nicio tranzacție găsită.
              </div>
            ) : (
              filteredEntries.map((e) => (
                <div key={e.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        e.action === 'BUY'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {e.action}
                      </span>
                      <span className="font-semibold text-white text-sm">{e.symbol}</span>
                    </div>

                    <span className="text-[11px] font-mono text-zinc-400">
                      {e.timestamp.replace('T', ' ').substring(0, 16)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-zinc-950/50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-zinc-500 text-[10px] block">PREȚ EXECUȚIE</span>
                      <span className="text-zinc-200">${e.price.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block">CANTITATE</span>
                      <span className="text-zinc-200">{e.amount}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block">COMISION</span>
                      <span className="text-zinc-400">${e.fee.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block">PNL REALIZAT</span>
                      {e.action === 'SELL' ? (
                        <span className={e.pnl >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                          {e.pnl >= 0 ? '+' : ''}${e.pnl.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-zinc-500">-</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                    <span className="text-zinc-400">{e.modelName}</span>
                    <span className="text-emerald-400 font-mono font-semibold">{e.mlProbability}% Prob</span>
                  </div>

                  <div className="text-[11px] text-zinc-400 italic bg-zinc-900 p-2 rounded-lg">
                    {e.entryReason}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MODEL PERFORMANCE */}
      {activeTab === 'models' && analytics && (
        <div className="space-y-8">
          {/* Performance by Model Section */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-6">
            <h2 className="font-serif text-lg text-white flex items-center gap-2">
              <Cpu size={18} className="text-indigo-400" />
              Performanță Comparativă Modele ML
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.performanceByModel.map((m) => (
                <div key={m.model} className="bg-zinc-950 border border-white/5 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-medium text-white text-xs">{m.model}</span>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded">
                      {m.avgProbability}% avg prob
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-zinc-400">
                      <span>Rată Câștig:</span>
                      <span className="text-emerald-400 font-bold">{m.winRate}%</span>
                    </div>

                    <div className="flex justify-between text-zinc-400">
                      <span>PnL Generat:</span>
                      <span className={m.totalPnL >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                        {m.totalPnL >= 0 ? '+' : ''}${m.totalPnL.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-zinc-400">
                      <span>Tranzacții Executate:</span>
                      <span className="text-zinc-200">{m.totalTrades} ({m.closedTrades} închise)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance by Strategy Section */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-6">
            <h2 className="font-serif text-lg text-white flex items-center gap-2">
              <BarChart2 size={18} className="text-emerald-400" />
              Performanță pe Strategii AI Strategy Lab
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.performanceByStrategy.map((s) => (
                <div key={s.strategy} className="bg-zinc-950 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-white">{s.strategy}</h3>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      {s.totalTrades} semnale | {s.closedTrades} tranzacții finale
                    </p>
                  </div>

                  <div className="text-right">
                    <div className={`text-sm font-mono font-bold ${s.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {s.totalPnL >= 0 ? '+' : ''}${s.totalPnL.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-emerald-300 font-mono">
                      {s.winRate}% Win Rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DAILY SNAPSHOTS & EQUITY CURVE */}
      {activeTab === 'snapshots' && (
        <div className="space-y-8">
          {/* Equity & PnL History Chart */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-serif text-lg text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              Evoluție Zilnică Equity Portofoliu
            </h2>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={snapshotChartData}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                  <Area type="monotone" dataKey="equity" name="Equity ($)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#equityGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Snapshots Table */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-serif text-md text-white">Istoric Înregistrări Zilnice (Daily Snapshots)</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/80 text-zinc-400 font-mono text-[11px] uppercase border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3">Dată</th>
                    <th className="px-5 py-3 text-right">Equity Închidere</th>
                    <th className="px-5 py-3 text-right">PnL Realizat Zi</th>
                    <th className="px-5 py-3 text-right">PnL Nerealizat</th>
                    <th className="px-5 py-3 text-right">Win Rate Zi</th>
                    <th className="px-5 py-3 text-right">Tranzacții</th>
                    <th className="px-5 py-3">Cel Mai Bun Model</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300 font-mono">
                  {snapshots.map((s) => (
                    <tr key={s.date} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-white font-bold">{s.date}</td>
                      <td className="px-5 py-3 text-right">${s.equity.toLocaleString()}</td>
                      <td className={`px-5 py-3 text-right font-bold ${s.realizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {s.realizedPnL >= 0 ? '+' : ''}${s.realizedPnL.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right text-zinc-400">
                        ${s.unrealizedPnL.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right text-emerald-400">{s.winRate}%</td>
                      <td className="px-5 py-3 text-right text-zinc-200">{s.totalTrades}</td>
                      <td className="px-5 py-3 font-sans text-zinc-300">{s.bestModel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
