import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FuelTypeCode, Order, StationTab } from '../../types';
import { GasStationDashboard } from './GasStationDashboard';
import { GasStationOrders } from './GasStationOrders';
import { GasStationInventory } from './GasStationInventory';
import { GasStationInventoryHistory } from './GasStationInventoryHistory';
import { GasStationProfile } from './GasStationProfile';
import { GasStationNotifications } from './GasStationNotifications';
import { GasStationDeliveryMap } from './GasStationDeliveryMap';
import { RestockModal } from '../admin/modals/RestockModal';
import { OrderDetailsModal } from '../admin/modals/OrderDetailsModal';
import { CancelOrderModal } from '../admin/modals/CancelOrderModal';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Building2,
  Bell,
  MapPin,
  Star,
  ShieldCheck,
} from 'lucide-react';

export const GasStationPortal: React.FC = () => {
  const {
    stationTab,
    setStationTab,
    currentStation,
    orders,
    notifications,
    stationInventoryLogs,
  } = useApp();

  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockFuelCode, setRestockFuelCode] = useState<FuelTypeCode>('PETROL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const handleOpenRestock = (fuelCode: FuelTypeCode) => {
    setRestockFuelCode(fuelCode);
    setIsRestockOpen(true);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsCancelOpen(true);
  };

  if (!currentStation) {
    return (
      <div className="p-8 text-center text-slate-400">
        Please select a Gas Station from the top navigation bar to continue.
      </div>
    );
  }

  const stationOrders = orders.filter((o) => o.gasStationId === currentStation.id);
  const pendingOrders = stationOrders.filter((o) => o.status === 'PENDING').length;
  const unreadNotifs = notifications.filter(
    (n) =>
      !n.isRead &&
      n.recipientRole === 'station' &&
      (n.recipientId === currentStation.id || n.recipientId === 'ALL')
  ).length;

  const tabs: { id: StationTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ShoppingCart className="w-4 h-4" />,
      badge: pendingOrders > 0 ? pendingOrders : undefined,
    },
    { id: 'inventory', label: 'Available Inventory', icon: <Package className="w-4 h-4" /> },
    { id: 'inventory_history', label: 'Inventory History', icon: <FileText className="w-4 h-4" /> },
    { id: 'delivery_map', label: 'Bowser Live Map', icon: <MapPin className="w-4 h-4" /> },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
    },
    { id: 'reviews', label: 'Customer Ratings', icon: <Star className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile & Station Details', icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Station Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-2 shadow-xl flex items-center gap-1.5 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = stationTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStationTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-amber-600' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-Views */}
      {stationTab === 'dashboard' && (
        <GasStationDashboard
          onOpenRestockModal={handleOpenRestock}
          onViewOrderDetails={handleViewOrder}
          onOpenCancelModal={handleCancelOrder}
        />
      )}

      {stationTab === 'orders' && (
        <GasStationOrders
          onViewOrderDetails={handleViewOrder}
          onOpenCancelModal={handleCancelOrder}
        />
      )}

      {stationTab === 'inventory' && (
        <GasStationInventory onOpenRestockModal={handleOpenRestock} />
      )}

      {stationTab === 'inventory_history' && (
        <GasStationInventoryHistory onOpenRestockModal={handleOpenRestock} />
      )}

      {stationTab === 'delivery_map' && <GasStationDeliveryMap />}

      {stationTab === 'notifications' && <GasStationNotifications />}

      {stationTab === 'profile' && <GasStationProfile />}

      {/* Station Reviews */}
      {stationTab === 'reviews' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Star className="w-6 h-6 text-amber-400" />
              Customer Ratings for {currentStation.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Overall rating: {currentStation.rating} / 5 ({currentStation.totalRatingsCount} verified customer reviews)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders
              .filter((o) => o.gasStationId === currentStation.id && o.review)
              .map((ord) => (
                <div key={ord.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{ord.userName}</span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {ord.review?.rating} / 5
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic">"{ord.review?.comment}"</p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Order {ord.orderNumber} • {ord.fuelTypeName}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <RestockModal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        initialStationId={currentStation.id}
        initialFuelCode={restockFuelCode}
      />
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        onOpenCancelModal={(ord) => {
          setIsOrderDetailsOpen(false);
          setSelectedOrder(ord);
          setIsCancelOpen(true);
        }}
      />
      <CancelOrderModal
        order={selectedOrder}
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        cancelledBy="GAS_STATION"
      />
    </div>
  );
};
