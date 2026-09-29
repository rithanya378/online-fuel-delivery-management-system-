import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FuelTypeCode } from '../../types';
import {
  FileText,
  Fuel,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Truck,
  Package,
} from 'lucide-react';

interface Props {
  onOpenRestockModal: (fuelCode: FuelTypeCode) => void;
}

export const GasStationInventoryHistory: React.FC<Props> = ({ onOpenRestockModal }) => {
  const { currentStation, stationInventoryLogs } = useApp();

  const [fuelFilter, setFuelFilter] = useState<'ALL' | FuelTypeCode>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentStation) {
    return (
      <div className="p-8 text-center text-slate-400">
        No active gas station selected.
      </div>
    );
  }

  // Filter logs for this station
  const stationLogs = stationInventoryLogs.filter((log) => log.stationId === currentStation.id);

  const filteredLogs = stationLogs.filter((log) => {
    if (fuelFilter !== 'ALL' && log.fuelTypeCode !== fuelFilter) return false;
    if (actionFilter !== 'ALL' && log.actionType !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = log.referenceNumber?.toLowerCase().includes(q);
      const matchNotes = log.notes?.toLowerCase().includes(q);
      const matchOperator = log.performedBy.toLowerCase().includes(q);
      const matchFuel = log.fuelTypeName.toLowerCase().includes(q);
      if (!matchRef && !matchNotes && !matchOperator && !matchFuel) return false;
    }
    return true;
  });

  // Calculate metrics
  const totalRestocked = stationLogs
    .filter((l) => l.actionType === 'RESTOCK')
    .reduce((acc, l) => acc + l.quantityLitres, 0);

  const totalDispatched = stationLogs
    .filter((l) => l.actionType === 'DISPATCH')
    .reduce((acc, l) => acc + l.quantityLitres, 0);

  const totalCalibrations = stationLogs.filter((l) => l.actionType === 'CALIBRATION').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Quick Action */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Underground Inventory History & Audit Log</h1>
            <p className="text-xs text-slate-400">Tanker discharge, customer dispatch, and ATG telemetry history</p>
          </div>
        </div>

        <button
          onClick={() => onOpenRestockModal('PETROL')}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restock / Calibrate Tank</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Refinery Tanker Refills</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            +{totalRestocked.toLocaleString()} <span className="text-xs text-slate-400 font-normal">Litres</span>
          </div>
          <p className="text-[11px] text-slate-500">Total volume added from depot tankers</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Bowser Dispatches</span>
            <ArrowUpRight className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono">
            -{totalDispatched.toLocaleString()} <span className="text-xs text-slate-400 font-normal">Litres</span>
          </div>
          <p className="text-[11px] text-slate-500">Fulfilled to customer delivery orders</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dip Calibrations & Audits</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">{totalCalibrations} Events</div>
          <p className="text-[11px] text-slate-500">ATG sensor and physical dip stick checks</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by invoice #, order #, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={fuelFilter}
            onChange={(e) => setFuelFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Fuel Types</option>
            <option value="PETROL">Petrol (RON 91/95)</option>
            <option value="DIESEL">Diesel (BS-VI)</option>
            <option value="PREMIUM_PETROL">Premium Petrol</option>
            <option value="BIO_DIESEL">Bio-Diesel</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Action Types</option>
            <option value="RESTOCK">Tanker Refill (RESTOCK)</option>
            <option value="DISPATCH">Customer Dispatch (DISPATCH)</option>
            <option value="CALIBRATION">Dip Calibration</option>
            <option value="ADJUSTMENT">Manual Adjustment</option>
          </select>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Fuel Type</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Volume Delta</th>
                <th className="py-3.5 px-4">Resulting Available</th>
                <th className="py-3.5 px-4">Challan / Ref #</th>
                <th className="py-3.5 px-4">Operator / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No inventory history logs found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isPositive = log.actionType === 'RESTOCK';
                  const isNegative = log.actionType === 'DISPATCH';

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <Fuel className="w-3.5 h-3.5 text-amber-400" />
                          {log.fuelTypeName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                            log.actionType === 'RESTOCK'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : log.actionType === 'DISPATCH'
                              ? 'bg-blue-950 text-blue-300 border-blue-800'
                              : log.actionType === 'CALIBRATION'
                              ? 'bg-purple-950 text-purple-300 border-purple-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}
                        >
                          {log.actionType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold">
                        {isPositive && (
                          <span className="text-emerald-400">+{log.quantityLitres.toLocaleString()} L</span>
                        )}
                        {isNegative && (
                          <span className="text-blue-400">-{log.quantityLitres.toLocaleString()} L</span>
                        )}
                        {!isPositive && !isNegative && (
                          <span className="text-slate-400">±{log.quantityLitres.toLocaleString()} L</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-white font-bold">
                        {log.newAvailableLitres.toLocaleString()} L
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                        {log.referenceNumber || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                        <span className="text-slate-300 font-semibold">{log.performedBy}: </span>
                        {log.notes || 'Routine inventory event.'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
