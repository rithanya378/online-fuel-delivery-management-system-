import React from 'react';
import { useApp } from '../../context/AppContext';
import { FuelTypeCode, StationInventory } from '../../types';
import { Package, RefreshCw, AlertTriangle, Fuel, ShieldCheck, Lock, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  onOpenRestockModal: (fuelCode: FuelTypeCode) => void;
}

export const GasStationInventory: React.FC<Props> = ({ onOpenRestockModal }) => {
  const { currentStation, fuelPrices } = useApp();

  if (!currentStation) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-amber-400" />
            Underground Storage Tank Telemetry & Stock Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tank level sensors and inventory calibration for <strong>{currentStation.name}</strong>
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">
            Certified Station Hub ID: <strong className="text-white font-mono">{currentStation.id}</strong>
          </span>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Strict Permission Matrix */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Station Role Permissions & Access Control (RBAC)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 font-mono">
            Role: Station Manager
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Allowed Actions Table */}
          <div className="rounded-2xl bg-slate-950 border border-emerald-500/20 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Allowed Station Operations (Inventory Only)</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="pb-2">Fuel Type</th>
                  <th className="pb-2">Current Stock</th>
                  <th className="pb-2 text-right">Update Permission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {(Object.entries(currentStation.inventory) as [FuelTypeCode, StationInventory][]).map(([code, inv]) => (
                  <tr key={code} className="py-2">
                    <td className="py-2 font-medium text-white flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-amber-400" />
                      <span>{code.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="py-2 font-mono text-emerald-400 font-bold">
                      {inv.availableLitres.toLocaleString()} L
                    </td>
                    <td className="py-2 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Allowed (Refill/Gauge)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Strictly Restricted Actions */}
          <div className="rounded-2xl bg-slate-950 border border-rose-500/20 p-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <XCircle className="w-4 h-4" />
              <span>Strictly Prohibited Operations (Central Admin Enforced)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span><strong>Change fuel prices:</strong> Prohibited (Locked to central tariff)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span><strong>Create new fuel types:</strong> Prohibited (Admin only)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span><strong>Modify assigned fuel configuration:</strong> Prohibited</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span><strong>Change customer orders:</strong> Prohibited (User/Admin only)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span><strong>Change amount charged to customers:</strong> Prohibited</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Grid of Tanks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.entries(currentStation.inventory) as [FuelTypeCode, StationInventory][]).map(([code, inv]) => {
          const fuelCode = code;
          const percent = Math.round((inv.availableLitres / inv.capacityLitres) * 100);
          const isLow = inv.availableLitres <= inv.lowStockThreshold;
          const isCritical = inv.availableLitres <= (inv.criticalThreshold || 50);
          const isOut = inv.availableLitres === 0;

          return (
            <div
              key={code}
              className={`p-6 rounded-3xl border shadow-xl space-y-4 transition-all ${
                isOut
                  ? 'bg-rose-950/30 border-rose-800/80'
                  : isCritical
                  ? 'bg-rose-950/20 border-rose-600/60'
                  : isLow
                  ? 'bg-amber-950/20 border-amber-600/60'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 flex items-center justify-center">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{code.replace(/_/g, ' ')}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Last Refilled: {new Date(inv.lastRestocked).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenRestockModal(fuelCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update Stock / Refill</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300 font-mono">
                  <span>
                    Available: <strong className="text-white font-bold">{inv.availableLitres.toLocaleString()} L</strong>
                  </span>
                  <span>
                    Max Capacity: {inv.capacityLitres.toLocaleString()} L ({percent}%)
                  </span>
                </div>

                <div className="w-full h-3.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
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

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                <div>
                  Low Stock Alert Threshold: <strong className="text-amber-400 font-mono">{inv.lowStockThreshold} L</strong>
                </div>
                <div>
                  Critical Cutoff: <strong className="text-rose-400 font-mono">{inv.criticalThreshold || 100} L</strong>
                </div>
              </div>

              {isLow && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Tank is nearing safety reserve limit. Orders exceeding available {inv.availableLitres}L will be blocked by the overbooking engine.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
