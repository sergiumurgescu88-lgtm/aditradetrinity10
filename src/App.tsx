/**
 * HERMES TRINITY CORE - Main Operational Dashboard Orchestrator
 * High-performance algorithmic trading control center for institutional units.
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  Sun,
  Moon,
  Activity,
  ShieldAlert,
  Zap,
  DollarSign,
  TrendingUp,
  Percent,
  Compass,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Flame,
  CheckCircle2,
  X,
} from 'lucide-react';

import { useHermesWebSocket } from './hooks/useHermesWebSocket';
import { BotCard } from './components/BotCard';
import { VolatilityHeatmap } from './components/VolatilityHeatmap';
import { MarketDepth } from './components/MarketDepth';
import { SystemLogs } from './components/SystemLogs';
import { TradeHistory } from './components/TradeHistory';
import { NotificationToast } from './components/NotificationToast';
import type { Bot, TrinityEngineType, SystemLogEntry, ToastNotification } from './types';

const INITIAL_SYSTEM_LOGS: SystemLogEntry[] = [
  {
    id: 'log-seed-1',
    timestamp: Date.now() - 12000,
    level: 'INFO',
    subsystem: 'GATEWAY-WS',
    message: 'Hermes Trinity Telemetry socket connected to internal primary mesh at 14ms.',
  },
  {
    id: 'log-seed-2',
    timestamp: Date.now() - 9000,
    level: 'EXEC',
    subsystem: 'TRINITY-ALPHA',
    message: 'Breakout trigger validated for BTC/USDT. Filled 0.45 BTC @ $94,210.50 via Binance L3.',
  },
  {
    id: 'log-seed-3',
    timestamp: Date.now() - 6000,
    level: 'EXEC',
    subsystem: 'TRINITY-BETA',
    message: 'Funding rate arbitrage balance executed on ETH/USDT | Spread: +42.1 bps | Profit: +$184.20.',
  },
  {
    id: 'log-seed-4',
    timestamp: Date.now() - 3000,
    level: 'INFO',
    subsystem: 'RISK-SENTINEL',
    message: 'Global portfolio VaR within limits. Max Drawdown: 0.85% (Circuit limit: 3.50%).',
  },
  {
    id: 'log-seed-5',
    timestamp: Date.now() - 1000,
    level: 'EXEC',
    subsystem: 'SERGIU-SOVEREIGN',
    message: 'Neural macro overlay calibrating basis yield across BTC/ETH synthetics.',
  },
];

// Hourly mock net progression data for Recharts sparkline
const HOURLY_PNL_SPARKLINE = [
  { hour: '00:00', pnl: 450, cumulative: 450 },
  { hour: '02:00', pnl: 720, cumulative: 1170 },
  { hour: '04:00', pnl: -180, cumulative: 990 },
  { hour: '06:00', pnl: 640, cumulative: 1630 },
  { hour: '08:00', pnl: 890, cumulative: 2520 },
  { hour: '10:00', pnl: 320, cumulative: 2840 },
  { hour: '12:00', pnl: 510, cumulative: 3350 },
  { hour: '14:00', pnl: -120, cumulative: 3230 },
  { hour: '16:00', pnl: 410, cumulative: 3640 },
  { hour: '18:00', pnl: 200, cumulative: 3840 },
];

export default function App() {
  // Theme state with localStorage persistence (defaults to dark mode)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hermes_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('hermes_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Live Hermes WebSocket & Data State
  const {
    state,
    isConnected,
    connectionStatus,
    latencyMs,
    dashboard,
    startBot,
    pauseBot,
    toggleAutoPause,
    emergencyStop,
    reconnect,
  } = useHermesWebSocket();

  // Selected Filter for Bot Grid
  const [engineFilter, setEngineFilter] = useState<'ALL' | TrinityEngineType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [killSwitchModalOpen, setKillSwitchModalOpen] = useState(false);
  const [activeBotModal, setActiveBotModal] = useState<Bot | null>(null);

  // System Logs state with 3-second telemetry stream (capped at 100 entries)
  const [systemLogs, setSystemLogs] = useState<SystemLogEntry[]>(INITIAL_SYSTEM_LOGS);

  useEffect(() => {
    const logTimer = setInterval(() => {
      const subsystems = [
        'TRINITY-ALPHA',
        'TRINITY-BETA',
        'TRINITY-GAMMA',
        'TRINITY-EPSILON',
        'SERGIU-SOVEREIGN',
        'RISK-SENTINEL',
        'ROUTER-L3',
        'XAUUSD-ORACLE',
      ];
      const levels: SystemLogEntry['level'][] = ['EXEC', 'INFO', 'WARN', 'DEBUG'];
      const chosenSubsystem = subsystems[Math.floor(Math.random() * subsystems.length)];
      const chosenLevel =
        Math.random() < 0.45 ? 'EXEC' : Math.random() < 0.75 ? 'INFO' : Math.random() < 0.9 ? 'DEBUG' : 'WARN';

      const messages = [
        `Order batch executed on ${chosenSubsystem} | Tx: 0x${Math.random().toString(16).slice(2, 8)} | Latency: ${(
          Math.random() * 8 +
          4
        ).toFixed(1)}ms`,
        `Telemetry tick received: L2 book spread calibrated at ${(Math.random() * 0.4 + 0.1).toFixed(2)} bps`,
        `Dynamic hedge rebalance initiated on ${chosenSubsystem} with delta ratio 0.998`,
        `Whale inflow detected: +$${(Math.random() * 2.5 + 0.5).toFixed(2)}M in quote asset`,
        `Trailing stop adjusted to $${(94000 + Math.random() * 500).toFixed(2)} | ADX holding firm`,
        `Execution route validated via Frankfurt low-latency co-location gateway`,
        `Risk threshold check passed. Current drawdown: ${(Math.random() * 1.2 + 0.2).toFixed(2)}% (limit: 3.5%)`,
      ];

      const newLog: SystemLogEntry = {
        id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: Date.now(),
        level: chosenLevel,
        subsystem: chosenSubsystem,
        message: messages[Math.floor(Math.random() * messages.length)],
      };

      setSystemLogs((prev) => [newLog, ...prev].slice(0, 100));
    }, 3000);

    return () => clearInterval(logTimer);
  }, []);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastNotification[]>([
    {
      id: 'toast-init',
      type: 'INFO',
      title: 'HERMES TRINITY CORE ONLINE',
      message: 'All 5 operational units initialized and synchronized with telemetry gateway.',
      timestamp: Date.now(),
      durationMs: 6000,
    },
  ]);

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // simulateHermesBrain(): Runs every 5 seconds.
  // Checks if any active bot has its drawdown exceeding its set threshold.
  // If so, Hermes automatically shifts the bot to 'PAUSED' and dispatches an alert toast.
  useEffect(() => {
    const brainInterval = setInterval(() => {
      // Find active bots with auto-pause enabled
      const activeBots = dashboard.bots.filter(
        (b) => b.status === 'ACTIVE' && b.config.autoPauseEnabled
      );

      if (activeBots.length === 0) return;

      // Check condition: simulate if any active bot crosses threshold or encounters sudden drawdown
      for (const bot of activeBots) {
        const threshold = bot.config.autoPauseThreshold;
        const currentDrawdown = bot.metrics.currentDrawdownPercent;

        // Condition check or probabilistic volatility stress event (~15% chance per cycle on a bot)
        const triggerEvent = currentDrawdown >= threshold || (Math.random() < 0.15 && bot.engine === 'EPSILON');

        if (triggerEvent) {
          const simulatedBreach = Math.max(currentDrawdown, Number((threshold + 0.18).toFixed(2)));

          // 1. Shift bot to PAUSED
          pauseBot(bot.id);

          // 2. Dispatch Alert Toast
          const alertToast: ToastNotification = {
            id: `TOAST-ALERT-${Date.now()}-${bot.id}`,
            type: 'ALERT',
            title: 'HERMES BRAIN // AUTO-PAUSE CIRCUIT TRIGGERED',
            message: `${bot.name} drawdown reached ${simulatedBreach}% (Threshold limit: ${threshold.toFixed(
              1
            )}%). Hermes Brain shifted unit status to PAUSED to protect capital.`,
            timestamp: Date.now(),
            durationMs: 7000,
          };

          setToasts((prev) => [alertToast, ...prev.filter((t) => t.id !== alertToast.id)].slice(0, 4));

          // 3. Log into SystemLogs
          const riskLog: SystemLogEntry = {
            id: `LOG-RISK-${Date.now()}`,
            timestamp: Date.now(),
            level: 'RISK',
            subsystem: 'HERMES-BRAIN',
            message: `CIRCUIT BREAKER TRIGGERED: ${bot.name} paused automatically. Drawdown ${simulatedBreach}% >= ${threshold.toFixed(1)}% threshold limit.`,
          };

          setSystemLogs((prev) => [riskLog, ...prev].slice(0, 100));

          // Trigger once per interval
          break;
        }
      }
    }, 5000);

    return () => clearInterval(brainInterval);
  }, [dashboard.bots, pauseBot]);

  // Auto-dismiss toasts timer
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(0, prev.length - 1));
    }, 7000);
    return () => clearTimeout(timer);
  }, [toasts]);

  // Filtered operational units (Alpha, Beta, Gamma, Epsilon, Sergiu)
  const filteredBots = useMemo(() => {
    return dashboard.bots.filter((bot) => {
      const matchesEngine = engineFilter === 'ALL' || bot.engine === engineFilter;
      const matchesSearch =
        bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.config.activePairs.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesEngine && matchesSearch;
    });
  }, [dashboard.bots, engineFilter, searchQuery]);

  // Handler for bot toggle (Start/Pause)
  const handleToggleBot = (botId: string) => {
    const target = dashboard.bots.find((b) => b.id === botId);
    if (!target) return;
    if (target.status === 'ACTIVE') {
      pauseBot(botId);
    } else {
      startBot(botId);
    }
  };

  const isPositiveEquity = dashboard.dailyPnlUsd >= 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans transition-colors duration-300 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Toast Alert Notifications in Top-Right Corner */}
      <NotificationToast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Top Real-time Market Ticker Ribbon */}
      <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100/90 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 px-4 py-1.5 text-xs font-mono overflow-x-auto scrollbar-none flex items-center justify-between gap-6">
        <div className="flex items-center gap-6 shrink-0">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            HERMES TRINITY FEED
          </span>
          {Object.values(dashboard.tickers).map((ticker) => {
            const isUp = ticker.change24h >= 0;
            return (
              <div key={ticker.pair} className="flex items-center gap-2">
                <span className="text-slate-300 font-semibold">{ticker.pair}</span>
                <span className="text-slate-100 font-mono">
                  ${ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isUp ? '+' : ''}{ticker.change24h.toFixed(2)}%
                </span>
                <span className="text-[10px] text-slate-400">
                  sprd: ${ticker.spread.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-4 shrink-0 text-slate-400 text-[11px]">
          <span>Node: <strong className="text-slate-200 font-mono">Frankfurt-Cluster-09</strong></span>
          <span>Risk Sentinel: <strong className="text-emerald-400">ARMED</strong></span>
        </div>
      </div>

      {/* Main Institutional Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/85 dark:bg-slate-950/85 light:bg-white/85 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-emerald-500/20 border border-cyan-500/40 shadow-sm shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider uppercase bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                  HERMES TRINITY
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  CORE v4.8
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Institutional Algorithmic Execution Hub
              </p>
            </div>
          </div>

          {/* Controls: Connection Status, Dark/Light Toggle, Kill Switch */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Connection Status Pill */}
            <div
              onClick={reconnect}
              title="Click to Force Reconnect Telemetry Gateway"
              className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 hover:border-slate-700 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                {isConnected ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 animate-pulse" />
                )}
              </span>
              <span className="text-xs font-mono font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">
                {connectionStatus}
              </span>
              <span className="text-[11px] font-mono text-cyan-400 pl-1 border-l border-slate-700">
                {latencyMs}ms
              </span>
            </div>

            {/* Dark / Light Mode Toggle with LocalStorage Persistence */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-2 rounded-lg bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 border border-slate-800 dark:border-slate-800 light:border-slate-300 hover:border-slate-700 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-500" />
              )}
            </button>

            {/* Circuit Breaker Kill-Switch */}
            <button
              type="button"
              onClick={() => setKillSwitchModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-semibold transition-all shadow-sm shadow-rose-950/20"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Emergency Halt</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Grid: Live Equity, Daily Net with Recharts sparkline, Margin Level, Sentiment */}
        <section aria-label="Key Performance Indicators">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Live Equity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="p-5 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                  Live Equity
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  REAL-TIME
                </span>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-100 tracking-tight">
                  ${dashboard.totalPortfolioValueUsd.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs font-mono">
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{dashboard.totalPnlPercent.toFixed(2)}% total
                  </span>
                  <span className="text-slate-400">
                    from ${(dashboard.initialBalanceUsd / 1000).toFixed(0)}k init
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Active Capital: ${(dashboard.totalPortfolioValueUsd * 0.94).toFixed(0)}</span>
                <span className="text-cyan-400">5/5 Units Online</span>
              </div>
            </motion.div>

            {/* 2. Daily Net with Recharts Sparkline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="p-5 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Daily Net (24h)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {dashboard.totalTrades24h} TRADES
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div
                    className={`text-2xl sm:text-3xl font-mono font-extrabold tracking-tight ${
                      isPositiveEquity ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositiveEquity ? '+' : ''}${dashboard.dailyPnlUsd.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">
                    {isPositiveEquity ? '+' : ''}{dashboard.dailyPnlPercent.toFixed(2)}% today
                  </div>
                </div>

                {/* Recharts Hourly Net Sparkline */}
                <div className="w-28 h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={HOURLY_PNL_SPARKLINE}>
                      <defs>
                        <linearGradient id="pnlSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#1E293B',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          padding: '4px 8px',
                        }}
                        formatter={(val: any) => [`+$${val}`, 'Hourly PnL']}
                        labelStyle={{ display: 'none' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#10B981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#pnlSparklineGrad)"
                        isAnimationActive={true}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Win Rate: <strong className="text-slate-200">{dashboard.winRate.toFixed(1)}%</strong></span>
                <span>Sharpe: <strong className="text-cyan-400">{dashboard.overallSharpeRatio.toFixed(2)}</strong></span>
              </div>
            </motion.div>

            {/* 3. Margin Level */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
              className="p-5 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-indigo-400" />
                  Margin Level
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  HEALTHY
                </span>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-100 tracking-tight">
                  428.4%
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1">
                  Used: $42.6k / Free: $212.2k
                </div>
              </div>

              {/* Progress Visual */}
              <div className="space-y-1.5 mt-2">
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-cyan-400" style={{ width: '22%' }} />
                  <div className="h-full bg-emerald-500" style={{ width: '78%' }} />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Leverage avg: 2.8x</span>
                  <span>Max DD: {dashboard.maxDrawdownPercent.toFixed(2)}%</span>
                </div>
              </div>
            </motion.div>

            {/* 4. Sentiment & Market Flow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.2 }}
              className="p-5 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-400" />
                  Trinity Sentiment
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  GREED 78/100
                </span>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-cyan-300 tracking-tight">
                  Bullish Consensus
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1">
                  Whale Accumulation Bias (84%)
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Flame className="w-3.5 h-3.5" />
                  Order Imbalance +4.2%
                </span>
                <span>Perp Funding: +0.012%</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section: Advanced Market Microstructure & Volatility Matrix */}
        <section aria-label="Microstructure & Volatility Analytics" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <VolatilityHeatmap theme={theme} />
          <MarketDepth theme={theme} />
        </section>

        {/* Section: Operational Units Header & Filters */}
        <section aria-label="Operational Trading Units" className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  Operational Units ({dashboard.bots.length})
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {dashboard.activeBotsCount} Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Alpha, Beta, Gamma, Epsilon, and Sovereign Sergiu Neural Engine
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              {(['ALL', 'ALPHA', 'BETA', 'GAMMA', 'EPSILON', 'SERGIU'] as const).map((eng) => (
                <button
                  key={eng}
                  type="button"
                  onClick={() => setEngineFilter(eng)}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    engineFilter === eng
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm shadow-cyan-500/10 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {eng === 'ALL' ? 'All Units' : eng}
                </button>
              ))}
            </div>
          </div>

          {/* Operational Units Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBots.map((bot) => (
              <BotCard
                key={bot.id}
                bot={bot}
                onToggleStatus={handleToggleBot}
                onToggleAutoPause={toggleAutoPause}
                onSelectBot={(id) => {
                  const b = dashboard.bots.find((x) => x.id === id);
                  if (b) setActiveBotModal(b);
                }}
              />
            ))}
          </div>

          {filteredBots.length === 0 && (
            <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 font-mono">
              No operational units matching the selected filter.
            </div>
          )}
        </section>

        {/* Section: Live Order Executions & Terminal Telemetry */}
        <section aria-label="Order History and System Logs" className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
          <TradeHistory trades={dashboard.recentTrades} theme={theme} />
          <SystemLogs logs={systemLogs} onClearLogs={() => setSystemLogs([])} theme={theme} />
        </section>
      </main>

      {/* Emergency Halt Modal */}
      <AnimatePresence>
        {killSwitchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-rose-500/50 shadow-2xl shadow-rose-950/40 text-slate-100"
            >
              <div className="flex items-center gap-3 text-rose-400 mb-3">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-lg font-bold">EMERGENCY KILL-SWITCH</h3>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4">
                Engaging the Circuit Breaker will immediately cancel all open orders across Alpha, Beta,
                Gamma, Epsilon, and Sergiu, flatten active exposures where possible, and lock the gateway.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 mb-5">
                Current Exposure at Risk: <strong className="text-slate-200">$242,500.00 USD</strong>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setKillSwitchModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    emergencyStop();
                    setKillSwitchModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30"
                >
                  Confirm Emergency Halt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bot Inspector / Calibration Modal */}
      <AnimatePresence>
        {activeBotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-lg w-full p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 relative"
            >
              <button
                type="button"
                onClick={() => setActiveBotModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {activeBotModal.engine}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {activeBotModal.version}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-1">{activeBotModal.name}</h3>
              <p className="text-xs text-slate-400 font-sans mb-4">
                {activeBotModal.description}
              </p>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono mb-4">
                <div>
                  <span className="text-slate-500 uppercase text-[10px]">Active Pairs</span>
                  <div className="font-semibold text-slate-200 mt-0.5">{activeBotModal.config.activePairs.join(', ')}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px]">Risk Profile</span>
                  <div className="font-semibold text-cyan-400 mt-0.5">{activeBotModal.config.riskProfile}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px]">Stop Loss</span>
                  <div className="font-semibold text-slate-200 mt-0.5">{activeBotModal.config.stopLossPercent}%</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px]">Take Profit</span>
                  <div className="font-semibold text-emerald-400 mt-0.5">{activeBotModal.config.takeProfitPercent}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Uptime: {(activeBotModal.metrics.uptimeSeconds / 3600).toFixed(1)} hrs</span>
                <button
                  type="button"
                  onClick={() => setActiveBotModal(null)}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Institutional Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>HERMES TRINITY CORE • SYSTEM NORMAL</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Latency: {latencyMs}ms</span>
          <span>Risk Sentinel: Online</span>
          <span>Memory: 32.1%</span>
        </div>
      </footer>
    </div>
  );
}
