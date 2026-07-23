import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WatchlistItem {
  symbol: string;
  price: number | null;
  signal: { action: 'BUY' | 'SELL' | 'HOLD'; prob: number } | null;
  active: boolean;
}

export interface Position {
  symbol: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
}

interface TradingStore {
  balance: number;
  initialBalance: number;
  watchlist: WatchlistItem[];
  positions: Position[];
  logs: { time: string; message: string; type: 'info' | 'success' | 'warning'; equity?: number }[];
  autoTradingActive: boolean;
  dataInterval: number;
  analysisInterval: number;
  apiKey: string;
  apiSecret: string;
  geminiApiKey: string;
  notificationProvider: 'discord' | 'telegram';
  discordWebhookUrl: string;
  telegramBotToken: string;
  telegramChatId: string;
  timezone: string;
  reportConfig: {
    channels: { telegram: boolean; discord: boolean; browser: boolean };
    daily: { enabled: boolean; time: string };
    weekly: { enabled: boolean; day: number; time: string };
    monthly: { enabled: boolean };
  };
  
  setBalance: (amount: number) => void;
  addWatchlist: (symbol: string) => void;
  removeWatchlist: (symbol: string) => void;
  updatePrice: (symbol: string, price: number) => void;
  updateSignal: (symbol: string, signal: WatchlistItem['signal']) => void;
  toggleWatchlistActive: (symbol: string) => void;
  executeTrade: (symbol: string, action: 'BUY' | 'SELL', price: number, amount: number) => void;
  addLog: (message: string, type?: 'info' | 'success' | 'warning') => void;
  setAutoTradingActive: (active: boolean) => void;
  setDataInterval: (seconds: number) => void;
  setAnalysisInterval: (seconds: number) => void;
  setApiKey: (key: string) => void;
  setApiSecret: (secret: string) => void;
  setGeminiApiKey: (key: string) => void;
  setNotificationProvider: (provider: 'discord' | 'telegram') => void;
  setDiscordWebhookUrl: (url: string) => void;
  setTelegramBotToken: (token: string) => void;
  setTelegramChatId: (id: string) => void;
  setTimezone: (timezone: string) => void;
  setReportConfig: (config: Partial<TradingStore['reportConfig']>) => void;
}

