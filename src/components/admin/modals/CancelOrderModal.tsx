import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Order } from '../../../types';
import { XCircle, X, AlertTriangle, Fuel, ShieldAlert } from 'lucide-react';

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  cancelledBy?: 'USER' | 'GAS_STATION' | 'ADMIN';
}

export const CancelOrderModal: React.FC<Props> = ({
  order,
  isOpen,
  onClose,
  cancelledBy = 'ADMIN',
}) => {
  const { cancelOrder } = useApp();

  const isStation = cancelledBy === 'GAS_STATION';

  const defaultStationReason = order
    ? `Insufficient ${order.fuelTypeName.toLowerCase()} inventory`
    : 'Insufficient petrol inventory';

  const [selectedReason, setSelectedReason] = useState(defaultStationReason);
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    if (order) {
      if (isStation) {
        setSelectedReason(`Insufficient ${order.fuelTypeName.toLowerCase()} inventory`);
      } else {
        setSelectedReason('Customer requested cancellation before dispatch');
      }
    }
  }, [order, isStation]);

  if (!isOpen || !order) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Other' ? customReason : selectedReason;
    cancelOrder(order.id, finalReason, cancelledBy);
    onClose();
  };

  const stationReasons = [
    `Insufficient ${order.fuelTypeName.toLowerCase()} inventory`,
    `Underground ${order.fuelTypeName} tank depleted below reserve threshold`,
    'Emergency tank maintenance & pump dispenser offline',
    'Other fuel shortage condition',
  ];

  const adminUserReasons = [
    'Customer requested cancellation before dispatch',
    'Insufficient fuel stock at station storage tank',
    'Bowser vehicle mechanical maintenance / unavailable',
    'Extreme traffic / route blockage to delivery address',
    'Address outside operational safety perimeter',
    'Other',
  ];

  const reasonsList = isStation ? stationReasons : adminUserReasons;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cancel Order {order.orderNumber}</h3>
              <p className="text-[11px] text-slate-400">
                {isStation ? 'Station Fuel Shortage Protocol' : 'Automatic refund and inventory restocking'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-5 space-y-4">
          {isStation ? (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-600/40 text-xs text-rose-300 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Station Cancellation Rule:</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Gas stations may cancel an order <strong>only when sufficient fuel is unavailable</strong>. The customer ({order.userName}) will be instantly notified and refunded ₹{order.totalAmount.toFixed(2)}.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Restocking & Refund Pipeline:</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Cancelling will return <strong>{order.quantityLitres} L</strong> of {order.fuelTypeName} to{' '}
                {order.gasStationName} and refund ₹{order.totalAmount.toFixed(2)} to {order.userName}.
              </p>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
              {isStation ? 'Mandatory Fuel Shortage Reason' : 'Select Cancellation Reason'}
            </label>
            <div className="space-y-1.5">
              {reasonsList.map((reason) => (
                <button
                  type="button"
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                    selectedReason === reason
                      ? 'bg-rose-950/80 border-rose-600 text-rose-200 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isStation && <Fuel className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    <span>{reason}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {(selectedReason === 'Other' || selectedReason === 'Other fuel shortage condition') && (
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Specify Reason Details</label>
              <textarea
                required
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Explain why fuel cannot be dispensed..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Keep Order Active
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-colors cursor-pointer"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
