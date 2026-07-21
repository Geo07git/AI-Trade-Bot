export type ViewState = 'dashboard' | 'strategies' | 'data_sources' | 'backtesting' | 'analyst' | 'alerts' | 'logs' | 'settings' | 'guide';

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
}

export interface BacktestResult {
  strategy: string;
  totalReturn: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
  chartData: { time: string; equity: number }[];
}
