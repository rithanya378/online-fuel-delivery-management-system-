import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, FuelTypeCode } from '../../types';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  XCircle,
  Truck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowUpDown,
  Download,
  Upload,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  MapPin,
  Fuel,
  CreditCard,
  Building2,
  User as UserIcon,
} from 'lucide-react';
import { CsvImportModal } from '../common/CsvImportModal';

interface Props {
  onViewOrderDetails: (order: Order) => void;
  onOpenCancelModal: (order: Order) => void;
}

export const AdminOrdersManager: React.FC<Props> = ({ onViewOrderDetails, onOpenCancelModal }) => {
  const {
    orders,
    stations,
    updateOrderStatus,
    advanceOrderStatusToNext,
    triggerInsufficientFuelFlow,
    addToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stationFilter, setStationFilter] = useState<string>('ALL');
  const [fuelFilter, setFuelFilter] = useState<string>('ALL');
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'EXCEPTIONS'>('ALL');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      ord.userName.toLowerCase().includes(search.toLowerCase()) ||
      ord.userPhone.includes(search) ||
      ord.gasStationName.toLowerCase().includes(search.toLowerCase()) ||
      ord.deliveryAddress.street.toLowerCase().includes(search.toLowerCase()) ||
      ord.deliveryAddress.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || ord.status === statusFilter;
    const matchesStation = stationFilter === 'ALL' || ord.gasStationId === stationFilter;
    const matchesFuel = fuelFilter === 'ALL' || ord.fuelTypeCode === fuelFilter;

    if (activeWorkflowTab === 'ACTIVE') {
      if (['DELIVERED', 'CANCELLED', 'REFUND_INITIATED'].includes(ord.status)) return false;
    } else if (activeWorkflowTab === 'DELIVERED') {
      if (ord.status !== 'DELIVERED') return false;
    } else if (activeWorkflowTab === 'EXCEPTIONS') {
      if (!['INSUFFICIENT_FUEL', 'CANCELLED', 'REFUND_INITIATED'].includes(ord.status)) return false;
    }

    return matchesSearch && matchesStatus && matchesStation && matchesFuel;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED':
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            1. Placed
          </span>
        );
      case 'PAYMENT_SUCCESSFUL':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 w-max block">
            2. Payment Successful
          </span>
        );
      case 'ORDER_CONFIRMED':
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 w-max block">
            3. Confirmed
          </span>
        );
      case 'ACCEPTED_BY_STATION':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 w-max block">
            4. Accepted by Station
          </span>
        );
      case 'PREPARING':
      case 'PROCESSING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 w-max block">
            5. Preparing Bowser
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30 animate-pulse flex items-center gap-1 w-max">
            <Truck className="w-3 h-3" />
            6. Out for Delivery
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 w-max">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            7. Delivered
          </span>
        );
      case 'CHECKING_INVENTORY':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 w-max block">
            Checking Inventory
          </span>
        );
      case 'INSUFFICIENT_FUEL':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40 flex items-center gap-1 w-max">
            <AlertTriangle className="w-3 h-3" />
            Insufficient Fuel
          </span>
        );
      case 'REFUND_INITIATED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/40 flex items-center gap-1 w-max">
            <RotateCcw className="w-3 h-3" />
            Refund Initiated
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 w-max block">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 w-max block">
            {status}
          </span>
        );
    }
  };

  const getNextStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED':
      case 'PENDING':
        return 'Verify Payment ➔';
      case 'PAYMENT_SUCCESSFUL':
        return 'Confirm Order ➔';
      case 'ORDER_CONFIRMED':
      case 'CONFIRMED':
        return 'Station Accept ➔';
      case 'ACCEPTED_BY_STATION':
        return 'Start Bowser Prep ➔';
      case 'PREPARING':
      case 'PROCESSING':
        return 'Dispatch Bowser ➔';
      case 'OUT_FOR_DELIVERY':
        return 'Mark Delivered ✓';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="w-6 h-6 text-emerald-400" />
            Order Management Master
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete lifecycle monitoring: Placed ➔ Payment ➔ Confirmation ➔ Station Acceptance ➔ Bowser Prep ➔ Transit ➔ Delivery
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              const headers = [
                'Order ID',
                'User',
                'User Phone',
                'Gas Station',
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
                `"${o.gasStationName}"`,
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
              link.setAttribute('download', `fuel_orders_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              addToast({
                type: 'info',
                title: 'Orders Exported',
                message: `Exported ${filteredOrders.length} order records with all 12 attributes to CSV.`,
              });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV ({filteredOrders.length})</span>
          </button>

          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-950/40"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
        </div>
      </div>

      {/* Visual Lifecycle Architecture Reference Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Standard Workflow Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Standard 7-Stage Order Lifecycle
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
              Happy Path
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 overflow-x-auto gap-1">
            <span className="text-amber-400 whitespace-nowrap">PLACED</span>
            <span className="text-slate-600">➔</span>
            <span className="text-emerald-400 whitespace-nowrap">PAYMENT OK</span>
            <span className="text-slate-600">➔</span>
            <span className="text-blue-400 whitespace-nowrap">CONFIRMED</span>
            <span className="text-slate-600">➔</span>
            <span className="text-indigo-400 whitespace-nowrap">STATION ACCEPT</span>
            <span className="text-slate-600">➔</span>
            <span className="text-purple-400 whitespace-nowrap">PREPARING</span>
            <span className="text-slate-600">➔</span>
            <span className="text-orange-400 whitespace-nowrap">EN ROUTE</span>
            <span className="text-slate-600">➔</span>
            <span className="text-emerald-400 whitespace-nowrap">DELIVERED</span>
          </div>
        </div>

        {/* Insufficient Fuel Exception Flow Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Insufficient Fuel Fallback Workflow
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 font-bold border border-rose-800">
              Depot Stock Alert
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 overflow-x-auto gap-1">
            <span className="text-amber-400 whitespace-nowrap">ORDER PLACED</span>
            <span className="text-slate-600">➔</span>
            <span className="text-slate-300 whitespace-nowrap">CHECK INVENTORY</span>
            <span className="text-slate-600">➔</span>
            <span className="text-rose-400 whitespace-nowrap">INSUFFICIENT FUEL</span>
            <span className="text-slate-600">➔</span>
            <span className="text-rose-400 whitespace-nowrap">ORDER CANCELLED</span>
            <span className="text-slate-600">➔</span>
            <span className="text-purple-400 whitespace-nowrap">REFUND INITIATED</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Quick Workflow Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full md:w-auto">
          {[
            { id: 'ALL', label: `All Orders (${orders.length})` },
            {
              id: 'ACTIVE',
              label: `Active Pipeline (${orders.filter((o) => !['DELIVERED', 'CANCELLED', 'REFUND_INITIATED'].includes(o.status)).length})`,
            },
            {
              id: 'DELIVERED',
              label: `Delivered (${orders.filter((o) => o.status === 'DELIVERED').length})`,
            },
            {
              id: 'EXCEPTIONS',
              label: `Exceptions / Refunds (${orders.filter((o) => ['INSUFFICIENT_FUEL', 'CANCELLED', 'REFUND_INITIATED'].includes(o.status)).length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveWorkflowTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeWorkflowTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order #, user, location..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLACED">1. Placed</option>
            <option value="PAYMENT_SUCCESSFUL">2. Payment Successful</option>
            <option value="ORDER_CONFIRMED">3. Confirmed</option>
            <option value="ACCEPTED_BY_STATION">4. Accepted by Station</option>
            <option value="PREPARING">5. Preparing</option>
            <option value="OUT_FOR_DELIVERY">6. Out for Delivery</option>
            <option value="DELIVERED">7. Delivered</option>
            <option value="INSUFFICIENT_FUEL">Stock Alert: Insufficient Fuel</option>
            <option value="REFUND_INITIATED">Refund Initiated</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Station Filter */}
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="ALL">All Stations</option>
            {stations.map((st) => (
              <option key={st.id} value={st.id}>
                {st.codeName || st.name}
              </option>
            ))}
          </select>

          {/* Fuel Filter */}
          <select
            value={fuelFilter}
            onChange={(e) => setFuelFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="ALL">All Fuels</option>
            <option value="PETROL">Petrol</option>
            <option value="DIESEL">Diesel</option>
            <option value="PREMIUM_PETROL">Premium Petrol</option>
            <option value="BIO_DIESEL">Bio-Diesel</option>
          </select>
        </div>
      </div>

      {/* Orders Table - 12 Full Columns as required */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3.5">1. Order ID</th>
                <th className="p-3.5">2. User</th>
                <th className="p-3.5">3. Gas Station</th>
                <th className="p-3.5">4. Fuel Type</th>
                <th className="p-3.5">5. Qty</th>
                <th className="p-3.5">6. Price/L</th>
                <th className="p-3.5">7. Delivery</th>
                <th className="p-3.5">8. Total</th>
                <th className="p-3.5">9. Delivery Location</th>
                <th className="p-3.5">10. Order Date</th>
                <th className="p-3.5">11. Payment</th>
                <th className="p-3.5">12. Order Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-slate-500">
                    No orders match your filter criteria
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const nextAction = getNextStatusLabel(ord.status);

                  return (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* 1. Order ID */}
                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        {ord.orderNumber}
                      </td>

                      {/* 2. User */}
                      <td className="p-3.5">
                        <div className="font-bold text-white whitespace-nowrap">{ord.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ord.userPhone}</div>
                      </td>

                      {/* 3. Gas Station */}
                      <td className="p-3.5 text-slate-300">
                        <div className="font-semibold text-white whitespace-nowrap">
                          {ord.gasStationName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                          {ord.gasStationAddress}
                        </div>
                      </td>

                      {/* 4. Fuel Type */}
                      <td className="p-3.5">
                        <span className="font-semibold text-amber-400 whitespace-nowrap">
                          {ord.fuelTypeName}
                        </span>
                      </td>

                      {/* 5. Quantity */}
                      <td className="p-3.5 font-bold font-mono text-white whitespace-nowrap">
                        {ord.quantityLitres} L
                      </td>

                      {/* 6. Price/Litre */}
                      <td className="p-3.5 font-mono text-slate-300 whitespace-nowrap">
                        ₹{ord.pricePerLitre.toFixed(2)}
                      </td>

                      {/* 7. Delivery Charge */}
                      <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                        ₹{ord.deliveryCharge.toFixed(2)}
                      </td>

                      {/* 8. Total Amount */}
                      <td className="p-3.5 font-mono font-black text-emerald-400 whitespace-nowrap">
                        ₹{ord.totalAmount.toFixed(2)}
                      </td>

                      {/* 9. Delivery Location */}
                      <td className="p-3.5 max-w-[160px]">
                        <div className="font-semibold text-slate-200 truncate" title={ord.deliveryAddress.title}>
                          {ord.deliveryAddress.title}
                        </div>
                        <div
                          className="text-[10px] text-slate-400 truncate"
                          title={`${ord.deliveryAddress.street}, ${ord.deliveryAddress.city}`}
                        >
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
                          {/* Quick Step Advance */}
                          {nextAction && (
                            <button
                              onClick={() => advanceOrderStatusToNext(ord.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow cursor-pointer whitespace-nowrap"
                              title="Advance Order to Next Stage in Pipeline"
                            >
                              {nextAction}
                            </button>
                          )}

                          {/* Trigger Insufficient Fuel Exception */}
                          {['PLACED', 'PENDING', 'ORDER_CONFIRMED', 'CONFIRMED', 'ACCEPTED_BY_STATION'].includes(
                            ord.status
                          ) && (
                            <button
                              onClick={() => triggerInsufficientFuelFlow(ord.id)}
                              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors cursor-pointer"
                              title="Test Insufficient Stock Exception & Refund"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* View Details Manifest */}
                          <button
                            onClick={() => onViewOrderDetails(ord)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
                            title="View Full Digital Manifest"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Cancel */}
                          {ord.status !== 'DELIVERED' &&
                            ord.status !== 'CANCELLED' &&
                            ord.status !== 'REFUND_INITIATED' && (
                              <button
                                onClick={() => onOpenCancelModal(ord)}
                                className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer border border-slate-800"
                                title="Cancel Order"
                              >
                                <XCircle className="w-3.5 h-3.5" />
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
      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        defaultType="orders"
      />
    </div>
  );
};

