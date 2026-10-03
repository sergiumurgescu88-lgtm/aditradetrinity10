import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Layers, ArrowDown, ArrowUp } from 'lucide-react';

interface DepthRow {
  priceLevel: number;
  priceFormatted: string;
  bidVolume: number; // negative for mirrored left layout
  askVolume: number; // positive for mirrored right layout
  rawBidVolume: number;
  rawAskVolume: number;
  cumulativeBidOz: number;
  cumulativeAskOz: number;
  side: 'BID' | 'ASK' | 'MID';
}

const XAU_MID_PRICE = 2654.50;

// Institutional depth book for XAUUSD (Gold vs US Dollar)
const INITIAL_DEPTH_DATA: DepthRow[] = [
  // Asks (Sells above mid price) - ordered descending to mid
  { priceLevel: 2657.50, priceFormatted: '2,657.50', bidVolume: 0, askVolume: 1240, rawBidVolume: 0, rawAskVolume: 1240, cumulativeBidOz: 0, cumulativeAskOz: 5820, side: 'ASK' },
  { priceLevel: 2657.00, priceFormatted: '2,657.00', bidVolume: 0, askVolume: 980, rawBidVolume: 0, rawAskVolume: 980, cumulativeBidOz: 0, cumulativeAskOz: 4580, side: 'ASK' },
  { priceLevel: 2656.50, priceFormatted: '2,656.50', bidVolume: 0, askVolume: 1420, rawBidVolume: 0, rawAskVolume: 1420, cumulativeBidOz: 0, cumulativeAskOz: 3600, side: 'ASK' },
  { priceLevel: 2656.00, priceFormatted: '2,656.00', bidVolume: 0, askVolume: 850, rawBidVolume: 0, rawAskVolume: 850, cumulativeBidOz: 0, cumulativeAskOz: 2180, side: 'ASK' },
  { priceLevel: 2655.50, priceFormatted: '2,655.50', bidVolume: 0, askVolume: 710, rawBidVolume: 0, rawAskVolume: 710, cumulativeBidOz: 0, cumulativeAskOz: 1330, side: 'ASK' },
  { priceLevel: 2655.00, priceFormatted: '2,655.00', bidVolume: 0, askVolume: 620, rawBidVolume: 0, rawAskVolume: 620, cumulativeBidOz: 0, cumulativeAskOz: 620, side: 'ASK' },

  // Bids (Buys below mid price) - ordered descending from mid
  { priceLevel: 2654.00, priceFormatted: '2,654.00', bidVolume: -780, askVolume: 0, rawBidVolume: 780, rawAskVolume: 0, cumulativeBidOz: 780, cumulativeAskOz: 0, side: 'BID' },
  { priceLevel: 2653.50, priceFormatted: '2,653.50', bidVolume: -940, askVolume: 0, rawBidVolume: 940, rawAskVolume: 0, cumulativeBidOz: 1720, cumulativeAskOz: 0, side: 'BID' },
  { priceLevel: 2653.00, priceFormatted: '2,653.00', bidVolume: -1350, askVolume: 0, rawBidVolume: 1350, rawAskVolume: 0, cumulativeBidOz: 3070, cumulativeAskOz: 0, side: 'BID' },
  { priceLevel: 2652.50, priceFormatted: '2,652.50', bidVolume: -1120, askVolume: 0, rawBidVolume: 1120, rawAskVolume: 0, cumulativeBidOz: 4190, cumulativeAskOz: 0, side: 'BID' },
  { priceLevel: 2652.00, priceFormatted: '2,652.00', bidVolume: -890, askVolume: 0, rawBidVolume: 890, rawAskVolume: 0, cumulativeBidOz: 5080, cumulativeAskOz: 0, side: 'BID' },
  { priceLevel: 2651.50, priceFormatted: '2,651.50', bidVolume: -1560, askVolume: 0, rawBidVolume: 1560, rawAskVolume: 0, cumulativeBidOz: 6640, cumulativeAskOz: 0, side: 'BID' },
];

interface MarketDepthProps {
  theme?: 'dark' | 'light';
}

