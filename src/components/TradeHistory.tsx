import { useState, useMemo } from 'react';
import {
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';
import type { TradeHistory as TradeHistoryType, OrderSide } from '../types';

interface TradeHistoryProps {
  trades: TradeHistoryType[];
  theme?: 'dark' | 'light';
}

export function TradeHistory({ trades, theme = 'dark' }: TradeHistoryProps) {
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState<'ALL' | OrderSide>('ALL');
  const [exportSuccess, setExportSuccess] = useState(false);

  // Filtered trades
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const matchesSide = sideFilter === 'ALL' || trade.side === sideFilter;
      const matchesSearch =
        trade.pair.toLowerCase().includes(search.toLowerCase()) ||
        trade.botName.toLowerCase().includes(search.toLowerCase()) ||
        trade.id.toLowerCase().includes(search.toLowerCase()) ||
        trade.executionVenue.toLowerCase().includes(search.toLowerCase());
      return matchesSide && matchesSearch;
    });
  }, [trades, sideFilter, search]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (trades.length === 0) return;

    const headers = [
      'Order ID',
      'Date & Time',
      'Bot Name',
      'Engine',
      'Pair',
      'Side',
      'Type',
      'Execution Price (USD)',
      'Amount',
      'Total Value (USD)',
      'Fee (USD)',
      'PnL (USD)',
      'PnL (%)',
      'Latency (ms)',
      'Venue',
      'Status',
    ];

    const rows = filteredTrades.map((t) => [
      t.id,
      new Date(t.timestamp).toISOString(),
      `"${t.botName}"`,
      t.engine,
      t.pair,
      t.side,
      t.type,
      t.executionPrice.toFixed(2),
      t.amount,
      t.totalValueUsd.toFixed(2),
      t.feeUsd.toFixed(2),
      (t.pnlUsd ?? 0).toFixed(2),
      (t.pnlPercentage ?? 0).toFixed(2),
      t.latencyMs,
      `"${t.executionVenue}"`,
      t.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `hermes_trinity_trades_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2500);
  };

  return (
    <div className="rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 overflow-hidden flex flex-col h-[380px] shadow-sm">
      {/* Table Header & Action Controls */}
      <div className="p-4 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900 uppercase font-mono">
            Execution Log & Order History
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {filteredTrades.length} EXECUTIONS
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pair, bot, id..."
              className="pl-8 pr-3 py-1 text-xs font-mono rounded-lg bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 w-36 sm:w-44"
            />
          </div>

          {/* Side Filter Pills */}
          <div className="flex items-center gap-1 text-[11px] font-mono bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 p-0.5 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300">
            {(['ALL', 'BUY', 'SELL'] as const).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => setSideFilter(side)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  sideFilter === side
                    ? side === 'BUY'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : side === 'SELL'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-cyan-500/20 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {side}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all border ${
              exportSuccess
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700 hover:border-slate-600'
            }`}
          >
            {exportSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Export CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-950/90 dark:bg-slate-950/90 light:bg-slate-100/90 backdrop-blur-sm text-[10px] uppercase text-slate-400 border-b border-slate-800/80">
            <tr>
              <th className="py-2.5 px-3">Order ID</th>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Engine / Bot</th>
              <th className="py-2.5 px-3">Pair</th>
              <th className="py-2.5 px-3">Side</th>
              <th className="py-2.5 px-3 text-right">Price</th>
              <th className="py-2.5 px-3 text-right">Volume</th>
              <th className="py-2.5 px-3 text-right">Total ($)</th>
              <th className="py-2.5 px-3 text-right">Net PnL</th>
              <th className="py-2.5 px-3">Venue</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 dark:divide-slate-800/50 light:divide-slate-200">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-500">
                  No matching trade executions found.
                </td>
              </tr>
            ) : (
              filteredTrades.map((trade) => {
                const isBuy = trade.side === 'BUY';
                const isProfit = (trade.pnlUsd ?? 0) >= 0;
                const timeString = new Date(trade.timestamp).toTimeString().split(' ')[0];

                return (
                  <tr
                    key={trade.id}
                    className="hover:bg-slate-950/50 dark:hover:bg-slate-950/50 light:hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                      {trade.id}
                    </td>

                    <td className="py-2 px-3 text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {timeString}
                    </td>

                    <td className="py-2 px-3">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          trade.engine === 'ALPHA'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            : trade.engine === 'BETA'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : trade.engine === 'GAMMA'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                            : trade.engine === 'EPSILON'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                        }`}
                      >
                        {trade.botName}
                      </span>
                    </td>

                    <td className="py-2 px-3 font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800">
                      {trade.pair}
                    </td>

                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          isBuy
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {isBuy ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {trade.side}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-right font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900">
                      ${trade.executionPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-2 px-3 text-right text-slate-300 dark:text-slate-300 light:text-slate-700">
                      {trade.amount}
                    </td>

                    <td className="py-2 px-3 text-right text-slate-300 dark:text-slate-300 light:text-slate-700 font-semibold">
                      ${trade.totalValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td
                      className={`py-2 px-3 text-right font-bold ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}${trade.pnlUsd?.toFixed(2)} ({isProfit ? '+' : ''}
                      {trade.pnlPercentage?.toFixed(2)}%)
                    </td>

                    <td className="py-2 px-3 text-slate-400 text-[11px] truncate max-w-[120px]">
                      {trade.executionVenue}
                    </td>

                    <td className="py-2 px-3 text-center">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                        {trade.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
