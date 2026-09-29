import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle, VehicleCategory, FuelTypeCode } from '../../types';
import {
  Car,
  Truck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Fuel,
  ShieldCheck,
  AlertCircle,
  Zap,
  Info,
  Calendar,
} from 'lucide-react';

export const VehicleGarageModule: React.FC = () => {
  const {
    currentUser,
    addUserVehicle,
    editUserVehicle,
    deleteUserVehicle,
    setDefaultUserVehicle,
    setUserTab,
  } = useApp();

  const vehicles = currentUser.vehicles || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [makeModel, setMakeModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [category, setCategory] = useState<VehicleCategory>('CAR');
  const [tankCapacityLitres, setTankCapacityLitres] = useState<number>(45);
  const [preferredFuelType, setPreferredFuelType] = useState<FuelTypeCode>('PETROL');
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setMakeModel('');
    setRegistrationNumber('');
    setCategory('CAR');
    setTankCapacityLitres(45);
    setPreferredFuelType('PETROL');
    setIsDefault(false);
    setIsAdding(false);
    setEditingVehicle(null);
    setFormError(null);
  };

  const handleStartEdit = (veh: Vehicle) => {
    setEditingVehicle(veh);
    setMakeModel(veh.makeModel);
    setRegistrationNumber(veh.registrationNumber);
    setCategory(veh.category || 'CAR');
    setTankCapacityLitres(veh.tankCapacityLitres || 45);
    setPreferredFuelType(veh.preferredFuelType || 'PETROL');
    setIsDefault(veh.isDefault || false);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!makeModel.trim()) {
      setFormError('Please enter the vehicle make & model.');
      return;
    }
    if (!registrationNumber.trim()) {
      setFormError('Please enter a valid registration/plate number.');
      return;
    }

    if (editingVehicle) {
      editUserVehicle(currentUser.id, {
        id: editingVehicle.id,
        makeModel: makeModel.trim(),
        registrationNumber: registrationNumber.trim().toUpperCase(),
        category,
        tankCapacityLitres: Number(tankCapacityLitres) || 45,
        preferredFuelType,
        isDefault,
      });
    } else {
      addUserVehicle(currentUser.id, {
        makeModel: makeModel.trim(),
        registrationNumber: registrationNumber.trim().toUpperCase(),
        category,
        tankCapacityLitres: Number(tankCapacityLitres) || 45,
        preferredFuelType,
        isDefault,
      });
    }
    resetForm();
  };

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case 'COMMERCIAL_TRUCK':
      case 'FLEET':
        return <Truck className="w-5 h-5 text-amber-400" />;
      case 'GENERATOR':
        return <Zap className="w-5 h-5 text-indigo-400" />;
      default:
        return <Car className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Vehicle & Asset Garage
              <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 font-mono">
                {vehicles.length} Registered
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Register your personal cars, commercial trucks, or diesel backup generators for quick 1-click refueling.
            </p>
          </div>
        </div>

        {!isAdding && (
          <button
            id="btn-add-vehicle"
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle / Asset</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Modal/Card */}
      {isAdding && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Car className="w-4 h-4 text-emerald-400" />
              <span>{editingVehicle ? 'Edit Vehicle Details' : 'Register New Vehicle / Equipment'}</span>
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

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Make & Model <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Hyundai Creta SX, Ashok Leyland 2820"
                value={makeModel}
                onChange={(e) => setMakeModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Registration / Plate Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., DL-01-AB-1234 or GEN-SITE-4"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Asset Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="CAR">Personal Sedan / Hatchback</option>
                <option value="SUV">SUV / Compact SUV</option>
                <option value="COMMERCIAL_TRUCK">Heavy Commercial Truck</option>
                <option value="FLEET">Corporate Fleet Van</option>
                <option value="GENERATOR">Industrial Diesel Generator (DG Set)</option>
                <option value="BIKE">Two Wheeler / Motorcycle</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Tank Capacity (Litres)</label>
              <input
                type="number"
                min="5"
                max="5000"
                value={tankCapacityLitres}
                onChange={(e) => setTankCapacityLitres(parseInt(e.target.value) || 45)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Preferred Fuel Grade</label>
              <select
                value={preferredFuelType}
                onChange={(e) => setPreferredFuelType(e.target.value as FuelTypeCode)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="PETROL">Petrol (BS-VI Unleaded)</option>
                <option value="DIESEL">Diesel (Ultra-Low Sulfur BS-VI)</option>
                <option value="PREMIUM_PETROL">Speed 95 Octane Premium</option>
                <option value="BIO_DIESEL">Biodiesel B20 Clean Blend</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Set as primary default vehicle</span>
              </label>
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-950/40 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingVehicle ? 'Update Vehicle' : 'Save to Garage'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-md space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Car className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-white">No Vehicles Registered in Garage</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Add your vehicle or DG set details so you can order fuel with one tap without having to enter tank sizes and plate numbers every time.
          </p>
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Vehicle</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((veh) => {
            const isPetrol = (veh.preferredFuelType || '').includes('PETROL');
            return (
              <div
                key={veh.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-lg space-y-4 transition-all relative overflow-hidden ${
                  veh.isDefault
                    ? 'border-emerald-500/60 ring-1 ring-emerald-500/40 bg-gradient-to-b from-slate-900 to-emerald-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {veh.isDefault && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-3 py-0.5 rounded-bl-xl tracking-wider">
                    Primary Default
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                    {getCategoryIcon(veh.category)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{veh.makeModel}</h4>
                    <span className="font-mono text-xs font-extrabold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 mt-1 inline-block">
                      {veh.registrationNumber}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Fuel Preference</span>
                    <span className="text-slate-200 font-semibold flex items-center gap-1 mt-0.5">
                      <Fuel className={`w-3 h-3 ${isPetrol ? 'text-emerald-400' : 'text-amber-400'}`} />
                      {veh.preferredFuelType || 'PETROL'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Tank Capacity</span>
                    <span className="text-white font-mono font-bold mt-0.5 block">
                      {veh.tankCapacityLitres || 45} Litres
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  {!veh.isDefault ? (
                    <button
                      onClick={() => setDefaultUserVehicle(currentUser.id, veh.id)}
                      className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Set as Default</span>
                    </button>
                  ) : (
                    <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Selected for Fast Ordering</span>
                    </span>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStartEdit(veh)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Edit Vehicle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteUserVehicle(currentUser.id, veh.id)}
                      className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors cursor-pointer"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setUserTab('order_fuel')}
                  className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Order Fuel for this Vehicle</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
