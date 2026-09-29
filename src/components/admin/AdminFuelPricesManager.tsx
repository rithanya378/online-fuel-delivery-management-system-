import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, ShieldCheck, Check, AlertCircle, PlusCircle, Fuel, Sliders, Trash2, Edit3 } from 'lucide-react';
import { FuelTypeCode, FuelType } from '../../types';
import { AddFuelTypeModal } from './modals/AddFuelTypeModal';

export const AdminFuelPricesManager: React.FC = () => {
  const { fuelPrices, updateCentralFuelPrice, fuelTypes, updateFuelType, deleteFuelType } = useApp();

  const [isAddFuelOpen, setIsAddFuelOpen] = useState(false);
  const [reason, setReason] = useState('Central daily oil ministry pricing revision');

  // Local prices map for instant editing
  const [localPrices, setLocalPrices] = useState<Record<string, number>>({});
  const [editingFuel, setEditingFuel] = useState<FuelType | null>(null);

  const getPrice = (code: FuelTypeCode) => {
    if (localPrices[code] !== undefined) return localPrices[code];
    return fuelPrices[code]?.pricePerLitre || 100.0;
  };

  const handlePriceChange = (code: FuelTypeCode, val: number) => {
    setLocalPrices((prev) => ({ ...prev, [code]: val }));
  };

  const handleUpdate = (code: FuelTypeCode) => {
    const priceToSet = getPrice(code);
    updateCentralFuelPrice(code, priceToSet, 'Administrator', reason);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Central Fuel Pricing & Catalog Management
          </h1>
          <p className="text-xs text-slate-400">
            Enforce uniform regulatory fuel rates, min/max quantity limits, and catalog items across all stations
          </p>
        </div>

        <button
          onClick={() => setIsAddFuelOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Fuel Product</span>
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold">Operational Hierarchy:</span> Only Central Administrator accounts can modify
          retail prices and delivery tariffs. Gas stations operate strictly in read-only mode regarding pricing.
        </div>
      </div>

      {/* Grid of Fuel Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fuelTypes.map((ft) => {
          const currentPrice = getPrice(ft.code);
          const priceObj = fuelPrices[ft.code];

          return (
            <div
              key={ft.code}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 font-mono uppercase">{ft.code}</span>
                    {ft.octaneOrCetane && (
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                        {ft.octaneOrCetane}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">{ft.name}</h3>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Active Rate: ₹{priceObj?.pricePerLitre?.toFixed(2) || currentPrice.toFixed(2)}/L
                </span>
              </div>

              <p className="text-xs text-slate-400">{ft.description}</p>

              {/* Price Editor & Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Retail Rate (₹/L)</span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.1"
                      value={currentPrice}
                      onChange={(e) => handlePriceChange(ft.code, Number(e.target.value))}
                      className="w-full bg-transparent text-emerald-400 font-mono font-bold text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Min Order (L)</span>
                  <input
                    type="number"
                    value={ft.minOrderQuantity || 5}
                    onChange={(e) => updateFuelType(ft.code, { minOrderQuantity: Number(e.target.value) })}
                    className="w-full bg-transparent text-white font-mono font-bold text-sm focus:outline-none mt-1"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Max Order (L)</span>
                  <input
                    type="number"
                    value={ft.maxOrderQuantity || 3000}
                    onChange={(e) => updateFuelType(ft.code, { maxOrderQuantity: Number(e.target.value) })}
                    className="w-full bg-transparent text-white font-mono font-bold text-sm focus:outline-none mt-1"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2">
                {ft.code !== 'PETROL' && ft.code !== 'DIESEL' && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete ${ft.name} from catalog?`)) {
                        deleteFuelType(ft.code);
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-950 text-rose-400 border border-rose-800/60 text-xs font-bold transition-colors cursor-pointer"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => handleUpdate(ft.code)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-colors cursor-pointer text-center"
                >
                  Set {ft.name.split(' ')[0]} Price (₹{currentPrice.toFixed(2)}/L)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Fuel Modal */}
      <AddFuelTypeModal
        isOpen={isAddFuelOpen}
        onClose={() => setIsAddFuelOpen(false)}
      />
    </div>
  );
};

