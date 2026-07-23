import fs from 'fs';
import path from 'path';

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

export interface LogItem {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  equity?: number;
}

export interface CompletedTrade {
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  amount: number;
  pnl: number;
  pnlPercent: number;
  timestamp: string;
}

export interface ReportConfig {
  channels: {
    telegram: boolean;
    discord: boolean;
    browser: boolean;
  };
  daily: {
    enabled: boolean;
    time: string;
  };
  weekly: {
    enabled: boolean;
    day: number;
    time: string;
  };
  monthly: {
    enabled: boolean;
  };
}

export interface BotState {
  autoTradingActive: boolean;
  balance: number;
  initialBalance: number;
  watchlist: WatchlistItem[];
  positions: Position[];
  logs: LogItem[];
  tradeHistory: CompletedTrade[];
  reportConfig: ReportConfig;
  notificationProvider: 'discord' | 'telegram';
  discordWebhookUrl: string;
  telegramBotToken: string;
  telegramChatId: string;
  timezone: string;
  dataInterval: number; // in seconds
  analysisInterval: number; // in seconds
  serverStartedAt: string;
  lastCheckAt: string;
  totalTradesExecuted: number;
}

const BASELINE_PRICES: Record<string, number> = {
  'BTC': 64230.00,
  'BTCUSDT': 64230.00,
  'ETH': 3450.00,
  'ETHUSDT': 3450.00,
  'SOL': 145.20,
  'SOLUSDT': 145.20,
  'NVDA': 125.80,
  'AAPL': 224.50,
  'MSFT': 412.30,
  'TSLA': 187.40,
  'AMD': 164.20,
  'COIN': 210.50,
  'SPY': 540.20,
  'QQQ': 460.80,
};

function getFallbackBasePrice(symbol: string): number {
  const cleanSymbol = symbol.trim().toUpperCase();
  if (BASELINE_PRICES[cleanSymbol] !== undefined) {
    return BASELINE_PRICES[cleanSymbol];
  }
  let hash = 0;
  for (let i = 0; i < cleanSymbol.length; i++) {
    hash = cleanSymbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 10 + (Math.abs(hash) % 990);
}

async function fetchLivePriceServer(symbol: string): Promise<number> {
  const cleanSymbol = symbol.trim().toUpperCase();
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${cleanSymbol}`);
    if (res.ok) {
      const data = await res.json();
      const apiPrice = parseFloat(data.price);
      if (!isNaN(apiPrice) && apiPrice > 0) {
        return apiPrice;
      }
    }
  } catch (err) {
    // Fallback below
  }

  const basePrice = getFallbackBasePrice(cleanSymbol);
  const fluctuation = 1 + (Math.random() * 0.008 - 0.004);
  return parseFloat((basePrice * fluctuation).toFixed(2));
}

function generateSignalServer(symbol: string, currentPrice: number) {
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rawProb = 40 + (hash % 30) + (Math.random() * 20 - 10);
  
  let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let prob = rawProb;

  if (rawProb > 65) {
    action = 'BUY';
    prob = rawProb;
  } else if (rawProb < 45) {
    action = 'SELL';
    prob = 100 - rawProb;
  } else {
    action = 'HOLD';
    prob = 50 + Math.random() * 10;
  }

  return { action, prob: Math.round(prob) };
}

async function sendWebhookServer(provider: 'discord' | 'telegram', urlOrToken: string, chatIdOrMessage: string, message?: string) {
  try {
    if (provider === 'discord' && urlOrToken) {
      await fetch(urlOrToken, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: chatIdOrMessage })
      });
    } else if (provider === 'telegram' && urlOrToken && chatIdOrMessage && message) {
      const url = `https://api.telegram.org/bot${urlOrToken}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatIdOrMessage, text: message })
      });
    }
  } catch (err) {
    console.error('Webhook error on server:', err);
  }
}

class ServerBotEngine {
  public state: BotState;
  private intervalTimer: NodeJS.Timeout | null = null;
  private secondsCounter = 0;
  private stateFilePath = path.join(process.cwd(), 'bot_state.json');
  private telegramOffset = 0;

