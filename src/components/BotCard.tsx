import { motion } from 'motion/react';
import {
  Play,
  Pause,
  RotateCw,
  Shield,
  ShieldAlert,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from 'lucide-react';
import type { Bot, TrinityEngineType } from '../types';

interface BotCardProps {
  bot: Bot;
  onToggleStatus: (botId: string) => void;
  onToggleAutoPause: (botId: string) => void;
  onSelectBot?: (botId: string) => void;
}

export function BotCard({
  bot,
  onToggleStatus,
  onToggleAutoPause,
  onSelectBot,
}: BotCardProps) {
  const isPositive = bot.metrics.pnl24hUsd >= 0;
  const isActive = bot.status === 'ACTIVE';
  const isEmergency = bot.status === 'EMERGENCY_STOPPED';

  // Engine branding styles
  const getEngineBadge = (engine: TrinityEngineType) => {
    switch (engine) {
      case 'ALPHA':
        return {
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          dot: 'bg-cyan-400',
          label: 'ALPHA • TREND',
        };
      case 'BETA':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          label: 'BETA • ARBITRAGE',
        };
      case 'GAMMA':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          dot: 'bg-indigo-400',
          label: 'GAMMA • HFT GRID',
        };
      case 'EPSILON':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
          label: 'EPSILON • MEAN-REV',
        };
      case 'SERGIU':
        return {
          bg: 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-emerald-500/20 text-cyan-300 border-cyan-400/40 shadow-sm shadow-cyan-500/10',
          dot: 'bg-cyan-300 animate-pulse',
          label: 'SERGIU • SOVEREIGN CORE',
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          dot: 'bg-slate-400',
          label: engine,
        };
    }
  };

  const engineStyle = getEngineBadge(bot.engine);

  // ADX trend evaluation
  const getAdxColor = (adx: number) => {
    if (adx >= 35) return { text: 'text-cyan-400', bar: 'bg-cyan-400', label: 'Strong Trend' };
    if (adx >= 25) return { text: 'text-emerald-400', bar: 'bg-emerald-400', label: 'Moderate' };
    return { text: 'text-slate-400', bar: 'bg-slate-500', label: 'Ranging / Weak' };
  };

  const adxInfo = getAdxColor(bot.adx);

  // Whale activity evaluation
  const getWhaleBadge = () => {
    switch (bot.whaleActivity) {
      case 'ACCUMULATION':
        return {
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          text: 'Accumulation',
          icon: TrendingUp,
        };
      case 'DISTRIBUTION':
        return {
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
          text: 'Distribution',
          icon: ArrowDownRight,
        };
      case 'SPIKE_DETECTED':
        return {
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/30 animate-pulse',
          text: 'Volume Spike',
          icon: Zap,
        };
      default:
        return {
          color: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
          text: 'Neutral Flow',
          icon: Activity,
        };
    }
  };

  const whale = getWhaleBadge();
  const WhaleIcon = whale.icon;

  // Drawdown gauge
  const currentDrawdown = bot.metrics.currentDrawdownPercent;
  const maxAllowedDrawdown = bot.config.autoPauseThreshold;
  const drawdownRatio = Math.min(100, Math.round((currentDrawdown / maxAllowedDrawdown) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3 }}
      className={`relative group rounded-xl border backdrop-blur-md transition-all duration-200 overflow-hidden flex flex-col justify-between snap-center shrink-0 w-[88vw] sm:w-[340px] md:w-auto ${
        bot.engine === 'SERGIU'
          ? 'bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950/95 border-cyan-500/40 shadow-lg shadow-cyan-950/20'
          : 'bg-slate-900/70 dark:bg-slate-900/70 light:bg-white/80 border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 hover:border-slate-700 dark:hover:border-slate-700 shadow-sm'
      }`}
    >
      {/* Live Hermes Active Pulse Glow */}
      {isActive && (
        <motion.div
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          className="absolute inset-0 border border-cyan-500/30 rounded-xl pointer-events-none"
        />
      )}
      {/* Top subtle highlight bar */}
      <div
        className={`h-0.5 w-full ${
          bot.engine === 'ALPHA'
            ? 'bg-cyan-500'
            : bot.engine === 'BETA'
            ? 'bg-emerald-500'
            : bot.engine === 'GAMMA'
            ? 'bg-indigo-500'
            : bot.engine === 'EPSILON'
            ? 'bg-amber-500'
            : 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400'
        }`}
      />

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Header: Title, Engine Badge & Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider uppercase border ${engineStyle.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${engineStyle.dot}`} />
                {engineStyle.label}
              </span>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-500 px-1.5 py-0.5 bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-100 rounded">
                {bot.config.activePairs.join(' • ')}
              </span>
            </div>
            <h3
              onClick={() => onSelectBot?.(bot.id)}
              className="font-bold text-base sm:text-lg text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight truncate cursor-pointer hover:text-cyan-400 transition-colors"
            >
              {bot.name}
            </h3>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : isEmergency
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive
                    ? 'bg-emerald-400 animate-pulse'
                    : isEmergency
                    ? 'bg-rose-500'
                    : 'bg-amber-400'
                }`}
              />
              {bot.status}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 line-clamp-2 mb-4 leading-relaxed font-sans">
          {bot.description}
        </p>

        {/* Financial KPIs 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-lg bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 mb-4">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-500">
              Net 24h PnL
            </div>
            <div
              className={`text-sm sm:text-base font-mono font-bold flex items-center gap-1 mt-0.5 ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>
                {isPositive ? '+' : ''}${bot.metrics.pnl24hUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-500">
              {isPositive ? '+' : ''}{bot.metrics.pnl24hPercent.toFixed(2)}%
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-500">
              Win Rate / Ratio
            </div>
            <div className="text-sm sm:text-base font-mono font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mt-0.5">
              {bot.metrics.winRate.toFixed(1)}%
            </div>
            <div className="text-[11px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-500">
              {bot.metrics.winningTrades}W • {bot.metrics.losingTrades}L
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-500">
              Capital Exposure
            </div>
            <div className="text-xs sm:text-sm font-mono font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 mt-0.5">
              ${(bot.metrics.currentExposureUsd / 1000).toFixed(1)}k
            </div>
            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-500">
              of ${(bot.metrics.allocatedCapitalUsd / 1000).toFixed(0)}k pool ({bot.config.leverage}x lev)
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-500">
              Execution Speed
            </div>
            <div className="text-xs sm:text-sm font-mono font-semibold text-cyan-400 mt-0.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              {bot.metrics.avgExecutionLatencyMs}ms
            </div>
            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-500">
              Sharpe: {bot.metrics.sharpeRatio.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Institutional Intelligence: ADX & Whale Tracking */}
        <div className="space-y-2.5 mb-4">
          {/* ADX Strength Bar */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-100/70 border border-slate-800/40">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-mono uppercase text-slate-300 dark:text-slate-300 light:text-slate-700">
                ADX Strength:
              </span>
              <span className={`text-[11px] font-mono font-bold ${adxInfo.text}`}>
                {bot.adx.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${adxInfo.bar}`}
                  style={{ width: `${Math.min(100, (bot.adx / 60) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-500">
                {adxInfo.label}
              </span>
            </div>
          </div>

          {/* Whale Order Flow */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-100/70 border border-slate-800/40">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-mono uppercase text-slate-300 dark:text-slate-300 light:text-slate-700">
                Whale Flow:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-300 dark:text-slate-300 light:text-slate-700">
                ${(bot.whaleVolumeUsd / 1000000).toFixed(2)}M
              </span>
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${whale.color}`}
              >
                <WhaleIcon className="w-2.5 h-2.5" />
                {whale.text}
              </span>
            </div>
          </div>
        </div>

        {/* Drawdown Sentinel & Auto-Pause Toggle */}
        <div className="p-2.5 rounded-lg bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-500 flex items-center gap-1">
              <Shield className="w-3 h-3 text-cyan-400" />
              Drawdown Guard
            </span>
            <span className="text-[11px] font-mono font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800">
              {currentDrawdown.toFixed(2)}% / {maxAllowedDrawdown.toFixed(1)}% limit
            </span>
          </div>

          {/* Drawdown Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-300 ${
                drawdownRatio > 80
                  ? 'bg-rose-500'
                  : drawdownRatio > 50
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${drawdownRatio}%` }}
            />
          </div>

          {/* Interactive Auto-Pause Switch */}
          <button
            type="button"
            onClick={() => onToggleAutoPause(bot.id)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono transition-all border ${
              bot.config.autoPauseEnabled
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
                : 'bg-slate-800/40 text-slate-400 border-slate-700/60 hover:bg-slate-800/60 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {bot.config.autoPauseEnabled ? (
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>Auto-Pause on Max Drawdown</span>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                bot.config.autoPauseEnabled
                  ? 'bg-cyan-400/20 text-cyan-300'
                  : 'bg-slate-700/50 text-slate-400'
              }`}
            >
              {bot.config.autoPauseEnabled ? 'ARMED' : 'DISABLED'}
            </span>
          </button>
        </div>

        {/* Live Signal Ticker if Available */}
        {bot.lastSignal && (
          <div className="mt-auto mb-3 px-2.5 py-1.5 rounded bg-slate-900/60 border border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Signal:
            </span>
            <span className="font-semibold text-cyan-300">
              {bot.lastSignal.action} @ ${bot.lastSignal.price.toLocaleString()} ({bot.lastSignal.confidence}% conf)
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200">
          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.01 }}
            type="button"
            disabled={isEmergency}
            onClick={() => onToggleStatus(bot.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-semibold transition-all border ${
              isActive
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isActive ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Engine</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Engage Bot</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.90, rotate: 180 }}
            whileHover={{ scale: 1.08 }}
            type="button"
            title="Recalibrate Engine Parameters"
            onClick={() => onSelectBot?.(bot.id)}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 hover:border-slate-600 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
