import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { FuelTypeCode } from '../../../types';
import { Package, X, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialStationId?: string;
  initialFuelCode?: FuelTypeCode;
}

export const RestockModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialStationId,
  initialFuelCode,
}) => {
  const { stations, updateStationInventory } = useApp();

  const [selectedStationId, setSelectedStationId] = useState(initialStationId || stations[0]?.id || '');
  const [selectedFuelCode, setSelectedFuelCode] = useState<FuelTypeCode>(initialFuelCode || 'PETROL');
  const [actionType, setActionType] = useState<'RESTOCK' | 'CALIBRATION' | 'ADJUSTMENT'>('RESTOCK');
  const [restockAmount, setRestockAmount] = useState(3000);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [dipReadingCm, setDipReadingCm] = useState(145);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialStationId) setSelectedStationId(initialStationId);
    if (initialFuelCode) setSelectedFuelCode(initialFuelCode);
    setReferenceNumber(`TANKER-${Date.now().toString().slice(-5)}`);
  }, [initialStationId, initialFuelCode, isOpen]);

  if (!isOpen) return null;

  const currentStation = stations.find((s) => s.id === selectedStationId) || stations[0];
  const currentInv = currentStation?.inventory[selectedFuelCode];

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStation || !currentInv) return;

    let newTotal = currentInv.availableLitres;
    if (actionType === 'RESTOCK') {
      newTotal = Math.min(currentInv.capacityLitres, currentInv.availableLitres + Number(restockAmount));
    } else if (actionType === 'ADJUSTMENT' || actionType === 'CALIBRATION') {
      newTotal = Math.min(currentInv.capacityLitres, Number(restockAmount));
    }

    updateStationInventory(
      currentStation.id,
      selectedFuelCode,
      newTotal,
      actionType,
      {
        referenceNumber: referenceNumber || `REF-${Date.now().toString().slice(-4)}`,
        notes: notes || (actionType === 'RESTOCK' ? 'Refinery bulk tanker discharge' : 'Physical dip calibration update'),
        performedBy: currentStation.managerName || 'Station Operator',
        dipReadingCm,
      }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Underground Tank Refill & Calibration</h3>
              <p className="text-[11px] text-slate-400">Update depot storage inventory & audit log</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleRestock} className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Target Gas Station</label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.codeName || st.name} ({st.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Operation Type</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="RESTOCK">Tanker Refill (+ Litres)</option>
                <option value="CALIBRATION">Dip Gauge Calibration</option>
                <option value="ADJUSTMENT">Inventory Adjustment</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Fuel Type</label>
              <select
                value={selectedFuelCode}
                onChange={(e) => setSelectedFuelCode(e.target.value as FuelTypeCode)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="PETROL">Petrol (RON 91/95)</option>
                <option value="DIESEL">Commercial Diesel (BS-VI)</option>
                <option value="PREMIUM_PETROL">Speed Plus 98 Petrol</option>
                <option value="BIO_DIESEL">Eco-B20 Biodiesel</option>
              </select>
            </div>
          </div>

          {currentInv && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Current Available Stock:</span>
                <span className="font-mono font-bold text-white">{currentInv.availableLitres.toLocaleString()} L</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Tank Capacity:</span>
                <span className="font-mono text-slate-300">{currentInv.capacityLitres.toLocaleString()} L</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Safety Threshold:</span>
                <span className="font-mono text-amber-400">{currentInv.lowStockThreshold} L</span>
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              {actionType === 'RESTOCK' ? 'Litres to Add from Refinery Tanker' : 'Set Exact New Available Litres'}
            </label>
            <input
              type="number"
              min="1"
              required
              value={restockAmount}
              onChange={(e) => setRestockAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Challan / Invoice #</label>
              <input
                type="text"
                placeholder="TANKER-REC-8921"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Dip Gauge Reading (cm)</label>
              <input
                type="number"
                placeholder="145 cm"
                value={dipReadingCm}
                onChange={(e) => setDipReadingCm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Operator Notes</label>
            <input
              type="text"
              placeholder="Tanker discharge verified by station supervisor"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
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
              Record & Update Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
