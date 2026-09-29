import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminTab, StationTab, UserTab, StationInventory } from '../../types';
import {
  LayoutDashboard,
  Users,
  Building2,
  Fuel,
  DollarSign,
  Package,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Star,
  Bell,
  FileText,
  Settings,
  LogOut,
  MapPin,
  Truck,
  ShieldCheck,
  X,
  Flame,
  Activity,
  UserCheck,
  FileSpreadsheet,
  Database,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    adminTab,
    setAdminTab,
    stationTab,
    setStationTab,
    userTab,
    setUserTab,
    isSidebarOpen,
    setIsSidebarOpen,
    notifications,
    orders,
    stations,
    currentUser,
    currentStation,
    setActiveView,
  } = useApp();

  // Badges calculation
  const unreadNotifs = notifications.filter((n) => {
    if (n.isRead) return false;
    if (currentRole === 'admin') return n.recipientRole === 'admin';
    if (currentRole === 'station') return n.recipientId === currentStation.id;
    return n.recipientId === currentUser.id;
  }).length;

  const pendingOrders = orders.filter((o) => {
    if (currentRole === 'station') {
      return o.gasStationId === currentStation.id && ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status);
    }
    return ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status);
  }).length;

  const lowStockCount = stations.reduce((acc, st) => {
    let count = 0;
    (Object.values(st.inventory) as StationInventory[]).forEach((inv) => {
      if (inv.availableLitres <= inv.lowStockThreshold) count++;
    });
    return acc + count;
  }, 0);

  const activeDeliveriesCount = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;

  const handleAdminNav = (tab: AdminTab) => {
    setActiveView('app');
    setAdminTab(tab);
    setIsSidebarOpen(false);
  };

  const handleStationNav = (tab: StationTab) => {
    setActiveView('app');
    setStationTab(tab);
    setIsSidebarOpen(false);
  };

  const handleUserNav = (tab: UserTab) => {
    setActiveView('app');
    setUserTab(tab);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    if (currentRole === 'admin') {
      setCurrentRole('user');
      setUserTab('dashboard');
    } else if (currentRole === 'station') {
      setCurrentRole('user');
      setUserTab('dashboard');
    } else {
      setCurrentRole('admin');
      setAdminTab('dashboard');
    }
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Fuel className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                Fuel<span className="text-emerald-400">Flow</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800/80 text-emerald-300">
                  {currentRole}
                </span>
              </span>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">SaaS Delivery OS</p>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Identity Card in Sidebar */}
        <div className="p-3.5 mx-3 mt-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {currentRole === 'admin' ? 'Super Admin' : currentRole === 'station' ? 'Station Operator' : 'Customer Account'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="font-bold text-white mt-1 truncate">
            {currentRole === 'admin'
              ? 'Administrator'
              : currentRole === 'station'
              ? currentStation.codeName || currentStation.name
              : currentUser.name}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            {currentRole === 'admin'
              ? 'Central Control Command'
              : currentRole === 'station'
              ? currentStation.city
              : currentUser.userType === 'FLEET_OPERATOR'
              ? 'Commercial Fleet Operator'
              : 'Individual Consumer'}
          </div>
        </div>

        {/* Nav Items List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {/* ===================== ADMIN SIDEBAR ===================== */}
          {currentRole === 'admin' && (
            <>
              <div className="px-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Admin Command Center
              </div>

              <button
                onClick={() => handleAdminNav('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </button>

              <button
                onClick={() => handleAdminNav('datasets')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'datasets'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30'
                }`}
              >
                <div className="flex items-center gap-2.5 font-bold">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>CSV Datasets Hub</span>
                </div>
                <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded">
                  CSV
                </span>
              </button>

              <button
                onClick={() => handleAdminNav('users')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'users'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">1,250</span>
              </button>

              <button
                onClick={() => handleAdminNav('stations')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'stations'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4" />
                  <span>Gas Stations</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">25</span>
              </button>

              <button
                onClick={() => handleAdminNav('fuel_management')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'fuel_management'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Fuel className="w-4 h-4" />
                  <span>Fuel Management</span>
                </div>
              </button>

              <button
                onClick={() => handleAdminNav('fuel_prices')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'fuel_prices'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4" />
                  <span>Fuel Prices</span>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  Central
                </span>
              </button>

              <button
                onClick={() => handleAdminNav('inventory')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'inventory'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Inventory</span>
                </div>
                {lowStockCount > 0 && (
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-bold">
                    {lowStockCount} Low
                  </span>
                )}
              </button>

              <button
                onClick={() => handleAdminNav('orders')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'orders'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Orders</span>
                </div>
                {activeDeliveriesCount > 0 && (
                  <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-1.5 py-0.5 rounded font-bold animate-pulse">
                    {activeDeliveriesCount} Live
                  </span>
                )}
              </button>

              <button
                onClick={() => handleAdminNav('payments')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'payments'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Payments</span>
                </div>
              </button>

              <button
                onClick={() => handleAdminNav('reports')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'reports'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4" />
                  <span>Reports</span>
                </div>
              </button>

              <button
                onClick={() => handleAdminNav('reviews')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'reviews'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4" />
                  <span>Reviews</span>
                </div>
              </button>

              <button
                onClick={() => handleAdminNav('notifications')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'notifications'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </div>
                {unreadNotifs > 0 && (
                  <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleAdminNav('audit_logs')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'audit_logs'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>Audit Logs</span>
                </div>
              </button>

              <button
                onClick={() => handleAdminNav('settings')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'settings'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </div>
              </button>
            </>
          )}

          {/* ===================== GAS STATION SIDEBAR ===================== */}
          {currentRole === 'station' && (
            <>
              <div className="px-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Gas Station Operations
              </div>

              <button
                onClick={() => handleStationNav('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  stationTab === 'dashboard'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </button>

              <button
                onClick={() => handleStationNav('orders')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  stationTab === 'orders'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Orders</span>
                </div>
                {pendingOrders > 0 && (
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-bold">
                    {pendingOrders} Pending
                  </span>
                )}
              </button>

              <button
                onClick={() => handleStationNav('inventory')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  stationTab === 'inventory'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Available Inventory</span>
                </div>
              </button>

              <button
                onClick={() => handleStationNav('inventory_history')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  stationTab === 'inventory_history'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>Inventory History</span>
                </div>
              </button>

              <button
                onClick={() => handleStationNav('delivery_map')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  stationTab === 'delivery_map'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4" />
                  <span>Bowser Live Map</span>
                </div>
              </button>

              <button
                onClick={() => handleStationNav('reviews')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  stationTab === 'reviews'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4" />
                  <span>Customer Reviews</span>
                </div>
              </button>

              <button
                onClick={() => handleStationNav('notifications')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  stationTab === 'notifications'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </div>
                {unreadNotifs > 0 && (
                  <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleStationNav('profile')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  stationTab === 'profile'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4" />
                  <span>Profile & Details</span>
                </div>
              </button>
            </>
          )}

          {/* ===================== USER SIDEBAR ===================== */}
          {currentRole === 'user' && (
            <>
              <div className="px-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Customer Fuel Portal
              </div>

              <button
                onClick={() => handleUserNav('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  userTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </button>

              <button
                onClick={() => handleUserNav('order_fuel')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  userTab === 'order_fuel'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5 font-bold">
                  <Fuel className="w-4 h-4 text-amber-400" />
                  <span>Order Fuel</span>
                </div>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded">NEW</span>
              </button>

              <button
                onClick={() => handleUserNav('my_orders')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  userTab === 'my_orders'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4" />
                  <span>My Orders</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                  {orders.filter((o) => o.userId === currentUser.id).length}
                </span>
              </button>

              <button
                onClick={() => handleUserNav('track_order')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  userTab === 'track_order'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4" />
                  <span>Track Order</span>
                </div>
                {orders.some((o) => o.userId === currentUser.id && ['PROCESSING', 'OUT_FOR_DELIVERY'].includes(o.status)) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>

              <button
                onClick={() => handleUserNav('addresses')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  userTab === 'addresses'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4" />
                  <span>Addresses</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                  {currentUser.addresses.length}
                </span>
              </button>

              <button
                onClick={() => handleUserNav('payments')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  userTab === 'payments'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Payments</span>
                </div>
              </button>

              <button
                onClick={() => handleUserNav('notifications')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  userTab === 'notifications'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </div>
                {unreadNotifs > 0 && (
                  <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleUserNav('profile')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  userTab === 'profile'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Profile</span>
                </div>
              </button>
            </>
          )}
        </nav>

        {/* Footer Logout & Role Switcher */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Switch / Logout</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Exit</span>
          </button>
        </div>
      </aside>
    </>
  );
};
