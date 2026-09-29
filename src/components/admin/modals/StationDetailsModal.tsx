import React from 'react';
import { useApp } from '../../../context/AppContext';
import { GasStation, FuelTypeCode, StationInventory } from '../../../types';
import {
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Fuel,
  Star,
  ShieldCheck,
  Truck,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  station: GasStation | null;
  onOpenRestockModal: (stationId: string, fuelCode: FuelTypeCode) => void;
  onOpenEditModal: (station: GasStation) => void;
}

export const StationDetailsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  station,
  onOpenRestockModal,
  onOpenEditModal,
}) => {
  const { orders, toggleStationStatus } = useApp();

  if (!isOpen || !station) return null;

  const stationOrders = orders.filter((o) => o.gasStationId === station.id);
  const deliveredCount = stationOrders.filter((o) => o.status === 'DELIVERED').length;
  const pendingCount = stationOrders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PROCESSING' || o.status === 'OUT_FOR_DELIVERY'
  ).length;
  const totalRevenue = stationOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black font-mono">
              {station.codeName || 'HUB'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{station.name}</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    station.status === 'ACTIVE'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : station.status === 'PENDING_APPROVAL'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {station.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-500" /> {station.address}, {station.city}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Total Orders Logged</span>
              <span className="text-lg font-extrabold text-white font-mono">{stationOrders.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-emerald-400 block">Delivered Orders</span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono">{deliveredCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-amber-400 block">Active / In-Flight</span>
              <span className="text-lg font-extrabold text-amber-400 font-mono">{pendingCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-teal-400 block">Station Revenue</span>
              <span className="text-lg font-extrabold text-teal-400 font-mono">₹{totalRevenue.toLocaleString()}</span>
            </div>
          </div>

          {/* Manager & Operational Details */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-amber-400" /> Manager & Operations Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Manager:</span>
                  <span className="font-bold text-white">{station.managerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-mono text-white">{station.contactNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-300">{station.email}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Coverage Radius:</span>
                  <span className="font-bold text-emerald-400 font-mono">{station.coverageRadiusKm} KM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GPS Coordinates:</span>
                  <span className="font-mono text-slate-400 text-[11px]">{station.coordinates.lat.toFixed(4)}, {station.coordinates.lng.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Rating:</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" /> {station.rating} ({station.totalRatingsCount} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Underground Fuel Tank Levels */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Fuel className="w-3.5 h-3.5 text-amber-400" /> Underground Tank Stock Inventory
              </h3>
              <span className="text-[11px] text-slate-500">Real-time Level Sensors</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.entries(station.inventory) as [FuelTypeCode, StationInventory][]).map(([code, inv]) => {
                const percent = Math.round((inv.availableLitres / inv.capacityLitres) * 100);
                const isLow = inv.availableLitres <= inv.lowStockThreshold;
                const isCritical = inv.availableLitres <= (inv.criticalThreshold || 50);

                return (
                  <div key={code} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{code.replace(/_/g, ' ')}</span>
                        {isCritical ? (
                          <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded font-black">
                            CRITICAL
                          </span>
                        ) : isLow ? (
                          <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-black">
                            LOW
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-black">
                            NORMAL
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenRestockModal(station.id, code);
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        + Refill Tank
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>Available: <strong className="text-white">{inv.availableLitres.toLocaleString()} L</strong></span>
                      <span>Cap: {inv.capacityLitres.toLocaleString()} L ({percent}%)</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCritical
                            ? 'bg-rose-500'
                            : isLow
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => toggleStationStatus(station.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                station.status === 'ACTIVE'
                  ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
              }`}
            >
              {station.status === 'ACTIVE' ? 'Disable / Pause Station' : 'Enable Station Dispatching'}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenEditModal(station);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Edit Station Details
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
