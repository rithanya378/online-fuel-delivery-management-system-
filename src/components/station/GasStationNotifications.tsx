import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Fuel,
  ShoppingCart,
  DollarSign,
  Info,
  Clock,
  Filter,
  Check,
} from 'lucide-react';

export const GasStationNotifications: React.FC = () => {
  const {
    currentStation,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  if (!currentStation) {
    return (
      <div className="p-8 text-center text-slate-400">
        No active gas station selected.
      </div>
    );
  }

  // Filter notifications for this station
  const stationNotifs = notifications.filter(
    (n) =>
      n.recipientRole === 'station' &&
      (n.recipientId === currentStation.id || n.recipientId === 'ALL' || !n.recipientId)
  );

  const filteredNotifs = stationNotifs.filter((n) => {
    if (categoryFilter !== 'ALL' && n.category !== categoryFilter) return false;
    return true;
  });

  const unreadCount = stationNotifs.filter((n) => !n.isRead).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ORDER':
        return <ShoppingCart className="w-4 h-4 text-blue-400" />;
      case 'INVENTORY':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'PRICE':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Station Notification Center</h1>
            <p className="text-xs text-slate-400">Real-time order alerts, inventory threshold warnings, and price updates</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark All Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'ORDER', 'INVENTORY', 'PRICE', 'SYSTEM'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === cat
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800'
            }`}
          >
            {cat === 'ALL' ? 'All Alerts' : cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">No notifications in this category</p>
            <p className="text-xs text-slate-400">All alerts and dispatch triggers have been reviewed.</p>
          </div>
        ) : (
          filteredNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationRead(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                !item.isRead
                  ? 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-950/20 hover:border-amber-500'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-90'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                {getCategoryIcon(item.category)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(item.createdAt).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
