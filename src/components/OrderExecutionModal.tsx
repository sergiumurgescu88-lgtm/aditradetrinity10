import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Zap,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Target,
  Calculator,
  Sliders,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type {
  OrderSide,
  OrderType,
  MarketTicker,
  Bot,
} from '../types';

interface OrderExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  equityUsd: number;
  tickers: Record<string, MarketTicker>;
  bots: Bot[];
  onExecuteOrder: (order: {
    pair: string;
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
    stopLossPrice?: number;
    takeProfitPrice?: number;
    botId?: string;
    executionVenue?: string;
  }) => void;
}

export function OrderExecutionModal({
  isOpen,
  onClose,
  equityUsd,
  tickers,
  bots,
  onExecuteOrder,
}: OrderExecutionModalProps) {
  // Available assets
  const availablePairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT', 'XAUUSD'];

  // Form State
  const [selectedPair, setSelectedPair] = useState<string>('BTC/USDT');
  const [selectedBotId, setSelectedBotId] = useState<string>(bots[0]?.id || 'manual-desk');
  const [side, setSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [customPrice, setCustomPrice] = useState<string>('');

  // Position Sizing Calculator State
  const [riskPercent, setRiskPercent] = useState<number>(1.0); // 1% of equity by default
  const [customRiskAmount, setCustomRiskAmount] = useState<string>('');
  const [useCustomRiskUsd, setUseCustomRiskUsd] = useState<boolean>(false);
  const [stopLossPrice, setStopLossPrice] = useState<string>('');
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>('');
  const [manualLotSize, setManualLotSize] = useState<string>('');
  const [useAutoSizing, setUseAutoSizing] = useState<boolean>(true);

  // Live price reference
  const currentTicker = tickers[selectedPair];
  const spotPrice = useMemo(() => {
    if (selectedPair === 'XAUUSD') return 2654.50;
    return currentTicker?.price || (selectedPair.includes('BTC') ? 94250 : 3340);
  }, [currentTicker, selectedPair]);

  // Set default entry price
  const executionPrice = useMemo(() => {
    if (orderType === 'MARKET') return spotPrice;
    const parsed = parseFloat(customPrice);
    return !isNaN(parsed) && parsed > 0 ? parsed : spotPrice;
  }, [orderType, customPrice, spotPrice]);

  // Set intelligent initial SL/TP defaults whenever pair or side changes
  useEffect(() => {
    if (spotPrice > 0) {
      const defaultSlPct = 0.015; // 1.5% distance
      const defaultTpPct = 0.035; // 3.5% distance (1:2.3 R:R)
      const sl = side === 'BUY' ? spotPrice * (1 - defaultSlPct) : spotPrice * (1 + defaultSlPct);
      const tp = side === 'BUY' ? spotPrice * (1 + defaultTpPct) : spotPrice * (1 - defaultTpPct);
      
      const decimals = spotPrice > 1000 ? 2 : spotPrice > 10 ? 2 : 4;
      setStopLossPrice(sl.toFixed(decimals));
      setTakeProfitPrice(tp.toFixed(decimals));
      setCustomPrice(spotPrice.toFixed(decimals));
    }
  }, [selectedPair, side, spotPrice]);

  // Dynamic Sizing Calculations
  const calculations = useMemo(() => {
    const sl = parseFloat(stopLossPrice);
    const tp = parseFloat(takeProfitPrice);

    // Dollar risk calculation
    const calculatedRiskUsd = useCustomRiskUsd && parseFloat(customRiskAmount) > 0
      ? parseFloat(customRiskAmount)
      : equityUsd * (riskPercent / 100);

    let optimalLot = 0;
    let slDistance = 0;
    let slDistancePct = 0;
    let isValidSl = false;

    if (!isNaN(sl) && sl > 0) {
      if (side === 'BUY' && sl < executionPrice) {
        slDistance = executionPrice - sl;
        isValidSl = true;
      } else if (side === 'SELL' && sl > executionPrice) {
        slDistance = sl - executionPrice;
        isValidSl = true;
      }

      if (isValidSl && slDistance > 0) {
        slDistancePct = (slDistance / executionPrice) * 100;
        optimalLot = calculatedRiskUsd / slDistance;
      }
    }

    // Decide final lot size
    const finalLot = useAutoSizing
      ? optimalLot
      : parseFloat(manualLotSize) || 0;

    const notionalValueUsd = finalLot * executionPrice;
    const requiredMarginUsd = notionalValueUsd / 5; // assumes standard 5x collateral requirement
    const effectiveLeverage = equityUsd > 0 ? notionalValueUsd / equityUsd : 1;

    // Expected profit at TP
    let expectedProfitUsd = 0;
    let rrRatio = 0;
    let isValidTp = false;

    if (!isNaN(tp) && tp > 0 && finalLot > 0) {
      if (side === 'BUY' && tp > executionPrice) {
        expectedProfitUsd = (tp - executionPrice) * finalLot;
        isValidTp = true;
      } else if (side === 'SELL' && tp < executionPrice) {
        expectedProfitUsd = (executionPrice - tp) * finalLot;
        isValidTp = true;
      }

      if (calculatedRiskUsd > 0 && expectedProfitUsd > 0) {
        rrRatio = expectedProfitUsd / calculatedRiskUsd;
      }
    }

    return {
      calculatedRiskUsd,
      optimalLot,
      finalLot,
      notionalValueUsd,
      requiredMarginUsd,
      effectiveLeverage,
      slDistance,
      slDistancePct,
      isValidSl,
      expectedProfitUsd,
      rrRatio,
      isValidTp,
    };
  }, [
    equityUsd,
    riskPercent,
    useCustomRiskUsd,
    customRiskAmount,
    stopLossPrice,
    takeProfitPrice,
    side,
    executionPrice,
    useAutoSizing,
    manualLotSize,
  ]);

  // Quick Preset Handlers
  const handleApplyRiskPreset = (pct: number) => {
    setUseCustomRiskUsd(false);
    setRiskPercent(pct);
  };

  const handleApplySlDistance = (pct: number) => {
    const sl = side === 'BUY' ? executionPrice * (1 - pct / 100) : executionPrice * (1 + pct / 100);
    const decimals = spotPrice > 1000 ? 2 : 2;
    setStopLossPrice(sl.toFixed(decimals));
  };

  const handleApplyRrPreset = (targetRr: number) => {
    const sl = parseFloat(stopLossPrice);
    if (isNaN(sl)) return;
    const slDist = Math.abs(executionPrice - sl);
    const tpDist = slDist * targetRr;
    const tp = side === 'BUY' ? executionPrice + tpDist : executionPrice - tpDist;
    const decimals = spotPrice > 1000 ? 2 : 2;
    setTakeProfitPrice(tp.toFixed(decimals));
  };

  // Submit Order
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculations.finalLot <= 0) return;

    const parsedSl = parseFloat(stopLossPrice);
    const parsedTp = parseFloat(takeProfitPrice);

    onExecuteOrder({
      pair: selectedPair,
      side,
      type: orderType,
      price: executionPrice,
      amount: Number(calculations.finalLot.toFixed(selectedPair.includes('BTC') ? 3 : 2)),
      stopLossPrice: !isNaN(parsedSl) ? parsedSl : undefined,
      takeProfitPrice: !isNaN(parsedTp) ? parsedTp : undefined,
      botId: selectedBotId,
      executionVenue: 'Hermes L3 Direct Gateway',
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="max-w-2xl w-full my-6 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-slate-950/60 text-slate-100 flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-slate-950/90 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base uppercase tracking-wider font-mono">
                  HERMES FAST ORDER ROUTER
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  L3 DIRECT
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Sub-millisecond execution with algorithmic position sizing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 font-mono text-xs flex-1">
          {/* Asset & Bot Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Trading Instrument
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {availablePairs.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPair(p)}
                    className={`py-1.5 px-2 rounded text-center transition-all border ${
                      selectedPair === p
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {p.split('/')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Execution Bot / Engine
              </label>
              <select
                value={selectedBotId}
                onChange={(e) => setSelectedBotId(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              >
                {bots.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.engine})
                  </option>
                ))}
                <option value="manual-desk">Direct Desk (Manual Discretionary)</option>
              </select>
            </div>
          </div>

          {/* Current Asset Spot Reference */}
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">
              Market Reference: <strong className="text-slate-200">{selectedPair}</strong>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-100">
                ${spotPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE SPOT
              </span>
            </div>
          </div>

          {/* Order Side & Order Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Side Tabs */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Order Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSide('BUY')}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    side === 'BUY'
                      ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-950/30'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setSide('SELL')}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    side === 'SELL'
                      ? 'bg-rose-500/25 text-rose-300 border-rose-500 shadow-md shadow-rose-950/30'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  SELL / SHORT
                </button>
              </div>
            </div>

            {/* Order Type */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Execution Type
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['MARKET', 'LIMIT', 'STOP_LOSS'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setOrderType(t)}
                    className={`py-2 px-1 rounded text-center transition-all border text-[11px] ${
                      orderType === t
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Limit / Trigger Price if needed */}
          {orderType !== 'MARKET' && (
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                {orderType === 'LIMIT' ? 'Limit Price (USD)' : 'Stop Activation Price (USD)'}
              </label>
              <input
                type="number"
                step="any"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Dynamic Position Sizing Calculator Panel */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span>DYNAMIC POSITION SIZING CALCULATOR</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Equity: <strong className="text-slate-200">${equityUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
              </span>
            </div>

            {/* Risk Control */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase text-slate-400">Assumed Risk per Trade</span>
                <span className="text-cyan-400 font-bold">
                  {useCustomRiskUsd ? `$${calculations.calculatedRiskUsd.toFixed(2)}` : `${riskPercent.toFixed(1)}% (${calculations.calculatedRiskUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)`}
                </span>
              </div>

              {/* Risk Presets */}
              <div className="flex items-center gap-2 mb-2">
                {[0.5, 1.0, 1.5, 2.0, 3.0].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleApplyRiskPreset(p)}
                    className={`flex-1 py-1 rounded text-center border text-[11px] transition-colors ${
                      !useCustomRiskUsd && riskPercent === p
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            {/* Stop Loss & Take Profit Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Stop Loss Input & Quick Distances */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-rose-400" />
                    Stop Loss Price
                  </span>
                  <span className="text-[10px] text-rose-400">
                    {calculations.isValidSl ? `-${calculations.slDistancePct.toFixed(2)}% dist` : 'Invalid SL'}
                  </span>
                </div>
                <input
                  type="number"
                  step="any"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  className={`w-full py-1.5 px-2.5 rounded bg-slate-900 border text-slate-100 focus:outline-none ${
                    calculations.isValidSl ? 'border-slate-700 focus:border-cyan-500' : 'border-rose-500/60'
                  }`}
                  placeholder="Stop price..."
                />
                {/* SL Distance Presets */}
                <div className="flex items-center gap-1 mt-1.5">
                  {[0.8, 1.2, 2.0, 3.5].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleApplySlDistance(pct)}
                      className="flex-1 py-0.5 rounded text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Take Profit Input & Quick R:R */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
                    <Target className="w-3 h-3 text-emerald-400" />
                    Take Profit Price
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    {calculations.isValidTp ? `R:R 1:${calculations.rrRatio.toFixed(2)}` : 'Optional'}
                  </span>
                </div>
                <input
                  type="number"
                  step="any"
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Target price..."
                />
                {/* R:R Presets */}
                <div className="flex items-center gap-1 mt-1.5">
                  {[1.5, 2.0, 3.0, 4.0].map((rr) => (
                    <button
                      key={rr}
                      type="button"
                      onClick={() => handleApplyRrPreset(rr)}
                      className="flex-1 py-0.5 rounded text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                    >
                      1:{rr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Position Metrics 4-Box Output */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-400 block">Optimal Lot Size</span>
                <span className="text-sm font-bold text-cyan-300 block mt-0.5">
                  {calculations.finalLot > 0
                    ? `${calculations.finalLot.toFixed(selectedPair.includes('BTC') ? 3 : 2)}`
                    : '---'}
                </span>
                <span className="text-[9px] text-slate-500">{selectedPair.split('/')[0]}</span>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-400 block">Position Value</span>
                <span className="text-sm font-bold text-slate-100 block mt-0.5">
                  ${calculations.notionalValueUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[9px] text-slate-500">Notional Exposure</span>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-400 block">Max Risk (at SL)</span>
                <span className="text-sm font-bold text-rose-400 block mt-0.5">
                  -${calculations.calculatedRiskUsd.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-slate-500">100% of defined risk</span>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-400 block">Expected Reward</span>
                <span className="text-sm font-bold text-emerald-400 block mt-0.5">
                  {calculations.isValidTp
                    ? `+$${calculations.expectedProfitUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                    : '---'}
                </span>
                <span className="text-[9px] text-emerald-400/80">
                  {calculations.isValidTp ? `1:${calculations.rrRatio.toFixed(2)} R:R` : 'No TP set'}
                </span>
              </div>
            </div>
          </div>

          {/* Validation Banner if SL is invalid */}
          {!calculations.isValidSl && (
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {side === 'BUY'
                  ? 'Stop Loss must be lower than the Entry Price for a BUY order.'
                  : 'Stop Loss must be higher than the Entry Price for a SELL order.'}
              </span>
            </div>
          )}

          {/* Execution Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!calculations.isValidSl || calculations.finalLot <= 0}
              className={`w-full py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                side === 'BUY'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40'
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-950/40'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>
                {orderType} {side} //{' '}
                {calculations.finalLot > 0
                  ? `${calculations.finalLot.toFixed(selectedPair.includes('BTC') ? 3 : 2)} ${selectedPair.split('/')[0]} (~$${calculations.notionalValueUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })})`
                  : 'Specify Valid Stop Loss'}
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
