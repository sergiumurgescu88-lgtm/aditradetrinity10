/**
 * HERMES TRINITY CORE - Main Operational Dashboard Orchestrator
 * High-performance algorithmic trading control center for institutional units.
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LogOut,
} from 'lucide-react';

import { useHermesWebSocket } from '../hooks/useHermesWebSocket';
import { BotCard } from '../components/BotCard';
import { VolatilityHeatmap } from '../components/VolatilityHeatmap';
import { MarketDepth } from '../components/MarketDepth';
import { SystemLogs } from '../components/SystemLogs';
import { TradeHistory } from '../components/TradeHistory';
import { NotificationToast } from '../components/NotificationToast';
import { OrderExecutionModal } from '../components/OrderExecutionModal';
import { HermesInsights } from '../components/HermesInsights';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { MobileBottomSheet } from '../components/MobileBottomSheet';
import type {
  Bot,
  TrinityEngineType,
  SystemLogEntry,
  ToastNotification,
  OrderSide,
  OrderType,
  HermesInsight,
  MacroCorrelationMatrix,
} from '../types';

const INITIAL_HERMES_INSIGHTS: HermesInsight[] = [
  {
    id: 'ins-1',
    timestamp: Date.now() - 15000,
    category: 'MACRO_CORRELATION',
    title: 'DXY Surge ⇄ XAUUSD Bias Recalibrated',
    thought:
      'Hermes a detectat o creștere bruscă pe DXY (+0.38% spre 104.42). Având în vedere corelația inversă de -0.84 cu Aurul, am ajustat bias-ul pe XAUUSD spre DEFENSIVE și am strâns spread-urile pe Gamma.',
    actionTaken: 'XAUUSD Bias set to DEFENSIVE (-18% Exposure)',
    affectedAsset: 'XAUUSD',
    affectedEngine: 'GAMMA',
    confidence: 96,
    impact: 'DEFENSIVE',
  },
  {
    id: 'ins-2',
    timestamp: Date.now() - 8000,
    category: 'TECHNICAL_DIVERGENCE',
    title: 'H4 RSI Bearish Divergence on BTC',
    thought:
      'Hermes a detectat o divergență RSI pe H4 și a redus expunerea lui Alpha cu 20% pentru a preveni riscul de retragere bruscă la suportul $93,400.',
    actionTaken: 'Alpha Exposure Throttled -20%',
    affectedAsset: 'BTC/USDT',
    affectedEngine: 'ALPHA',
    confidence: 92,
    impact: 'DEFENSIVE',
  },
  {
    id: 'ins-3',
    timestamp: Date.now() - 2000,
    category: 'LIQUIDITY_SHOCK',
    title: 'Cross-Exchange Funding Rate Asymmetry',
    thought:
      'Hermes a identificat o discrepanță de 14 bps între Deribit și Binance pe ETH. Motorul Beta a inițiat un rebalance delta-neutral pentru a captura yield-ul.',
    actionTaken: 'Beta Delta-Neutral Rebalance Engaged',
    affectedAsset: 'ETH/USDT',
    affectedEngine: 'BETA',
    confidence: 94,
    impact: 'POSITIVE',
  },
];

const INITIAL_MACRO_CORRELATION: MacroCorrelationMatrix = {
  dxy: { value: 104.42, change24h: 0.38, trend: 'SURGING' },
  us10y: { value: 4.38, change24h: 1.2 },
  spx: { value: 5740.20, change24h: 0.45 },
  btcGoldCorr: 0.48,
  dxyGoldCorr: -0.84,
  dxyBtcCorr: -0.62,
};

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
];

// Sparkline Mock Data for Daily Performance Card
const HOURLY_PNL_SPARKLINE = [
  { hour: '00:00', net: 120, cumulative: 120 },
  { hour: '03:00', net: 450, cumulative: 570 },
  { hour: '06:00', net: -110, cumulative: 460 },
  { hour: '09:00', net: 840, cumulative: 1300 },
  { hour: '12:00', net: 380, cumulative: 1680 },
  { hour: '15:00', net: 920, cumulative: 2600 },
  { hour: '18:00', net: 410, cumulative: 3010 },
  { hour: '21:00', net: 830, cumulative: 3840 },
];

export function HermesDashboard() {
  const navigate = useNavigate();

  // Dark / Light Theme Mode with LocalStorage Persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hermes_theme');
      if (stored === 'light' || stored === 'dark') return stored;
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
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
    executeManualOrder,
    emergencyStop,
    reconnect,
  } = useHermesWebSocket();

  // Selected Filter for Bot Grid
  const [engineFilter, setEngineFilter] = useState<'ALL' | TrinityEngineType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [killSwitchModalOpen, setKillSwitchModalOpen] = useState(false);
  const [activeBotModal, setActiveBotModal] = useState<Bot | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [isMobileDockOpen, setIsMobileDockOpen] = useState<boolean>(false);

  // Fast Order Execution Handler connecting to Hermes WebSocket & Telemetry
  const handleExecuteOrder = (order: {
    pair: string;
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
    stopLossPrice?: number;
    takeProfitPrice?: number;
    botId?: string;
    executionVenue?: string;
  }) => {
    const executedTrade = executeManualOrder(order);

    // Confirmation Toast
    const orderToast: ToastNotification = {
      id: `TOAST-ORD-${Date.now()}`,
      type: 'SUCCESS',
      title: `ORDER FILLED // ${order.side} ${order.pair}`,
      message: `Executed ${order.type} ${order.side} ${order.amount} ${order.pair} @ $${order.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Stop Loss: ${order.stopLossPrice ? `$${order.stopLossPrice.toLocaleString()}` : 'None'}.`,
      timestamp: Date.now(),
      durationMs: 7000,
    };
    setToasts((prev) => [orderToast, ...prev].slice(0, 4));

    // Terminal Log entry
    const orderLog: SystemLogEntry = {
      id: `LOG-MANUAL-${Date.now()}`,
      timestamp: Date.now(),
      level: 'EXEC',
      subsystem: 'MANUAL-DESK',
      message: `Direct Order Filled: ${order.side} ${order.amount} ${order.pair} @ $${order.price.toFixed(2)} | Notional: $${(order.amount * order.price).toFixed(2)} | Latency: ${executedTrade.latencyMs}ms via Hermes Router`,
    };
    setSystemLogs((prev) => [orderLog, ...prev].slice(0, 100));
  };

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

  // Deep Hermes AI Insights & Macro Correlation Matrix State
  const [hermesInsights, setHermesInsights] = useState<HermesInsight[]>(INITIAL_HERMES_INSIGHTS);
  const [macroCorrelation, setMacroCorrelation] = useState<MacroCorrelationMatrix>(INITIAL_MACRO_CORRELATION);

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // simulateHermesBrain(): Runs every 5 seconds.
  // 1. Checks if any active bot exceeds drawdown threshold -> auto-pauses bot and fires alerts.
  // 2. Evaluates real-time macro correlation matrix (DXY surges -> adjusts XAUUSD bias & bot exposure).
  // 3. Injects autonomous AI thoughts and technical divergence reasoning into HermesInsights.
  useEffect(() => {
    let cycleCount = 0;

    const brainInterval = setInterval(() => {
      cycleCount++;

      // --- SECTION 1: Drawdown Guard Check ---
      const activeBots = dashboard.bots.filter(
        (b) => b.status === 'ACTIVE' && b.config.autoPauseEnabled
      );

      if (activeBots.length > 0) {
        for (const bot of activeBots) {
          const threshold = bot.config.autoPauseThreshold;
          const currentDrawdown = bot.metrics.currentDrawdownPercent;

          // Condition check: threshold breach or occasional stress test on Epsilon
          const triggerEvent =
            currentDrawdown >= threshold ||
            (Math.random() < 0.12 && bot.engine === 'EPSILON' && cycleCount % 4 === 0);

          if (triggerEvent) {
            const simulatedBreach = Math.max(currentDrawdown, Number((threshold + 0.18).toFixed(2)));

            pauseBot(bot.id);

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

            const riskLog: SystemLogEntry = {
              id: `LOG-RISK-${Date.now()}`,
              timestamp: Date.now(),
              level: 'RISK',
              subsystem: 'HERMES-BRAIN',
              message: `CIRCUIT BREAKER TRIGGERED: ${bot.name} paused automatically. Drawdown ${simulatedBreach}% >= ${threshold.toFixed(1)}% threshold limit.`,
            };

            setSystemLogs((prev) => [riskLog, ...prev].slice(0, 100));
            break;
          }
        }
      }

      // --- SECTION 2: Real-Time Macro Correlation & AI Insights ---
      setMacroCorrelation((prev) => {
        const delta = (Math.random() - 0.48) * 0.08;
        const nextDxy = Number((prev.dxy.value + delta).toFixed(2));
        const isSurging = nextDxy >= 104.40;

        return {
          ...prev,
          dxy: {
            value: nextDxy,
            change24h: Number(((nextDxy - 104.0) / 104.0 * 100).toFixed(2)),
            trend: isSurging ? 'SURGING' : 'NEUTRAL',
          },
        };
      });

      // Every 2 cycles (~10 seconds), generate an actionable Hermes Neural Thought
      if (cycleCount % 2 === 0) {
        const scenarios: HermesInsight[] = [
          {
            id: `ins-${Date.now()}-dxy`,
            timestamp: Date.now(),
            category: 'MACRO_CORRELATION',
            title: 'DXY Surge ⇄ XAUUSD Bias Recalibration',
            thought:
              'Hermes a detectat o creștere bruscă pe DXY (+0.42%). Corelația inversă (-0.84) impune o ajustare defensivă pe XAUUSD: am redus expunerea pe Gamma cu 18% și am strâns spread-urile bid/ask.',
            actionTaken: 'XAUUSD Bias set to DEFENSIVE (-18% Gamma Exposure)',
            affectedAsset: 'XAUUSD',
            affectedEngine: 'GAMMA',
            confidence: 96,
            impact: 'DEFENSIVE',
          },
          {
            id: `ins-${Date.now()}-rsi`,
            timestamp: Date.now(),
            category: 'TECHNICAL_DIVERGENCE',
            title: 'H4 RSI Bearish Divergence on BTC',
            thought:
              'Hermes a detectat o divergență RSI pe H4 și a redus expunerea lui Alpha cu 20% pentru a preveni riscul de retragere bruscă la suportul $93,400.',
            actionTaken: 'Alpha Exposure Throttled -20%',
            affectedAsset: 'BTC/USDT',
            affectedEngine: 'ALPHA',
            confidence: 92,
            impact: 'DEFENSIVE',
          },
          {
            id: `ins-${Date.now()}-arb`,
            timestamp: Date.now(),
            category: 'VOLATILITY_REGIME',
            title: 'Statistical Arbitrage Spread Expansion',
            thought:
              'Dislocare de preț de 18 bps detectată pe perechea ETH/USDT între piețele spot și perpetual. Motorul Beta a majorat rotația de lichiditate pentru a captura funding rate-ul pozitiv.',
            actionTaken: 'Beta Rebalance Yield +$320 Captured',
            affectedAsset: 'ETH/USDT',
            affectedEngine: 'BETA',
            confidence: 95,
            impact: 'POSITIVE',
          },
          {
            id: `ins-${Date.now()}-sovereign`,
            timestamp: Date.now(),
            category: 'LIQUIDITY_SHOCK',
            title: 'Sergiu Sovereign Neural Re-hedge',
            thought:
              'Analiza micro-structurii carnetului de ordine indică acumulare agresivă din partea portofelelor Whale pe BTC. Sergiu Sovereign Core a activat un trailing hedge asimetric.',
            actionTaken: 'Sovereign Macro Overlay Calibrated',
            affectedAsset: 'BTC/ETH',
            affectedEngine: 'SERGIU',
            confidence: 98,
            impact: 'POSITIVE',
          },
        ];

        const chosenScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        setHermesInsights((prev) => [chosenScenario, ...prev].slice(0, 15));

        // Inject high-priority insight into SystemLogs
        const aiLog: SystemLogEntry = {
          id: `LOG-AI-${Date.now()}`,
          timestamp: Date.now(),
          level: 'INFO',
          subsystem: 'HERMES-AI',
          message: `${chosenScenario.title}: ${chosenScenario.actionTaken} (Confidence: ${chosenScenario.confidence}%)`,
        };
        setSystemLogs((prev) => [aiLog, ...prev].slice(0, 100));
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
      <header
        id="hermes-dashboard-header"
        className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/85 dark:bg-slate-950/85 light:bg-white/85 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand Title */}
          <div
            onClick={() => navigate('/')}
            title="Return to Gateway"
            className="cursor-pointer flex items-center gap-2.5 sm:gap-3.5 group min-w-0"
          >
            <div className="relative shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-emerald-500/20 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 group-hover:border-cyan-400 transition-colors">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 sm:gap-2 leading-tight">
                <h1 className="text-lg sm:text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent truncate drop-shadow-sm">
                  AM Team
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0 font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-mono text-slate-400 truncate mt-0.5">
                Institutional Algorithmic Execution
              </p>
            </div>
          </div>

          {/* Controls: Fast Order, Connection Status, Dark/Light Toggle, Kill Switch */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Quick Manual Order Execution Trigger */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
              type="button"
              onClick={() => setIsOrderModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-md shadow-cyan-950/30"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">+ Fast Order</span>
            </motion.button>

            {/* Connection Status Pill */}
            <div
              onClick={reconnect}
              title="Click to Force Reconnect Telemetry Gateway"
              className="cursor-pointer flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 hover:border-slate-700 transition-colors"
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
              <span className="hidden md:inline text-xs font-mono font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">
                {connectionStatus}
              </span>
              <span className="text-[11px] font-mono text-cyan-400 md:pl-1 md:border-l md:border-slate-700">
                {latencyMs}ms
              </span>
            </div>

            {/* Dark / Light Mode Toggle with LocalStorage Persistence */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 border border-slate-800 dark:border-slate-800 light:border-slate-300 hover:border-slate-700 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500" />
              )}
            </button>

            {/* Exit to Gateway */}
            <button
              type="button"
              onClick={() => navigate('/')}
              title="Exit Terminal to Gateway"
              className="hidden sm:flex p-2 rounded-lg bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Circuit Breaker Kill-Switch */}
            <button
              type="button"
              onClick={() => setKillSwitchModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-semibold transition-all shadow-sm shadow-rose-950/20"
            >
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
              <span className="hidden sm:inline">Emergency Halt</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 pb-32 md:pb-8">
        {/* KPI Grid: Live Equity, Daily Net with Recharts sparkline, Margin Level, Sentiment */}
        <section aria-label="Key Performance Indicators" id="kpi-section">
          {/* Mobile Swipe Hint */}
          <div className="flex md:hidden items-center justify-between text-[11px] font-mono text-slate-400 mb-2 px-1">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Activity className="w-3.5 h-3.5" />
              Live Performance Radar
            </span>
            <span className="text-slate-500">Swipe metrics →</span>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 gap-3.5 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4">
            {/* 1. Live Equity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="snap-center shrink-0 w-[84vw] sm:w-[320px] md:w-auto p-5 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 relative overflow-hidden flex flex-col justify-between"
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
              className="snap-center shrink-0 w-[84vw] sm:w-[320px] md:w-auto p-5 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 relative overflow-hidden flex flex-col justify-between"
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
              className="snap-center shrink-0 w-[84vw] sm:w-[320px] md:w-auto p-5 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 relative overflow-hidden flex flex-col justify-between"
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
              className="snap-center shrink-0 w-[84vw] sm:w-[320px] md:w-auto p-5 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 relative overflow-hidden flex flex-col justify-between"
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
        <section aria-label="Microstructure & Volatility Analytics" id="analytics-section" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <VolatilityHeatmap theme={theme} />
          <MarketDepth theme={theme} />
        </section>

        {/* Section: Deep Hermes AI Logic & Cross-Asset Macro Correlation Insights */}
        <section aria-label="Hermes Neural Brain Insights" id="insights-section">
          <HermesInsights
            insights={hermesInsights}
            correlationMatrix={macroCorrelation}
            theme={theme}
          />
        </section>

        {/* Section: Operational Units Header & Filters */}
        <section aria-label="Operational Trading Units" id="bots-section" className="space-y-4 pt-2">
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

            {/* Filter Pills with Motion Tap Feedback */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              {(['ALL', 'ALPHA', 'BETA', 'GAMMA', 'EPSILON', 'SERGIU'] as const).map((eng) => (
                <motion.button
                  key={eng}
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.02 }}
                  type="button"
                  onClick={() => setEngineFilter(eng)}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    engineFilter === eng
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm shadow-cyan-500/10 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {eng === 'ALL' ? 'All Units' : eng}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Mobile Swipe Prompt */}
          <div className="flex md:hidden items-center justify-between text-[11px] font-mono text-slate-400 px-1 pt-1">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Layers className="w-3.5 h-3.5" />
              Active Engines ({filteredBots.length})
            </span>
            <span className="text-slate-500">Swipe units →</span>
          </div>

          {/* Operational Units Snap Carousel on Mobile */}
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-3 gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5">
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
        <section aria-label="Execution Telemetry & Order History" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SystemLogs logs={systemLogs} onClearLogs={() => setSystemLogs([])} />
          <TradeHistory trades={dashboard.recentTrades} />
        </section>
      </main>

      {/* Circuit Breaker Kill-Switch Modal */}
      <AnimatePresence>
        {killSwitchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-[95vw] sm:max-w-md p-5 sm:p-6 rounded-2xl bg-slate-900 border border-rose-500/50 shadow-2xl shadow-rose-950/50 text-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3 text-rose-400 mb-4">
                <AlertTriangle className="w-6 h-6 animate-pulse shrink-0" />
                <h3 className="text-base sm:text-lg font-bold">EMERGENCY CIRCUIT BREAKER</h3>
              </div>
              <p className="text-xs text-slate-300 font-mono leading-relaxed mb-4">
                Triggering the Emergency Circuit Breaker will immediately:
                <br />• <strong>Pause all 5 Trinity engines</strong>
                <br />• <strong>Cancel all open limit & grid orders</strong>
                <br />• <strong>Lock telemetry to safe-only mode</strong>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-[95vw] sm:max-w-lg p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto"
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

              <h3 className="text-lg sm:text-xl font-bold mb-1">{activeBotModal.name}</h3>
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

      {/* Advanced Order Execution & Dynamic Position Sizing Modal */}
      <OrderExecutionModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        equityUsd={dashboard.totalPortfolioValueUsd}
        tickers={dashboard.tickers}
        bots={dashboard.bots}
        onExecuteOrder={handleExecuteOrder}
      />

      {/* Modern Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        onOpenOrderModal={() => setIsOrderModalOpen(true)}
        onOpenDock={() => setIsMobileDockOpen(true)}
      />

      {/* Modern Mobile Bottom Sheet Control Dock */}
      <MobileBottomSheet
        isOpen={isMobileDockOpen}
        onClose={() => setIsMobileDockOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenOrderModal={() => setIsOrderModalOpen(true)}
        onOpenKillSwitch={() => setKillSwitchModalOpen(true)}
        selectedEngineFilter={engineFilter}
        onSelectEngineFilter={setEngineFilter}
        dashboard={dashboard}
        latencyMs={latencyMs}
      />

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
