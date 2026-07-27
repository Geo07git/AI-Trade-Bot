export type ViewState = 'superDashboard' | 'dashboard' | 'strategyLab' | 'strategies' | 'backtesting' | 'journal' | 'analyst' | 'news' | 'alerts' | 'logs' | 'settings' | 'guide';

export interface JournalEntry {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  price: number;
  amount: number;
  fee: number;
  pnl: number;
  pnlPercent: number;
  mlProbability: number;
  modelName: string;
  entryReason: string;
  mode: 'paper' | 'testnet' | 'live';
  timestamp: string;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface DailySnapshot {
  date: string; // YYYY-MM-DD
  equity: number;
  realizedPnL: number;
  unrealizedPnL: number;
  winRate: number;
  totalTrades: number;
  bestModel: string;
  bestStrategy: string;
  timestamp: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  categories: string[];
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  imageUrl?: string;
  relatedSymbols?: string[];
}

export interface Position {
  id: string;
  symbol: string;
  shares: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface TradeLog {
  id: string;
  timestamp: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  shares: number;
  price: number;
  reason: string;
  equity?: number;
}

export interface BacktestResult {
  strategy: string;
  totalReturn: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
  chartData: { time: string; equity: number }[];
}
