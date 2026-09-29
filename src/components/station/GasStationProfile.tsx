import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Fuel,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const GasStationProfile: React.FC = () => {
  const {
    currentStation,
    fuelPrices,
    fuelTypes,
    stationChangeRequests,
    submitStationChangeRequest,
    addToast,
  } = useApp();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [managerName, setManagerName] = useState(currentStation?.managerName || '');
  const [contactNumber, setContactNumber] = useState(currentStation?.contactNumber || '');
  const [email, setEmail] = useState(currentStation?.email || '');
  const [address, setAddress] = useState(currentStation?.address || '');
  const [coverageRadiusKm, setCoverageRadiusKm] = useState(currentStation?.coverageRadiusKm || 15);
  const [reason, setReason] = useState('');

  if (!currentStation) {
    return (
      <div className="p-8 text-center text-slate-400">
        No gas station active. Please select a station.
      </div>
    );
  }

  // Filter change requests for this station
  const stationRequests = stationChangeRequests.filter((r) => r.stationId === currentStation.id);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      addToast({
        type: 'warning',
        title: 'Reason Required',
        message: 'Please explain the reason for requesting station detail modifications.',
      });
      return;
    }

    const res = submitStationChangeRequest(
      currentStation.id,
      {
        managerName,
        contactNumber,
        email,
        address,
        coverageRadiusKm: Number(coverageRadiusKm),
      },
      reason
    );

    if (res.success) {
      setIsRequestModalOpen(false);
      setReason('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 🔒 Strict Restriction Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border border-amber-500/40 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">
                Strict Central Governance & Pricing Policy
              </h2>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                LOCKED
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In accordance with network regulatory standards, gas stations are <strong>strictly prohibited</strong> from changing:
              Petrol price, Diesel price, assigned fuel pricing, or system-wide pricing tariffs.
              Station profile details are locked and require verified Admin approval.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Station Profile & Details + Assigned Fuel & Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Station Profile & Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Station Profile & Details</h2>
                  <p className="text-xs text-slate-400">Station metadata and operational configuration</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setManagerName(currentStation.managerName);
                  setContactNumber(currentStation.contactNumber);
                  setEmail(currentStation.email);
                  setAddress(currentStation.address);
                  setCoverageRadiusKm(currentStation.coverageRadiusKm);
                  setIsRequestModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-amber-500/30 flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Changes from Admin</span>
              </button>
            </div>

            {/* Read-Only Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  Station Name / Code
                </span>
                <p className="text-sm font-bold text-white">{currentStation.name}</p>
                <span className="text-[10px] text-amber-400 font-mono">Hub ID: {currentStation.codeName || currentStation.id}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Station Manager
                </span>
                <p className="text-sm font-bold text-white">{currentStation.managerName}</p>
                <span className="text-[10px] text-slate-500">Authorized Refinery Operator</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  Contact Telephone
                </span>
                <p className="text-sm font-bold text-white font-mono">{currentStation.contactNumber}</p>
                <span className="text-[10px] text-slate-500">24/7 Dispatch Coordination</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  Official Email
                </span>
                <p className="text-sm font-bold text-white">{currentStation.email}</p>
                <span className="text-[10px] text-slate-500">E-Invoicing & Automated Alerts</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1 md:col-span-2">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  Physical Station Location & GPS Coordinates
                </span>
                <p className="text-sm font-bold text-white">{currentStation.address}, {currentStation.city}</p>
                <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-1 font-mono">
                  <span>Lat: {currentStation.coordinates.lat.toFixed(4)}° N</span>
                  <span>Lng: {currentStation.coordinates.lng.toFixed(4)}° E</span>
                  <span className="text-emerald-400 font-bold">Coverage Radius: {currentStation.coverageRadiusKm} km</span>
                </div>
              </div>
            </div>

            {/* Operating Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Refinery Safety Compliance Certified</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Operating Hours: 24 Hours / 7 Days</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Station Rating: {currentStation.rating} ★ ({currentStation.totalRatingsCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Admin Change Requests History */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Station Detail Change Requests to Admin</span>
              </h3>
              <span className="text-xs text-slate-400">{stationRequests.length} Requests Total</span>
            </div>

            {stationRequests.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                No change requests submitted yet. Station details are up to date.
              </div>
            ) : (
              <div className="space-y-3">
                {stationRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                            req.status === 'APPROVED'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : req.status === 'REJECTED'
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                        <span className="font-semibold text-white">
                          Requested on {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{req.id}</span>
                    </div>

                    <p className="text-slate-300 text-[11px]">
                      <strong>Reason:</strong> {req.reason}
                    </p>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1 text-slate-400">
                      <div className="font-semibold text-slate-300">Requested Modifications:</div>
                      {req.requestedFields.contactNumber && (
                        <div>• Contact Phone: <span className="text-amber-400">{req.requestedFields.contactNumber}</span></div>
                      )}
                      {req.requestedFields.managerName && (
                        <div>• Station Manager: <span className="text-amber-400">{req.requestedFields.managerName}</span></div>
                      )}
                      {req.requestedFields.coverageRadiusKm && (
                        <div>• Coverage Radius: <span className="text-amber-400">{req.requestedFields.coverageRadiusKm} km</span></div>
                      )}
                      {req.requestedFields.address && (
                        <div>• Address: <span className="text-amber-400">{req.requestedFields.address}</span></div>
                      )}
                    </div>

                    {req.adminNotes && (
                      <p className="text-[11px] text-emerald-400 font-medium">
                        <strong>Admin Notes:</strong> {req.adminNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assigned Fuel Types & Assigned Fuel Prices (1 Col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Assigned Fuel Types & Rates</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Centrally regulated pricing tariffs</p>
            </div>

            {/* List of Fuels & Prices */}
            <div className="space-y-3.5">
              {currentStation.supportedFuels.map((code) => {
                const fuelMeta = fuelTypes.find((f) => f.code === code);
                const priceMeta = fuelPrices[code];
                const price = priceMeta ? priceMeta.pricePerLitre : 0;

                return (
                  <div
                    key={code}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{fuelMeta?.name || code}</span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-slate-400">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Price Locked</span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-2xl font-black text-amber-400 font-mono">
                          ₹{price.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400"> / Litre</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Octane/Density: {fuelMeta?.octaneOrCetane || 'Standard'}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
                      <span>Delivery Base Fee: ₹{priceMeta?.deliveryFeeBase || 50}</span>
                      <span>Tax: {priceMeta?.taxRatePercent || 18}% GST</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lock Explanation Note */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Info className="w-4 h-4" />
                <span>Why are fuel prices locked?</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Central Refinery Admin establishes uniform daily fuel price tariffs across the network.
                Gas stations receive standardized delivery commissions per litre dispensed and are protected from market price fluctuations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Change Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Request Station Details Change</h3>
                  <p className="text-[11px] text-slate-400">Requires Central Refinery Admin Review</p>
                </div>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-5 space-y-4 overflow-y-auto">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                🔒 Note: Pricing cannot be modified. Only operational contact, manager, address, and coverage range updates can be requested.
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Station Manager Name</label>
                <input
                  type="text"
                  required
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Coverage Radius (km)</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    required
                    value={coverageRadiusKm}
                    onChange={(e) => setCoverageRadiusKm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Physical Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Reason for Change (Required for Audit)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Upgraded secondary emergency hotline and added 2 new bowsers to expand service radius..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950/50 transition-colors cursor-pointer"
                >
                  Submit for Admin Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
