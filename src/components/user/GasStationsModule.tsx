import React, { useState } from 'react';
import { useApp, calculateDistanceKm } from '../../context/AppContext';
import { GasStation, FuelTypeCode } from '../../types';
import {
  Building2,
  MapPin,
  Fuel,
  Phone,
  Mail,
  Clock,
  Star,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Navigation,
} from 'lucide-react';

interface GasStationsModuleProps {
  onSelectStationForOrder?: (stationId: string) => void;
}

export const GasStationsModule: React.FC<GasStationsModuleProps> = ({ onSelectStationForOrder }) => {
  const { stations, currentUser, setUserTab } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFuelFilter, setSelectedFuelFilter] = useState<'ALL' | FuelTypeCode>('ALL');

  const defaultAddr = currentUser.addresses.find((a) => a.isDefault) || currentUser.addresses[0];
  const userLat = defaultAddr?.coordinates?.lat || 28.6139;
  const userLng = defaultAddr?.coordinates?.lng || 77.209;

  const filteredStations = stations
    .map((st) => {
      const distance = calculateDistanceKm(st.coordinates.lat, st.coordinates.lng, userLat, userLng);
      return { ...st, distanceKm: distance };
    })
    .filter((st) => {
      const matchesSearch =
        st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFuel =
        selectedFuelFilter === 'ALL' || st.supportedFuels.includes(selectedFuelFilter);

      return matchesSearch && matchesFuel;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const handleOrderFromStation = (stId: string) => {
    if (onSelectStationForOrder) {
      onSelectStationForOrder(stId);
    } else {
      setUserTab('order_fuel');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Nearby Gas Station Depots
              <span className="text-xs bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-800 font-mono">
                {stations.length} Certified Stations
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live automated inventory levels, Petrol & Diesel supply gauges, and dispatch radius matrix.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-slate-300">
          <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Ref Location: <strong>{defaultAddr?.title || 'Home Location'}</strong> ({defaultAddr?.city || 'Delhi'})
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search stations by name, city or street..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter Fuel:
          </span>
          {(['ALL', 'PETROL', 'DIESEL', 'PREMIUM_PETROL', 'BIO_DIESEL'] as const).map((fuel) => (
            <button
              key={fuel}
              onClick={() => setSelectedFuelFilter(fuel)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedFuelFilter === fuel
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {fuel.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Station Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStations.map((st) => {
          const petrolInv = st.inventory.PETROL;
          const dieselInv = st.inventory.DIESEL;
          const petrolPct = petrolInv ? Math.round((petrolInv.availableLitres / petrolInv.capacityLitres) * 100) : 0;
          const dieselPct = dieselInv ? Math.round((dieselInv.availableLitres / dieselInv.capacityLitres) * 100) : 0;

          const isWithinCoverage = st.distanceKm <= st.coverageRadiusKm;

          return (
            <div
              key={st.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-lg space-y-4 transition-all flex flex-col justify-between ${
                st.status === 'ACTIVE'
                  ? 'border-slate-800 hover:border-amber-500/50'
                  : 'border-slate-800/60 opacity-70 bg-slate-950'
              }`}
            >
              <div className="space-y-3">
                {/* Header Title & Distance Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{st.name}</h4>
                      {st.status === 'ACTIVE' ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active & Open" />
                      ) : (
                        <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded font-bold">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{st.address}, {st.city}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-950 text-amber-300 font-mono font-bold text-xs border border-slate-800 inline-block">
                      {st.distanceKm} km
                    </span>
                    <span className={`text-[10px] block mt-0.5 font-semibold ${isWithinCoverage ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isWithinCoverage ? 'Within Radius' : 'Outside Radius'}
                    </span>
                  </div>
                </div>

                {/* Rating & Manager Contact */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{st.rating.toFixed(1)}</span>
                    <span className="text-slate-500 text-[10px]">({st.totalRatingsCount})</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{st.contactNumber || st.managerPhone || '+91 98765 43210'}</span>
                  </div>
                </div>

                {/* Live Real-time Stock Gauges */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Live Underground Reservoir Stock
                  </span>

                  {/* Petrol Gauge */}
                  {petrolInv && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold flex items-center gap-1">
                          <Fuel className="w-3 h-3 text-emerald-400" /> Petrol
                        </span>
                        <span className="font-mono text-emerald-400 font-bold text-[11px]">
                          {petrolInv.availableLitres.toLocaleString()} L ({petrolPct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            petrolPct < 20 ? 'bg-rose-500' : petrolPct < 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, petrolPct)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Diesel Gauge */}
                  {dieselInv && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold flex items-center gap-1">
                          <Fuel className="w-3 h-3 text-amber-400" /> Diesel
                        </span>
                        <span className="font-mono text-amber-400 font-bold text-[11px]">
                          {dieselInv.availableLitres.toLocaleString()} L ({dieselPct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            dieselPct < 20 ? 'bg-rose-500' : dieselPct < 40 ? 'bg-amber-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, dieselPct)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Operating Info */}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {st.operatingHours || '24/7 Operations'}
                  </span>
                  <span>Radius: {st.coverageRadiusKm} km</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800">
                <button
                  id={`btn-order-station-${st.id}`}
                  onClick={() => handleOrderFromStation(st.id)}
                  disabled={st.status !== 'ACTIVE'}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    st.status === 'ACTIVE'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/40'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Fuel className="w-3.5 h-3.5" />
                  <span>Order Doorstep Fuel from Here</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
