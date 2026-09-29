import React from 'react';
import { Order } from '../../types';
import {
  CheckCircle2,
  Truck,
  Fuel,
  MapPin,
  Car,
  ShieldCheck,
  FileText,
  ArrowRight,
  Clock,
  Building2,
  X,
  Lock,
} from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order;
  onClose: () => void;
  onTrackOrder: () => void;
  onViewInvoice: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onTrackOrder,
  onViewInvoice,
}) => {
  const isPetrol = order.fuelTypeCode.includes('PETROL');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        {/* Header with success badge */}
        <div className="text-center space-y-2 relative">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <h3 className="text-xl font-extrabold text-white">Order Placed Successfully!</h3>
          <p className="text-xs text-slate-400">
            Your fuel delivery request has been confirmed and routed to the nearest depot.
          </p>
        </div>

        {/* Key Info Banner: Order ID + OTP Code */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
              Order Number
            </span>
            <span className="text-sm font-mono font-extrabold text-white mt-0.5 block">
              {order.orderNumber}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block flex items-center justify-end gap-1">
              <Lock className="w-3 h-3" /> Delivery Safety OTP
            </span>
            <span className="text-base font-mono font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-800 inline-block mt-0.5 tracking-widest">
              {order.otpCode || '4892'}
            </span>
          </div>
        </div>

        {/* Order Breakdown Details */}
        <div className="space-y-2.5 text-xs">
          {/* Fuel & Quantity */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${isPetrol ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                <Fuel className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">{order.quantityLitres} Litres {order.fuelTypeName}</span>
                <span className="text-[11px] text-slate-400 font-mono">₹{order.pricePerLitre.toFixed(2)}/L</span>
              </div>
            </div>
            <span className="font-mono font-bold text-white text-sm">₹{order.totalAmount.toFixed(2)}</span>
          </div>

          {/* Vehicle Details if attached */}
          {order.vehicleDetails && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="p-2 rounded-lg bg-slate-900 text-slate-300">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Vehicle Refueling Target</span>
                <span className="font-bold text-slate-200">
                  {order.vehicleDetails.makeModel}{' '}
                  <span className="font-mono text-emerald-400">({order.vehicleDetails.registrationNumber})</span>
                </span>
              </div>
            </div>
          )}

          {/* Delivery Location & Assigned Depot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" /> Delivery Address
              </span>
              <span className="font-bold text-slate-300 mt-1 block">{order.deliveryAddress.title}</span>
              <span className="text-slate-500 line-clamp-1">{order.deliveryAddress.street}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold block flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-400" /> Assigned Depot
              </span>
              <span className="font-bold text-slate-300 mt-1 block">{order.gasStationName}</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> ETA ~{order.deliveryDetails.estimatedMinutes || 25} mins
              </span>
            </div>
          </div>
        </div>

        {/* Safety Note */}
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-[11px] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Share the 4-digit OTP with the mobile bowser operator only after nozzle verification.</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={onViewInvoice}
            className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>View GST Tax Invoice</span>
          </button>

          <button
            id="btn-confirm-modal-track"
            onClick={onTrackOrder}
            className="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Track Live Dispatch</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
