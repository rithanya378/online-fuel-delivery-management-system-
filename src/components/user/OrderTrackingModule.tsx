import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { InvoiceModal } from '../common/InvoiceModal';
import {
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  Star,
  FileText,
  AlertCircle,
  Building2,
  Phone,
  Fuel,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Calendar,
  XCircle,
  DollarSign,
  Share2,
  KeyRound,
  Car,
  LifeBuoy,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface OrderTrackingModuleProps {
  justPlacedOrderId?: string | null;
  onNavigateToOrder?: () => void;
  onLodgeSupportTicket?: (orderId: string) => void;
}

export const OrderTrackingModule: React.FC<OrderTrackingModuleProps> = ({
  justPlacedOrderId,
  onNavigateToOrder,
  onLodgeSupportTicket,
}) => {
  const {
    currentUser,
    orders,
    cancelOrder,
    updateOrderStatus,
    advanceOrderStatusToNext,
    submitOrderReview,
    placeOrder,
  } = useApp();

  const userOrders = orders.filter((o) => o.userId === currentUser.id);

  // Selected Order for Detail View
  const [selectedOrderId, setSelectedOrderId] = useState<string>(() => {
    if (justPlacedOrderId) return justPlacedOrderId;
    const active = userOrders.find((o) =>
      ['PLACED', 'PAYMENT_SUCCESSFUL', 'ORDER_CONFIRMED', 'ACCEPTED_BY_STATION', 'PREPARING', 'PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY'].includes(o.status)
    );
    return active ? active.id : userOrders[0]?.id || '';
  });

  // Keep selected order in sync if justPlacedOrderId changes
  React.useEffect(() => {
    if (justPlacedOrderId) {
      setSelectedOrderId(justPlacedOrderId);
    }
  }, [justPlacedOrderId]);

  // Cancel Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of schedule / location');

  // Invoice Modal State
  const [viewInvoiceOrder, setViewInvoiceOrder] = useState<Order | null>(null);

  // Review Modal State
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Reorder State
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState<string | null>(null);

  const selectedOrder = userOrders.find((o) => o.id === selectedOrderId) || userOrders[0];

  // 7 Standard Pipeline Stages
  const STANDARD_PIPELINE_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'PLACED', label: '1. Placed', desc: 'Submitted by user' },
    { status: 'PAYMENT_SUCCESSFUL', label: '2. Payment OK', desc: 'Secure payment captured' },
    { status: 'ORDER_CONFIRMED', label: '3. Confirmed', desc: 'Depot assigned & verified' },
    { status: 'ACCEPTED_BY_STATION', label: '4. Accepted', desc: 'Station allocated stock' },
    { status: 'PREPARING', label: '5. Preparing', desc: 'Bowser tank filling & calibrated' },
    { status: 'OUT_FOR_DELIVERY', label: '6. Out for Delivery', desc: 'Pilot en route to GPS location' },
    { status: 'DELIVERED', label: '7. Delivered', desc: 'Hazard pumping complete' },
  ];

  // 5 Exception Stages (Insufficient Fuel)
  const EXCEPTION_STEPS = [
    { num: 1, label: 'Order Placed', desc: 'Customer placed order', status: 'PLACED' },
    { num: 2, label: 'Station Checks Stock', desc: 'Inventory scan at depot', status: 'CHECKING' },
    { num: 3, label: 'Insufficient Fuel', desc: 'Requested litres unavailable', status: 'INSUFFICIENT' },
    { num: 4, label: 'Order Cancelled', desc: 'Cancelled automatically', status: 'CANCELLED' },
    { num: 5, label: 'Refund Initiated', desc: '100% funds returned', status: 'REFUND' },
  ];

  const isInsufficientFuelException =
    selectedOrder &&
    (selectedOrder.status === 'INSUFFICIENT_FUEL' ||
      selectedOrder.status === 'REFUND_INITIATED' ||
      selectedOrder.cancellationReason?.toLowerCase().includes('insufficient'));

  const getStandardStepIndex = (status: OrderStatus) => {
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

  const handleCancelSubmit = () => {
    if (!selectedOrder) return;
    cancelOrder(selectedOrder.id, cancelReason, 'USER');
    setShowCancelModal(false);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;
    submitOrderReview(reviewOrder.id, rating, comment);
    setReviewOrder(null);
    setComment('');
  };

  // Reorder past order
  const handleReorder = async (order: Order) => {
    const res = await placeOrder({
      userId: currentUser.id,
      fuelTypeCode: order.fuelTypeCode,
      quantityLitres: order.quantityLitres,
      deliveryAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      deliveryInstructions: order.deliveryDetails.vehicleNumber
        ? `Refill repeat for previous order ${order.orderNumber}`
        : '',
    });

    if (res.success && res.orderId) {
      setSelectedOrderId(res.orderId);
      setReorderSuccessMsg(`Reordered ${order.quantityLitres}L of ${order.fuelTypeName}! New Order ID: ${res.orderId}`);
      setTimeout(() => setReorderSuccessMsg(null), 5000);
    }
  };

  // Simulate Next Dispatch Step (Demo helper)
  const handleSimulateNextStep = (order: Order) => {
    advanceOrderStatusToNext(order.id);
  };

  if (userOrders.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-md space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <Truck className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white">No Fuel Delivery Orders Found</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          You haven't placed any fuel delivery orders yet with this account. Switch to the Fuel Ordering module to place your first order.
        </p>
        {onNavigateToOrder && (
          <button
            onClick={onNavigateToOrder}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <Fuel className="w-4 h-4" />
            <span>Place First Fuel Order</span>
          </button>
        )}
      </div>
    );
  }

  const currentStepIdx = selectedOrder ? getStandardStepIndex(selectedOrder.status) : 0;
  const isCancelled =
    selectedOrder?.status === 'CANCELLED' ||
    selectedOrder?.status === 'REFUND_INITIATED' ||
    selectedOrder?.status === 'INSUFFICIENT_FUEL';
  const isDelivered = selectedOrder?.status === 'DELIVERED';
  const canCancel =
    selectedOrder &&
    !isCancelled &&
    !isDelivered &&
    ['PLACED', 'PENDING', 'ORDER_CONFIRMED', 'CONFIRMED'].includes(selectedOrder.status);

  return (
    <div className="space-y-6">
      {reorderSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-sm flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{reorderSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Orders Master List + Selected Detail & Live Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: All Orders History List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Order History ({userOrders.length})
            </h3>
            <span className="text-xs text-slate-500">Live Status Sync</span>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {userOrders.map((ord) => {
              const isSelected = ord.id === selectedOrderId;
              const isPetrol = ord.fuelTypeCode.includes('PETROL');

              let statusBg = 'bg-slate-800 text-slate-300 border-slate-700';
              if (ord.status === 'CONFIRMED') statusBg = 'bg-indigo-950 text-indigo-300 border-indigo-700';
              if (ord.status === 'PROCESSING') statusBg = 'bg-amber-950 text-amber-300 border-amber-700';
              if (ord.status === 'OUT_FOR_DELIVERY') statusBg = 'bg-teal-950 text-teal-300 border-teal-700 animate-pulse';
              if (ord.status === 'DELIVERED') statusBg = 'bg-emerald-950 text-emerald-300 border-emerald-700';
              if (ord.status === 'CANCELLED') statusBg = 'bg-rose-950 text-rose-300 border-rose-700';

              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500 shadow-lg shadow-emerald-950/20'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-xs text-white block">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {new Date(ord.createdAt).toLocaleDateString()} at{' '}
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${statusBg}`}>
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Fuel className={`w-3.5 h-3.5 ${isPetrol ? 'text-emerald-400' : 'text-amber-400'}`} />
                      <span>{ord.quantityLitres}L {ord.fuelTypeName}</span>
                    </div>
                    <span className="font-mono font-bold text-white">${ord.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {ord.gasStationName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Live Order Details, Pipeline Timeline & Actions */}
        {selectedOrder && (
          <div className="lg:col-span-2 space-y-6">
            {/* Top Order Card Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white font-mono">{selectedOrder.orderNumber}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                        selectedOrder.status === 'DELIVERED'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : selectedOrder.status === 'CANCELLED'
                          ? 'bg-rose-950 text-rose-300 border-rose-700'
                          : selectedOrder.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-teal-950 text-teal-300 border-teal-700 animate-pulse'
                          : 'bg-indigo-950 text-indigo-300 border-indigo-700'
                      }`}
                    >
                      {selectedOrder.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()} • Transaction ID:{' '}
                    <span className="font-mono text-slate-300">{selectedOrder.transactionId}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewInvoiceOrder(selectedOrder)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>View / Download Invoice</span>
                  </button>

                  <button
                    onClick={() => handleReorder(selectedOrder)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold border border-indigo-700 transition-colors cursor-pointer"
                    title="1-Click Reorder"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reorder</span>
                  </button>
                </div>
              </div>

              {/* Status Timeline Progression */}
              <div className="py-6 border-b border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    {isInsufficientFuelException ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span className="text-rose-400">Insufficient Fuel Exception Workflow</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>Live Dispatch Progression (7-Stage Pipeline)</span>
                      </>
                    )}
                  </span>
                  {selectedOrder.status !== 'DELIVERED' &&
                    selectedOrder.status !== 'CANCELLED' &&
                    !isInsufficientFuelException && (
                      <button
                        onClick={() => handleSimulateNextStep(selectedOrder)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Advance Next Stage (Live Demo)
                      </button>
                    )}
                </div>

                {isInsufficientFuelException ? (
                  <div className="space-y-4">
                    {/* 5-Step Insufficient Fuel Visual Pipeline */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {EXCEPTION_STEPS.map((step) => {
                        return (
                          <div
                            key={step.num}
                            className={`p-2.5 rounded-xl border text-center ${
                              step.num === 5
                                ? 'bg-purple-950/60 border-purple-500 shadow-md'
                                : step.num >= 3
                                ? 'bg-rose-950/50 border-rose-800 text-rose-200'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div
                              className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                                step.num === 5
                                  ? 'bg-purple-500 text-white font-black'
                                  : step.num >= 3
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {step.num}
                            </div>
                            <div className="text-xs font-bold text-white">{step.label}</div>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{step.desc}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs space-y-1.5">
                      <div className="font-bold flex items-center gap-2 text-sm text-rose-300">
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Order Cancelled & 100% Refund Initiated</span>
                      </div>
                      <p className="text-rose-200">
                        Reason: "{selectedOrder.cancellationReason || 'Insufficient station fuel inventory'}" by Depot Management.
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-rose-900/60 text-[11px]">
                        <span className="text-emerald-400 font-semibold">
                          Refund Status: <strong className="font-mono">{selectedOrder.paymentStatus}</strong> (₹{selectedOrder.totalAmount.toFixed(2)})
                        </span>
                        <span className="text-slate-400 font-mono">Ref: {selectedOrder.transactionId}</span>
                      </div>
                    </div>
                  </div>
                ) : isCancelled ? (
                  <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Order Cancelled</span>
                    </div>
                    <p className="text-rose-300">
                      Cancellation Reason: "{selectedOrder.cancellationReason || 'User Request'}" by{' '}
                      {selectedOrder.cancelledBy || 'USER'}.
                    </p>
                    <p className="text-emerald-400 font-semibold text-[11px] pt-1">
                      Full refund of ₹{selectedOrder.totalAmount.toFixed(2)} has been credited to your payment method.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 relative">
                    {STANDARD_PIPELINE_STEPS.map((step, idx) => {
                      const currentStandardIdx = getStandardStepIndex(selectedOrder.status);
                      const isCompleted = currentStandardIdx >= idx;
                      const isCurrent = currentStandardIdx === idx;

                      return (
                        <div
                          key={step.status}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isCurrent
                              ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                              : isCompleted
                              ? 'bg-slate-900 border-emerald-800/60 text-emerald-400'
                              : 'bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all ${
                              isCurrent
                                ? 'bg-emerald-500 text-slate-950 font-black animate-pulse'
                                : isCompleted
                                ? 'bg-emerald-800 text-emerald-100'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isCompleted && !isCurrent ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <div
                            className={`text-xs font-bold leading-tight ${
                              isCurrent ? 'text-emerald-400' : isCompleted ? 'text-white' : 'text-slate-500'
                            }`}
                          >
                            {step.label}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block leading-tight">
                            {step.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Safety OTP & Vehicle Details Row */}
              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Safety Dispense OTP Box */}
                {selectedOrder.status !== 'CANCELLED' && (
                  <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 p-4 rounded-xl border border-indigo-500/40 space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-indigo-300 uppercase font-bold tracking-wider flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Safety Dispense OTP</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedOrder.status === 'DELIVERED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-indigo-900 text-indigo-200 border border-indigo-700 animate-pulse'
                      }`}>
                        {selectedOrder.status === 'DELIVERED' ? 'Verified & Closed' : 'Active Delivery Code'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="font-mono text-2xl font-black text-amber-400 tracking-widest bg-slate-950 px-4 py-1.5 rounded-lg border border-amber-500/40 inline-block shadow-inner">
                        {selectedOrder.otpCode || '582914'}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Share this 6-digit PIN with the bowser pilot strictly <strong>after</strong> zero-meter inspection on site.
                      </p>
                    </div>
                  </div>
                )}

                {/* Receiving Vehicle Asset */}
                {selectedOrder.vehicleDetails && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-emerald-400" /> Receiving Vehicle / Asset
                    </span>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-sm">
                        {selectedOrder.vehicleDetails.makeModel}
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {selectedOrder.vehicleDetails.registrationNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      {selectedOrder.vehicleDetails.category && (
                        <span>Type: {selectedOrder.vehicleDetails.category}</span>
                      )}
                      {selectedOrder.vehicleDetails.tankCapacityLitres && (
                        <span>Tank Cap: {selectedOrder.vehicleDetails.tankCapacityLitres}L</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Specification Summary Cards */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                {/* 1. Fuel Details */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-emerald-400" /> Fuel Specification
                  </span>
                  <div className="font-bold text-white text-sm">
                    {selectedOrder.quantityLitres} Litres
                  </div>
                  <div className="text-slate-300">{selectedOrder.fuelTypeName}</div>
                  <div className="text-slate-500 text-[11px]">
                    Price: ${selectedOrder.pricePerLitre.toFixed(2)}/L
                  </div>
                </div>

                {/* 2. Gas Station Info */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" /> Assigned Gas Station
                  </span>
                  <div className="font-bold text-white text-sm">{selectedOrder.gasStationName}</div>
                  <div className="text-slate-400 text-[11px] line-clamp-2">{selectedOrder.gasStationAddress}</div>
                </div>

                {/* 3. Financial Breakdown */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Financial Summary
                  </span>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Fuel:</span>
                    <span className="font-mono text-slate-200">${selectedOrder.fuelCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Delivery:</span>
                    <span className="font-mono text-slate-200">${selectedOrder.deliveryCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Tax:</span>
                    <span className="font-mono text-slate-200">${selectedOrder.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800 flex justify-between font-bold text-white">
                    <span>Total:</span>
                    <span className="font-mono text-emerald-400">${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Details & Bowser Driver Card */}
              <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-900 text-teal-400 border border-slate-700">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white">
                      Delivery Address: {selectedOrder.deliveryAddress.title}
                    </h5>
                    <p className="text-slate-400 mt-0.5">
                      {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}{' '}
                      {selectedOrder.deliveryAddress.zipCode}
                    </p>
                    {selectedOrder.deliveryDetails.driverName && (
                      <p className="text-teal-300 font-semibold mt-1 flex items-center gap-3">
                        <span>Driver: {selectedOrder.deliveryDetails.driverName}</span>
                        <span>Vehicle: {selectedOrder.deliveryDetails.vehicleNumber}</span>
                        <span>Phone: {selectedOrder.deliveryDetails.driverPhone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {/* Support / Grievance Button */}
                  {onLodgeSupportTicket && (
                    <button
                      onClick={() => onLodgeSupportTicket(selectedOrder.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Report issue with this order"
                    >
                      <LifeBuoy className="w-3.5 h-3.5 text-rose-400" />
                      <span>Report Grievance</span>
                    </button>
                  )}

                  {/* Cancel Action */}
                  {canCancel && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}

                  {/* Review Prompt if Delivered */}
                  {isDelivered && !selectedOrder.review && (
                    <button
                      onClick={() => setReviewOrder(selectedOrder)}
                      className="px-4 py-2 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>Rate Delivery Experience</span>
                    </button>
                  )}
                </div>

                {selectedOrder.review && (
                  <div className="bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-lg text-xs text-amber-200">
                    <div className="flex items-center gap-1 font-bold">
                      {[...Array(selectedOrder.review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                      <span className="ml-1">Reviewed</span>
                    </div>
                    {selectedOrder.review.comment && (
                      <p className="text-[11px] text-amber-300 mt-1">"{selectedOrder.review.comment}"</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base pb-2 border-b border-slate-800">
              <ShieldAlert className="w-5 h-5" />
              <span>Cancel Fuel Delivery Order</span>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to cancel order <strong>{selectedOrder?.orderNumber}</strong>? The reserved fuel will be returned to the station's underground tank and your payment will be refunded immediately.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Reason for Cancellation *
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="Change of schedule / location">Change of schedule / location</option>
                <option value="Vehicle refueled at another station">Vehicle refueled at another station</option>
                <option value="Ordered incorrect fuel type or quantity">Ordered incorrect fuel type or quantity</option>
                <option value="Delivery time delay">Delivery time delay</option>
                <option value="Other / Commercial reason">Other / Commercial reason</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Confirm Cancellation & Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleReviewSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base pb-2 border-b border-slate-800">
              <Star className="w-5 h-5 fill-amber-400" />
              <span>Rate Fuel Delivery Service</span>
            </div>

            <p className="text-xs text-slate-300">
              How was your fuel dispensing experience for order <strong>{reviewOrder.orderNumber}</strong> from{' '}
              <strong>{reviewOrder.gasStationName}</strong>?
            </p>

            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl focus:outline-none transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Comments / Operator Feedback
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g., Driver was very punctual and dispensing was fast and clean."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewOrder(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice Modal */}
      {viewInvoiceOrder && (
        <InvoiceModal order={viewInvoiceOrder} onClose={() => setViewInvoiceOrder(null)} />
      )}
    </div>
  );
};
