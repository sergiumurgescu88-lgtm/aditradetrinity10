import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import type { ToastNotification } from '../types';

interface NotificationToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export function NotificationToast({ toasts, onDismiss }: NotificationToastProps) {
  return (
    <div
      aria-live="polite"
      aria-label="System Notifications"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const isAlert = toast.type === 'ALERT';
          const isSuccess = toast.type === 'SUCCESS';

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto rounded-xl p-4 shadow-2xl backdrop-blur-xl border flex items-start gap-3 relative overflow-hidden ${
                isAlert
                  ? 'bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 border-rose-500/50 shadow-rose-950/30'
                  : isSuccess
                  ? 'bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 border-emerald-500/50 shadow-emerald-950/30'
                  : 'bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 border-cyan-500/50 shadow-cyan-950/30'
              }`}
            >
              {/* Highlight Line */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  isAlert ? 'bg-rose-500' : isSuccess ? 'bg-emerald-400' : 'bg-cyan-400'
                }`}
              />

              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {isAlert ? (
                  <div className="p-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                ) : isSuccess ? (
                  <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <Info className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h4
                    className={`text-xs font-mono font-bold uppercase tracking-wider ${
                      isAlert ? 'text-rose-400' : isSuccess ? 'text-emerald-400' : 'text-cyan-400'
                    }`}
                  >
                    {toast.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {new Date(toast.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 font-sans leading-relaxed">
                  {toast.message}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
