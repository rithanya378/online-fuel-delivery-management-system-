import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Address } from '../../types';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Navigation,
  Building2,
  Home,
  Briefcase,
  Factory,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const AddressManagerModule: React.FC = () => {
  const {
    currentUser,
    addUserAddress,
    editUserAddress,
    deleteUserAddress,
    setDefaultUserAddress,
    setUserTab,
  } = useApp();

  const addresses = currentUser.addresses || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Delhi');
  const [zipCode, setZipCode] = useState('');
  const [lat, setLat] = useState<number>(28.6139);
  const [lng, setLng] = useState<number>(77.209);
  const [isDefault, setIsDefault] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setStreet('');
    setCity('');
    setState('Delhi');
    setZipCode('');
    setLat(28.6139);
    setLng(77.209);
    setIsDefault(false);
    setIsAdding(false);
    setEditingAddress(null);
    setFormError(null);
  };

  const handleStartEdit = (addr: Address) => {
    setEditingAddress(addr);
    setTitle(addr.title);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setZipCode(addr.zipCode);
    setLat(addr.coordinates?.lat || 28.6139);
    setLng(addr.coordinates?.lng || 77.209);
    setIsDefault(addr.isDefault || false);
    setIsAdding(true);
  };

  const handleDetectGps = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(Math.round(position.coords.latitude * 10000) / 10000);
          setLng(Math.round(position.coords.longitude * 10000) / 10000);
          setIsDetectingGps(false);
        },
        (error) => {
          // Fallback simulation for Delhi NCR region
          const randomLat = 28.5355 + (Math.random() * 0.1 - 0.05);
          const randomLng = 77.391 + (Math.random() * 0.1 - 0.05);
          setLat(Math.round(randomLat * 10000) / 10000);
          setLng(Math.round(randomLng * 10000) / 10000);
          setIsDetectingGps(false);
        },
        { timeout: 5000 }
      );
    } else {
      const randomLat = 28.5355 + (Math.random() * 0.1 - 0.05);
      const randomLng = 77.391 + (Math.random() * 0.1 - 0.05);
      setLat(Math.round(randomLat * 10000) / 10000);
      setLng(Math.round(randomLng * 10000) / 10000);
      setIsDetectingGps(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter an address label (e.g., Home, Plant Site, Fleet Yard).');
      return;
    }
    if (!street.trim()) {
      setFormError('Please enter street address / landmark details.');
      return;
    }
    if (!city.trim() || !zipCode.trim()) {
      setFormError('City and PIN / Zip code are required.');
      return;
    }

    if (editingAddress) {
      editUserAddress(currentUser.id, {
        id: editingAddress.id,
        title: title.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        coordinates: { lat: Number(lat), lng: Number(lng) },
        isDefault,
      });
    } else {
      addUserAddress(currentUser.id, {
        title: title.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        coordinates: { lat: Number(lat), lng: Number(lng) },
        isDefault,
      });
    }
    resetForm();
  };

  const getAddressIcon = (t: string) => {
    const lower = t.toLowerCase();
    if (lower.includes('home') || lower.includes('residence') || lower.includes('flat')) {
      return <Home className="w-5 h-5 text-emerald-400" />;
    }
    if (lower.includes('office') || lower.includes('headquarter') || lower.includes('tech')) {
      return <Briefcase className="w-5 h-5 text-indigo-400" />;
    }
    if (lower.includes('yard') || lower.includes('fleet') || lower.includes('site') || lower.includes('plant')) {
      return <Factory className="w-5 h-5 text-amber-400" />;
    }
    return <MapPin className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/50 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Saved Delivery Addresses & GPS Pins
              <span className="text-xs bg-teal-950 text-teal-300 px-2 py-0.5 rounded-full border border-teal-800 font-mono">
                {addresses.length} Saved
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your residential premises, commercial depots, and generator sites with precise GPS coordinates for doorstep bowser access.
            </p>
          </div>
        </div>

        {!isAdding && (
          <button
            id="btn-add-address"
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-950/40 flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Delivery Location</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <div className="bg-slate-900 border border-teal-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>{editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}</span>
            </div>
            <button
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Location Label <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Home Residence, Main Depot, Construction Site A"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Street Address & Landmark <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 42 Tech Boulevard, Near Sector 62 Metro Gate"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  City <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Noida, New Delhi, Gurugram"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">State / Region</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Delhi NCR, Uttar Pradesh"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  PIN / Postal Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 110001 or 201301"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* GPS Coordinates Section */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-teal-400" /> Bowser GPS Navigation Coordinates
                </span>
                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={isDetectingGps}
                  className="px-3 py-1.5 rounded-lg bg-teal-950 hover:bg-teal-900 border border-teal-700 text-teal-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isDetectingGps ? 'Pinpointing GPS...' : 'Use Current Live GPS'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-teal-500 focus:ring-teal-500"
                />
                <span>Set as primary default delivery location</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-950/40 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingAddress ? 'Update Location' : 'Save Address'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`bg-slate-900 border rounded-2xl p-5 shadow-lg space-y-4 transition-all flex flex-col justify-between relative overflow-hidden ${
              addr.isDefault
                ? 'border-teal-500/60 ring-1 ring-teal-500/40 bg-gradient-to-b from-slate-900 to-teal-950/20'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {addr.isDefault && (
              <div className="absolute top-0 right-0 bg-teal-500 text-slate-950 font-black text-[10px] uppercase px-3 py-0.5 rounded-bl-xl tracking-wider">
                Primary Default
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                  {getAddressIcon(addr.title)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{addr.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{addr.street}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {addr.city}, {addr.state} {addr.zipCode}
                  </p>
                </div>
              </div>

              {/* Coordinates Pill */}
              {addr.coordinates && (
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-teal-400" /> GPS Coords:
                  </span>
                  <span className="text-slate-300">
                    {addr.coordinates.lat.toFixed(4)}, {addr.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                {!addr.isDefault ? (
                  <button
                    onClick={() => setDefaultUserAddress(currentUser.id, addr.id)}
                    className="text-teal-400 hover:text-teal-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Make Default</span>
                  </button>
                ) : (
                  <span className="text-teal-400 text-[11px] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Default Location</span>
                  </span>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(addr)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title="Edit Address"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteUserAddress(currentUser.id, addr.id)}
                    className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors cursor-pointer"
                    title="Delete Address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setUserTab('order_fuel')}
                className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Deliver Fuel Here</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
