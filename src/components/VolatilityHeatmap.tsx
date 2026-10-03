import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Activity, Info } from 'lucide-react';

interface VolatilityCell {
  bot: string;
  botId: string;
  volatilityLevel: string;
  levelIndex: number;
  botIndex: number;
  score: number; // 0 - 100 efficiency / edge
  winRate: number;
  recommendedExposure: string;
  notes: string;
}

const BOTS = [
  'Alpha (Trend)',
  'Beta (Arb)',
  'Gamma (HFT)',
  'Epsilon (MeanRev)',
  'Sergiu (Sovereign)',
];

const VOLATILITY_LEVELS = [
  'Low (<15%)',
  'Mid (15-30%)',
  'High (30-50%)',
  'Extreme (>50%)',
];

// Matrix 5x4 Data
const MATRIX_DATA: VolatilityCell[] = [
  // Alpha (Trend Hunter performs best in High/Extreme vol)
  { bot: 'Alpha (Trend)', botId: 'alpha', volatilityLevel: 'Low (<15%)', levelIndex: 0, botIndex: 0, score: 58, winRate: 61.2, recommendedExposure: '30%', notes: 'Choppy consolidation, tight brackets.' },
  { bot: 'Alpha (Trend)', botId: 'alpha', volatilityLevel: 'Mid (15-30%)', levelIndex: 1, botIndex: 0, score: 74, winRate: 69.5, recommendedExposure: '65%', notes: 'Clean breakout expansion.' },
  { bot: 'Alpha (Trend)', botId: 'alpha', volatilityLevel: 'High (30-50%)', levelIndex: 2, botIndex: 0, score: 92, winRate: 78.4, recommendedExposure: '90%', notes: 'Peak trend following velocity.' },
  { bot: 'Alpha (Trend)', botId: 'alpha', volatilityLevel: 'Extreme (>50%)', levelIndex: 3, botIndex: 0, score: 88, winRate: 74.0, recommendedExposure: '75%', notes: 'Wide trailing stops active.' },

  // Beta (Arb performs best in Mid to High spread expansions)
  { bot: 'Beta (Arb)', botId: 'beta', volatilityLevel: 'Low (<15%)', levelIndex: 0, botIndex: 1, score: 82, winRate: 84.1, recommendedExposure: '80%', notes: 'Tight spreads, steady funding fees.' },
  { bot: 'Beta (Arb)', botId: 'beta', volatilityLevel: 'Mid (15-30%)', levelIndex: 1, botIndex: 1, score: 95, winRate: 89.2, recommendedExposure: '100%', notes: 'Optimal cross-DEX price dislocations.' },
  { bot: 'Beta (Arb)', botId: 'beta', volatilityLevel: 'High (30-50%)', levelIndex: 2, botIndex: 1, score: 86, winRate: 81.0, recommendedExposure: '70%', notes: 'High funding rate arbitrage yield.' },
  { bot: 'Beta (Arb)', botId: 'beta', volatilityLevel: 'Extreme (>50%)', levelIndex: 3, botIndex: 1, score: 64, winRate: 68.5, recommendedExposure: '45%', notes: 'Latency slippage buffer engaged.' },

  // Gamma (HFT Grid excels in Mid & Low-Mid frequency fluctuations)
  { bot: 'Gamma (HFT)', botId: 'gamma', volatilityLevel: 'Low (<15%)', levelIndex: 0, botIndex: 2, score: 78, winRate: 71.0, recommendedExposure: '70%', notes: 'Micro-range grid harvesting.' },
  { bot: 'Gamma (HFT)', botId: 'gamma', volatilityLevel: 'Mid (15-30%)', levelIndex: 1, botIndex: 2, score: 91, winRate: 80.5, recommendedExposure: '95%', notes: 'Maximum orderbook fill velocity.' },
  { bot: 'Gamma (HFT)', botId: 'gamma', volatilityLevel: 'High (30-50%)', levelIndex: 2, botIndex: 2, score: 76, winRate: 67.8, recommendedExposure: '60%', notes: 'Dynamic grid spacing expanded.' },
  { bot: 'Gamma (HFT)', botId: 'gamma', volatilityLevel: 'Extreme (>50%)', levelIndex: 3, botIndex: 2, score: 54, winRate: 59.2, recommendedExposure: '25%', notes: 'High inventory risk, throttled.' },

  // Epsilon (Mean-Reversion dominates ranging low-to-mid volatility)
  { bot: 'Epsilon (MeanRev)', botId: 'epsilon', volatilityLevel: 'Low (<15%)', levelIndex: 0, botIndex: 3, score: 89, winRate: 76.5, recommendedExposure: '85%', notes: 'High statistical envelope adherence.' },
  { bot: 'Epsilon (MeanRev)', botId: 'epsilon', volatilityLevel: 'Mid (15-30%)', levelIndex: 1, botIndex: 3, score: 84, winRate: 72.8, recommendedExposure: '75%', notes: 'Standard Bollinger mean-reversion.' },
  { bot: 'Epsilon (MeanRev)', botId: 'epsilon', volatilityLevel: 'High (30-50%)', levelIndex: 2, botIndex: 3, score: 62, winRate: 60.1, recommendedExposure: '40%', notes: 'Extended band breakouts, cautious.' },
  { bot: 'Epsilon (MeanRev)', botId: 'epsilon', volatilityLevel: 'Extreme (>50%)', levelIndex: 3, botIndex: 3, score: 45, winRate: 52.4, recommendedExposure: '20%', notes: 'Trend runaway risk, auto-hedged.' },

  // Sergiu (Sovereign Neural Core adapts dynamically across all regimes)
  { bot: 'Sergiu (Sovereign)', botId: 'sergiu', volatilityLevel: 'Low (<15%)', levelIndex: 0, botIndex: 4, score: 90, winRate: 85.0, recommendedExposure: '85%', notes: 'Macro accumulation & basis yield.' },
  { bot: 'Sergiu (Sovereign)', botId: 'sergiu', volatilityLevel: 'Mid (15-30%)', levelIndex: 1, botIndex: 4, score: 96, winRate: 91.4, recommendedExposure: '100%', notes: 'Full dual-engine synergy.' },
  { bot: 'Sergiu (Sovereign)', botId: 'sergiu', volatilityLevel: 'High (30-50%)', levelIndex: 2, botIndex: 4, score: 98, winRate: 93.8, recommendedExposure: '95%', notes: 'Asymmetric volatility harvesting.' },
  { bot: 'Sergiu (Sovereign)', botId: 'sergiu', volatilityLevel: 'Extreme (>50%)', levelIndex: 3, botIndex: 4, score: 94, winRate: 87.6, recommendedExposure: '80%', notes: 'Automated tail-risk protection.' },
];

