import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { FuelTypeCode, StationInventory } from '../../../types';
import { Building2, X, Fuel, MapPin, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addGasStation, fuelTypes } = useApp();

  const [codeName, setCodeName] = useState('Station E');
  const [name, setName] = useState('Station E (North Express Fuel Hub)');
  const [managerName, setManagerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Metro City');
  const [coverageRadiusKm, setCoverageRadiusKm] = useState(25);
  const [lat, setLat] = useState(28.62);
  const [lng, setLng] = useState(77.22);
  const [selectedFuels, setSelectedFuels] = useState<FuelTypeCode[]>(['PETROL', 'DIESEL']);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !managerName || !contactNumber || !address) return;

    const initialInventory: Record<FuelTypeCode, StationInventory> = {
      PETROL: {
        fuelTypeCode: 'PETROL',
        availableLitres: 3000,
        capacityLitres: 5000,
        lowStockThreshold: 400,
        criticalThreshold: 150,
        lastRestocked: new Date().toISOString(),
      },
      DIESEL: {
        fuelTypeCode: 'DIESEL',
        availableLitres: 5000,
        capacityLitres: 8000,
        lowStockThreshold: 600,
        criticalThreshold: 200,
        lastRestocked: new Date().toISOString(),
      },
      PREMIUM_PETROL: {
        fuelTypeCode: 'PREMIUM_PETROL',
        availableLitres: 1000,
        capacityLitres: 2000,
        lowStockThreshold: 200,
        criticalThreshold: 80,
        lastRestocked: new Date().toISOString(),
      },
      BIO_DIESEL: {
        fuelTypeCode: 'BIO_DIESEL',
        availableLitres: 1000,
        capacityLitres: 2000,
        lowStockThreshold: 200,
        criticalThreshold: 80,
        lastRestocked: new Date().toISOString(),
      },
    };

    addGasStation({
      codeName,
      name,
      managerName,
      contactNumber,
      email,
      address,
      city,
      coverageRadiusKm,
      coordinates: { lat, lng },
      status: 'ACTIVE',
      supportedFuels: selectedFuels,
      inventory: initialInventory,
    });

    onClose();
  };

  const toggleFuel = (code: FuelTypeCode) => {
    if (selectedFuels.includes(code)) {
      setSelectedFuels(selectedFuels.filter((c) => c !== code));
    } else {
      setSelectedFuels([...selectedFuels, code]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Add New Gas Station</h3>
              <p className="text-[11px] text-slate-400">Enroll a certified fuel dispensing depot</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Code Alias</label>
              <input
                type="text"
                required
                value={codeName}
                onChange={(e) => setCodeName(e.target.value)}
                placeholder="Station E"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Station Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. North Express Hub"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Station Manager</label>
              <input
                type="text"
                required
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="Manager Name"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="station@fuelflow.com"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Depot Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full Street, Sector, Industrial Area"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Coverage Radius (km)</label>
              <input
                type="number"
                min="5"
                max="100"
                value={coverageRadiusKm}
                onChange={(e) => setCoverageRadiusKm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Supported Fuels Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Supported Fuel Types</label>
            <div className="grid grid-cols-2 gap-2">
              {(['PETROL', 'DIESEL', 'PREMIUM_PETROL', 'BIO_DIESEL'] as FuelTypeCode[]).map((code) => (
                <button
                  type="button"
                  key={code}
                  onClick={() => toggleFuel(code)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedFuels.includes(code)
                      ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{code.replace(/_/g, ' ')}</span>
                  {selectedFuels.includes(code) && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
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
              Enroll Station
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
