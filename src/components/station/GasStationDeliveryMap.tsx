import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Truck, Navigation, ShieldCheck, Clock, Fuel, Radio } from 'lucide-react';

export const GasStationDeliveryMap: React.FC = () => {
  const { currentStation, orders } = useApp();
  const [selectedBowser, setSelectedBowser] = useState<string | null>(null);

  if (!currentStation) return null;

  const activeDeliveries = orders.filter(
    (o) => o.gasStationId === currentStation.id && (o.status === 'PROCESSING' || o.status === 'OUT_FOR_DELIVERY')
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Navigation className="w-6 h-6 text-emerald-400" />
            Station Coverage Zone & Live Bowser GPS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of active fuel dispensing bowsers within {currentStation.coverageRadiusKm} km radius
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3.5 py-1.5 rounded-2xl">
          <Radio className="w-4 h-4 animate-pulse text-emerald-400" />
          <span>GPS Live Telemetry Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Visualizer */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Depot Dispatch Radius Visualizer
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Base: {currentStation.coordinates.lat}° N, {currentStation.coordinates.lng}° E
            </span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full h-[380px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-4">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

            {/* Coverage Radius Circle */}
            <div className="absolute w-72 h-72 rounded-full border-2 border-emerald-500/30 bg-emerald-500/5 animate-pulse flex items-center justify-center pointer-events-none">
              <div className="w-44 h-44 rounded-full border border-emerald-500/20 bg-emerald-500/5" />
            </div>

            {/* Station Central Hub Marker */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-2xl shadow-amber-500/50 border-2 border-white animate-bounce">
                {currentStation.codeName?.charAt(0) || 'H'}
              </div>
              <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-[10px] font-bold text-white shadow-md">
                {currentStation.name} (Hub)
              </div>
            </div>

            {/* Active Delivery Bowser Pins */}
            <div className="absolute top-16 left-28 z-20 flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/50 border border-white cursor-pointer hover:scale-110 transition-transform">
                <Truck className="w-4 h-4" />
              </div>
              <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-[9px] font-mono text-orange-400 font-bold">
                Bowser #1 • 3.2 km
              </div>
            </div>

            <div className="absolute bottom-16 right-24 z-20 flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/50 border border-white cursor-pointer hover:scale-110 transition-transform">
                <Truck className="w-4 h-4" />
              </div>
              <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-[9px] font-mono text-blue-400 font-bold">
                Bowser #2 • 6.8 km
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Coverage Diameter: {currentStation.coverageRadiusKm * 2} km</span>
            <span>Speed Limit: 40 km/h (Hazardous Fuel Carrier)</span>
          </div>
        </div>

        {/* Active Bowser Fleet Status List */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-400" />
            Assigned Bowsers & Crews
          </h3>

          <div className="space-y-3">
            {activeDeliveries.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No active mobile bowsers currently in transit.
              </div>
            ) : (
              activeDeliveries.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-emerald-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      {ord.deliveryDetails?.vehicleNumber || 'KA-01-FL-9921'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-950 text-orange-400 border border-orange-800">
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-white font-semibold">
                    Driver: {ord.deliveryDetails?.driverName || 'Ramesh Kumar'}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>
                      Cargo: <strong>{ord.quantityLitres} L {ord.fuelTypeName}</strong>
                    </span>
                    <span className="text-emerald-400 font-bold font-mono">
                      ETA: ~{ord.deliveryDetails?.estimatedMinutes || 15}m
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 truncate">
                    Destination: {ord.deliveryAddress.street}, {ord.deliveryAddress.city}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
