import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTradingStore } from '../store';
import { fetchLivePrice } from '../services/api';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, AlertTriangle, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function Dashboard() {
  const { balance, positions, watchlist, updatePrice, addWatchlist, toggleWatchlistActive, removeWatchlist } = useTradingStore();
  const [newSymbol, setNewSymbol] = useState('');
  
  const equity = balance + positions.reduce((acc, pos) => acc + (pos.amount * (pos.currentPrice || pos.entryPrice)), 0);
  const dayChange = equity - useTradingStore.getState().initialBalance;
  const dayChangePercent = (dayChange / useTradingStore.getState().initialBalance) * 100;

  // Use dynamic performance data using local state simulation
  const mockChartData = [
    { time: '09:30', equity: useTradingStore.getState().initialBalance },
    { time: '10:30', equity: useTradingStore.getState().initialBalance * 1.01 },
    { time: '11:30', equity: useTradingStore.getState().initialBalance * 0.99 },
    { time: '12:30', equity: useTradingStore.getState().initialBalance * 1.02 },
    { time: 'Now', equity: equity }
  ];

  useEffect(() => {
    const fetchAllPrices = async () => {
      watchlist.forEach(async (item) => {
        const price = await fetchLivePrice(item.symbol);
        if (price) {
          updatePrice(item.symbol, price);
        }
      });
    };
    
    // Initial fetch
    fetchAllPrices();

    // Poll prices for all items in the watchlist every 5 seconds
    const interval = setInterval(fetchAllPrices, 5000);

    return () => clearInterval(interval);
  }, [watchlist.map(w => w.symbol).join(','), updatePrice]);

  const handleAddSymbol = () => {
    if (newSymbol.trim()) {
      addWatchlist(newSymbol.trim().toUpperCase());
      setNewSymbol('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-900/10 backdrop-blur-md shrink-0">
        <div className="flex gap-12">
          <div>
            <p className="text-[10px] uppercase text-zinc-500 tracking-wider mb-0.5">Capital Virtual (Paper Trading)</p>
            <p className="font-serif text-xl font-medium">${equity.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className={cn("text-sm font-sans ml-1", dayChangePercent >= 0 ? "text-emerald-400" : "text-rose-400")}>{dayChangePercent >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%</span></p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-zinc-500 tracking-wider mb-0.5">Profit Virtual Generat</p>
            <p className={cn("font-serif text-xl font-medium", dayChange >= 0 ? "text-emerald-400" : "text-rose-400")}>{dayChange >= 0 ? '+' : ''}${dayChange.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-zinc-500 tracking-wider mb-0.5">Cash Disponibil</p>
            <p className="font-serif text-xl font-medium">${balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-4 py-1.5 border border-white/10 rounded-full text-xs">Sursă Date: <span className="text-emerald-400">Binance API</span></div>
          <div className="w-10 h-10 rounded-full border border-white/20 bg-zinc-800 flex items-center justify-center text-xs">JD</div>
        </div>
      </header>

      <div className="p-8 overflow-y-auto flex-1 space-y-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Chart Section */}
          <div className="col-span-12 xl:col-span-8 bg-zinc-900/50 border border-white/5 rounded-2xl p-6 relative">
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-serif text-lg text-white">Performance Analytics</h2>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-400">1D</span>
                <span className="px-2 py-1 bg-white/10 text-white rounded text-[10px]">1W</span>
                <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-400">1M</span>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis 
                    domain={['dataMin - 100', 'dataMax + 100']} 
                    stroke="#52525b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-zinc-800/40 rounded-xl border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Total Positions</p>
                <p className="text-xl font-serif">{positions.length}</p>
              </div>
              <div className="p-4 bg-zinc-800/40 rounded-xl border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Max Drawdown (Sim)</p>
                <p className="text-xl font-serif">2.1%</p>
              </div>
              <div className="p-4 bg-zinc-800/40 rounded-xl border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Sharpe Ratio</p>
                <p className="text-xl font-serif text-emerald-400">3.21</p>
              </div>
            </div>
          </div>

          {/* Asset Selection / Watchlist */}
          <div className="col-span-12 xl:col-span-8 bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-lg text-white">Selecție Active (Watchlist AI)</h2>
              <div className="relative">
                <input 
                  type="text" 
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSymbol()}
                  placeholder="Caută simbol (ex: ETHUSDT)..." 
                  className="bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-1.5 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-xs w-64"
                />
                <button 
                  onClick={handleAddSymbol}
                  className="absolute right-2 top-1.5 text-emerald-400 text-xs font-bold uppercase tracking-widest hover:text-emerald-300">
                  Adaugă
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono text-zinc-400">
                <thead className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5">
                  <tr>
                    <th className="pb-3 font-medium">Activ (Binance)</th>
                    <th className="pb-3 font-medium">Preț Curent</th>
                    <th className="pb-3 font-medium text-right">Semnal AI (Local)</th>
                    <th className="pb-3 font-medium text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {watchlist.map((item) => (
                    <tr key={item.symbol}>
                      <td className="py-3 font-bold text-zinc-200">{item.symbol}</td>
                      <td className="py-3">{item.price ? `$${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : 'Se încarcă...'}</td>
                      <td className={`py-3 text-right font-bold tracking-wider ${item.signal?.action === 'BUY' ? 'text-emerald-400' : item.signal?.action === 'SELL' ? 'text-rose-400' : 'text-zinc-400'}`}>
                        {item.signal ? `${item.signal.action} (${item.signal.prob}%)` : '-'}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => toggleWatchlistActive(item.symbol)}
                            className={`px-3 py-1 text-xs transition-colors rounded border ${item.active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold' : 'bg-white/5 hover:bg-white/10 text-white border-white/5'}`}>
                            {item.active ? 'Activ' : 'Urmărește'}
                          </button>
                          <button 
                            onClick={() => removeWatchlist(item.symbol)}
                            className="p-1 text-zinc-500 hover:text-rose-400 transition-colors rounded hover:bg-white/5"
                            title="Elimină activ">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-zinc-500 mt-4 text-center">Botul va procesa doar activele marcate ca "Activ". Date preluate gratuit via Binance Public API.</p>
          </div>

          {/* Active Positions */}
          <div className="col-span-12 xl:col-span-4 bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <h2 className="font-serif text-lg mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_blue]"></span>
              Poziții Curente (Virtuale)
            </h2>
            <div className="space-y-4">
              {positions.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8 border border-white/5 rounded-xl border-dashed">Nicio poziție deschisă. Rulează modelul ML pentru a genera tranzacții automate.</p>
              ) : (
                positions.map((pos, i) => {
                  const currentPrice = pos.currentPrice || pos.entryPrice;
                  const value = currentPrice * pos.amount;
                  const pl = value - (pos.entryPrice * pos.amount);
                  const plPercent = (pl / (pos.entryPrice * pos.amount)) * 100;
                  
                  return (
                    <div key={i} className="p-4 bg-zinc-800/40 rounded-xl border border-white/5 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[12px] font-bold text-zinc-200 tracking-wider">{pos.symbol}</p>
                        <p className={cn("text-xs font-mono font-bold", pl >= 0 ? "text-emerald-400" : "text-rose-400")}>
                          {pl >= 0 ? '+' : ''}{plPercent.toFixed(2)}%
                        </p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                           <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Value (Qty)</p>
                           <p className="text-sm font-mono text-zinc-300">${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-xs text-zinc-500">({pos.amount})</span></p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">P&L / Entry</p>
                           <p className={cn("text-sm font-mono", pl >= 0 ? "text-emerald-400" : "text-rose-400")}>
                             ${Math.abs(pl).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-xs text-zinc-500">(@ ${pos.entryPrice.toLocaleString(undefined, {maximumFractionDigits: 6})})</span>
                           </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
