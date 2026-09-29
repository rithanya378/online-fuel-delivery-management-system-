import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  Truck,
  Search,
  Eye,
  XCircle,
  CheckCircle2,
  Clock,
  MapPin,
  FileSpreadsheet,
  AlertTriangle,
  Fuel,
  Filter,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface Props {
  onViewOrderDetails: (order: Order) => void;
  onOpenCancelModal: (order: Order) => void;
}

export const GasStationOrders: React.FC<Props> = ({ onViewOrderDetails, onOpenCancelModal }) => {
  const {
    currentStation,
    orders,
    updateOrderStatus,
    advanceOrderStatusToNext,
    triggerInsufficientFuelFlow,
    addToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'TODAY' | 'INCOMING' | 'PROCESSING' | 'COMPLETED' | 'EXCEPTIONS'>('ALL');

  if (!currentStation) return null;

  const stationOrders = orders.filter((o) => o.gasStationId === currentStation.id);

  // Today orders
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayOrdersList = stationOrders.filter((o) => o.createdAt.startsWith(todayDateStr));

  const filteredOrders = stationOrders.filter((ord) => {
    // Search filter
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      ord.userName.toLowerCase().includes(search.toLowerCase()) ||
      ord.userPhone.includes(search) ||
      ord.deliveryAddress.street.toLowerCase().includes(search.toLowerCase()) ||
      ord.deliveryAddress.city.toLowerCase().includes(search.toLowerCase()) ||
      ord.fuelTypeName.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    // Quick Tab filter
    if (activeTabFilter === 'TODAY') {
      if (!ord.createdAt.startsWith(todayDateStr)) return false;
    } else if (activeTabFilter === 'INCOMING') {
      if (!['PLACED', 'PENDING', 'ORDER_CONFIRMED', 'CONFIRMED'].includes(ord.status)) return false;
    } else if (activeTabFilter === 'PROCESSING') {
      if (!['ACCEPTED_BY_STATION', 'PREPARING', 'PROCESSING', 'OUT_FOR_DELIVERY'].includes(ord.status)) return false;
    } else if (activeTabFilter === 'COMPLETED') {
      if (ord.status !== 'DELIVERED') return false;
    } else if (activeTabFilter === 'EXCEPTIONS') {
      if (!['INSUFFICIENT_FUEL', 'CANCELLED', 'REFUND_INITIATED'].includes(ord.status)) return false;
    }

    // Dropdown status filter
    if (statusFilter !== 'ALL' && ord.status !== statusFilter) return false;

    return true;
  });

  const completedOrders = stationOrders.filter((o) => o.status === 'DELIVERED');
  const totalDeliveredLitres = completedOrders.reduce((acc, o) => acc + o.quantityLitres, 0);
  const cancelledOrders = stationOrders.filter((o) => ['CANCELLED', 'REFUND_INITIATED', 'INSUFFICIENT_FUEL'].includes(o.status));
  const incomingOrders = stationOrders.filter((o) => ['PLACED', 'PENDING', 'ORDER_CONFIRMED', 'CONFIRMED'].includes(o.status));

  const handleAcceptOrder = (order: Order) => {
    const fuelInv = currentStation.inventory[order.fuelTypeCode];
    const availableStock = fuelInv ? fuelInv.availableLitres : 0;

    if (order.quantityLitres > availableStock) {
      addToast({
        type: 'error',
        title: 'Overbooking Prevented',
        message: `Cannot accept order: Requested ${order.quantityLitres}L exceeds station's available stock (${availableStock}L). Triggering insufficient stock workflow.`,
      });
      return;
    }

    updateOrderStatus(order.id, 'ACCEPTED_BY_STATION');
    addToast({
      type: 'success',
      title: 'Order Accepted by Station',
      message: `Order ${order.orderNumber} accepted for ${order.userName}. Stock allocated and ready for bowser preparation.`,
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED':
      case 'PENDING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 w-max block">
            1. Placed
          </span>
        );
      case 'PAYMENT_SUCCESSFUL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 w-max block">
            2. Payment OK
          </span>
        );
      case 'ORDER_CONFIRMED':
      case 'CONFIRMED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 w-max block">
            3. Confirmed
          </span>
        );
      case 'ACCEPTED_BY_STATION':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 w-max block">
            4. Accepted by Depot
          </span>
        );
      case 'PREPARING':
      case 'PROCESSING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 w-max block">
            5. Preparing Bowser
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30 animate-pulse w-max block">
            6. Out for Delivery
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 w-max block">
            7. Delivered
          </span>
        );
      case 'INSUFFICIENT_FUEL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40 w-max block">
            Insufficient Fuel
          </span>
        );
      case 'REFUND_INITIATED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/40 w-max block">
            Refund Initiated
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 w-max block">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 w-max block">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-emerald-400" />
            Station Dispatch & Order Register
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Doorstep fuel delivery operations for <strong>{currentStation.name}</strong> ({currentStation.codeName})
          </p>
        </div>

        <button
          onClick={() => {
            const headers = [
              'Order ID',
              'User',
              'User Phone',
              'Fuel Type',
              'Quantity (L)',
              'Price/Litre (INR)',
              'Delivery Charge (INR)',
              'Total Amount (INR)',
              'Delivery Location',
              'Order Date',
              'Payment Status',
              'Order Status',
            ];
            const rows = filteredOrders.map((o) => [
              o.orderNumber,
              `"${o.userName}"`,
              o.userPhone,
              `"${o.fuelTypeName}"`,
              o.quantityLitres,
              o.pricePerLitre,
              o.deliveryCharge,
              o.totalAmount,
              `"${o.deliveryAddress.street}, ${o.deliveryAddress.city}"`,
              new Date(o.createdAt).toLocaleString(),
              o.paymentStatus,
              o.status,
            ]);
            const csvContent =
              'data:text/csv;charset=utf-8,' +
              [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `station_orders_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            addToast({
              type: 'info',
              title: 'Export Complete',
              message: `Exported ${filteredOrders.length} station delivery logs to CSV format.`,
            });
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all self-start sm:self-auto cursor-pointer border border-slate-700"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export Logs ({filteredOrders.length})</span>
        </button>
      </div>

      {/* Lifecycle Architecture Reference Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Standard Workflow Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Standard Fulfillment Workflow
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
              7 Stages
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 overflow-x-auto gap-1">
            <span className="text-amber-400 whitespace-nowrap">PLACED</span>
            <span className="text-slate-600">➔</span>
            <span className="text-emerald-400 whitespace-nowrap">PAYMENT OK</span>
            <span className="text-slate-600">➔</span>
            <span className="text-blue-400 whitespace-nowrap">CONFIRMED</span>
            <span className="text-slate-600">➔</span>
            <span className="text-indigo-400 whitespace-nowrap">ACCEPTED</span>
            <span className="text-slate-600">➔</span>
            <span className="text-purple-400 whitespace-nowrap">PREPARING</span>
            <span className="text-slate-600">➔</span>
            <span className="text-orange-400 whitespace-nowrap">TRANSIT</span>
            <span className="text-slate-600">➔</span>
            <span className="text-emerald-400 whitespace-nowrap">DELIVERED</span>
          </div>
        </div>

        {/* Insufficient Fuel Workflow Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-rose-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Insufficient Stock Fallback Workflow
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 font-bold border border-rose-800">
              Auto-Refund
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 overflow-x-auto gap-1">
            <span className="text-amber-400 whitespace-nowrap">ORDER PLACED</span>
            <span className="text-slate-600">➔</span>
            <span className="text-slate-300 whitespace-nowrap">CHECK DEPOT</span>
            <span className="text-slate-600">➔</span>
            <span className="text-rose-400 whitespace-nowrap">INSUFFICIENT</span>
            <span className="text-slate-600">➔</span>
            <span className="text-rose-400 whitespace-nowrap">CANCELLED</span>
            <span className="text-slate-600">➔</span>
            <span className="text-purple-400 whitespace-nowrap">REFUND INITIATED</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Total Station Orders</span>
          <div className="text-2xl font-black text-white font-mono">{stationOrders.length}</div>
          <span className="text-[10px] text-slate-500">All registered jobs</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-1">
          <span className="text-[11px] font-semibold text-amber-300">Incoming / Pending</span>
          <div className="text-2xl font-black text-amber-400 font-mono">{incomingOrders.length}</div>
          <span className="text-[10px] text-amber-400/80">Requires stock review</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-300">Completed Orders</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {completedOrders.length}{' '}
            <span className="text-xs text-slate-400 font-normal font-sans">({totalDeliveredLitres.toLocaleString()} L)</span>
          </div>
          <span className="text-[10px] text-emerald-400/80">Delivered successfully</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-1">
          <span className="text-[11px] font-semibold text-rose-300">Cancelled / Refunded</span>
          <div className="text-2xl font-black text-rose-400 font-mono">{cancelledOrders.length}</div>
          <span className="text-[10px] text-rose-400/80">Stock shortage / cancellations</span>
        </div>
      </div>

      {/* Filter toolbar & Quick Tabs */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: `All Orders (${stationOrders.length})` },
            { id: 'TODAY', label: `Today's Orders (${todayOrdersList.length})` },
            { id: 'INCOMING', label: `Incoming (${incomingOrders.length})` },
            { id: 'PROCESSING', label: `In Transit / Bowser Prep` },
            { id: 'COMPLETED', label: `Delivered (${completedOrders.length})` },
            { id: 'EXCEPTIONS', label: `Stock Alerts / Refunds (${cancelledOrders.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTabFilter(tab.id as any);
                setStatusFilter('ALL');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTabFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex-1 min-w-[260px] relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer, address, fuel..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PLACED">1. Placed</option>
              <option value="PAYMENT_SUCCESSFUL">2. Payment Successful</option>
              <option value="ORDER_CONFIRMED">3. Confirmed</option>
              <option value="ACCEPTED_BY_STATION">4. Accepted by Station</option>
              <option value="PREPARING">5. Preparing Bowser</option>
              <option value="OUT_FOR_DELIVERY">6. Out for Delivery</option>
              <option value="DELIVERED">7. Delivered</option>
              <option value="INSUFFICIENT_FUEL">Stock Alert: Insufficient Fuel</option>
              <option value="REFUND_INITIATED">Refund Initiated</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table - Complete 12 Attributes as required */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3.5">1. Order ID</th>
                <th className="p-3.5">2. User</th>
                <th className="p-3.5">4. Fuel Type</th>
                <th className="p-3.5">5. Qty</th>
                <th className="p-3.5">6. Price/L</th>
                <th className="p-3.5">7. Delivery</th>
                <th className="p-3.5">8. Total</th>
                <th className="p-3.5">Depot Stock Check</th>
                <th className="p-3.5">9. Location</th>
                <th className="p-3.5">10. Date</th>
                <th className="p-3.5">11. Payment</th>
                <th className="p-3.5">12. Order Status</th>
                <th className="p-3.5 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-slate-500">
                    No orders found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const fuelInv = currentStation.inventory[ord.fuelTypeCode];
                  const availableStock = fuelInv ? fuelInv.availableLitres : 0;
                  const hasSufficientStock = ord.quantityLitres <= availableStock;

                  return (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* 1. Order ID */}
                      <td className="p-3.5 font-mono font-bold text-emerald-400 whitespace-nowrap">
                        {ord.orderNumber}
                      </td>

                      {/* 2. User */}
                      <td className="p-3.5">
                        <div className="font-bold text-white whitespace-nowrap">{ord.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ord.userPhone}</div>
                      </td>

                      {/* 4. Fuel Type */}
                      <td className="p-3.5">
                        <span className="font-semibold text-amber-400 whitespace-nowrap">
                          {ord.fuelTypeName}
                        </span>
                      </td>

                      {/* 5. Qty */}
                      <td className="p-3.5 font-bold text-white font-mono whitespace-nowrap">
                        {ord.quantityLitres} L
                      </td>

                      {/* 6. Price/L */}
                      <td className="p-3.5 font-mono text-slate-300 whitespace-nowrap">
                        ₹{ord.pricePerLitre.toFixed(2)}
                      </td>

                      {/* 7. Delivery */}
                      <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                        ₹{ord.deliveryCharge.toFixed(2)}
                      </td>

                      {/* 8. Total */}
                      <td className="p-3.5 font-mono font-black text-emerald-400 whitespace-nowrap">
                        ₹{ord.totalAmount.toFixed(2)}
                      </td>

                      {/* Depot Stock Check */}
                      <td className="p-3.5 whitespace-nowrap">
                        {hasSufficientStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Stock OK ({availableStock}L)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/90 px-2 py-0.5 rounded-full border border-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Shortage ({availableStock}L)</span>
                          </span>
                        )}
                      </td>

                      {/* 9. Delivery Location */}
                      <td className="p-3.5 max-w-[140px]">
                        <div className="text-white text-xs font-medium truncate" title={ord.deliveryAddress.title}>
                          {ord.deliveryAddress.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate" title={`${ord.deliveryAddress.street}, ${ord.deliveryAddress.city}`}>
                          {ord.deliveryAddress.street}, {ord.deliveryAddress.city}
                        </div>
                      </td>

                      {/* 10. Order Date */}
                      <td className="p-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(ord.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* 11. Payment Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            ord.paymentStatus === 'SUCCESSFUL'
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                              : ord.paymentStatus === 'REFUND_INITIATED' || ord.paymentStatus === 'REFUNDED'
                              ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                              : 'bg-amber-950/80 text-amber-400 border-amber-800'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>

                      {/* 12. Order Status */}
                      <td className="p-3.5">{getStatusBadge(ord.status)}</td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewOrderDetails(ord)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                            title="View Manifest & Customer Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Order Acceptance Workflow */}
                          {(ord.status === 'PLACED' || ord.status === 'PENDING' || ord.status === 'ORDER_CONFIRMED' || ord.status === 'CONFIRMED') && (
                            hasSufficientStock ? (
                              <button
                                onClick={() => handleAcceptOrder(ord)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-sm whitespace-nowrap"
                              >
                                Accept Order
                              </button>
                            ) : (
                              <button
                                onClick={() => triggerInsufficientFuelFlow(ord.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-sm whitespace-nowrap flex items-center gap-1"
                                title="Insufficient stock: Auto cancel & initiate 100% refund"
                              >
                                <AlertTriangle className="w-3 h-3" />
                                <span>Trigger Stock Shortage Refund</span>
                              </button>
                            )
                          )}

                          {ord.status === 'ACCEPTED_BY_STATION' && (
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'PREPARING')}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold cursor-pointer whitespace-nowrap"
                            >
                              Prep Bowser
                            </button>
                          )}

                          {(ord.status === 'PREPARING' || ord.status === 'PROCESSING') && (
                            <button
                              onClick={() =>
                                updateOrderStatus(ord.id, 'OUT_FOR_DELIVERY', {
                                  driverName: 'Suresh Verma',
                                  driverPhone: '+91 98444 11223',
                                  vehicleNumber: 'DL-01-BW-4091 (Hazard Unit)',
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold cursor-pointer whitespace-nowrap"
                            >
                              Dispatch Bowser
                            </button>
                          )}

                          {ord.status === 'OUT_FOR_DELIVERY' && (
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'DELIVERED')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer whitespace-nowrap"
                            >
                              Mark Delivered
                            </button>
                          )}

                          {/* Fallback Insufficient Stock Button */}
                          {['PLACED', 'PENDING', 'ORDER_CONFIRMED', 'CONFIRMED', 'ACCEPTED_BY_STATION'].includes(
                            ord.status
                          ) && (
                            <button
                              onClick={() => triggerInsufficientFuelFlow(ord.id)}
                              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 cursor-pointer border border-rose-800/40"
                              title="Insufficient Stock: Cancel & Refund Order"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
