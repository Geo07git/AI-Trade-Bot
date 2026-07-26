import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Cpu, 
  ShieldCheck, 
  TrendingUp, 
  Play, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  BarChart3, 
  Layers, 
  ArrowRight, 
  Zap, 
  Info, 
  Activity,
  Sliders,
  Award,
  ChevronRight,
  Filter
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface StrategyHypothesis {
  id: string;
  name: string;
  description: string;
  targetRegime: 'TRENDING_BULL' | 'TRENDING_BEAR' | 'SIDEWAYS_RANGE' | 'HIGH_VOLATILITY' | 'LOW_VOLATILITY';
  timeframe: string;
  rules: {
    entry: string[];
    exit: string[];
    indicators: string[];
  };
  status: 'HYPOTHESIS' | 'BACKTESTED' | 'ML_FILTER_PASSED' | 'WALK_FORWARD_PASSED' | 'MONTE_CARLO_PASSED' | 'PAPER_TRADING' | 'LIVE_READY' | 'REJECTED';
  metrics: {
    profitFactor: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
    avgTradeReturn: number;
  };
  mlScores: {
    randomForestProb: number;
    ensembleScore: number;
    treesApproved?: number;
  };
  aiConfidence: number;
  totalScore: number;
  walkForwardWindowsPassed: number;
  monteCarloVar95: number;
  paperTradesCount: number;
  paperWinRate: number;
  paperProfitFactor: number;
  createdAt: string;
}