  constructor() {
    this.state = {
      autoTradingActive: true,
      balance: 10000,
      initialBalance: 10000,
      watchlist: [
        { symbol: 'BTCUSDT', price: 64230, signal: { action: 'BUY', prob: 88 }, active: true },
        { symbol: 'ETHUSDT', price: 3450, signal: { action: 'BUY', prob: 76 }, active: true },
        { symbol: 'SOLUSDT', price: 145.20, signal: { action: 'HOLD', prob: 52 }, active: false },
      ],
      positions: [],
      logs: [
        {
          time: new Date().toLocaleTimeString(),
          message: '🤖 Engine-ul de fundal AI.TRADE Bot a fost inițializat pe server. Rulare 24/7 activă!',
          type: 'info'
        }
      ],
      tradeHistory: [],
      reportConfig: {
        channels: { telegram: true, discord: false, browser: false },
        daily: { enabled: true, time: '21:00' },
        weekly: { enabled: true, day: 0, time: '21:00' },
        monthly: { enabled: true }
      },
      notificationProvider: 'discord',
      discordWebhookUrl: '',
      telegramBotToken: '',
      telegramChatId: '',
      timezone: 'Europe/Bucharest',
      dataInterval: 10,
      analysisInterval: 30,
      serverStartedAt: new Date().toISOString(),
      lastCheckAt: new Date().toISOString(),
      totalTradesExecuted: 0,
    };

    this.loadPersistedState();
    this.startBackgroundLoop();
  }

