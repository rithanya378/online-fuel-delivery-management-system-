import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GasStation, FuelTypeCode, StationInventory } from '../../types';
import {
  Building2,
  PlusCircle,
  MapPin,
  Star,
  Fuel,
  RefreshCw,
  Phone,
  Mail,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Edit,
  Trash2,
  Eye,
  Sliders,
  DollarSign,
  ShoppingCart,
} from 'lucide-react';
import { EditStationModal } from './modals/EditStationModal';
import { StationDetailsModal } from './modals/StationDetailsModal';
import { AssignFuelModal } from './modals/AssignFuelModal';

interface Props {
  onOpenAddStationModal: () => void;
  onOpenRestockModal: (stationId: string, fuelCode: FuelTypeCode) => void;
}

export const AdminStationsManager: React.FC<Props> = ({
  onOpenAddStationModal,
  onOpenRestockModal,
}) => {
  const {
    stations,
    orders,
    toggleStationStatus,
    deleteGasStation,
    approveStationRegistration,
    stationChangeRequests,
    approveStationChangeRequest,
    rejectStationChangeRequest,
    setAdminTab,
  } = useApp();

  const [filterCity, setFilterCity] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAssignFuelOpen, setIsAssignFuelOpen] = useState(false);

  const pendingRegistrations = stations.filter((s) => s.status === 'PENDING_APPROVAL');
  const pendingRequests = stationChangeRequests.filter((r) => r.status === 'PENDING');

  const filteredStations = stations.filter((st) => {
    const matchesCity = filterCity === 'ALL' || st.city === filterCity;
    const matchesStatus = statusFilter === 'ALL' || st.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.managerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.codeName && st.codeName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCity && matchesStatus && matchesSearch;
  });

  const handleOpenEdit = (station: GasStation) => {
    setSelectedStation(station);
    setIsEditOpen(true);
  };

  const handleOpenDetails = (station: GasStation) => {
    setSelectedStation(station);
    setIsDetailsOpen(true);
  };

  const handleOpenAssignFuel = (station: GasStation) => {
    setSelectedStation(station);
    setIsAssignFuelOpen(true);
  };

  const handleDelete = (station: GasStation) => {
    if (window.confirm(`Are you sure you want to delete "${station.name}" from the network?`)) {
      deleteGasStation(station.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-amber-400" />
            Gas Station Network & Hub Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Highest level of control: onboard depots, approve registrations, assign fuel grades, calibrate tanks & edit profiles
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={onOpenAddStationModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Gas Station</span>
          </button>
        </div>
      </div>

      {/* 1. Pending Gas Station Registration Approvals (Admin Workflow) */}
      {pendingRegistrations.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheckIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Pending Gas Station Registrations</h3>
                <p className="text-[11px] text-slate-400">New partner depots requesting enrollment to receive dispatches</p>
              </div>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/40">
              {pendingRegistrations.length} Awaiting Authorization
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRegistrations.map((st) => (
              <div key={st.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs">{st.name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Manager: {st.managerName} ({st.contactNumber})</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    PENDING APPROVAL
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{st.address}, {st.city} (Radius: {st.coverageRadiusKm} KM)</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                  <button
                    onClick={() => handleOpenDetails(st)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Application
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(st)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => approveStationRegistration(st.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Registration</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Pending Station Detail Change Requests */}
      {pendingRequests.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Pending Station Detail Change Requests</h3>
                <p className="text-[11px] text-slate-400">Gas station managers requesting profile modifications</p>
              </div>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-full border border-amber-500/40">
              {pendingRequests.length} Pending Approval
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div key={req.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs">{req.stationName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">ID: {req.stationId}</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1 text-slate-300">
                  <div className="font-bold text-amber-400">Reason: "{req.reason}"</div>
                  <div className="text-slate-400 pt-1">
                    <strong>Requested Updates:</strong>
                    {req.requestedFields.contactNumber && <div>• Phone: {req.requestedFields.contactNumber}</div>}
                    {req.requestedFields.managerName && <div>• Manager: {req.requestedFields.managerName}</div>}
                    {req.requestedFields.coverageRadiusKm && <div>• Radius: {req.requestedFields.coverageRadiusKm} km</div>}
                    {req.requestedFields.address && <div>• Address: {req.requestedFields.address}</div>}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => rejectStationChangeRequest(req.id, 'Does not comply with safety radius regulations.')}
                    className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() => approveStationChangeRequest(req.id, 'Approved by Central Dispatcher.')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Changes</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search stations, managers, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-56 sm:w-72"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive / Paused</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Grid of Stations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStations.map((station) => {
          const stationOrdersCount = orders.filter((o) => o.gasStationId === station.id).length;

          return (
            <div
              key={station.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        {station.codeName || 'HUB'}
                      </span>
                      <h3 className="text-base font-extrabold text-white">{station.name}</h3>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{station.address}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStationStatus(station.id)}
                    className={`p-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      station.status === 'ACTIVE'
                        ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1'
                        : station.status === 'PENDING_APPROVAL'
                        ? 'text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-1'
                        : 'text-slate-500 bg-slate-950 border border-slate-800 px-2.5 py-1'
                    }`}
                    title="Enable / Disable station dispatching"
                  >
                    {station.status === 'ACTIVE' ? 'Active' : station.status === 'PENDING_APPROVAL' ? 'Pending' : 'Paused'}
                  </button>
                </div>

                {/* Manager Contact & Rating */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Station Manager:</span>
                    <span className="font-bold text-white">{station.managerName}</span>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-500" /> {station.contactNumber}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Coverage Radius:</span>
                    <span className="font-bold text-emerald-400 font-mono">{station.coverageRadiusKm} km</span>
                    <div className="flex items-center justify-end gap-1 text-amber-400 font-bold mt-0.5 text-xs">
                      <Star className="w-3 h-3 fill-amber-400" /> {station.rating > 0 ? station.rating : 'New'} ({station.totalRatingsCount} reviews)
                    </div>
                  </div>
                </div>

                {/* Supported Fuels Tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Assigned Fuels:</span>
                  {(station.supportedFuels || []).map((f) => (
                    <span
                      key={f}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {f}
                    </span>
                  ))}
                  <button
                    onClick={() => handleOpenAssignFuel(station)}
                    className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer ml-1"
                  >
                    + Assign Fuels
                  </button>
                </div>

                {/* Inventory Meters for Petrol & Diesel */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-amber-400" /> Underground Tank Stock:
                    </span>
                  </div>

                  {(Object.entries(station.inventory) as [FuelTypeCode, StationInventory][]).map(([code, inv]) => {
                    const fuelCode = code;
                    const percent = Math.round((inv.availableLitres / inv.capacityLitres) * 100);
                    const isLow = inv.availableLitres <= inv.lowStockThreshold;
                    const isCritical = inv.availableLitres <= (inv.criticalThreshold || 50);
                    const isOut = inv.availableLitres === 0;

                    return (
                      <div key={code} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{code.replace(/_/g, ' ')}</span>
                            {isOut ? (
                              <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.2 rounded font-black">
                                OUT OF STOCK
                              </span>
                            ) : isCritical ? (
                              <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.2 rounded font-black">
                                CRITICAL
                              </span>
                            ) : isLow ? (
                              <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.2 rounded font-black">
                                LOW
                              </span>
                            ) : (
                              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-black">
                                NORMAL
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-xs">
                              {inv.availableLitres.toLocaleString()} / {inv.capacityLitres.toLocaleString()} L
                            </span>
                            <button
                              onClick={() => onOpenRestockModal(station.id, fuelCode)}
                              className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              + Refill
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOut || isCritical
                                ? 'bg-rose-500'
                                : isLow
                                ? 'bg-amber-500'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Station Action Toolbar (Image 2 Features) */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenDetails(station)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(station)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                    title="Edit Station Details"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleOpenAssignFuel(station)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                    title="Assign Fuel Types"
                  >
                    <Sliders className="w-3.5 h-3.5 text-teal-400" />
                    <span>Fuels</span>
                  </button>

                  <button
                    onClick={() => handleDelete(station)}
                    className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-950 text-rose-400 border border-rose-800/60 transition-colors cursor-pointer"
                    title="Delete Station"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <EditStationModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        station={selectedStation}
      />

      <StationDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        station={selectedStation}
        onOpenRestockModal={onOpenRestockModal}
        onOpenEditModal={handleOpenEdit}
      />

      <AssignFuelModal
        isOpen={isAssignFuelOpen}
        onClose={() => setIsAssignFuelOpen(false)}
        station={selectedStation}
      />
    </div>
  );
};

// Internal icon helper
const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
