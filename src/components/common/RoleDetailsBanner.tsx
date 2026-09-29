import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Building2,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Clock,
  LogOut,
  Sparkles,
  Layers,
  Fuel,
  Activity,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const RoleDetailsBanner: React.FC = () => {
  const {
    currentRole,
    currentUser,
    currentStation,
    stations,
    orders,
    logout,
    setActiveView,
    setAdminTab,
    setStationTab,
    setUserTab,
  } = useApp();

  const userOrders = orders.filter((o) => o.userId === currentUser.id);
  const stationOrders = orders.filter((o) => o.gasStationId === currentStation?.id);
  const activeStationOrders = stationOrders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY'].includes(o.status)
  );

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
      {/* Ambient background glow matching role */}
      <div
        className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${
          currentRole === 'admin'
            ? 'bg-emerald-500'
            : currentRole === 'station'
            ? 'bg-amber-500'
            : 'bg-blue-500'
        }`}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Role Avatar, Name, Email, Phone, and Credentials */}
        <div className="flex items-start sm:items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${
              currentRole === 'admin'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 shadow-emerald-950/50'
                : currentRole === 'station'
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-400 shadow-amber-950/50'
                : 'bg-blue-950/80 border-blue-500/50 text-blue-400 shadow-blue-950/50'
            }`}
          >
            {currentRole === 'admin' && <ShieldCheck className="w-7 h-7" />}
            {currentRole === 'station' && <Building2 className="w-7 h-7" />}
            {currentRole === 'user' && <UserIcon className="w-7 h-7" />}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${
                  currentRole === 'admin'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : currentRole === 'station'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                }`}
              >
                {currentRole === 'admin'
                  ? 'Administrator Profile'
                  : currentRole === 'station'
                  ? 'Gas Station Facility'
                  : currentUser.userType === 'FLEET_OPERATOR'
                  ? 'Fleet Enterprise Account'
                  : 'Customer Account'}
              </span>

              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Session Active & Authenticated
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              {currentRole === 'admin' && 'Central Command Administrator'}
              {currentRole === 'station' && (currentStation?.name || 'Gas Station Manager')}
              {currentRole === 'user' && currentUser.name}
            </h1>

            {/* Credential Details Pills */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-300">
                  {currentRole === 'admin' && 'admin@fuelflow.com'}
                  {currentRole === 'station' && (currentStation?.email || 'station@fuelflow.com')}
                  {currentRole === 'user' && currentUser.email}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-300">
                  {currentRole === 'admin' && '+91 1800-555-FUEL'}
                  {currentRole === 'station' && (currentStation?.contactNumber || '+91 98765 43210')}
                  {currentRole === 'user' && currentUser.phone}
                </span>
              </div>

              {currentRole === 'station' && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-slate-300 truncate max-w-xs">{currentStation?.address}</span>
                </div>
              )}

              {currentRole === 'user' && currentUser.addresses?.[0] && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-slate-300 truncate max-w-xs">
                    {currentUser.addresses[0].title}: {currentUser.addresses[0].street}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Key Stats & Quick Sign-out / Switch Action */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
            {currentRole === 'admin' && (
              <>
                <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Stations</span>
                  <span className="text-sm font-bold text-emerald-400">{stations.length} Active</span>
                </div>
                <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Orders</span>
                  <span className="text-sm font-bold text-white">{orders.length} Total</span>
                </div>
              </>
            )}

            {currentRole === 'station' && (
              <>
                <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Station Code</span>
                  <span className="text-sm font-bold text-amber-400">{currentStation?.codeName || 'STN-01'}</span>
                </div>
                <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Open Deliveries</span>
                  <span className="text-sm font-bold text-white">{activeStationOrders.length} In Queue</span>
                </div>
              </>
            )}

            {currentRole === 'user' && (
              <>
                <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Saved Places</span>
                  <span className="text-sm font-bold text-blue-400">{currentUser.addresses?.length || 1} Addr</span>
                </div>
                <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">My Orders</span>
                  <span className="text-sm font-bold text-white">{userOrders.length} Orders</span>
                </div>
              </>
            )}
          </div>

          {/* Sign Out / Switch User Button */}
          <button
            id="btn-header-signout"
            onClick={logout}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer ml-auto sm:ml-0"
            title="Sign out and return to the Brand Welcome & Login Screen"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
