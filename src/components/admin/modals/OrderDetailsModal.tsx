import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Order, OrderStatus } from '../../../types';
import {
  X,
  Fuel,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Printer,
  Calendar,
  Clock,
  User,
  Building2,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCancelModal?: (order: Order) => void;
}

export const OrderDetailsModal: React.FC<Props> = ({ order, isOpen, onClose, onOpenCancelModal }) => {
  const { updateOrderStatus, advanceOrderStatusToNext, triggerInsufficientFuelFlow } = useApp();

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isInsufficientFuelOrder =
    order.status === 'INSUFFICIENT_FUEL' ||
    order.status === 'REFUND_INITIATED' ||
    order.cancellationReason?.toLowerCase().includes('insufficient');

  // 7 standard stages
  const standardStages: { key: OrderStatus; label: string; num: number }[] = [
    { key: 'PLACED', label: 'Placed', num: 1 },
    { key: 'PAYMENT_SUCCESSFUL', label: 'Payment Successful', num: 2 },
    { key: 'ORDER_CONFIRMED', label: 'Order Confirmed', num: 3 },
    { key: 'ACCEPTED_BY_STATION', label: 'Accepted by Station', num: 4 },
    { key: 'PREPARING', label: 'Preparing', num: 5 },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', num: 6 },
    { key: 'DELIVERED', label: 'Delivered', num: 7 },
  ];

  // 5 insufficient fuel stages
  const fallbackStages = [
    { label: 'Order Placed', num: 1 },
    { label: 'Station Checks Inventory', num: 2 },
    { label: 'Insufficient Fuel', num: 3 },
    { label: 'Order Cancelled', num: 4 },
    { label: 'Refund Initiated', num: 5 },
  ];

  const getStandardStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED':
      case 'PENDING':
        return 0;
      case 'PAYMENT_SUCCESSFUL':
        return 1;
      case 'ORDER_CONFIRMED':
      case 'CONFIRMED':
        return 2;
      case 'ACCEPTED_BY_STATION':
        return 3;
      case 'PREPARING':
      case 'PROCESSING':
        return 4;
      case 'OUT_FOR_DELIVERY':
        return 5;
      case 'DELIVERED':
        return 6;
      default:
        return -1;
    }
  };

  const currentStandardIndex = getStandardStageIndex(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-black text-sm">
              {order.orderNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Order Details & Digital Manifest</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {order.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                12-Attribute Digital Fuel Manifest • {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Print Tax Invoice"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Lifecycle Progress Pipeline Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {isInsufficientFuelOrder ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-400">Insufficient Fuel Exception Workflow</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Standard 7-Stage Order Pipeline</span>
                  </>
                )}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  order.status === 'DELIVERED'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : isInsufficientFuelOrder
                    ? 'bg-purple-950 text-purple-300 border-purple-800'
                    : 'bg-blue-950 text-blue-300 border-blue-800'
                }`}
              >
                Status: {order.status.replace(/_/g, ' ')}
              </span>
            </div>

            {!isInsufficientFuelOrder ? (
              /* Standard 7-Step Pipeline */
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
                {standardStages.map((stage, idx) => {
                  const isPassed = currentStandardIndex > idx;
                  const isCurrent = currentStandardIndex === idx;

                  return (
                    <div
                      key={stage.key}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-emerald-950/60 border-emerald-500 shadow-md scale-102'
                          : isPassed
                          ? 'bg-slate-900 border-emerald-800/60 text-emerald-400'
                          : 'bg-slate-950 border-slate-800/80 text-slate-500'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                          isCurrent
                            ? 'bg-emerald-500 text-slate-950 font-black animate-pulse'
                            : isPassed
                            ? 'bg-emerald-800 text-emerald-200'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isPassed ? '✓' : stage.num}
                      </div>
                      <div
                        className={`text-[10px] font-bold leading-tight ${
                          isCurrent ? 'text-white' : isPassed ? 'text-emerald-300' : 'text-slate-500'
                        }`}
                      >
                        {stage.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Insufficient Fuel 5-Step Pipeline */
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {fallbackStages.map((stage, idx) => {
                  return (
                    <div
                      key={stage.label}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        idx === 4
                          ? 'bg-purple-950/60 border-purple-500 shadow-md'
                          : idx >= 2
                          ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                          idx === 4
                            ? 'bg-purple-500 text-white font-black'
                            : idx >= 2
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {stage.num}
                      </div>
                      <div className="text-[10px] font-bold text-white leading-tight">{stage.label}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Actions in Modal */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900">
              <span className="text-[11px] text-slate-400">
                Payment Status:{' '}
                <strong className="text-emerald-400 font-mono">{order.paymentStatus}</strong> (Mode:{' '}
                {order.paymentMethod})
              </span>

              <div className="flex items-center gap-2">
                {!isInsufficientFuelOrder && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                  <button
                    onClick={() => advanceOrderStatusToNext(order.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Advance to Next Stage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {!isInsufficientFuelOrder &&
                  ['PLACED', 'PENDING', 'ORDER_CONFIRMED', 'CONFIRMED', 'ACCEPTED_BY_STATION'].includes(
                    order.status
                  ) && (
                    <button
                      onClick={() => triggerInsufficientFuelFlow(order.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Trigger Insufficient Fuel Flow</span>
                    </button>
                  )}
              </div>
            </div>
          </div>

          {/* Complete 12-Attribute Manifest Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              12 Core Order Attributes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* 1. Order ID */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">1. Order ID</span>
                <span className="text-sm font-black font-mono text-emerald-400 mt-1 block">
                  {order.orderNumber}
                </span>
                <span className="text-[10px] font-mono text-slate-500">Ref: {order.id}</span>
              </div>

              {/* 2. User */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">2. User (Customer)</span>
                <span className="text-sm font-bold text-white mt-1 block truncate">{order.userName}</span>
                <span className="text-[11px] font-mono text-slate-400 block">{order.userPhone}</span>
                <span className="text-[10px] text-slate-500 truncate block">{order.userEmail}</span>
              </div>

              {/* 3. Gas Station */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">3. Gas Station</span>
                <span className="text-sm font-bold text-white mt-1 block truncate">{order.gasStationName}</span>
                <span className="text-[10px] text-slate-400 line-clamp-2">{order.gasStationAddress}</span>
              </div>

              {/* 4. Fuel Type */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">4. Fuel Type</span>
                <span className="text-sm font-bold text-amber-400 mt-1 block">{order.fuelTypeName}</span>
                <span className="text-[10px] text-slate-500 font-mono">Code: {order.fuelTypeCode}</span>
              </div>

              {/* 5. Quantity */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">5. Quantity</span>
                <span className="text-sm font-black font-mono text-white mt-1 block">
                  {order.quantityLitres} Litres
                </span>
                <span className="text-[10px] text-slate-500">Hazard Verified</span>
              </div>

              {/* 6. Price / Litre */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">6. Price / Litre</span>
                <span className="text-sm font-bold font-mono text-white mt-1 block">
                  ₹{order.pricePerLitre.toFixed(2)} / L
                </span>
                <span className="text-[10px] text-slate-500">Government Regulated</span>
              </div>

              {/* 7. Delivery Charge */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">7. Delivery Charge</span>
                <span className="text-sm font-bold font-mono text-slate-300 mt-1 block">
                  ₹{order.deliveryCharge.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500">Bowser Dispatch Surcharge</span>
              </div>

              {/* 8. Total Amount */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">8. Total Amount</span>
                <span className="text-base font-black font-mono text-emerald-400 mt-1 block">
                  ₹{order.totalAmount.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500">Fuel: ₹{order.fuelCost.toFixed(2)} + Delivery</span>
              </div>

              {/* 9. Delivery Location */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">9. Delivery Location</span>
                <span className="text-xs font-bold text-white mt-1 block truncate">
                  {order.deliveryAddress.title}
                </span>
                <span className="text-[10px] text-slate-400 line-clamp-2">
                  {order.deliveryAddress.street}, {order.deliveryAddress.city} ({order.deliveryAddress.zipCode})
                </span>
              </div>

              {/* 10. Order Date */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">10. Order Date</span>
                <span className="text-xs font-bold font-mono text-white mt-1 block">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(order.createdAt).toLocaleTimeString()}
                </span>
              </div>

              {/* 11. Payment Status */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">11. Payment Status</span>
                <span
                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded border inline-block mt-1 ${
                    order.paymentStatus === 'SUCCESSFUL'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : order.paymentStatus === 'REFUND_INITIATED' || order.paymentStatus === 'REFUNDED'
                      ? 'bg-purple-950 text-purple-300 border-purple-800'
                      : 'bg-amber-950 text-amber-400 border-amber-800'
                  }`}
                >
                  {order.paymentStatus}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block mt-1 truncate">
                  {order.transactionId}
                </span>
              </div>

              {/* 12. Order Status */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">12. Order Status</span>
                <span className="text-xs font-extrabold text-white mt-1 block">
                  {order.status.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">Verified in System</span>
              </div>
            </div>
          </div>

          {/* Assigned Bowser Details */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-orange-400 font-bold">
              <Truck className="w-4 h-4" />
              <span>Assigned Delivery Bowser & Dispatch Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-slate-500 text-[10px] block">Driver:</span>
                <span className="text-white font-semibold">
                  {order.deliveryDetails?.driverName || 'Dispatch Pending'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Bowser Vehicle:</span>
                <span className="text-white font-semibold">
                  {order.deliveryDetails?.vehicleNumber || 'Hazard Unit DL-01-BW-4091'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Driver Phone:</span>
                <span className="text-slate-300 font-mono">
                  {order.deliveryDetails?.driverPhone || '+91 98444 11223'}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Info (if cancelled or insufficient fuel) */}
          {(order.status === 'CANCELLED' ||
            order.status === 'REFUND_INITIATED' ||
            order.status === 'INSUFFICIENT_FUEL') && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/80 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <XCircle className="w-4 h-4" />
                <span>Order Cancellation / Exception Record</span>
              </div>
              <p className="text-slate-300">
                <span className="font-semibold text-white">Reason:</span>{' '}
                {order.cancellationReason || 'Insufficient station fuel inventory'}
              </p>
              <p className="text-slate-400 text-[11px]">
                Cancelled By: {order.cancelledBy || 'GAS_STATION'} | Refund Status: {order.paymentStatus}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

