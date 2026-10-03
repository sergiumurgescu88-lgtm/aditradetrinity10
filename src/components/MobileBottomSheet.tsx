import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Zap,
  Sun,
  Moon,
  ShieldAlert,
  Layers,
  Terminal,
  Activity,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import type { TrinityEngineType, DashboardData } from '../types';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenOrderModal: () => void;
  onOpenKillSwitch: () => void;
  selectedEngineFilter: 'ALL' | TrinityEngineType;
  onSelectEngineFilter: (engine: 'ALL' | TrinityEngineType) => void;
  dashboard: DashboardData;
  latencyMs: number;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  onOpenOrderModal,
  onOpenKillSwitch,
  selectedEngineFilter,
  onSelectEngineFilter,
  dashboard,
  latencyMs,
}: MobileBottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
          />

          {/* Bottom Sheet Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="relative z-10 w-full max-h-[85vh] bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-5 shadow-2xl text-slate-100 flex flex-col overflow-y-auto"
          >
            {/* Drag Handle Bar */}
            <div className="w-12 h-1.5 bg-slate-700 hover:bg-slate-600 rounded-full mx-auto mb-3 cursor-grab shrink-0" />

            {/* Sticky Header with Close Button */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-20 flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold uppercase font-mono tracking-wider">
                    HERMES CONTROL DOCK
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Latency: <strong className="text-cyan-400">{latencyMs}ms</strong> • Node: Frankfurt-09
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Matrix */}
            <div className="py-4 space-y-3 pb-8">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                Primary Actions
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Fast Order Trigger */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOrderModal();
                  }}
                  className="p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-950/40"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>+ Fast Order</span>
                </motion.button>

                {/* Kill Switch Trigger */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenKillSwitch();
                  }}
                  className="p-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold font-mono text-xs flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Emergency Halt</span>
                </motion.button>
              </div>

              {/* Theme Toggle Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onToggleTheme}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-mono flex items-center justify-between text-slate-200"
              >
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-cyan-400" />
                  )}
                  <span>Display Theme</span>
                </div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </motion.button>
            </div>

            {/* Quick Engine Filter Pills */}
            <div className="py-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                Filter Operational Units
              </span>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                {(['ALL', 'ALPHA', 'BETA', 'GAMMA', 'EPSILON', 'SERGIU'] as const).map((eng) => (
                  <motion.button
                    key={eng}
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={() => {
                      onSelectEngineFilter(eng);
                      onClose();
                    }}
                    className={`py-2 px-1 rounded-lg border text-center transition-all ${
                      selectedEngineFilter === eng
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-slate-950/70 text-slate-400 border-slate-800'
                    }`}
                  >
                    {eng}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Live Portfolio Telemetry Summary */}
            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Total Equity</span>
                <span className="text-sm font-bold text-slate-100 block mt-0.5">
                  ${dashboard.totalPortfolioValueUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Daily Net PnL</span>
                <span
                  className={`text-sm font-bold block mt-0.5 ${
                    dashboard.dailyPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {dashboard.dailyPnlUsd >= 0 ? '+' : ''}$
                  {dashboard.dailyPnlUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
