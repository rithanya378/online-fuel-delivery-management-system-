import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FuelTypeCode, Order, OrderStatus, StationInventory } from '../../types';
import {
  Building2,
  Fuel,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Eye,
  XCircle,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  onOpenRestockModal: (fuelCode: FuelTypeCode) => void;
  onViewOrderDetails: (order: Order) => void;
  onOpenCancelModal: (order: Order) => void;
}

export const GasStationDashboard: React.FC<Props> = ({
  onOpenRestockModal,
  onViewOrderDetails,
  onOpenCancelModal,
}) => {
  const { currentStation, orders, fuelPrices, updateOrderStatus, setStationTab, addToast } = useApp();

  if (!currentStation) {
    return (
      <div className="p-8 text-center text-slate-400">
        No active gas station selected. Switch station in the top bar.
      </div>
    );
  }

  // Filter orders for this station
  const stationOrders = orders.filter((o) => o.gasStationId === currentStation.id);

  // Exact 8 Metrics requested:
  // 1. Today's orders
  const todayOrders = stationOrders.length;
  // 2. Pending orders
  const pendingOrders = stationOrders.filter((o) => o.status === 'PENDING').length;
  // 3. Processing orders
  const processingOrders = stationOrders.filter((o) => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length;
  // 4. Completed orders & Total Delivered Litres
  const completedOrdersList = stationOrders.filter((o) => o.status === 'DELIVERED');
  const completedOrders = completedOrdersList.length;
  const totalDeliveredLitres = completedOrdersList.reduce((acc, o) => acc + o.quantityLitres, 0);
  // 5. Cancelled orders
  const cancelledOrders = stationOrders.filter((o) => o.status === 'CANCELLED').length;

  // Active queue (non-delivered, non-cancelled)
  const activeOrders = stationOrders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PROCESSING' || o.status === 'OUT_FOR_DELIVERY'
  );

  // 6. Current fuel inventory (Total available across all station tanks)
  const inventoryList = Object.values(currentStation.inventory) as StationInventory[];
  const totalInventoryLitres: number = inventoryList.reduce(
    (acc: number, inv: StationInventory) => acc + inv.availableLitres,
    0
  );
  const totalCapacityLitres: number = inventoryList.reduce(
    (acc: number, inv: StationInventory) => acc + inv.capacityLitres,
    0
  );

  // 7. Petrol quantity available
  const petrolInv = currentStation.inventory.PETROL;
  const petrolPercent = Math.round((petrolInv.availableLitres / petrolInv.capacityLitres) * 100);
  const isPetrolLow = petrolInv.availableLitres <= petrolInv.lowStockThreshold;

  // 8. Diesel quantity available
  const dieselInv = currentStation.inventory.DIESEL;
  const dieselPercent = Math.round((dieselInv.availableLitres / dieselInv.capacityLitres) * 100);
  const isDieselLow = dieselInv.availableLitres <= dieselInv.lowStockThreshold;

  // Helper for accepting order with overbooking check
  const handleAcceptOrder = (order: Order) => {
    const inv = currentStation.inventory[order.fuelTypeCode];
    const available = inv ? inv.availableLitres : 0;

    if (order.quantityLitres > available) {
      addToast({
        type: 'error',
        title: 'Overbooking Prevented',
        message: `Cannot accept order: Requested ${order.quantityLitres}L exceeds available stock (${available}L).`,
      });
      return;
    }

    updateOrderStatus(order.id, 'PROCESSING');
    addToast({
      type: 'success',
      title: 'Order Accepted & Filling Started',
      message: `Order ${order.orderNumber} accepted. Assigned to bowser dispatch.`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Station Profile & RBAC Policy Header */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-black text-lg border border-amber-500/20">
            {currentStation.codeName || 'HUB'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {currentStation.name}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                {currentStation.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentStation.address}</span>
              <span className="text-slate-600">•</span>
              <span>Coverage: <strong>{currentStation.coverageRadiusKm} km Radius</strong></span>
            </p>
          </div>
        </div>

        {/* Read-Only Admin Rates Notice (Strict RBAC Rule) */}
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-medium">Station Permissions:</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
              Inventory Update: Allowed
            </span>
            <span className="bg-rose-500/10 text-rose-400 font-bold px-2 py-0.5 rounded-md border border-rose-500/30">
              Pricing / Orders: Read-Only (Admin)
            </span>
          </div>
        </div>
      </div>

      {/* 8 Required Dashboard Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Operational Orders & Storage Telemetry</span>
          </h2>
          <span className="text-xs text-slate-500">Live synchronized with Central Dispatch</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* 1. Today's Orders */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1.5 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Today's Orders</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Truck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">{todayOrders}</div>
            <div className="text-[11px] text-slate-400">All registered station jobs</div>
          </div>

          {/* 2. Pending Orders */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-md space-y-1.5 hover:border-amber-500 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300">Pending Orders</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center animate-pulse">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">{pendingOrders}</div>
            <div className="text-[11px] text-amber-400/80 font-medium">Awaiting station acceptance</div>
          </div>

          {/* 3. Processing Orders */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-md space-y-1.5 hover:border-purple-500 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-300">Processing Orders</span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-400 font-mono">{processingOrders}</div>
            <div className="text-[11px] text-purple-300/80">Filling & bowser preparation</div>
          </div>

          {/* 4. Completed Orders */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-md space-y-1.5 hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-300">Completed Orders</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{completedOrders}</div>
            <div className="text-[11px] text-emerald-400/80">Delivered to customers</div>
          </div>

          {/* 5. Total Delivered Quantity */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-teal-500/30 shadow-md space-y-1.5 hover:border-teal-500 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-300">Total Delivered Volume</span>
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-teal-400 font-mono">
              {totalDeliveredLitres.toLocaleString()} <span className="text-xs font-sans text-slate-400 font-normal">L</span>
            </div>
            <div className="text-[11px] text-teal-300/80">Cumulative fuel pumped</div>
          </div>

          {/* 6. Cancelled Orders */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 shadow-md space-y-1.5 hover:border-rose-500 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300">Cancelled Orders</span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <XCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">{cancelledOrders}</div>
            <div className="text-[11px] text-rose-400/80">Due to stock / user cancel</div>
          </div>

          {/* 7. Current Fuel Inventory */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1.5 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Fuel Inventory</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Package className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {totalInventoryLitres.toLocaleString()} <span className="text-xs font-sans text-slate-400 font-normal">L</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Capacity: {totalCapacityLitres.toLocaleString()} L ({Math.round((totalInventoryLitres / totalCapacityLitres) * 100)}%)
            </div>
          </div>

          {/* 8. Petrol Quantity Available */}
          <div
            className={`p-4 rounded-2xl border shadow-md space-y-1.5 transition-all ${
              isPetrolLow ? 'bg-amber-950/30 border-amber-500/60' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400">Petrol Stock (Available)</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Fuel className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {petrolInv.availableLitres.toLocaleString()} <span className="text-xs font-sans text-slate-400 font-normal">/ {petrolInv.capacityLitres.toLocaleString()} L</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{petrolPercent}% Capacity</span>
              {isPetrolLow ? (
                <span className="text-amber-400 font-bold">⚠️ Low Stock</span>
              ) : (
                <span className="text-emerald-400">Normal</span>
              )}
            </div>
          </div>

          {/* 8. Diesel Quantity Available */}
          <div
            className={`p-4 rounded-2xl border shadow-md space-y-1.5 transition-all ${
              isDieselLow ? 'bg-amber-950/30 border-amber-500/60' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-400">Diesel Stock (Available)</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Fuel className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-blue-400 font-mono">
              {dieselInv.availableLitres.toLocaleString()} <span className="text-xs font-sans text-slate-400 font-normal">/ {dieselInv.capacityLitres.toLocaleString()} L</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{dieselPercent}% Capacity</span>
              {isDieselLow ? (
                <span className="text-amber-400 font-bold">⚠️ Low Stock</span>
              ) : (
                <span className="text-emerald-400">Normal</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tank Storage & Quick Refill Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Petrol Tank Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Underground Petrol Tank</h3>
                <p className="text-[11px] text-slate-400">Unleaded Petrol (RON 91/95)</p>
              </div>
            </div>

            <button
              onClick={() => onOpenRestockModal('PETROL')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Update Stock / Refill</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>
                Available: <strong className="text-white">{petrolInv.availableLitres.toLocaleString()} L</strong>
              </span>
              <span>
                Total: {petrolInv.capacityLitres.toLocaleString()} L ({petrolPercent}%)
              </span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                style={{ width: `${petrolPercent}%` }}
                className={`h-full rounded-full transition-all duration-300 ${
                  isPetrolLow ? 'bg-amber-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                }`}
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Low Stock Alert Limit: <strong className="text-amber-400 font-mono">{petrolInv.lowStockThreshold} L</strong></span>
            <span>Safety Cutoff: <strong className="text-rose-400 font-mono">{petrolInv.criticalThreshold || 50} L</strong></span>
          </div>

          {isPetrolLow && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Stock is below safety reserve threshold ({petrolInv.lowStockThreshold} L). Orders exceeding {petrolInv.availableLitres} L cannot be accepted.
              </span>
            </div>
          )}
        </div>

        {/* Diesel Tank Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Underground Diesel Tank</h3>
                <p className="text-[11px] text-slate-400">Commercial Diesel (BS-VI Low Sulfur)</p>
              </div>
            </div>

            <button
              onClick={() => onOpenRestockModal('DIESEL')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Update Stock / Refill</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>
                Available: <strong className="text-white">{dieselInv.availableLitres.toLocaleString()} L</strong>
              </span>
              <span>
                Total: {dieselInv.capacityLitres.toLocaleString()} L ({dieselPercent}%)
              </span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                style={{ width: `${dieselPercent}%` }}
                className={`h-full rounded-full transition-all duration-300 ${
                  isDieselLow ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-teal-400'
                }`}
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Low Stock Alert Limit: <strong className="text-amber-400 font-mono">{dieselInv.lowStockThreshold} L</strong></span>
            <span>Safety Cutoff: <strong className="text-rose-400 font-mono">{dieselInv.criticalThreshold || 80} L</strong></span>
          </div>

          {isDieselLow && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Stock is below safety reserve threshold ({dieselInv.lowStockThreshold} L). Please refill promptly.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Active Order Queue Table & Immediate Actions */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              Incoming & Active Order Dispatch Queue
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Overbooking prevention active: Station cannot accept orders where requested quantity &gt; available inventory.
            </p>
          </div>

          <button
            onClick={() => setStationTab('orders')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Full Order Register ({stationOrders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Customer & Location</th>
                <th className="p-3.5">Fuel & Quantity</th>
                <th className="p-3.5">Stock Check</th>
                <th className="p-3.5">Total (₹)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Station Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {activeOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    No active orders in the queue. New incoming orders will appear here in real time.
                  </td>
                </tr>
              ) : (
                activeOrders.map((ord) => {
                  const fuelInv = currentStation.inventory[ord.fuelTypeCode];
                  const availableStock = fuelInv ? fuelInv.availableLitres : 0;
                  const hasSufficientStock = ord.quantityLitres <= availableStock;

                  return (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-emerald-400">{ord.orderNumber}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{ord.userName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{ord.deliveryAddress.street}, {ord.deliveryAddress.city}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-white font-mono">{ord.quantityLitres} L</span>{' '}
                        <span className="text-[11px] text-slate-400">({ord.fuelTypeName})</span>
                      </td>
                      <td className="p-3.5">
                        {hasSufficientStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>In Stock ({availableStock}L)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Insufficient ({availableStock}L)</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-white">₹{ord.totalAmount.toFixed(2)}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                              : ord.status === 'PROCESSING'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : ord.status === 'OUT_FOR_DELIVERY'
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 animate-pulse'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewOrderDetails(ord)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                            title="View Manifest & Customer Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Order Acceptance & Status Transitions with Overbooking Prevention */}
                          {ord.status === 'PENDING' && (
                            hasSufficientStock ? (
                              <button
                                onClick={() => handleAcceptOrder(ord)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-sm"
                              >
                                Accept Order
                              </button>
                            ) : (
                              <button
                                disabled
                                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-500 text-[11px] font-bold cursor-not-allowed border border-slate-700"
                                title="Cannot accept: Requested volume exceeds available inventory"
                              >
                                Insufficient Stock
                              </button>
                            )
                          )}

                          {ord.status === 'CONFIRMED' && (
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'PROCESSING')}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold cursor-pointer transition-colors"
                            >
                              Fill Tanker
                            </button>
                          )}

                          {ord.status === 'PROCESSING' && (
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'OUT_FOR_DELIVERY')}
                              className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold cursor-pointer transition-colors"
                            >
                              Dispatch Bowser
                            </button>
                          )}

                          {ord.status === 'OUT_FOR_DELIVERY' && (
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'DELIVERED')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition-colors"
                            >
                              Mark Delivered
                            </button>
                          )}

                          {/* Cancellation Button */}
                          <button
                            onClick={() => onOpenCancelModal(ord)}
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 cursor-pointer border border-rose-800/40"
                            title={
                              !hasSufficientStock
                                ? `Cancel: Insufficient ${ord.fuelTypeName} inventory`
                                : 'Cancel order'
                            }
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
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
