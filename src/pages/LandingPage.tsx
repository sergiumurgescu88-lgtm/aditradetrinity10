import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Shield,
  Activity,
  Layers,
  Cpu,
  ArrowRight,
  Lock,
  Server,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Standby');

  const handleAccessTerminal = () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setProgress(15);
    setStatusMessage('Establishing TLS 1.3 tunnel to Frankfurt-Cluster-09...');

    setTimeout(() => {
      setProgress(55);
      setStatusMessage('Authenticating Risk Sentinel & L3 Low-Latency Router...');
    }, 600);

    setTimeout(() => {
      setProgress(85);
      setStatusMessage('Synchronizing Multi-Engine State & Orderbooks...');
    }, 1300);

    setTimeout(() => {
      setProgress(100);
      setStatusMessage('Handshake verified. Access granted.');
    }, 1800);

    setTimeout(() => {
      navigate('/dashboard');
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-300 relative overflow-hidden flex flex-col justify-between">
      {/* Background Radial Gradients & Matrix Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(16,185,129,0.12),rgba(255,255,255,0))]" />
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Navigation Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-slate-300 font-bold">
            HERMES TRINITY // GATEWAY
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Node: Frankfurt-Cluster-09
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-slate-500">
            <Lock className="w-3 h-3 text-cyan-400" />
            TLS 1.3 Verified
          </span>
        </div>
      </header>

      {/* Main Hero & Terminal Access Center */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center text-center">
        {/* Animated Hermes Hologram Core Logo */}
        <div className="relative mb-6 sm:mb-8 flex items-center justify-center scale-75 sm:scale-100 transition-transform">
          {/* Outer Pulsing Radar Rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            className="w-36 h-36 rounded-full border border-dashed border-cyan-500/30 absolute"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="w-28 h-28 rounded-full border border-emerald-500/30 absolute"
          />

          {/* Central Hexagon Shield Core */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-950 via-slate-900 to-emerald-950 border border-cyan-400/50 shadow-2xl shadow-cyan-500/25 flex items-center justify-center relative overflow-hidden"
          >
            {/* Laser scanning beam */}
            <motion.div
              animate={{ y: [-30, 30, -30] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75"
            />
            <Zap className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
          </motion.div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-3 mb-6 max-w-2xl px-2">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] sm:text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HERMES TRINITY CORE v4.8 // INSTITUTIONAL</span>
          </div>

          <h1 className="text-2xl sm:text-5xl font-black uppercase tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Algorithmic Trading & Multi-Engine Mesh
          </h1>

          <p className="text-xs sm:text-base text-slate-400 font-sans leading-relaxed">
            Autonomous multi-asset quantitative execution center. Alpha trend capture,
            triangular arbitrage, high-frequency market making, and Sovereign Sergiu Neural Core.
          </p>
        </div>

        {/* Feature Micro-Badges */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-lg w-full mb-6 sm:mb-8 font-mono text-xs">
          <div className="p-2 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center">
            <span className="text-slate-400 text-[9px] sm:text-[10px] uppercase">Latency</span>
            <span className="text-cyan-400 font-bold text-xs sm:text-base mt-0.5">&lt; 14ms</span>
            <span className="text-slate-500 text-[8px] sm:text-[9px]">L3 Frankfurt</span>
          </div>

          <div className="p-2 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center">
            <span className="text-slate-400 text-[9px] sm:text-[10px] uppercase">Units</span>
            <span className="text-emerald-400 font-bold text-xs sm:text-base mt-0.5">5 Engines</span>
            <span className="text-slate-500 text-[8px] sm:text-[9px]">Multi-Model</span>
          </div>

          <div className="p-2 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center">
            <span className="text-slate-400 text-[9px] sm:text-[10px] uppercase">Sentinel</span>
            <span className="text-indigo-400 font-bold text-xs sm:text-base mt-0.5">100% Guard</span>
            <span className="text-slate-500 text-[8px] sm:text-[9px]">Auto Circuit</span>
          </div>
        </div>

        {/* Central Access Button & Connection Progress Animation */}
        <div className="w-full max-w-sm px-2">
          {!isConnecting ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleAccessTerminal}
              className="w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-slate-950 font-black font-mono tracking-wide text-xs sm:text-base uppercase shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 sm:gap-3 border border-cyan-300/40"
            >
              <span>AM Team - LIVE Dashboard</span>
              <ArrowRight className="w-4 h-4 sm:w-5 h-5 shrink-0" />
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl space-y-3 font-mono text-left"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Activity className="w-4 h-4 animate-spin" />
                  AUTHENTICATING SESSION
                </span>
                <span className="text-slate-300 font-bold">{progress}%</span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                />
              </div>

              <p className="text-[11px] text-slate-400 animate-pulse">
                {statusMessage}
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer Details */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 border-t border-slate-900 font-mono text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>HERMES TRINITY GATEWAY • ALL CLUSTERS OPERATIONAL</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>AES-256 Mesh</span>
          <span>Sergiu Murgescu Sovereign Desk</span>
          <span>© 2026 Hermes Core</span>
        </div>
      </footer>
    </div>
  );
}