  private loadPersistedState() {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const raw = fs.readFileSync(this.stateFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.state = { ...this.state, ...parsed };
        console.log('[AI.TRADE Bot] State încărcat din bot_state.json pe server');
      }
    } catch (e) {
      console.error('[AI.TRADE Bot] Eroare la citirea bot_state.json:', e);
    }
  }

  private savePersistedState() {
    try {
      fs.writeFileSync(this.stateFilePath, JSON.stringify(this.state, null, 2));
    } catch (e) {
      console.error('[AI.TRADE Bot] Eroare la salvarea bot_state.json:', e);
    }
  }

  public addLog(message: string, type: 'info' | 'success' | 'warning' = 'info', equity?: number) {
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: this.state.timezone || 'Europe/Bucharest',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const time = timeFormatter.format(new Date());
    this.state.logs = [{ time, message, type, equity }, ...this.state.logs.slice(0, 99)];
    this.savePersistedState();
  }

  public updateConfig(newConfig: Partial<BotState>) {
    if (newConfig.autoTradingActive !== undefined) this.state.autoTradingActive = newConfig.autoTradingActive;
    if (newConfig.notificationProvider !== undefined) this.state.notificationProvider = newConfig.notificationProvider;
    if (newConfig.discordWebhookUrl !== undefined) this.state.discordWebhookUrl = newConfig.discordWebhookUrl;
    if (newConfig.telegramBotToken !== undefined) this.state.telegramBotToken = newConfig.telegramBotToken;
    if (newConfig.telegramChatId !== undefined) this.state.telegramChatId = newConfig.telegramChatId;
    if (newConfig.timezone !== undefined) this.state.timezone = newConfig.timezone;
    if (newConfig.dataInterval !== undefined) this.state.dataInterval = newConfig.dataInterval;
    if (newConfig.analysisInterval !== undefined) this.state.analysisInterval = newConfig.analysisInterval;
    if (newConfig.watchlist !== undefined) this.state.watchlist = newConfig.watchlist;
    if (newConfig.balance !== undefined) this.state.balance = newConfig.balance;
    if (newConfig.reportConfig !== undefined) this.state.reportConfig = { ...this.state.reportConfig, ...newConfig.reportConfig };
    this.savePersistedState();
  }

  public resetPortfolio(newBalance = 10000) {
    this.state.balance = newBalance;
    this.state.initialBalance = newBalance;
    this.state.positions = [];
    this.state.logs = [];
    this.addLog(`Portofoliu resetat la $${newBalance} pe server.`, 'warning');
    this.savePersistedState();
  }

  private sendNotification(message: string) {
    if (this.state.notificationProvider === 'discord' && this.state.discordWebhookUrl) {
      sendWebhookServer('discord', this.state.discordWebhookUrl, message);
    } else if (this.state.notificationProvider === 'telegram' && this.state.telegramBotToken && this.state.telegramChatId) {
      sendWebhookServer('telegram', this.state.telegramBotToken, this.state.telegramChatId, message);
    }
  }

  private async pollTelegramMessages() {
    if (this.state.notificationProvider !== 'telegram' || !this.state.telegramBotToken) return;

    try {
      const url = `https://api.telegram.org/bot${this.state.telegramBotToken}/getUpdates?offset=${this.telegramOffset}&timeout=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.result.length > 0) {
          for (const update of data.result) {
            this.telegramOffset = update.update_id + 1;
            
            if (update.message && update.message.text) {
              const text = update.message.text.trim();
              const chatId = update.message.chat.id.toString();

              // Auto-set the chat ID if it's the user trying to configure it or if it's empty
              if (!this.state.telegramChatId || this.state.telegramChatId === chatId) {
                if (!this.state.telegramChatId) {
                   this.state.telegramChatId = chatId;
                   this.savePersistedState();
                }
                await this.handleTelegramCommand(text, chatId);
              }
            }
          }
        }
      }
    } catch (e) {
      // Ignore polling errors to not flood logs
    }
  }

  private async handleTelegramCommand(command: string, chatId: string) {
    const cmd = command.toLowerCase().split(' ')[0];
    let reply = '';
    
    switch (cmd) {
      case '/status':
        const equity = this.calculateEquity();
        const profit = equity - this.state.initialBalance;
        const profitSign = profit >= 0 ? '+' : '';
        const positions = this.state.positions.map(p => p.symbol).join(', ') || 'Niciuna';
        
        reply = `📊 *AI Trading Bot Status*\n\n` +
                `*Portofoliu:* $${equity.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n` +
                `*Profit total:* ${profitSign}$${profit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n` +
                `*Status 24/7:* ${this.state.autoTradingActive ? '✅ ACTIV' : '❌ OPRIT'}\n` +
                `*Poziții deschise:* ${positions}`;
        break;
      case '/portfolio':
      case '/performance':
        reply = `*Performanță Portofoliu*\nCapital Inițial: $${this.state.initialBalance.toFixed(2)}\nCapital Curent: $${this.calculateEquity().toFixed(2)}\nBalanță Cash: $${this.state.balance.toFixed(2)}`;
        break;
      case '/positions':
        if (this.state.positions.length === 0) {
          reply = 'Nicio poziție deschisă în prezent.';
        } else {
          reply = '*Poziții deschise:*\n' + this.state.positions.map(p => 
            `- ${p.symbol}: ${p.amount} buc @ $${p.entryPrice} (Preț actual: $${p.currentPrice})`
          ).join('\n');
        }
        break;
      case '/pause':
        this.state.autoTradingActive = false;
        this.savePersistedState();
        reply = '⏸️ *Auto-Trading Oprit*\nBotul nu va mai deschide sau închide poziții automat.';
        break;
      case '/resume':
        this.state.autoTradingActive = true;
        this.savePersistedState();
        reply = '▶️ *Auto-Trading Pornit*\nBotul 24/7 rulează acum activ și scanează piața.';
        break;
      default:
        reply = `Comenzi disponibile:\n/status - Informații generale\n/portfolio - P&L\n/positions - Poziții deschise\n/pause - Oprește tranzacționarea\n/resume - Pornește tranzacționarea`;
        break;
    }
    
    sendWebhookServer('telegram', this.state.telegramBotToken, chatId, reply);
  }

  public executeTrade(symbol: string, action: 'BUY' | 'SELL', price: number, amount: number) {
    const cost = price * amount;
    if (action === 'BUY' && this.state.balance >= cost) {
      const existing = this.state.positions.find(p => p.symbol === symbol);
      if (existing) {
        existing.amount += amount;
        existing.currentPrice = price;
      } else {
        this.state.positions.push({ symbol, amount, entryPrice: price, currentPrice: price });
      }
      this.state.balance -= cost;
      this.state.totalTradesExecuted += 1;

      const currentEquity = this.calculateEquity();
      this.addLog(`[SERVER BOT] Cumpărat ${amount} ${symbol} @ $${price}`, 'success', currentEquity);

      this.sendNotification(`🟢 **[AI.TRADE Bot Server 24/7]** CUMPĂRĂ\nActiv: ${symbol}\nPreț: $${price}\nCantitate: ${amount}\nBalanță liberă: $${this.state.balance.toFixed(2)}`);
    } else if (action === 'SELL') {
      const existingIndex = this.state.positions.findIndex(p => p.symbol === symbol);
      if (existingIndex !== -1) {
        const pos = this.state.positions[existingIndex];
        if (pos.amount >= amount) {
          const entryPrice = pos.entryPrice;
          const pnl = (price - entryPrice) * amount;
          const pnlPercent = ((price - entryPrice) / entryPrice) * 100;
          
          pos.amount -= amount;
          if (pos.amount <= 0) {
            this.state.positions.splice(existingIndex, 1);
          }
          this.state.balance += cost;
          this.state.totalTradesExecuted += 1;

          this.state.tradeHistory.push({
            symbol,
            entryPrice,
            exitPrice: price,
            amount,
            pnl,
            pnlPercent,
            timestamp: new Date().toISOString()
          });
          // Limit history size
          if (this.state.tradeHistory.length > 1000) {
            this.state.tradeHistory.shift();
          }

          const currentEquity = this.calculateEquity();
          this.addLog(`[SERVER BOT] Vândut ${amount} ${symbol} @ $${price}`, 'warning', currentEquity);

          this.sendNotification(`🔴 **[AI.TRADE Bot Server 24/7]** VÂNZARE\nActiv: ${symbol}\nPreț: $${price}\nCantitate: ${amount}\nBalanță liberă: $${this.state.balance.toFixed(2)}`);
        }
      }
    }
    this.savePersistedState();
  }

  public calculateEquity(): number {
    const positionsValue = this.state.positions.reduce((acc, pos) => acc + (pos.amount * (pos.currentPrice || pos.entryPrice)), 0);
    return parseFloat((this.state.balance + positionsValue).toFixed(2));
  }

  private startBackgroundLoop() {
    if (this.intervalTimer) clearInterval(this.intervalTimer);

    // Heartbeat every 5 seconds
    this.intervalTimer = setInterval(async () => {
      this.secondsCounter += 5;
      this.state.lastCheckAt = new Date().toISOString();

      if (!this.state.autoTradingActive) {
        return;
      }

      // Check prices according to dataInterval
      if (this.secondsCounter % Math.max(5, this.state.dataInterval) === 0) {
        await this.checkPricesAndSLTP();
      }

      // Run ML analysis according to analysisInterval
      if (this.secondsCounter % Math.max(10, this.state.analysisInterval) === 0) {
        await this.runMLAnalysis();
      }

      // Check reports every minute
      if (this.secondsCounter % 60 === 0) {
        this.checkAndSendReports();
      }

      await this.pollTelegramMessages();

      this.savePersistedState();
    }, 5000);

    console.log('[AI.TRADE Bot] Background 24/7 trading engine is active on server.');
  }

  private checkAndSendReports() {
    const now = new Date();
    
    // Get time in specified timezone
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: this.state.timezone || 'Europe/Bucharest',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const currentTime = timeFormatter.format(now); // e.g. "21:00"

    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: this.state.timezone || 'Europe/Bucharest',
      weekday: 'short'
    });
    const currentDayStr = dayFormatter.format(now);
    const dayMap: Record<string, number> = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    const currentDay = dayMap[currentDayStr];

    // For end of month check, we can use the local timezone date
    const datePartsFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: this.state.timezone || 'Europe/Bucharest',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
    const dateStr = datePartsFormatter.format(now); // "M/D/YYYY"
    const [month, day, year] = dateStr.split('/').map(Number);
    const isLastDayOfMonth = new Date(year, month, 0).getDate() === day;

    const config = this.state.reportConfig;

    if (config.daily.enabled && config.daily.time === currentTime) {
      this.sendNotification(this.generateDailyReport(now));
    }

    if (config.weekly.enabled && config.weekly.day === currentDay && config.weekly.time === currentTime) {
      this.sendNotification(this.generateWeeklyReport(now));
    }

    if (config.monthly.enabled && isLastDayOfMonth && config.daily.time === currentTime) {
      // Just reuse daily report format for monthly, or create a specific one. Let's send a summary.
      this.sendNotification(`📅 **Monthly Report**\nCapital Curent: $${this.calculateEquity().toFixed(2)}`);
    }
  }

  private generateDailyReport(date: Date): string {
    const equity = this.calculateEquity();
    const profit = equity - this.state.initialBalance;
    const profitPercent = (profit / this.state.initialBalance) * 100;
    const profitSign = profit >= 0 ? '+' : '';

    const todayStr = date.toISOString().split('T')[0];
    const todayTrades = this.state.tradeHistory.filter(t => t.timestamp.startsWith(todayStr));
    
    // In our simplified simulation, we count total trades executed. But let's build stats from todayTrades.
    const winTrades = todayTrades.filter(t => t.pnl > 0);
    const lossTrades = todayTrades.filter(t => t.pnl <= 0);
    const winRate = todayTrades.length > 0 ? ((winTrades.length / todayTrades.length) * 100).toFixed(1) : '0.0';
    
    const avgProfit = winTrades.length > 0 ? winTrades.reduce((a, b) => a + b.pnl, 0) / winTrades.length : 0;
    const avgLoss = lossTrades.length > 0 ? lossTrades.reduce((a, b) => a + b.pnl, 0) / lossTrades.length : 0;
    const profitFactor = Math.abs(avgLoss) > 0 ? (avgProfit / Math.abs(avgLoss)).toFixed(2) : (avgProfit > 0 ? 'INF' : '0.00');

    let bestTrade = todayTrades.length > 0 ? todayTrades.reduce((a, b) => a.pnl > b.pnl ? a : b) : null;
    let worstTrade = todayTrades.length > 0 ? todayTrades.reduce((a, b) => a.pnl < b.pnl ? a : b) : null;

    const openPositions = this.state.positions.length > 0 
      ? this.state.positions.map(p => `• ${p.symbol} → ${(((p.currentPrice! - p.entryPrice) / p.entryPrice) * 100).toFixed(2)}%`).join('\n')
      : 'Niciuna';

    return `🤖 *AI.TRADE Bot - Daily Paper Trading Report*\n\n` +
           `📅 Data: ${date.toLocaleDateString('ro-RO')}\n\n` +
           `💼 Valoare portofoliu: $${equity.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}\n` +
           `💵 Cash disponibil: $${this.state.balance.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}\n\n` +
           `📈 Profit total: ${profitSign}$${profit.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} (${profitSign}${profitPercent.toFixed(2)}%)\n\n` +
           `📋 Tranzacții închise azi: ${todayTrades.length}\n` +
           `🎯 Win Rate: ${winRate}%\n` +
           `💰 Profit mediu/tranzacție: +$${avgProfit.toFixed(2)}\n` +
           `📉 Pierdere medie: -$${Math.abs(avgLoss).toFixed(2)}\n` +
           `⚖️ Profit Factor: ${profitFactor}\n\n` +
           `📌 Poziții deschise:\n${openPositions}\n\n` +
           `🏆 Cel mai bun trade:\n${bestTrade ? `${bestTrade.symbol} +$${bestTrade.pnl.toFixed(2)}` : 'N/A'}\n\n` +
           `📉 Cel mai slab trade:\n${worstTrade ? `${worstTrade.symbol} -$${Math.abs(worstTrade.pnl).toFixed(2)}` : 'N/A'}`;
  }

  private generateWeeklyReport(date: Date): string {
    const equity = this.calculateEquity();
    const profit = equity - this.state.initialBalance;
    const profitPercent = (profit / this.state.initialBalance) * 100;
    const profitSign = profit >= 0 ? '+' : '';

    // Simplified weekly stats, taking all history for now
    const trades = this.state.tradeHistory;
    const winTrades = trades.filter(t => t.pnl > 0);
    const winRate = trades.length > 0 ? ((winTrades.length / trades.length) * 100).toFixed(1) : '0.0';
    const bestTrade = trades.length > 0 ? trades.reduce((a, b) => a.pnl > b.pnl ? a : b) : null;

    return `📅 *Weekly Report*\n\n` +
           `Profit:\n${profitSign}$${profit.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} (${profitSign}${profitPercent.toFixed(2)}%)\n\n` +
           `Tranzacții total (istoric):\n${trades.length}\n\n` +
           `Win Rate:\n${winRate}%\n\n` +
           `Cel mai profitabil activ:\n${bestTrade ? bestTrade.symbol : 'N/A'}`;
  }

  private async checkPricesAndSLTP() {
    for (const item of this.state.watchlist) {
      if (!item.active) continue;
      
      const livePrice = await fetchLivePriceServer(item.symbol);
      item.price = livePrice;

      // Update position current price if held
      const pos = this.state.positions.find(p => p.symbol === item.symbol);
      if (pos) {
        pos.currentPrice = livePrice;
        const pnlPercent = ((livePrice - pos.entryPrice) / pos.entryPrice) * 100;

        // Stop Loss -5%
        if (pnlPercent <= -5) {
          this.addLog(`[Stop Loss Server] Ieșire din ${item.symbol} la $${livePrice} (PNL: ${pnlPercent.toFixed(2)}%)`, 'warning');
          this.executeTrade(item.symbol, 'SELL', livePrice, pos.amount);
          this.sendNotification(`🚨 **[Stop Loss]** Vândut automat ${item.symbol} la $${livePrice} (PNL -5%)`);
        } 
        // Take Profit +10%
        else if (pnlPercent >= 10) {
          this.addLog(`[Take Profit Server] Ieșire din ${item.symbol} la $${livePrice} (PNL: +${pnlPercent.toFixed(2)}%)`, 'success');
          this.executeTrade(item.symbol, 'SELL', livePrice, pos.amount);
          this.sendNotification(`🎯 **[Take Profit]** Vândut automat ${item.symbol} la $${livePrice} (PNL +10%)`);
        }
      }
    }
  }

  private async runMLAnalysis() {
    for (const item of this.state.watchlist) {
      if (!item.active || !item.price) continue;

      const signal = generateSignalServer(item.symbol, item.price);
      item.signal = signal;

      const pos = this.state.positions.find(p => p.symbol === item.symbol);
      const isHolding = pos && pos.amount > 0;

      if (signal.action === 'BUY' && signal.prob >= 60 && !isHolding) {
        const amountToBuy = parseFloat((1000 / item.price).toFixed(6));
        this.addLog(`[Signal Server ML] ${item.symbol}: BUY (${signal.prob}% prob). Executăm cumpărare automat.`, 'info');
        this.executeTrade(item.symbol, 'BUY', item.price, amountToBuy);
      } else if (signal.action === 'SELL' && signal.prob >= 60 && isHolding) {
        this.addLog(`[Signal Server ML] ${item.symbol}: SELL (${signal.prob}% prob). Executăm vânzare automat.`, 'info');
        this.executeTrade(item.symbol, 'SELL', item.price, pos!.amount);
      }
    }
  }
}

export const botEngine = new ServerBotEngine();
