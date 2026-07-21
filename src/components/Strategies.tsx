import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTradingStore } from '../store';
import { simulateModelTraining, generateSignal } from '../services/ml';
import { sendWebPush } from '../services/notifications';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function Strategies() {
  const [activeTab, setActiveTab] = useState<'xgboost' | 'lightgbm' | 'rf'>('xgboost');
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const { watchlist, updateSignal, executeTrade, addLog } = useTradingStore();

  const handleTrainLocal = async () => {
    setIsTraining(true);
    setProgress(0);
    
    // Simulate training delay
    await simulateModelTraining(setProgress);
    
    // Generate signals and execute trades for active watchlist items
    const activeItems = watchlist.filter(w => w.active);
    
    for (const item of activeItems) {
      if (!item.price) continue;
      
      const signal = generateSignal(item.symbol, item.price);
      updateSignal(item.symbol, signal);
      
      addLog(`[Local Engine] Analiză ${item.symbol}: Semnal ${signal.action} (${signal.prob}%)`, 'info');
      
      if (signal.action === 'BUY' && signal.prob >= 60) {
        // Buy ~1000 USDT worth
        const amountToBuy = parseFloat((1000 / item.price).toFixed(6));
        executeTrade(item.symbol, 'BUY', item.price, amountToBuy);
        sendWebPush('Semnal AI: CUMPĂRĂ (Paper Trading)', `Activ: ${item.symbol}\nPreț: $${item.price}\nS-au achiziționat virtual ${amountToBuy} bucăți.`);
      } else if (signal.action === 'SELL' && signal.prob >= 60) {
        // Sell ~1000 USDT worth (will only sell if sufficient balance exists)
        const amountToSell = parseFloat((1000 / item.price).toFixed(6));
        executeTrade(item.symbol, 'SELL', item.price, amountToSell);
        sendWebPush('Semnal AI: VÂNZARE (Paper Trading)', `Activ: ${item.symbol}\nPreț: $${item.price}\nS-au vândut virtual ${amountToSell} bucăți.`);
      }
    }
    
    setIsTraining(false);
  };

  const getLatestSignal = () => {
    const active = watchlist.filter(w => w.active && w.signal);
    if (active.length === 0) return null;
    return active[active.length - 1]; // return last processed
  };
  const latestSignal = getLatestSignal();

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-900/10 backdrop-blur-md shrink-0">
        <div>
          <h1 className="font-serif text-xl text-white">Machine Learning Strategies (Classic Models)</h1>
          <p className="text-[10px] uppercase text-zinc-500 tracking-wider mt-0.5">Rapid, interpretable AI for generating trade signals</p>
        </div>
      </header>

      <div className="p-8 overflow-y-auto flex-1 space-y-6">
        <div className="flex gap-4 border-b border-white/5 pb-2">
          <button 
            onClick={() => setActiveTab('xgboost')}
            className={cn(
              "px-4 py-2 text-sm transition-colors border-b-2 font-medium",
              activeTab === 'xgboost' ? "border-emerald-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            XGBoost
          </button>
          <button 
            onClick={() => setActiveTab('lightgbm')}
            className={cn(
              "px-4 py-2 text-sm transition-colors border-b-2 font-medium",
              activeTab === 'lightgbm' ? "border-emerald-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            LightGBM
          </button>
          <button 
            onClick={() => setActiveTab('rf')}
            className={cn(
              "px-4 py-2 text-sm transition-colors border-b-2 font-medium",
              activeTab === 'rf' ? "border-emerald-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            Random Forest
          </button>
        </div>

        {activeTab === 'xgboost' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 xl:col-span-8 bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg text-white">TensorFlow.js / XGBoost.js Predictor</h2>
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-widest">In-Browser JS Execution</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Rulează 100% în memoria browser-ului (sau în aplicația ta Electron desktop). Fără servere backend de Python, fără costuri de cloud. Modelele sunt antrenate local folosind resursele calculatorului tău.
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Max Depth (Adâncime maximă)</label>
                    <input type="number" defaultValue={6} className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Learning Rate</label>
                    <input type="number" step="0.01" defaultValue={0.05} className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Features (Indicatori tehnici)</label>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {['RSI (14)', 'MACD (12,26)', 'Bollinger Bands', 'Volume Profile', 'Moving Average (50)'].map(feat => (
                      <span key={feat} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-300">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-zinc-800/40 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-mono text-zinc-300">Model Status</span>
                    <span className="text-xs text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/10 rounded">{isTraining ? 'TRAINING...' : 'READY'}</span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-1.5 mb-4">
                    <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${isTraining ? progress : 100}%` }}></div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <button 
                      onClick={handleTrainLocal}
                      disabled={isTraining || watchlist.filter(w => w.active).length === 0}
                      className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      {isTraining ? 'Se Antrenează...' : 'Antrenează Local & Generează Semnale'}
                    </button>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">Memorie estimată: ~120MB</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 xl:col-span-4 space-y-6">
               <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                  <h3 className="font-serif text-md text-white mb-4">Ultimul Semnal Generat</h3>
                  {latestSignal ? (
                    <div className={`p-4 border rounded-xl text-center mb-4 ${latestSignal.signal?.action === 'BUY' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'}`}>
                      <div className="text-xl font-bold text-white tracking-wider">⚡ {latestSignal.symbol}</div>
                      <div className={`font-mono mt-1 text-sm ${latestSignal.signal?.action === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>Probabilitate {latestSignal.signal?.action}: {latestSignal.signal?.prob}%</div>
                    </div>
                  ) : (
                    <div className="p-4 border border-white/10 bg-zinc-800/20 rounded-xl text-center mb-4 text-zinc-500">
                      Niciun semnal generat. Apasă "Antrenează Local" pentru a procesa watchlist-ul.
                    </div>
                  )}
                  <p className="text-xs text-zinc-500 text-center mb-4">Acest semnal poate fi trimis instant către Telegram, Discord, Push sau Email.</p>
                  <button className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-md transition-colors text-sm">
                    Testează Notificarea
                  </button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'lightgbm' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 xl:col-span-8 bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
              <h2 className="font-serif text-lg text-white mb-4">LightGBM Predictor</h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Light Gradient Boosting Machine oferă o eficiență superioară și un consum redus de memorie, excelent pentru backtesting masiv pe date istorice locale (fără DB, direct din CSV).
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Number of Leaves</label>
                    <input type="number" defaultValue={31} className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Boosting Type</label>
                    <select className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm">
                      <option>gbdt (Gradient Boosting)</option>
                      <option>dart (Dropouts meet Multiple Additive)</option>
                      <option>goss (Gradient-based One-Side Sampling)</option>
                    </select>
                  </div>
                </div>
                <button className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium rounded-md transition-colors mt-4 text-sm">
                  Antrenează pe Date Istorice
                </button>
              </div>
            </div>
             <div className="col-span-12 xl:col-span-4 space-y-6">
               <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                  <h3 className="font-serif text-md text-white mb-2">Model Status</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500">Accuracy</span>
                    <span className="text-[10px] text-zinc-300 font-mono">68.4%</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500">F1 Score</span>
                    <span className="text-[10px] text-zinc-300 font-mono">0.65</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1 mt-4">
                    <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <p className="text-[10px] text-emerald-400 uppercase tracking-widest mt-2 text-center">TRAINED (LOCAL CPU)</p>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'rf' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 xl:col-span-8 bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
              <h2 className="font-serif text-lg text-white mb-4">Random Forest Ensemble</h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Algoritm robust, ideal ca baseline pentru tranzacționare locală. Grupează sute de arbori de decizie pentru a asigura un nivel ridicat de stabilitate în predicție.
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Number of Estimators</label>
                    <input type="number" defaultValue={100} className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-sans">Criterion</label>
                    <select className="w-full bg-zinc-800/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-white/20 font-mono text-sm">
                      <option>Gini Impurity</option>
                      <option>Entropy</option>
                      <option>Log Loss</option>
                    </select>
                  </div>
                </div>
                <button className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium rounded-md transition-colors mt-4 text-sm">
                  Rulează Backtest Local
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
