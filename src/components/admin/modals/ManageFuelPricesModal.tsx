import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { FuelTypeCode } from '../../../types';
import { DollarSign, X, Check, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageFuelPricesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { fuelPrices, updateCentralFuelPrice, fuelTypes } = useApp();

  const [petrolPrice, setPetrolPrice] = useState(fuelPrices.PETROL?.pricePerLitre || 105.0);
  const [dieselPrice, setDieselPrice] = useState(fuelPrices.DIESEL?.pricePerLitre || 92.0);
  const [premiumPrice, setPremiumPrice] = useState(fuelPrices.PREMIUM_PETROL?.pricePerLitre || 115.0);
  const [bioDieselPrice, setBioDieselPrice] = useState(fuelPrices.BIO_DIESEL?.pricePerLitre || 98.0);
  const [reason, setReason] = useState('Central daily oil ministry pricing revision');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCentralFuelPrice('PETROL', Number(petrolPrice), 'Administrator', reason);
    updateCentralFuelPrice('DIESEL', Number(dieselPrice), 'Administrator', reason);
    updateCentralFuelPrice('PREMIUM_PETROL', Number(premiumPrice), 'Administrator', reason);
    updateCentralFuelPrice('BIO_DIESEL', Number(bioDieselPrice), 'Administrator', reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Central Fuel Price Management</h3>
              <p className="text-[11px] text-slate-400">Admin-controlled rates propagated network-wide</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold">Strict Authority Rule:</span> Fuel prices can only be modified centrally by
              Admin. Gas Station operators cannot alter these rates.
            </div>
          </div>

          <div className="space-y-3">
            {/* Petrol */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Unleaded Petrol</span>
                <span className="text-[10px] text-slate-400">Standard 91/95 RON</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.1"
                  min="50"
                  max="300"
                  value={petrolPrice}
                  onChange={(e) => setPetrolPrice(Number(e.target.value))}
                  className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 text-right"
                />
                <span className="text-xs text-slate-500">/ Litre</span>
              </div>
            </div>

            {/* Diesel */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Commercial Diesel</span>
                <span className="text-[10px] text-slate-400">BS-VI / Euro 6 Low Sulfur</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.1"
                  min="50"
                  max="300"
                  value={dieselPrice}
                  onChange={(e) => setDieselPrice(Number(e.target.value))}
                  className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 text-right"
                />
                <span className="text-xs text-slate-500">/ Litre</span>
              </div>
            </div>

            {/* Premium Petrol */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Speed Plus 98 Petrol</span>
                <span className="text-[10px] text-slate-400">High Octane Sport Blend</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.1"
                  min="50"
                  max="300"
                  value={premiumPrice}
                  onChange={(e) => setPremiumPrice(Number(e.target.value))}
                  className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 text-right"
                />
                <span className="text-xs text-slate-500">/ Litre</span>
              </div>
            </div>

            {/* Bio Diesel */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Eco-B20 Biodiesel</span>
                <span className="text-[10px] text-slate-400">Renewable Low-Carbon Blend</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.1"
                  min="50"
                  max="300"
                  value={bioDieselPrice}
                  onChange={(e) => setBioDieselPrice(Number(e.target.value))}
                  className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 text-right"
                />
                <span className="text-xs text-slate-500">/ Litre</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Pricing Change Audit Note</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Daily market index adjustment"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-colors cursor-pointer"
            >
              Apply Central Prices
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
