import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTradingStore } from '../store';
import { 
  runRealStrategyAnalysis, 
  StrategyResult, 
  TechnicalIndicators, 
  ModelMetrics, 
  BacktestResults 
} from '../services/ml';
import { sendWebPush } from '../services/notifications';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function Strategies() {
  const [activeTab, setActiveTab] = useState<'dt' | 'rf' | 'adaboost'>('rf');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Model parameters
  const [maxDepth, setMaxDepth] = useState(6);
  const [learningRate, setLearningRate] = useState(0.05);
  const [numLeaves, setNumLeaves] = useState(31);
  const [boostingType, setBoostingType] = useState('gbdt');
  const [nEstimators, setNEstimators] = useState(100);
  const [criterion, setCriterion] = useState('gini');

  // Risk Management
  const [stopLoss, setStopLoss] = useState(2.0);
  const [takeProfit, setTakeProfit] = useState(4.0);
  const [confidenceThreshold, setConfidenceThreshold] = useState(60);
  const [riskPerTrade, setRiskPerTrade] = useState(1.0);

  // Real analysis state output
  const [analysisResult, setAnalysisResult] = useState<StrategyResult | null>(null);

  const { watchlist, updateSignal, executeTrade, addLog, balance } = useTradingStore();

  // Set default symbol from watchlist if available
  useEffect(() => {
    if (watchlist.length > 0 && !watchlist.some(w => w.symbol === selectedSymbol)) {
      setSelectedSymbol(watchlist[0].symbol);
    }
  }, [watchlist]);

  const handleRunRealCalculation = async () => {
    setIsAnalyzing(true);
    setProgress(10);

    const modelParams = {
      maxDepth,
      learningRate,
      numLeaves,
      boostingType,
      nEstimators,
      criterion,
      stopLoss,
      takeProfit,
      confidenceThreshold,
      riskPerTrade
    };

    try {
      const result = await runRealStrategyAnalysis(selectedSymbol, activeTab, modelParams, (p) => setProgress(p));
      setAnalysisResult(result);

      // Update store signal
      updateSignal(result.symbol, { action: result.signal, prob: result.probability });

      addLog(`[Calcul Real AI] ${result.symbol} (${activeTab.toUpperCase()}): Semnal ${result.signal} (${result.probability}% prob) | RSI: ${result.indicators.rsi} | MACD Hist: ${result.indicators.macdHist}`, 'info');

      // Auto trade if paper trading condition met
      const item = watchlist.find(w => w.symbol === result.symbol);
      const currentPrice = item?.price || result.indicators.bollingerMiddle;

      if (result.signal === 'BUY' && result.probability >= confidenceThreshold) {
        const riskAmount = balance * (riskPerTrade / 100);
        const riskPerCoin = currentPrice * (stopLoss / 100);
        let amountToBuy = parseFloat((riskAmount / riskPerCoin).toFixed(6));
        const maxAffordable = balance / currentPrice;
        if (amountToBuy > maxAffordable) amountToBuy = parseFloat((maxAffordable * 0.99).toFixed(6));

        executeTrade(result.symbol, 'BUY', currentPrice, amountToBuy);
        sendWebPush(`Semnal AI Calculat: CUMPĂRĂ`, `Activ: ${result.symbol}\nPreț: $${currentPrice}\nRSI: ${result.indicators.rsi}\nProbabilitate: ${result.probability}%`);
      } else if (result.signal === 'SELL' && result.probability >= confidenceThreshold) {
        const riskAmount = balance * (riskPerTrade / 100);
        const riskPerCoin = currentPrice * (stopLoss / 100);
        // Simplified for shorting logic which typically requires margin, here we simulate holding the coin or equivalent
        let amountToSell = parseFloat((riskAmount / riskPerCoin).toFixed(6));

        executeTrade(result.symbol, 'SELL', currentPrice, amountToSell);
        sendWebPush(`Semnal AI Calculat: VÂNZARE`, `Activ: ${result.symbol}\nPreț: $${currentPrice}\nRSI: ${result.indicators.rsi}\nProbabilitate: ${result.probability}%`);
      }
    } catch (err) {
      console.error('Eroare la calculul real al strategiei:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run initial calculation when tab or symbol changes if empty
  useEffect(() => {
    handleRunRealCalculation();
  }, [selectedSymbol, activeTab]);

  return (
    <div className="flex flex-col h-full bg-black text-zinc-100">
      <header className="min-h-20 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 sm:px-8 py-3 bg-zinc-900/10 backdrop-blur-md shrink-0 gap-3">
        <div>
          <h1 className="font-serif text-xl text-white">Algoritmi ML & Indicatori Tehnici Reali</h1>
          <p className="text-[10px] uppercase text-zinc-500 tracking-wider mt-0.5">Calcul matematic pe date reale din piață (Binance OHLCV & Indicators)</p>
        </div>

        {/* Symbol Selector */}
        <div className="flex items-center gap-3 bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-1.5">
          <span className="text-xs text-zinc-400 font-sans">Activ de analizat:</span>
          <select 
            value={selectedSymbol} 
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-black text-white text-sm font-bold border border-white/10 rounded px-2 py-1 focus:outline-none focus:border-emerald-500/50"
          >
            {watchlist.map(w => (
              <option key={w.symbol} value={w.symbol}>{w.symbol}</option>
            ))}
            {!watchlist.some(w => w.symbol === 'BTCUSDT') && <option value="BTCUSDT">BTCUSDT</option>}
            {!watchlist.some(w => w.symbol === 'ETHUSDT') && <option value="ETHUSDT">ETHUSDT</option>}
            {!watchlist.some(w => w.symbol === 'SOLUSDT') && <option value="SOLUSDT">SOLUSDT</option>}
          </select>
        </div>
      </header>

      <div className="p-4 sm:p-8 overflow-y-auto flex-1 space-y-6">
        {/* Model Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">
              Random Forest Ensemble (Pondat 3000 Klines)
            </span>
            <span className="text-xs text-zinc-400">21 Indicatori Tehnici Extinși & Filtru Încredere 60%</span>
          </div>
        </div>

        {/* Parameters & Real Engine Control */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-7 bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg text-white">Configurare Random Forest Ensemble</h2>
                <p className="text-xs text-zinc-400">Istoric extins (3000 lumânări OHLCV) pentru {selectedSymbol}</p>
              </div>
              <button 
                onClick={handleRunRealCalculation}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-all text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? `Se calculează (${progress}%)...` : `⚡ Rulează Calcul & Backtest Real`}
              </button>
            </div>

            {/* Model Hyperparameters */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-800/30 p-4 rounded-xl border border-white/5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-1 font-sans">Număr Arbori (Estimators)</label>
                <input 
                  type="number" 
                  value={nEstimators} 
                  onChange={(e) => setNEstimators(Number(e.target.value))}
                  min={10} max={200}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-zinc-100 font-mono text-sm focus:border-emerald-500/50" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-1 font-sans">Adâncime Maximă (Max Depth)</label>
                <input 
                  type="number" 
                  value={maxDepth} 
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  min={2} max={15}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-zinc-100 font-mono text-sm focus:border-emerald-500/50" 
                />
              </div>
            </div>

            {/* Risk Management Controls */}
            <div className="bg-zinc-800/30 p-4 rounded-xl border border-white/5 space-y-4">
              <h3 className="text-xs font-semibold text-zinc-300">Risk Management & Execuție Pe Prag de Încredere</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-1 font-sans">Stop Loss (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={stopLoss} 
                    onChange={(e) => setStopLoss(Number(e.target.value))}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-zinc-100 font-mono text-sm focus:border-emerald-500/50" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-1 font-sans">Take Profit (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={takeProfit} 
                    onChange={(e) => setTakeProfit(Number(e.target.value))}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-zinc-100 font-mono text-sm focus:border-emerald-500/50" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-1 font-sans">Prag Încredere (%)</label>
                  <input 
                    type="number" 
                    value={confidenceThreshold} 
                    onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                    min={50} max={99}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-zinc-100 font-mono text-sm focus:border-emerald-500/50" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-1 font-sans">Risc/Trade (%)</label>
                  <input 
                    type="number" 
                    value={riskPerTrade} 
                    onChange={(e) => setRiskPerTrade(Number(e.target.value))}
                    min={0.1} max={10} step="0.1"
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-zinc-100 font-mono text-sm focus:border-emerald-500/50" 
                  />
                </div>
              </div>
            </div>

            {/* REAL CALCULATED TECHNICAL INDICATORS PANEL */}
            {analysisResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="font-serif text-sm text-white">📊 Set Extins Indicatori Tehnici (21 Caracteristici)</h3>
                  <span className="text-[10px] text-emerald-400 font-mono">3000 Lumânări Reale</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-black/60 border border-white/5 p-2.5 rounded-xl">
                    <p className="text-[10px] uppercase text-zinc-500 mb-0.5">RSI (14)</p>
                    <p className={cn("text-base font-bold", analysisResult.indicators.rsi < 30 ? "text-emerald-400" : analysisResult.indicators.rsi > 70 ? "text-rose-400" : "text-zinc-200")}>
                      {analysisResult.indicators.rsi}
                    </p>
                  </div>

                  <div className="bg-black/60 border border-white/5 p-2.5 rounded-xl">
                    <p className="text-[10px] uppercase text-zinc-500 mb-0.5">MACD Hist</p>
                    <p className={cn("text-base font-bold", analysisResult.indicators.macdHist >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {analysisResult.indicators.macdHist >= 0 ? '+' : ''}{analysisResult.indicators.macdHist}
                    </p>
                  </div>

                  <div className="bg-black/60 border border-white/5 p-2.5 rounded-xl">
                    <p className="text-[10px] uppercase text-zinc-500 mb-0.5">ADX (14)</p>
                    <p className={cn("text-base font-bold", analysisResult.indicators.adx14 > 25 ? "text-emerald-400" : "text-zinc-400")}>
                      {analysisResult.indicators.adx14}
                    </p>
                  </div>

                  <div className="bg-black/60 border border-white/5 p-2.5 rounded-xl">
                    <p className="text-[10px] uppercase text-zinc-500 mb-0.5">Stoch RSI %K</p>
                    <p className="text-base font-bold text-zinc-200">
                      {analysisResult.indicators.stochRsi}%
                    </p>
                  </div>

                  <div className="bg-black/60 border border-white/5 p-2.5 rounded-xl">
                    <p className="text-[10px] uppercase text-zinc-500 mb-0.5">CCI (20)</p>
                    <p className={cn("text-base font-bold", analysisResult.indicators.cci20 > 100 ? "text-rose-400" : analysisResult.indicators.cci20 < -100 ? "text-emerald-400" : "text-zinc-200")}>
                      {analysisResult.indicators.cci20}
                    </p>
                  </div>

                  <div className="bg-black/60 border border-white/5 p-2.5 rounded-xl">
                    <p className="text-[10px] uppercase text-zinc-500 mb-0.5">EMA 20 vs 50</p>
                    <p className={cn("text-base font-bold", analysisResult.indicators.ema20 >= analysisResult.indicators.ema50 ? "text-emerald-400" : "text-rose-400")}>
                      {analysisResult.indicators.ema20 >= analysisResult.indicators.ema50 ? "Bullish" : "Bearish"}
                    </p>
                  </div>

                  <div className="bg-black/60 border border-white/5 p-2.5 rounded-xl">
                    <p className="text-[10px] uppercase text-zinc-500 mb-0.5">ATR (14) %</p>
                    <p className="text-base font-bold text-zinc-200">
                      {analysisResult.indicators.atrPercent}%
                    </p>
                  </div>

                  <div className="bg-black/60 border border-white/5 p-2.5 rounded-xl">
                    <p className="text-[10px] uppercase text-zinc-500 mb-0.5">Dist. VWAP</p>
                    <p className={cn("text-base font-bold", analysisResult.indicators.vwap && analysisResult.indicators.bollingerMiddle ? (analysisResult.indicators.bollingerMiddle >= analysisResult.indicators.vwap ? "text-emerald-400" : "text-rose-400") : "text-zinc-200")}>
                      ${analysisResult.indicators.vwap}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono bg-black/40 p-3 rounded-xl border border-white/5 text-zinc-400">
                  <div>EMA20: <span className="text-zinc-200 font-bold">${analysisResult.indicators.ema20}</span></div>
                  <div>EMA50: <span className="text-zinc-200 font-bold">${analysisResult.indicators.ema50}</span></div>
                  <div>EMA200: <span className="text-zinc-200 font-bold">${analysisResult.indicators.ema200}</span></div>
                  <div>Dist. Max 20H: <span className="text-zinc-200 font-bold">{analysisResult.indicators.distHigh20}%</span></div>
                  <div>Dist. Min 20H: <span className="text-zinc-200 font-bold">{analysisResult.indicators.distLow20}%</span></div>
                  <div>Var. OBV 14H: <span className={analysisResult.indicators.obvChange >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{analysisResult.indicators.obvChange}%</span></div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: REAL BACKTEST & SIGNAL OUTPUT */}
          <div className="col-span-12 xl:col-span-5 space-y-6">
            {/* SIGNAL RESULT BADGE */}
            {analysisResult && (
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-md text-white">Semnal AI Calculat Matematice</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-white/5 rounded text-zinc-400">{selectedSymbol}</span>
                </div>

                <div className={cn(
                  "p-5 border rounded-2xl text-center space-y-1 transition-all",
                  analysisResult.signal === 'BUY' ? "border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]" :
                  analysisResult.signal === 'SELL' ? "border-rose-500/40 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.15)]" :
                  "border-zinc-500/30 bg-zinc-800/30"
                )}>
                  <div className="text-xs uppercase tracking-widest text-zinc-400 font-mono">Semnal Recomandat</div>
                  <div className={cn(
                    "text-3xl font-black tracking-wider font-mono",
                    analysisResult.signal === 'BUY' ? "text-emerald-400" :
                    analysisResult.signal === 'SELL' ? "text-rose-400" : "text-zinc-300"
                  )}>
                    {analysisResult.signal === 'BUY' ? '🟢 CUMPĂRĂ (BUY)' : analysisResult.signal === 'SELL' ? '🔴 VÂNZARE (SELL)' : '⚪ AȘTEAPTĂ (HOLD)'}
                  </div>
                  <div className="text-sm font-mono text-zinc-300">
                    Probabilitate de Succes: <span className="font-bold text-white">{analysisResult.probability}%</span>
                  </div>
                </div>

                {/* Rationale list */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase text-zinc-500 tracking-wider font-sans">Justificare Matematică (Rules Evaluation):</p>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {analysisResult.explanation.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-black/40 p-2 rounded border border-white/5">
                        <span className="text-emerald-400 font-mono">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* REAL HISTORICAL BACKTEST PERFORMANCE */}
            {analysisResult && (
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="font-serif text-md text-white">📈 Rezultate Backtest Real pe Istoric</h3>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">100+ Lumânări Reale</span>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="bg-black/60 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] uppercase text-zinc-500 mb-1">Acuratețe Model</p>
                    <p className="text-base font-bold text-emerald-400">{analysisResult.modelMetrics.accuracy}%</p>
                  </div>
                  <div className="bg-black/60 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] uppercase text-zinc-500 mb-1">Win Rate Tranzacții</p>
                    <p className="text-base font-bold text-emerald-400">{analysisResult.backtestResults.winRate}%</p>
                  </div>
                  <div className="bg-black/60 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] uppercase text-zinc-500 mb-1">Profit Factor</p>
                    <p className="text-base font-bold text-zinc-200">{analysisResult.backtestResults.profitFactor}</p>
                  </div>
                  <div className="bg-black/60 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] uppercase text-zinc-500 mb-1">Profit Total Backtest</p>
                    <p className={cn("text-base font-bold", analysisResult.backtestResults.totalReturnPercent >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {analysisResult.backtestResults.totalReturnPercent >= 0 ? '+' : ''}{analysisResult.backtestResults.totalReturnPercent}%
                    </p>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-zinc-400 font-mono px-1">
                  <span>Tranzacții testate: {analysisResult.backtestResults.totalTrades}</span>
                  <span>Max Drawdown: -{analysisResult.backtestResults.maxDrawdownPercent}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