export const useTradingStore = create<TradingStore>()(
  persist(
    (set) => ({
  balance: 10000,
  initialBalance: 10000,
  watchlist: [
    { symbol: 'BTCUSDT', price: null, signal: null, active: true },
    { symbol: 'ETHUSDT', price: null, signal: null, active: false },
    { symbol: 'SOLUSDT', price: null, signal: null, active: false },
  ],
  positions: [],
  logs: [],
  autoTradingActive: true,
  dataInterval: 30, // 30 seconds
  analysisInterval: 60, // 1 minute
  apiKey: '',
  apiSecret: '',
  geminiApiKey: '',
  notificationProvider: 'discord',
  discordWebhookUrl: '',
  telegramBotToken: '',
  telegramChatId: '',
  timezone: 'Europe/Bucharest',
  reportConfig: {
    channels: { telegram: true, discord: false, browser: false },
    daily: { enabled: true, time: '21:00' },
    weekly: { enabled: true, day: 0, time: '21:00' },
    monthly: { enabled: true }
  },
  
  setBalance: (amount) => {
    set({ balance: amount, initialBalance: amount, positions: [], logs: [] });
    fetch('/api/bot/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance: amount })
    }).catch(() => {});
  },
  
  addWatchlist: (symbol) => set((state) => {
    if (state.watchlist.find(w => w.symbol === symbol)) return state;
    const newWatchlist = [...state.watchlist, { symbol, price: null, signal: null, active: true }];
    fetch('/api/bot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ watchlist: newWatchlist })
    }).catch(() => {});
    return { watchlist: newWatchlist };
  }),

  removeWatchlist: (symbol) => set((state) => {
    const newWatchlist = state.watchlist.filter(w => w.symbol !== symbol);
    fetch('/api/bot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ watchlist: newWatchlist })
    }).catch(() => {});
    return { watchlist: newWatchlist };
  }),

  updatePrice: (symbol, price) => set((state) => ({
    watchlist: state.watchlist.map(w => w.symbol === symbol ? { ...w, price } : w),
    positions: state.positions.map(p => p.symbol === symbol ? { ...p, currentPrice: price } : p)
  })),

  updateSignal: (symbol, signal) => set((state) => ({
    watchlist: state.watchlist.map(w => w.symbol === symbol ? { ...w, signal } : w)
  })),

  toggleWatchlistActive: (symbol) => set((state) => {
    const newWatchlist = state.watchlist.map(w => w.symbol === symbol ? { ...w, active: !w.active } : w);
    fetch('/api/bot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ watchlist: newWatchlist })
    }).catch(() => {});
    return { watchlist: newWatchlist };
  }),

  executeTrade: (symbol, action, price, amount) => {
    fetch('/api/bot/trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, action, price, amount })
    }).catch(() => {});

    set((state) => {
      // Simplified paper trading execution
      const cost = price * amount;
      if (action === 'BUY' && state.balance >= cost) {
        const existing = state.positions.find(p => p.symbol === symbol);
        let newPositions = [...state.positions];
        if (existing) {
          newPositions = state.positions.map(p => p.symbol === symbol ? { ...p, amount: p.amount + amount, currentPrice: price } : p);
        } else {
          newPositions.push({ symbol, amount, entryPrice: price, currentPrice: price });
        }
        
        const newBalance = state.balance - cost;
        const newEquity = newBalance + newPositions.reduce((acc, pos) => acc + (pos.amount * (pos.currentPrice || pos.entryPrice)), 0);
        
        const timeFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: state.timezone || 'Europe/Bucharest',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });
        const time = timeFormatter.format(new Date());

        return { 
          balance: newBalance, 
          positions: newPositions,
          logs: [{ time, message: `Cumpărat ${amount} ${symbol} @ $${price}`, type: 'success', equity: newEquity }, ...state.logs]
        };
      } else if (action === 'SELL') {
        const existing = state.positions.find(p => p.symbol === symbol);
        if (existing && existing.amount >= amount) {
          const newPositions = state.positions.map(p => 
            p.symbol === symbol ? { ...p, amount: p.amount - amount } : p
          ).filter(p => p.amount > 0);
          
          const newBalance = state.balance + cost;
          const newEquity = newBalance + newPositions.reduce((acc, pos) => acc + (pos.amount * (pos.currentPrice || pos.entryPrice)), 0);
          
          const timeFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: state.timezone || 'Europe/Bucharest',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
          });
          const time = timeFormatter.format(new Date());

          return { 
            balance: newBalance,
            positions: newPositions,
            logs: [{ time, message: `Vândut ${amount} ${symbol} @ $${price}`, type: 'warning', equity: newEquity }, ...state.logs]
          };
        }
      }
      return state;
    });
  },

  addLog: (message, type = 'info') => set((state) => {
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: state.timezone || 'Europe/Bucharest',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
    const time = timeFormatter.format(new Date());
    return {
      logs: [{ time, message, type }, ...state.logs]
    };
  }),

  setAutoTradingActive: (active) => {
    set({ autoTradingActive: active });
    fetch('/api/bot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoTradingActive: active })
    }).catch(() => {});
  },
  setDataInterval: (seconds) => {
    set({ dataInterval: seconds });
    fetch('/api/bot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataInterval: seconds })
    }).catch(() => {});
  },
  setAnalysisInterval: (seconds) => {
    set({ analysisInterval: seconds });
    fetch('/api/bot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisInterval: seconds })
    }).catch(() => {});
  },
  setApiKey: (key) => set({ apiKey: key }),
  setApiSecret: (secret) => set({ apiSecret: secret }),
  setGeminiApiKey: (key) => set({ geminiApiKey: key }),
  setNotificationProvider: (provider) => {
    set({ notificationProvider: provider });
    fetch('/api/bot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationProvider: provider })
    }).catch(() => {});
  },
  setDiscordWebhookUrl: (url) => {
    set({ discordWebhookUrl: url });
    fetch('/api/bot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordWebhookUrl: url })
    }).catch(() => {});
  },
  setTelegramBotToken: (token) => {
    set({ telegramBotToken: token });
    fetch('/api/bot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramBotToken: token })
    }).catch(() => {});
  },
  setTelegramChatId: (id) => {
    set({ telegramChatId: id });
    fetch('/api/bot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramChatId: id })
    }).catch(() => {});
  },
  setTimezone: (timezone) => {
    set({ timezone });
    fetch('/api/bot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone })
    }).catch(() => {});
  },
  setReportConfig: (config) => set((state) => {
    const newConfig = { ...state.reportConfig, ...config };
    fetch('/api/bot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportConfig: newConfig })
    }).catch(() => {});
    return { reportConfig: newConfig };
  })
    }),
    {
      name: 'trading-store'
    }
  )
);