export function AIStrategyLab() {
  const [strategies, setStrategies] = useState<StrategyHypothesis[]>([]);
  const [regimeInfo, setRegimeInfo] = useState<{
    regime: string;
    description: string;
    optimalModels: string[];
  }>({
    regime: 'SIDEWAYS_RANGE',
    description: 'Piață Laterală (Range-Bound). Volatilitate moderată, fără trend clar.',
    optimalModels: ['Random Forest (RF)', 'Mean Reversion ML Filter', 'RSI / Stochastic Ensemble']
  });
  
  const [stats, setStats] = useState({
    generatedCount: 0,
    backtestPassedCount: 0,
    mlFilterPassedCount: 0,
    walkForwardPassedCount: 0,
    monteCarloPassedCount: 0,
    paperTradingCount: 0,
    liveReadyCount: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [batchCount, setBatchCount] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'all' | 'paper' | 'live' | 'rejected'>('all');
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyHypothesis | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string | null>(null);

  // Fetch Strategy Lab State
  const fetchLabState = async () => {
    try {
      const res = await fetch('/api/lab/state');
      if (res.ok) {
        const data = await res.json();
        setStrategies(data.strategies || []);
        if (data.regime) setRegimeInfo(data.regime);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching strategy lab state:', err);
    }
  };

  useEffect(() => {
    fetchLabState();
  }, []);

  // Generate & Validate Batch
  const handleGenerateBatch = async () => {
    setIsLoading(true);
    setGenerationProgress(`Pasul 1/5: AI Lab generează ${batchCount} ipoteze de strategii...`);

    try {
      setTimeout(() => {
        setGenerationProgress(`Pasul 2/5: Rulare Backtest & calcul Profit Factor...`);
      }, 800);

      setTimeout(() => {
        setGenerationProgress(`Pasul 3/5: Evaluare Random Forest Decision Trees ML Ensemble...`);
      }, 1600);

      setTimeout(() => {
        setGenerationProgress(`Pasul 4/5: Simulări Walk-Forward (5 ferestre) & Monte Carlo (1000 căi)...`);
      }, 2400);

      const res = await fetch('/api/lab/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: batchCount })
      });

      if (res.ok) {
        const data = await res.json();
        setStrategies(data.strategies || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error generating strategy batch:', err);
    } finally {
      setIsLoading(false);
      setGenerationProgress(null);
    }
  };

  // Promote Strategy
  const handlePromote = async (id: string, targetStatus: 'PAPER_TRADING' | 'LIVE_READY') => {
    try {
      const res = await fetch('/api/lab/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, targetStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setStrategies(data.strategies || []);
        if (selectedStrategy && selectedStrategy.id === id) {
          const updated = (data.strategies || []).find((s: StrategyHypothesis) => s.id === id);
          if (updated) setSelectedStrategy(updated);
        }
      }
    } catch (err) {
      console.error('Error promoting strategy:', err);
    }
  };

  // Change Market Regime
  const handleChangeRegime = async (newRegime: string) => {
    try {
      const res = await fetch('/api/lab/regime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regime: newRegime })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.regime) setRegimeInfo(data.regime);
        if (data.strategies) setStrategies(data.strategies);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error changing regime:', err);
    }
  };

  const filteredStrategies = strategies.filter(s => {
    if (activeTab === 'paper') return s.status === 'PAPER_TRADING';
    if (activeTab === 'live') return s.status === 'LIVE_READY';
    if (activeTab === 'rejected') return s.status === 'REJECTED';
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-black text-zinc-100 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">AI Strategy Lab</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              LLM + Random Forest Ensemble Research Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Generare automată de ipoteze, filtrare prin Random Forest Decision Tree Ensemble, validare Walk-Forward 5 ferestre & Monte Carlo 1000 simulări și incubare în Paper Trading înainte de activare live.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-900 border border-white/10 rounded-lg p-1 text-xs">
            {[100, 250, 500, 1000].map((count) => (
              <button
                key={count}
                onClick={() => setBatchCount(count)}
                className={cn(
                  "px-2.5 py-1 rounded font-mono transition-colors",
                  batchCount === count ? "bg-white/10 text-white font-semibold" : "text-zinc-400 hover:text-white"
                )}
              >
                {count}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerateBatch}
            disabled={isLoading}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generază & Validează {batchCount} Strategii</span>
          </button>
        </div>
      </div>

      {/* Generation Progress Indicator */}
      {generationProgress && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <RotateCw className="w-5 h-5 text-emerald-400 animate-spin" />
            <span className="text-xs font-mono text-emerald-300 font-medium">{generationProgress}</span>
          </div>
          <span className="text-xs font-mono text-emerald-400">Pipelines Active</span>
        </div>
      )}

      {/* Market Regime Detector Bar */}
      <div className="bg-zinc-900/80 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg mt-0.5">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Regimul Pieței Detectat:</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
                {regimeInfo.regime}
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1">{regimeInfo.description}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-zinc-500">Modele Optime Active:</span>
              {regimeInfo.optimalModels.map((m, idx) => (
                <span key={idx} className="text-[10px] bg-zinc-800 text-zinc-300 border border-white/5 px-2 py-0.5 rounded font-mono">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-zinc-500 mr-1">Schimbă Regim Test:</span>
          {[
            { id: 'SIDEWAYS_RANGE', label: 'Sideways' },
            { id: 'TRENDING_BULL', label: 'Bull Trend' },
            { id: 'HIGH_VOLATILITY', label: 'High Vol' }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => handleChangeRegime(r.id)}
              className={cn(
                "px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer font-mono",
                regimeInfo.regime === r.id 
                  ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-medium" 
                  : "bg-zinc-800/60 border-white/5 text-zinc-400 hover:text-white"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* System Architecture Flow Diagram */}
      <div className="bg-zinc-900/60 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Arhitectură de Cercetare & Filtrare Strategii
          </h2>
          <span className="text-[11px] text-zinc-500">Pipeline-ul de Convertire Ipoteză → Tranzacționare Live</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
          {[
            { step: '1. AI Strategy Lab', desc: 'Generează 100-1000 ipoteze', icon: Sparkles, color: 'text-amber-400 border-amber-500/20 bg-amber-500/5', count: stats.generatedCount },
            { step: '2. Fast Backtest', desc: 'Profit Factor > 1.30 & Win Rate > 48%', icon: BarChart3, color: 'text-blue-400 border-blue-500/20 bg-blue-500/5', count: stats.backtestPassedCount },
            { step: '3. RF Ensemble', desc: 'Random Forest Tree Votes >= 50%', icon: Cpu, color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5', count: stats.mlFilterPassedCount },
            { step: '4. Walk-Forward', desc: '5 Ferestre out-of-sample', icon: Sliders, color: 'text-purple-400 border-purple-500/20 bg-purple-500/5', count: stats.walkForwardPassedCount },
            { step: '5. Monte Carlo', desc: '1000 simulări (VaR < 11.0%)', icon: ShieldCheck, color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5', count: stats.monteCarloPassedCount },
            { step: '6. Paper Trading', desc: 'Incubare 100-200 tranzacții', icon: Activity, color: 'text-orange-400 border-orange-500/20 bg-orange-500/5', count: stats.paperTradingCount },
            { step: '7. Live Trading', desc: 'Aprobate pentru executare', icon: Zap, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', count: stats.liveReadyCount }
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className={cn("p-3 rounded-lg border flex flex-col items-center justify-between", s.color)}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold text-white">{s.step}</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight mb-2">{s.desc}</p>
                <div className="bg-black/40 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-white border border-white/5">
                  {s.count} candidate
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: `Toate Candidatele (${strategies.length})` },
            { id: 'paper', label: `Paper Trading (${stats.paperTradingCount})` },
            { id: 'live', label: `Aprobate Live (${stats.liveReadyCount})` },
            { id: 'rejected', label: `Respinse (${strategies.length - stats.backtestPassedCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                activeTab === tab.id
                  ? "bg-white/10 text-white border border-white/10 font-semibold"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-zinc-500 font-mono">
          Afișează {filteredStrategies.length} din {strategies.length} strategii
        </span>
      </div>

      {/* Strategy Candidates List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredStrategies.map((strat) => {
          const isLive = strat.status === 'LIVE_READY';
          const isPaper = strat.status === 'PAPER_TRADING';
          const isRejected = strat.status === 'REJECTED';

          return (
            <div 
              key={strat.id}
              className={cn(
                "bg-zinc-900/70 border rounded-xl p-5 flex flex-col justify-between transition-all hover:border-white/20",
                isLive ? "border-emerald-500/40 bg-emerald-950/10" :
                isPaper ? "border-amber-500/40 bg-amber-950/10" :
                isRejected ? "border-rose-500/20 opacity-60" : "border-white/10"
              )}
            >
              <div>
                {/* Strategy Top Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{strat.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-white/5">
                        {strat.timeframe}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {strat.targetRegime}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{strat.description}</p>
                  </div>

                  {/* Total Score Badge */}
                  <div className="flex flex-col items-end shrink-0">
                    <div className={cn(
                      "px-3 py-1 rounded-lg border font-mono text-sm font-bold flex items-center gap-1",
                      strat.totalScore >= 85 ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" :
                      strat.totalScore >= 70 ? "bg-amber-500/20 border-amber-500/40 text-amber-400" :
                      "bg-rose-500/20 border-rose-500/40 text-rose-400"
                    )}>
                      <Award className="w-3.5 h-3.5" />
                      <span>{strat.totalScore}/100</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 font-mono uppercase">TOTAL SCORE</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border flex items-center gap-1",
                    isLive ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                    isPaper ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                    isRejected ? "bg-rose-500/20 text-rose-300 border-rose-500/30" :
                    "bg-blue-500/20 text-blue-300 border-blue-500/30"
                  )}>
                    {isLive && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {isPaper && <Activity className="w-3 h-3 text-amber-400" />}
                    {isRejected && <XCircle className="w-3 h-3 text-rose-400" />}
                    <span>
                      {isLive ? 'APROBAT LIVE' : 
                       isPaper ? `PAPER TRADING (${strat.paperTradesCount}/200 Tranzacții)` : 
                       isRejected ? 'RESPINS DE VALIDATOR' : strat.status}
                    </span>
                  </span>

                  <span className="text-[11px] text-zinc-500 font-mono">
                    Walk-Forward: {strat.walkForwardWindowsPassed}/5 | VaR 95%: {strat.monteCarloVar95}%
                  </span>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-4 gap-2 bg-black/40 rounded-lg p-3 border border-white/5 mb-4 text-center">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Profit Factor</span>
                    <span className="text-xs font-mono font-semibold text-emerald-400">{strat.metrics.profitFactor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Win Rate</span>
                    <span className="text-xs font-mono font-semibold text-white">{strat.metrics.winRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Sharpe</span>
                    <span className="text-xs font-mono font-semibold text-indigo-300">{strat.metrics.sharpeRatio}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Max DD</span>
                    <span className="text-xs font-mono font-semibold text-rose-400">-{strat.metrics.maxDrawdown}%</span>
                  </div>
                </div>

                {/* ML Probability Breakdown (Random Forest Ensemble & Decision Trees) */}
                <div className="bg-zinc-800/40 rounded-lg p-3 border border-white/5 mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      Evaluare ML Random Forest Ensemble
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      Scor RF: {strat.mlScores.randomForestProb}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                    <div className="bg-black/30 p-1.5 rounded border border-white/5">
                      <span className="text-zinc-500 block">Arbori Decizionali Aprobați</span>
                      <span className="font-mono font-semibold text-emerald-400">{strat.mlScores.treesApproved || Math.round((strat.mlScores.randomForestProb/100)*10)} / 10 Arbori</span>
                    </div>
                    <div className="bg-black/30 p-1.5 rounded border border-white/5">
                      <span className="text-zinc-500 block">Probabilitate Direcțională</span>
                      <span className="font-mono font-semibold text-indigo-300">{strat.mlScores.randomForestProb}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3 gap-2">
                <button
                  onClick={() => setSelectedStrategy(strat)}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Vezi Reguli & Monte Carlo</span>
                </button>

                <div className="flex items-center gap-2">
                  {!isPaper && !isLive && !isRejected && (
                    <button
                      onClick={() => handlePromote(strat.id, 'PAPER_TRADING')}
                      className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium"
                    >
                      Trimite în Paper Trading
                    </button>
                  )}

                  {isPaper && (
                    <button
                      onClick={() => handlePromote(strat.id, 'LIVE_READY')}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Promovează în Live Bot
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Strategy Modal */}
      {selectedStrategy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{selectedStrategy.name}</h2>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Score: {selectedStrategy.totalScore}/100
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{selectedStrategy.description}</p>
              </div>

              <button 
                onClick={() => setSelectedStrategy(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800"
              >
                ✕
              </button>
            </div>

            {/* Rules Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                  Reguli de Intrare (Entry Rules)
                </h3>
                <ul className="space-y-1.5">
                  {selectedStrategy.rules.entry.map((rule, idx) => (
                    <li key={idx} className="text-xs text-zinc-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">
                  Reguli de Ieșire & Stop Loss
                </h3>
                <ul className="space-y-1.5">
                  {selectedStrategy.rules.exit.map((rule, idx) => (
                    <li key={idx} className="text-xs text-zinc-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Walk-Forward & Monte Carlo Matrix */}
            <div className="bg-zinc-800/40 border border-white/5 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                Validare Walk-Forward (5 Ferestre Out-Of-Sample) & Monte Carlo
              </h3>

              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {[1, 2, 3, 4, 5].map((w) => {
                  const passed = w <= selectedStrategy.walkForwardWindowsPassed;
                  return (
                    <div 
                      key={w} 
                      className={cn(
                        "p-2 rounded border font-mono text-[11px]",
                        passed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      )}
                    >
                      <div>Window #{w}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{passed ? 'PASSED' : 'FAILED'}</div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5 font-mono">
                <span className="text-zinc-400">Monte Carlo 95% Value-at-Risk (1000 căi):</span>
                <span className="text-cyan-400 font-bold">{selectedStrategy.monteCarloVar95}%</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                onClick={() => setSelectedStrategy(null)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
              >
                Închide
              </button>

              {selectedStrategy.status !== 'LIVE_READY' && (
                <button
                  onClick={() => {
                    handlePromote(selectedStrategy.id, 'LIVE_READY');
                    setSelectedStrategy(null);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer"
                >
                  Promovează în Tranzacționare Live
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
