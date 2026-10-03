import React, { memo, useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, Pause, Play, Filter, ShieldCheck } from 'lucide-react';
import type { SystemLogEntry } from '../types';

interface SystemLogsProps {
  logs: SystemLogEntry[];
  onClearLogs: () => void;
  theme?: 'dark' | 'light';
}

// Memoized individual log item for zero-lag high frequency rendering
const LogLine = memo(({ log }: { log: SystemLogEntry }) => {
  const timeFormatted = new Date(log.timestamp).toTimeString().split(' ')[0] +
    '.' +
    String(log.timestamp % 1000).padStart(3, '0');

  const getLevelStyle = (level: SystemLogEntry['level']) => {
    switch (level) {
      case 'EXEC':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'RISK':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse';
      case 'WARN':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'INFO':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'DEBUG':
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="flex items-start gap-1.5 sm:gap-2 py-0.5 sm:py-1 px-1.5 sm:px-2.5 rounded font-mono text-[10px] sm:text-xs hover:bg-slate-900/60 dark:hover:bg-slate-900/60 light:hover:bg-slate-100/60 transition-colors">
      <span className="text-slate-500 dark:text-slate-500 light:text-slate-400 shrink-0 select-none text-[9px] sm:text-[11px]">
        {timeFormatted}
      </span>

      <span
        className={`inline-block px-1 sm:px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold border shrink-0 uppercase tracking-wider ${getLevelStyle(
          log.level
        )}`}
      >
        {log.level}
      </span>

      <span className="text-cyan-500/80 dark:text-cyan-400/80 light:text-cyan-700 shrink-0 font-semibold text-[9px] sm:text-[11px]">
        [{log.subsystem}]
      </span>

      <span className="text-slate-300 dark:text-slate-300 light:text-slate-800 break-words leading-relaxed flex-1">
        {log.message}
      </span>
    </div>
  );
});

LogLine.displayName = 'LogLine';

export function SystemLogs({ logs, onClearLogs, theme = 'dark' }: SystemLogsProps) {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Slicing to maximum 100 entries strictly for maximum rendering performance
  const displayLogs = React.useMemo(() => {
    const sliced = logs.slice(0, 100);
    if (filterLevel === 'ALL') return sliced;
    return sliced.filter((l) => l.level === filterLevel);
  }, [logs, filterLevel]);

  // Auto-scroll on new entries if enabled
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [displayLogs, autoScroll]);

  return (
    <div className="rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-white border border-slate-800/90 dark:border-slate-800/90 light:border-slate-200 overflow-hidden flex flex-col h-[380px] shadow-lg">
      {/* Terminal Title Bar */}
      <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100/90 px-4 py-2.5 border-b border-slate-800/90 dark:border-slate-800/90 light:border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Simulated Terminal Window Dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 uppercase tracking-wider">
              HERMES TERMINAL STDOUT
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {displayLogs.length} / 100 BUFFER
            </span>
          </div>
        </div>

        {/* Console Controls */}
        <div className="flex items-center gap-2">
          {/* Level Filter Dropdown / Pills */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono bg-slate-950/60 dark:bg-slate-950/60 light:bg-white p-1 rounded-md border border-slate-800 dark:border-slate-800 light:border-slate-200">
            {['ALL', 'EXEC', 'RISK', 'WARN', 'INFO'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setFilterLevel(lvl)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  filterLevel === lvl
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Auto Scroll Toggle */}
          <button
            type="button"
            onClick={() => setAutoScroll((prev) => !prev)}
            title={autoScroll ? 'Pause Auto-scroll' : 'Resume Auto-scroll'}
            className={`p-1.5 rounded text-xs transition-colors border ${
              autoScroll
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {autoScroll ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Console Button */}
          <button
            type="button"
            onClick={onClearLogs}
            title="Clear Console Output"
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-400" />
            <span className="hidden sm:inline text-[11px]">Clear Console</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 p-3 overflow-y-auto font-mono space-y-0.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent select-text"
      >
        {displayLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 dark:text-slate-600 light:text-slate-400 text-xs font-mono">
            <span>[Buffer empty. Waiting for Hermes engine telemetry...]</span>
          </div>
        ) : (
          displayLogs.map((entry) => <LogLine key={entry.id} log={entry} />)
        )}
      </div>

      {/* Terminal Status Bar */}
      <div className="bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-50 px-4 py-1.5 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            Telemetry Stream: ACTIVE
          </span>
          <span>Max Buffer Limit: 100 entries</span>
        </div>
        <span>Rate: ~1 event / 3s</span>
      </div>
    </div>
  );
}