export function MarketDepth({ theme = 'dark' }: MarketDepthProps) {
  const [data] = useState<DepthRow[]>(INITIAL_DEPTH_DATA);

  const { totalBidsOz, totalAsksOz, bidRatio } = useMemo(() => {
    const bids = data.reduce((acc, r) => acc + r.rawBidVolume, 0);
    const asks = data.reduce((acc, r) => acc + r.rawAskVolume, 0);
    const total = bids + asks;
    const ratio = total > 0 ? Number(((bids / total) * 100).toFixed(1)) : 50;
    return {
      totalBidsOz: bids,
      totalAsksOz: asks,
      bidRatio: ratio,
    };
  }, [data]);

  const isDark = theme === 'dark';

  return (
    <div className="rounded-xl p-5 bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900 uppercase font-mono">
              XAUUSD Mirrored Depth
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              GOLD BULLION L2
            </span>
          </div>
        </div>

        {/* Pricing & Spread Row */}
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="text-xl sm:text-2xl font-mono font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
              ${XAU_MID_PRICE.toFixed(2)}
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Spread: <strong className="text-cyan-400">$0.35 (1.3 bps)</strong></span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-0.5">
                <ArrowUp className="w-3 h-3" /> +0.68%
              </span>
            </div>
          </div>

          <div className="text-right text-xs font-mono">
            <div className="text-slate-400 text-[10px] uppercase">Order Imbalance</div>
            <div className="font-bold text-slate-200 mt-0.5">
              <span className="text-emerald-400">{bidRatio}% Bids</span> /{' '}
              <span className="text-rose-400">{(100 - bidRatio).toFixed(1)}% Asks</span>
            </div>
          </div>
        </div>

        {/* Imbalance Meter Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex mb-4">
          <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${bidRatio}%` }} />
          <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${100 - bidRatio}%` }} />
        </div>
      </div>

      {/* Mirrored Horizontal BarChart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            stackOffset="sign"
            margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[-1800, 1800]}
              tickFormatter={(val: number) => `${Math.abs(val)}`}
              stroke={isDark ? '#475569' : '#94A3B8'}
              tick={{ fontSize: 10, fontFamily: 'monospace' }}
            />
            <YAxis
              type="category"
              dataKey="priceFormatted"
              stroke={isDark ? '#64748B' : '#64748B'}
              tick={{ fontSize: 10, fontFamily: 'monospace', fill: isDark ? '#94A3B8' : '#334155' }}
              width={65}
            />
            <ReferenceLine x={0} stroke={isDark ? '#334155' : '#CBD5E1'} strokeWidth={1.5} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as DepthRow;
                  const isBid = item.side === 'BID';
                  const volume = isBid ? item.rawBidVolume : item.rawAskVolume;
                  const cumOz = isBid ? item.cumulativeBidOz : item.cumulativeAskOz;
                  const totalUsd = (volume * item.priceLevel).toLocaleString('en-US', {
                    maximumFractionDigits: 0,
                  });

                  return (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono shadow-xl">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className={`font-bold ${isBid ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.side} @ ${item.priceFormatted}
                        </span>
                        <span className="text-[10px] text-slate-500">Gold Spot</span>
                      </div>
                      <div className="text-slate-300">
                        Volume: <strong className="text-slate-100">{volume} oz</strong> (~${totalUsd})
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Cumulative Depth: {cumOz} oz
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Mirrored Bars: Bid (Green/Emerald, negative x-values) */}
            <Bar
              dataKey="bidVolume"
              name="Bids (Buy)"
              fill="#10B981"
              radius={[4, 0, 0, 4]}
              opacity={0.85}
              isAnimationActive={true}
            />
            {/* Mirrored Bars: Ask (Red/Rose, positive x-values) */}
            <Bar
              dataKey="askVolume"
              name="Asks (Sell)"
              fill="#F43F5E"
              radius={[0, 4, 4, 0]}
              opacity={0.85}
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Summary Footer */}
      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-emerald-400" />
            Bids: {totalBidsOz.toLocaleString()} oz
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-rose-500" />
            Asks: {totalAsksOz.toLocaleString()} oz
          </span>
        </div>
        <span className="text-slate-400">Total Book: ${( ((totalBidsOz + totalAsksOz) * XAU_MID_PRICE) / 1000000 ).toFixed(1)}M</span>
      </div>
    </div>
  );
}
