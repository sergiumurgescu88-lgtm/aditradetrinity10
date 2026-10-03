import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Brain,
  Zap,
  Layers,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenOrderModal: () => void;
  onOpenDock: () => void;
  activeSection?: string;
}

export function MobileBottomNav({
  onOpenOrderModal,
  onOpenDock,
}: MobileBottomNavProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/95 dark:bg-slate-950/95 light:bg-white/95 backdrop-blur-xl border-t border-slate-800/90 dark:border-slate-800/90 light:border-slate-200 px-3 py-1.5 flex items-center justify-around font-mono shadow-2xl"
    >
      {/* 1. KPIs & Overview */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={() => scrollTo('kpi-section')}
        className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-cyan-400 py-1 px-2 transition-colors"
      >
        <LayoutDashboard className="w-4 h-4" />
        <span className="text-[10px]">Overview</span>
      </motion.button>

      {/* 2. Hermes Insights */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={() => scrollTo('insights-section')}
        className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-cyan-400 py-1 px-2 transition-colors"
      >
        <Brain className="w-4 h-4" />
        <span className="text-[10px]">Insights</span>
      </motion.button>

      {/* 3. Center Fast Order Button (High Visual Prominence) */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.05 }}
        type="button"
        onClick={onOpenOrderModal}
        className="-mt-5 p-3 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/30 border-2 border-slate-950 flex items-center justify-center font-bold"
      >
        <Zap className="w-5 h-5 fill-current" />
      </motion.button>

      {/* 4. Operational Units / Bots */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={() => scrollTo('bots-section')}
        className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-cyan-400 py-1 px-2 transition-colors"
      >
        <Layers className="w-4 h-4" />
        <span className="text-[10px]">Units</span>
      </motion.button>

      {/* 5. Modern Bottom Sheet Menu */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={onOpenDock}
        className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-cyan-400 py-1 px-2 transition-colors"
      >
        <Menu className="w-4 h-4" />
        <span className="text-[10px]">Control</span>
      </motion.button>
    </nav>
  );
}
