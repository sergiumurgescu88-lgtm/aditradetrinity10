import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Cpu,
  TrendingDown,
  TrendingUp,
  Sliders,
  ShieldAlert,
  Zap,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  Gauge,
} from 'lucide-react';
import type { HermesInsight, MacroCorrelationMatrix, InsightCategory } from '../types';

interface HermesInsightsProps {
  insights: HermesInsight[];
  correlationMatrix: MacroCorrelationMatrix;
  theme?: 'dark' | 'light';
}

export function HermesInsights({
  insights,
  correlationMatrix,
  theme = 'dark',
}: HermesInsightsProps) {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | InsightCategory>('ALL');

  const filteredInsights = insights.filter(
    (i) => selectedCategory === 'ALL' || i.category === selectedCategory
  );

  const isDxySurging = correlationMatrix.dxy.trend === 'SURGING';

  return (
    <div className="rounded-xl p-5 bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-cyan-500/30 dark:border-cyan-500/30 light:border-slate-200 shadow-xl shadow-cyan-950/20 flex flex-col justify-between">
      {/* Header with Synaptic Stream Pulse */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900 uppercase font-mono">
                  Hermes Neural Brain // Synaptic Insights
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
                  LIVE REASONING
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-600">
                Autonomous cross-asset macro correlation & algorithmic adjustments
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-cyan-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>Inference Latency: 2.4ms</span>
          </div>
        </div>

        {/* Real-time Macro Correlation Matrix Ribbon */}
        <div className="my-3 p-3 rounded-lg bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span className="uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Real-Time Macro Correlation Matrix
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[10px] border ${
                isDxySurging
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isDxySurging ? 'DXY SURGE DETECTED // GOLD DOWNWARD BIAS' : 'MACRO SPREAD BALANCED'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {/* DXY Index */}
            <div className="p-2 rounded bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">US Dollar Index (DXY)</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                  {correlationMatrix.dxy.value.toFixed(2)}
                </span>
                <span
                  className={`text-[11px] font-bold flex items-center gap-0.5 ${
                    correlationMatrix.dxy.change24h >= 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {correlationMatrix.dxy.change24h >= 0 ? '+' : ''}
                  {correlationMatrix.dxy.change24h.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* DXY vs XAUUSD Inverse Corr */}
            <div className="p-2 rounded bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">DXY ⇄ Gold (XAUUSD)</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-bold text-amber-400">
                  {correlationMatrix.dxyGoldCorr.toFixed(2)}r
                </span>
                <span className="text-[10px] text-slate-400">Strong Inverse</span>
              </div>
            </div>

            {/* DXY vs BTC Inverse Corr */}
            <div className="p-2 rounded bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">DXY ⇄ Bitcoin (BTC)</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-bold text-cyan-400">
                  {correlationMatrix.dxyBtcCorr.toFixed(2)}r
                </span>
                <span className="text-[10px] text-slate-400">Inverse Beta</span>
              </div>
            </div>

            {/* BTC vs Gold Correlation */}
            <div className="p-2 rounded bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">BTC ⇄ Gold Correlation</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-bold text-emerald-400">
                  +{correlationMatrix.btcGoldCorr.toFixed(2)}r
                </span>
                <span className="text-[10px] text-slate-400">Store of Value</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            {(
              [
                'ALL',
                'MACRO_CORRELATION',
                'TECHNICAL_DIVERGENCE',
                'VOLATILITY_REGIME',
                'LIQUIDITY_SHOCK',
              ] as const
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded transition-all border ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <span className="text-[10px] font-mono text-slate-500">
            {filteredInsights.length} thoughts active
          </span>
        </div>
      </div>

      {/* Neural Insights Thought Stream */}
      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        <AnimatePresence mode="popLayout">
          {filteredInsights.map((insight) => {
            const timeString = new Date(insight.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            const isDefensive = insight.impact === 'DEFENSIVE';
            const isPositive = insight.impact === 'POSITIVE';

            return (
              <motion.div
                key={insight.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="p-3 rounded-lg bg-slate-950/70 dark:bg-slate-950/70 light:bg-slate-50 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 hover:border-cyan-500/40 transition-all font-mono text-xs flex flex-col gap-1.5"
              >
                {/* Insight Top Metas */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {insight.category.replace('_', ' ')}
                    </span>
                    <span className="text-slate-200 dark:text-slate-200 light:text-slate-800 font-bold">
                      {insight.title}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 shrink-0">
                    {timeString}
                  </span>
                </div>

                {/* Narrative Thought */}
                <p className="text-slate-300 dark:text-slate-300 light:text-slate-700 font-sans text-xs leading-relaxed">
                  "{insight.thought}"
                </p>

                {/* Autonomous Action Taken & Confidence Meter */}
                <div className="pt-1.5 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[10px] uppercase">Autonomous Action:</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold border ${
                        isDefensive
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : isPositive
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {insight.actionTaken}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Confidence:</span>
                    <span className="text-cyan-400 font-bold">{insight.confidence}%</span>
                    <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400"
                        style={{ width: `${insight.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
