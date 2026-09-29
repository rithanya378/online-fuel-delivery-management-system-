import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Fuel,
  Flame,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
  FileCode,
  Lock,
  Zap,
} from 'lucide-react';

export const BrandLogoLanding: React.FC = () => {
  const { setAuthScreen, setActiveView, stations } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 flex flex-col justify-between relative overflow-hidden">
      {/* Background dynamic glowing energetic gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Top Brand Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 p-0.5 shadow-xl shadow-emerald-950/60">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <Fuel className="w-6 h-6 text-emerald-400" />
              <Flame className="w-3.5 h-3.5 text-amber-400 absolute top-1 right-1 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-mono">
                Fuel<span className="text-emerald-400">Flow</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                v2.4 Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400">On-Demand Fuel Logistics & Fleet Delivery</p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('specification')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
            <span>SRS Docs</span>
          </button>
          <button
            onClick={() => setAuthScreen('login')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* Main Logo & Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-16 flex flex-col items-center text-center my-auto">
        {/* Animated Main Logo Display */}
        <div className="relative mb-6 group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
          
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 flex flex-col items-center justify-center p-4 shadow-2xl shadow-emerald-950/80">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Fuel className="w-9 h-9 sm:w-12 sm:h-12 text-emerald-400 drop-shadow" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-bounce">
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-2">
              Energy Network
            </span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="max-w-3xl space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Doorstep Fuel Delivery • Smart Station Dispatch • Fleet Management</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Next-Generation <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              On-Demand Fuel Delivery
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate fueling station queues with scheduled & instant fuel delivery for individual consumers,
            commercial fleets, and emergency operations with real-time GPS telemetry and multi-station inventory monitoring.
          </p>
        </div>

        {/* Central Sign In Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-10 w-full max-w-md">
          <button
            id="btn-landing-signin"
            onClick={() => setAuthScreen('login')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-950/60 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Enter Email & Password to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Live Metrics Ticker Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl">
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm text-left">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Building2 className="w-4 h-4" />
              <span className="text-xs font-semibold">Active Hubs</span>
            </div>
            <div className="text-xl font-bold text-white">{stations.length} Stations</div>
            <div className="text-[11px] text-slate-500">Metro City Area Coverage</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm text-left">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-semibold">Dispatch Speed</span>
            </div>
            <div className="text-xl font-bold text-white">&lt; 30 Mins</div>
            <div className="text-[11px] text-slate-500">Fast Doorstep Delivery</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm text-left">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Fuel className="w-4 h-4" />
              <span className="text-xs font-semibold">Fuel Types</span>
            </div>
            <div className="text-xl font-bold text-white">4 Blends</div>
            <div className="text-[11px] text-slate-500">Petrol, Diesel, Speed+, Bio-B20</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm text-left">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold">Compliance</span>
            </div>
            <div className="text-xl font-bold text-white">100% Certified</div>
            <div className="text-[11px] text-slate-500">PESO & Weight Standards</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4 text-emerald-500" />
          <span>FuelFlow Energy Logistics Platform • ISO 9001 & PESO Compliant</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView('specification')}
            className="hover:text-slate-300 underline cursor-pointer"
          >
            System Requirements (SRS)
          </button>
          <span>•</span>
          <button
            onClick={() => setAuthScreen('login')}
            className="hover:text-emerald-400 font-semibold cursor-pointer"
          >
            Secure Login
          </button>
        </div>
      </footer>
    </div>
  );
};
