import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import {
  Menu,
  Search,
  Bell,
  CheckCheck,
  ChevronDown,
  Shield,
  Building2,
  User as UserIcon,
  FileCode,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Fuel,
  LogOut,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeView,
    setActiveView,
    selectedStationId,
    setSelectedStationId,
    selectedUserId,
    setSelectedUserId,
    users,
    stations,
    currentUser,
    currentStation,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetToSampleData,
    logout,
    isSidebarOpen,
    setIsSidebarOpen,
    searchQuery,
    setSearchQuery,
    setAdminTab,
    setStationTab,
    setUserTab,
  } = useApp();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleNotifs = notifications.filter((n) => {
    if (currentRole === 'admin') return n.recipientRole === 'admin';
    if (currentRole === 'station') return n.recipientId === currentStation.id;
    return n.recipientId === currentUser.id;
  });

  const unreadCount = roleNotifs.filter((n) => !n.isRead).length;

  const handleRoleChange = (role: Role) => {
    setCurrentRole(role);
    setActiveView('app');
    if (role === 'admin') setAdminTab('dashboard');
    if (role === 'station') setStationTab('dashboard');
    if (role === 'user') setUserTab('dashboard');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left: Sidebar Toggle + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Current Dashboard:</span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                currentRole === 'admin'
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                  : currentRole === 'station'
                  ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                  : 'bg-blue-950/80 border-blue-700 text-blue-300'
              }`}
            >
              {currentRole === 'admin'
                ? 'Admin Control Suite'
                : currentRole === 'station'
                ? `Gas Station: ${currentStation.codeName || currentStation.name}`
                : `User: ${currentUser.name}`}
            </span>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders (e.g. ORD-1055), stations, fuels..."
              className="w-full pl-9 pr-12 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-medium"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
              /
            </kbd>
          </div>
        </div>

        {/* Right: Role Switcher, Reset, Notifications, Persona Dropdown */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick Role Switcher Pill Bar */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
            <button
              onClick={() => handleRoleChange('admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'admin' && activeView === 'app'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Admin Dashboard"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>

            <button
              onClick={() => handleRoleChange('station')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'station' && activeView === 'app'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Gas Station Dashboard"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Station</span>
            </button>

            <button
              onClick={() => handleRoleChange('user')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'user' && activeView === 'app'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to User Dashboard"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">User</span>
            </button>

            <button
              onClick={() => setActiveView('specification')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'specification'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="View Complete Project Specification Docs"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">SRS Docs</span>
            </button>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={resetToSampleData}
            title="Reset system state to baseline sample data"
            className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-900 border border-slate-800 transition-colors hidden sm:flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs((prev) => !prev)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
              aria-label="View Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Flyout */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Notifications ({roleNotifs.length})</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {roleNotifs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">No notifications found</div>
                  ) : (
                    roleNotifs.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3.5 text-xs hover:bg-slate-800/60 transition-colors cursor-pointer ${
                          !notif.isRead ? 'bg-slate-800/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-200">{notif.title}</span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Persona Selector Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                  currentRole === 'admin'
                    ? 'bg-emerald-500 text-slate-950'
                    : currentRole === 'station'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {currentRole === 'admin'
                  ? 'AD'
                  : currentRole === 'station'
                  ? currentStation.codeName?.slice(-1) || 'ST'
                  : currentUser.name.charAt(0)}
              </div>
              <span className="max-w-[100px] truncate hidden md:inline">
                {currentRole === 'admin'
                  ? 'Admin'
                  : currentRole === 'station'
                  ? currentStation.codeName || currentStation.name
                  : currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 border-b border-slate-800 bg-slate-950">
                  <div className="text-xs font-bold text-white">
                    {currentRole === 'admin'
                      ? 'Admin Central Command'
                      : currentRole === 'station'
                      ? currentStation.name
                      : currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {currentRole === 'admin'
                      ? 'admin@fuelflow.io'
                      : currentRole === 'station'
                      ? currentStation.email
                      : currentUser.email}
                  </div>
                </div>

                {/* If role is station, allow switching stations */}
                {currentRole === 'station' && (
                  <div className="p-2 border-b border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                      Switch Station Persona:
                    </div>
                    {stations.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          setSelectedStationId(st.id);
                          setShowProfileMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                          selectedStationId === st.id
                            ? 'bg-amber-950/80 text-amber-300 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{st.codeName || st.name}</span>
                        {selectedStationId === st.id && <span className="text-[10px] text-amber-400">Active</span>}
                      </button>
                    ))}
                  </div>
                )}

                {/* If role is user, allow switching user accounts */}
                {currentRole === 'user' && (
                  <div className="p-2 border-b border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                      Switch User Persona:
                    </div>
                    {users
                      .filter((u) => u.role === 'user')
                      .map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setSelectedUserId(u.id);
                            setShowProfileMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                            selectedUserId === u.id
                              ? 'bg-blue-950/80 text-blue-300 font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{u.name}</span>
                          {selectedUserId === u.id && <span className="text-[10px] text-blue-400">Active</span>}
                        </button>
                      ))}
                  </div>
                )}

                <div className="p-2 border-b border-slate-800">
                  <button
                    onClick={() => {
                      resetToSampleData();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reset All Mock Data</span>
                  </button>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out to Welcome Page</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
