import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { GasStation, FuelTypeCode } from '../../../types';
import { X, Building2, MapPin, Phone, Mail, User, Fuel, Shield, Check, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  station: GasStation | null;
}

export const EditStationModal: React.FC<Props> = ({ isOpen, onClose, station }) => {
  const { editGasStation, fuelTypes } = useApp();

  const [name, setName] = useState('');
  const [codeName, setCodeName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [coverageRadiusKm, setCoverageRadiusKm] = useState(25);
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.209);
  const [supportedFuels, setSupportedFuels] = useState<FuelTypeCode[]>([]);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL'>('ACTIVE');

  useEffect(() => {
    if (station) {
      setName(station.name);
      setCodeName(station.codeName || '');
      setManagerName(station.managerName);
      setContactNumber(station.contactNumber);
      setEmail(station.email);
      setAddress(station.address);
      setCity(station.city);
      setCoverageRadiusKm(station.coverageRadiusKm);
      setLat(station.coordinates.lat);
      setLng(station.coordinates.lng);
      setSupportedFuels(station.supportedFuels || []);
      setStatus(station.status);
    }
  }, [station]);

  if (!isOpen || !station) return null;

  const toggleFuel = (code: FuelTypeCode) => {
    setSupportedFuels((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !managerName || !contactNumber || !address) return;

    editGasStation(station.id, {
      name,
      codeName,
      managerName,
      contactNumber,
      email,
      address,
      city,
      coverageRadiusKm: Number(coverageRadiusKm),
      coordinates: { lat: Number(lat), lng: Number(lng) },
      supportedFuels,
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Edit Gas Station Hub</h2>
              <p className="text-xs text-slate-400">Update depot parameters, manager contacts & operational status</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Station Display Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Hub Code (e.g. Station A)</label>
              <input
                type="text"
                value={codeName}
                onChange={(e) => setCodeName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Station Manager Name *</label>
              <input
                type="text"
                required
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Contact Phone Number *</label>
              <input
                type="text"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Operational Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="ACTIVE">Active (Live Dispatching)</option>
                <option value="INACTIVE">Inactive / Paused</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Depot Physical Address *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Coverage Radius (KM)</label>
              <input
                type="number"
                min="5"
                max="100"
                value={coverageRadiusKm}
                onChange={(e) => setCoverageRadiusKm(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">GPS Lat, Lng</label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  placeholder="Lat"
                  className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-[11px] font-mono focus:outline-none focus:border-amber-500"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  placeholder="Lng"
                  className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-[11px] font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Supported Fuel Types */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Supported Fuel Types</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {fuelTypes.map((ft) => {
                const isSelected = supportedFuels.includes(ft.code);
                return (
                  <button
                    type="button"
                    key={ft.code}
                    onClick={() => toggleFuel(ft.code)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{ft.name.split(' ')[0]}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">{ft.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
