import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FuelTypeCode, StationInventory } from '../../types';
import { Package, RefreshCw, AlertTriangle, Filter, CheckCircle2, Flame } from 'lucide-react';

interface Props {
  onOpenRestockModal: (stationId: string, fuelCode: FuelTypeCode) => void;
}

export const AdminInventoryMonitor: React.FC<Props> = ({ onOpenRestockModal }) => {
  const { stations } = useApp();
  const [filterType, setFilterType] = useState<string>('ALL');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-400" />
            Central Underground Storage Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry of depot tank levels, safety thresholds, and replenishment schedules
          </p>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium self-start sm:self-auto"
        >
          <option value="ALL">All Tanks</option>
          <option value="LOW">Low Stock Warnings Only</option>
          <option value="PETROL">Petrol Tanks Only</option>
          <option value="DIESEL">Diesel Tanks Only</option>
        </select>
      </div>

      {/* Grid of Station Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stations.map((station) => (
          <div
            key={station.id}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {station.codeName || 'HUB'}
                </span>
                <h3 className="text-base font-bold text-white">{station.name}</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{station.city}</span>
            </div>

            <div className="space-y-3 pt-1">
              {(Object.entries(station.inventory) as [FuelTypeCode, StationInventory][]).map(([code, inv]) => {
                const fuelCode = code;
                const percent = Math.round((inv.availableLitres / inv.capacityLitres) * 100);
                const isLow = inv.availableLitres <= inv.lowStockThreshold;
                const isCritical = inv.availableLitres <= (inv.criticalThreshold || 50);
                const isOut = inv.availableLitres === 0;

                if (filterType === 'LOW' && !isLow && !isCritical && !isOut) return null;
                if (filterType === 'PETROL' && fuelCode !== 'PETROL') return null;
                if (filterType === 'DIESEL' && fuelCode !== 'DIESEL') return null;

                return (
                  <div
                    key={code}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isOut
                        ? 'bg-rose-950/30 border-rose-800/80'
                        : isCritical
                        ? 'bg-rose-950/20 border-rose-600/60'
                        : isLow
                        ? 'bg-amber-950/20 border-amber-600/60'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{code.replace(/_/g, ' ')}</span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                            isOut
                              ? 'bg-rose-900 text-rose-100 border-rose-700'
                              : isCritical
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : isLow
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {isOut ? 'OUT OF STOCK' : isCritical ? 'CRITICAL' : isLow ? 'LOW STOCK' : 'HEALTHY'}
                        </span>
                      </div>

                      <button
                        onClick={() => onOpenRestockModal(station.id, fuelCode)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        ⚡ Restock
                      </button>
                    </div>

                    <div className="flex items-baseline justify-between text-xs text-slate-400 font-mono mb-2">
                      <span>
                        Available: <strong className="text-white font-bold">{inv.availableLitres.toLocaleString()} L</strong>
                      </span>
                      <span>
                        Capacity: {inv.capacityLitres.toLocaleString()} L ({percent}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOut || isCritical
                            ? 'bg-rose-500'
                            : isLow
                            ? 'bg-amber-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
