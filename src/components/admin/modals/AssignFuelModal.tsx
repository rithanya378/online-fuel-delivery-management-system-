import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { GasStation, FuelTypeCode } from '../../../types';
import { X, Fuel, Check, Building2, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  station: GasStation | null;
}

export const AssignFuelModal: React.FC<Props> = ({ isOpen, onClose, station }) => {
  const { fuelTypes, assignFuelTypesToStation } = useApp();
  const [selectedFuels, setSelectedFuels] = useState<FuelTypeCode[]>([]);

  useEffect(() => {
    if (station) {
      setSelectedFuels(station.supportedFuels || []);
    }
  }, [station]);

  if (!isOpen || !station) return null;

  const toggleFuel = (code: FuelTypeCode) => {
    setSelectedFuels((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSave = () => {
    assignFuelTypesToStation(station.id, selectedFuels);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl space-y-6">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Assign Fuel Types</h2>
              <p className="text-xs text-slate-400">Configure supported fuel grades for {station.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-xs font-bold text-white">{station.name}</span>
              <span className="text-[10px] text-slate-400 block">{station.address}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 block">Available Fuel Products</label>
            <div className="space-y-2">
              {fuelTypes.map((ft) => {
                const isSelected = selectedFuels.includes(ft.code);
                return (
                  <div
                    key={ft.code}
                    onClick={() => toggleFuel(ft.code)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{ft.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {ft.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{ft.description}</p>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-amber-500 text-slate-950' : 'border border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Fuel Assignments</span>
          </button>
        </div>
      </div>
    </div>
  );
};
