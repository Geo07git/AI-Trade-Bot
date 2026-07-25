export type ViewState = 'dashboard' | 'strategyLab' | 'strategies' | 'backtesting' | 'analyst' | 'news' | 'alerts' | 'logs' | 'settings' | 'guide';

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
