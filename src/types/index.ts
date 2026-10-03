/**
 * HERMES TRINITY CORE - Architectural Type Definitions
 * Strict TypeScript types for Trading Engines, Orders, Real-time Feeds, and System State.
 */

export type TrinityEngineType = 'ALPHA' | 'BETA' | 'GAMMA' | 'EPSILON' | 'SERGIU';

export type BotStatus = 
  | 'ACTIVE' 
  | 'IDLE' 
  | 'PAUSED' 
  | 'CALIBRATING' 
  | 'ERROR' 
  | 'EMERGENCY_STOPPED';

export type RiskProfile = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'ULTRA_HFT';

export interface BotMetrics {
  pnl24hUsd: number;
  pnl24hPercent: number;
  totalPnlUsd: number;
  totalPnlPercent: number;
  winRate: number; // 0 to 100
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  currentDrawdownPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgExecutionLatencyMs: number;
  currentExposureUsd: number;
  allocatedCapitalUsd: number;
  uptimeSeconds: number;
  lastTradeTimestamp: number;
}

export interface BotConfig {
  maxSlippagePercent: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  leverage: number;
  rebalanceIntervalSec: number;
  riskProfile: RiskProfile;
  activePairs: string[];
  maxDrawdownLimitPercent: number;
  autoPauseEnabled: boolean;
  autoPauseThreshold: number;
}

export type WhaleSignal = 'ACCUMULATION' | 'NEUTRAL' | 'DISTRIBUTION' | 'SPIKE_DETECTED';
export type AdxStrength = 'STRONG' | 'MODERATE' | 'WEAK';

export interface Bot {
  id: string;
  name: string;
  engine: TrinityEngineType;
  description: string;
  status: BotStatus;
  version: string;
  baseAsset: string;
  quoteAsset: string;
  metrics: BotMetrics;
  config: BotConfig;
  adx: number;
  adxTrend: AdxStrength;
  whaleActivity: WhaleSignal;
  whaleVolumeUsd: number;
  lastSignal?: {
    action: 'LONG' | 'SHORT' | 'HOLD' | 'REBALANCE';
    confidence: number;
    timestamp: number;
    price: number;
  };
}

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'TWAP' | 'ICEBERG';
export type OrderStatus = 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED' | 'PENDING';

export interface TradeHistory {
  id: string;
  botId: string;
  botName: string;
  engine: TrinityEngineType;
  pair: string;
  side: OrderSide;
  type: OrderType;
  amount: number;
  executionPrice: number;
  targetPrice?: number;
  stopPrice?: number;
  totalValueUsd: number;
  feeUsd: number;
  pnlUsd?: number;
  pnlPercentage?: number;
  status: OrderStatus;
  timestamp: number;
  latencyMs: number;
  txHash?: string;
  executionVenue: string;
}

export interface MarketTicker {
  pair: string;
  price: number;
  change24h: number;
  volume24hUsd: number;
  high24h: number;
  low24h: number;
  bidPrice: number;
  askPrice: number;
  spread: number;
  lastUpdated: number;
}

export interface TrinitySignal {
  id: string;
  botId: string;
  engine: TrinityEngineType;
  pair: string;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number; // 0 - 100
  indicatorName: string;
  timestamp: number;
  entryPrice: number;
  targetPrice: number;
  invalidationPrice: number;
}

export interface PerformanceDataPoint {
  timestamp: number;
  portfolioValue: number;
  dailyPnl: number;
  benchmarkValue: number;
  drawdownPercent: number;
}

export interface SystemHealth {
  coreEngine: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  wsGateway: 'HEALTHY' | 'DEGRADED' | 'DISCONNECTED';
  executionRouter: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  riskSentinel: 'ONLINE' | 'TRIGGERED' | 'STANDBY';
  nodeCluster: string;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  networkLatencyMs: number;
  activeSockets: number;
  lastSyncTimestamp: number;
}

export interface DashboardData {
  totalPortfolioValueUsd: number;
  initialBalanceUsd: number;
  totalPnlUsd: number;
  totalPnlPercent: number;
  dailyPnlUsd: number;
  dailyPnlPercent: number;
  winRate: number;
  activeBotsCount: number;
  totalBotsCount: number;
  totalTrades24h: number;
  overallSharpeRatio: number;
  maxDrawdownPercent: number;
  systemLatencyMs: number;
  gasOrFeesSpentUsd: number;
  bots: Bot[];
  recentTrades: TradeHistory[];
  tickers: Record<string, MarketTicker>;
  activeSignals: TrinitySignal[];
  performanceHistory: PerformanceDataPoint[];
  systemHealth: SystemHealth;
}

export interface SystemLogEntry {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARN' | 'EXEC' | 'RISK' | 'DEBUG';
  subsystem: string;
  message: string;
  meta?: Record<string, any>;
}

export interface ToastNotification {
  id: string;
  type: 'ALERT' | 'INFO' | 'SUCCESS';
  title: string;
  message: string;
  timestamp: number;
  durationMs?: number;
}

export type ConnectionStatus = 
  | 'INITIALIZING' 
  | 'CONNECTING' 
  | 'CONNECTED' 
  | 'RECONNECTING' 
  | 'DISCONNECTED' 
  | 'ERROR';

export interface HermesState {
  connectionStatus: ConnectionStatus;
  reconnectAttempts: number;
  latencyMs: number;
  lastHeartbeat: number | null;
  isLive: boolean;
  error: string | null;
  dashboard: DashboardData;
  selectedBotId: string | null;
  filterPair: string | null;
  filterSide: 'ALL' | OrderSide;
  filterEngine: 'ALL' | TrinityEngineType;
  emergencyStopArmed: boolean;
}

// WebSocket Protocol Interfaces
export type HermesWsAction = 
  | 'INIT_STATE'
  | 'TICKER_TICK'
  | 'BOT_STATUS_CHANGE'
  | 'TRADE_EXECUTED'
  | 'SIGNAL_TRIGGERED'
  | 'PORTFOLIO_UPDATE'
  | 'SYSTEM_HEALTH_UPDATE'
  | 'ERROR_ALERT'
  | 'PONG';

export interface HermesWsServerMessage {
  action: HermesWsAction;
  timestamp: number;
  payload: any;
}

export type HermesWsClientCommand =
  | 'SUBSCRIBE'
  | 'UNSUBSCRIBE'
  | 'START_BOT'
  | 'PAUSE_BOT'
  | 'RESTART_BOT'
  | 'EMERGENCY_STOP'
  | 'PING'
  | 'SET_RISK_PROFILE';

export interface HermesWsClientMessage {
  command: HermesWsClientCommand;
  timestamp: number;
  payload?: any;
}
