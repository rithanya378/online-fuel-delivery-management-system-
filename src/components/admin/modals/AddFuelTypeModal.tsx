import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { FuelTypeCode } from '../../../types';
import { X, Fuel, PlusCircle, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFuelTypeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addFuelType, updateCentralFuelPrice } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [octaneOrCetane, setOctaneOrCetane] = useState('');
  const [density, setDensity] = useState('0.75 kg/L');
  const [initialPrice, setInitialPrice] = useState(105.0);
  const [minOrderQuantity, setMinOrderQuantity] = useState(5);
  const [maxOrderQuantity, setMaxOrderQuantity] = useState(3000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const formattedCode = code.toUpperCase().replace(/\s+/g, '_') as FuelTypeCode;

    addFuelType({
      code: formattedCode,
      name,
      description: description || `${name} automotive fuel product`,
      octaneOrCetane: octaneOrCetane || 'Standard Rating',
      density: density || '0.75 kg/L',
      minOrderQuantity: Number(minOrderQuantity) || 5,
      maxOrderQuantity: Number(maxOrderQuantity) || 3000,
      isActive: true,
    });

    if (initialPrice > 0) {
      updateCentralFuelPrice(formattedCode, Number(initialPrice), 'Administrator', 'Initial product catalog pricing');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl space-y-6">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add New Fuel Product</h2>
              <p className="text-xs text-slate-400">Configure fuel grade, pricing tariff, and order limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Fuel Display Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. CNG Compressed Gas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Fuel Code (Unique) *</label>
              <input
                type="text"
                required
                placeholder="e.g. CNG_GAS"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Base Price (₹/L) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={initialPrice}
                onChange={(e) => setInitialPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Min Order (L)</label>
              <input
                type="number"
                min="1"
                value={minOrderQuantity}
                onChange={(e) => setMinOrderQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Max Order (L)</label>
              <input
                type="number"
                min="10"
                value={maxOrderQuantity}
                onChange={(e) => setMaxOrderQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Octane / Cetane Rating</label>
              <input
                type="text"
                placeholder="e.g. 95 RON or 52 Cetane"
                value={octaneOrCetane}
                onChange={(e) => setOctaneOrCetane(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Standard Density</label>
              <input
                type="text"
                placeholder="e.g. 0.74 kg/L"
                value={density}
                onChange={(e) => setDensity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Description & Specifications</label>
            <textarea
              rows={2}
              placeholder="Provide technical properties and vehicle compatibility details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-6 border-t border-slate-800 flex items-center justify-end gap-3 -mx-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enroll Fuel Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