interface VolatilityHeatmapProps {
  theme?: 'dark' | 'light';
}

export function VolatilityHeatmap({ theme = 'dark' }: VolatilityHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCell, setActiveCell] = useState<VolatilityCell | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean previous render
    const container = containerRef.current;
    d3.select(container).selectAll('*').remove();

    const isDark = theme === 'dark';
    const containerWidth = container.clientWidth || 480;
    const isMobile = containerWidth < 460;

    const margin = {
      top: 35,
      right: isMobile ? 12 : 25,
      bottom: 25,
      left: isMobile ? 70 : 135,
    };

    const height = isMobile ? 250 : 320;
    const width = Math.max(320, containerWidth);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('overflow', 'visible');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: 4 Volatility Levels
    const xScale = d3
      .scaleBand<string>()
      .domain(VOLATILITY_LEVELS)
      .range([0, innerWidth])
      .padding(0.08);

    // Y Scale: 5 Bots
    const yScale = d3
      .scaleBand<string>()
      .domain(BOTS)
      .range([0, innerHeight])
      .padding(0.1);

    // Color Scale: Gradient from Cyan (#06B6D4) to Emerald (#10B981)
    // Low scores get deep cyan/slate blend, high scores get glowing emerald
    const colorScale = d3
      .scaleLinear<string>()
      .domain([40, 70, 98])
      .range(['#083344', '#06B6D4', '#10B981'])
      .interpolate(d3.interpolateRgb);

    // X-Axis Header (Top)
    const xAxis = d3.axisTop(xScale).tickSize(0);
    const xAxisGroup = g
      .append('g')
      .call(xAxis)
      .attr('class', 'x-axis');

    xAxisGroup.select('.domain').remove();
    xAxisGroup
      .selectAll('text')
      .style('font-family', 'ui-monospace, monospace')
      .style('font-size', '10px')
      .style('font-weight', '600')
      .style('fill', isDark ? '#94A3B8' : '#475569')
      .attr('dy', '-8px');

    // Y-Axis Labels (Left)
    const yAxis = d3.axisLeft(yScale).tickSize(0);
    const yAxisGroup = g
      .append('g')
      .call(yAxis)
      .attr('class', 'y-axis');

    yAxisGroup.select('.domain').remove();
    yAxisGroup
      .selectAll('text')
      .text((d: any) => (isMobile ? String(d).split(' ')[0] : String(d)))
      .style('font-family', 'ui-monospace, monospace')
      .style('font-size', isMobile ? '10px' : '11px')
      .style('font-weight', (d) => (d === 'Sergiu (Sovereign)' ? '700' : '500'))
      .style('fill', (d) => {
        if (d === 'Sergiu (Sovereign)') return isDark ? '#38BDF8' : '#0284C7';
        return isDark ? '#CBD5E1' : '#334155';
      })
      .attr('dx', '-6px');

    // Render Matrix Rectangles (5x4)
    const cells = g
      .selectAll('.cell')
      .data(MATRIX_DATA)
      .enter()
      .append('g')
      .attr('class', 'cell-group')
      .style('cursor', 'pointer');

    cells
      .append('rect')
      .attr('x', (d) => xScale(d.volatilityLevel) || 0)
      .attr('y', (d) => yScale(d.bot) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', (d) => colorScale(d.score))
      .attr('stroke', (d) => (d.bot.includes('Sergiu') ? '#38BDF8' : isDark ? '#1E293B' : '#E2E8F0'))
      .attr('stroke-width', (d) => (d.bot.includes('Sergiu') ? 1.5 : 1))
      .attr('fill-opacity', (d) => (d.score >= 90 ? 0.95 : 0.75))
      .style('transition', 'all 0.15s ease-out')
      .on('mouseenter', function (_event, d) {
        d3.select(this)
          .attr('stroke', '#38BDF8')
          .attr('stroke-width', 2)
          .attr('fill-opacity', 1);
        setActiveCell(d);
      })
      .on('mouseleave', function (_event, d) {
        d3.select(this)
          .attr('stroke', d.bot.includes('Sergiu') ? '#38BDF8' : isDark ? '#1E293B' : '#E2E8F0')
          .attr('stroke-width', d.bot.includes('Sergiu') ? 1.5 : 1)
          .attr('fill-opacity', d.score >= 90 ? 0.95 : 0.75);
      });

    // Score Value Labels inside each cell
    cells
      .append('text')
      .attr('x', (d) => (xScale(d.volatilityLevel) || 0) + xScale.bandwidth() / 2)
      .attr('y', (d) => (yScale(d.bot) || 0) + yScale.bandwidth() / 2 + 3.5)
      .attr('text-anchor', 'middle')
      .style('font-family', 'ui-monospace, monospace')
      .style('font-size', '11px')
      .style('font-weight', '700')
      .style('fill', '#FFFFFF')
      .style('pointer-events', 'none')
      .text((d) => `${d.score}%`);

    // Clean-up handler
    return () => {
      d3.select(container).selectAll('*').remove();
    };
  }, [theme]);

  return (
    <div className="rounded-xl p-4 md:p-5 bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900 uppercase font-mono">
            Trinity Volatility Heatmap
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          D3.JS MATRIX (5×4)
        </span>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mb-3 font-sans">
        Algorithmic efficiency rating across 4 market volatility regimes. Cyan = Baseline / Trend Expansion, Emerald = Peak Sharpe Optimal.
      </p>

      {/* D3 Heatmap Container */}
      <div ref={containerRef} className="w-full overflow-x-auto min-h-[230px]" />

      {/* Active Cell Telemetry Inspector */}
      <div className="mt-3 p-2.5 rounded-lg bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {activeCell ? (
          <>
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-300">{activeCell.bot}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">{activeCell.volatilityLevel}</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold">Edge: {activeCell.score}%</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>Rec. Exp: <strong className="text-slate-200">{activeCell.recommendedExposure}</strong></span>
              <span>Win Rate: <strong className="text-emerald-400">{activeCell.winRate}%</strong></span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Hover over any cell in the 5x4 matrix to inspect algorithmic regime tuning.</span>
          </div>
        )}
      </div>
    </div>
  );
}
