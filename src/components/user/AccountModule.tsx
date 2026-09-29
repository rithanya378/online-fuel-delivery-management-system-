import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Address, User } from '../../types';
import {
  UserCheck,
  UserPlus,
  KeyRound,
  ShieldCheck,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Compass,
  Building2,
  Mail,
  Phone,
  Lock,
  Edit3,
  AlertCircle,
  Sparkles,
  Smartphone,
  Save,
  Check,
  RotateCcw,
} from 'lucide-react';

export const AccountModule: React.FC = () => {
  const {
    currentUser,
    users,
    selectedUserId,
    setSelectedUserId,
    updateUserProfile,
    changeUserPassword,
    resetUserPassword,
    registerNewUser,
    addUserAddress,
    deleteUserAddress,
    setDefaultUserAddress,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'addresses' | 'security' | 'register'>('profile');

  // Edit Profile Form State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [companyName, setCompanyName] = useState(currentUser.companyName || '');
  const [fleetSize, setFleetSize] = useState<number>(currentUser.fleetSize || 0);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regType, setRegType] = useState<'INDIVIDUAL' | 'FLEET_OPERATOR'>('INDIVIDUAL');
  const [regCompany, setRegCompany] = useState('');
  const [regFleetCount, setRegFleetCount] = useState(5);
  const [regStreet, setRegStreet] = useState('');
  const [regCity, setRegCity] = useState('Metro City');
  const [regZip, setRegZip] = useState('94103');
  const [regMsg, setRegMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Address Creation Modal/Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrTitle, setAddrTitle] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('Metro City');
  const [addrState, setAddrState] = useState('CA');
  const [addrZip, setAddrZip] = useState('94105');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrInstructions, setAddrInstructions] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsDetectedCoords, setGpsDetectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Sync state if currentUser changes from dropdown
  React.useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setPhone(currentUser.phone);
    setCompanyName(currentUser.companyName || '');
    setFleetSize(currentUser.fleetSize || 0);
    setProfileSuccessMsg(null);
  }, [currentUser]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(currentUser.id, {
      name,
      email,
      phone,
      companyName: currentUser.userType === 'FLEET_OPERATOR' ? companyName : undefined,
      fleetSize: currentUser.userType === 'FLEET_OPERATOR' ? fleetSize : undefined,
    });
    setProfileSuccessMsg('Profile and contact details saved successfully.');
    setTimeout(() => setProfileSuccessMsg(null), 4000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    const res = changeUserPassword(currentUser.id, currentPassword, newPassword);
    if (res.success) {
      setPasswordMsg({ type: 'success', text: res.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: res.message });
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    const res = resetUserPassword(forgotEmail);
    if (res.success) {
      setForgotMsg({ type: 'success', text: res.message });
      setForgotEmail('');
    } else {
      setForgotMsg({ type: 'error', text: res.message });
    }
  };

  const handleGpsDetect = () => {
    setIsDetectingGps(true);
    // Simulate high-accuracy GPS triangulation with realistic coordinates
    setTimeout(() => {
      const simLat = 37.7749 + (Math.random() - 0.5) * 0.05;
      const simLng = -122.4194 + (Math.random() - 0.5) * 0.05;
      setGpsDetectedCoords({ lat: parseFloat(simLat.toFixed(5)), lng: parseFloat(simLng.toFixed(5)) });
      if (!addrStreet) {
        setAddrStreet(`${Math.floor(100 + Math.random() * 899)} Mission Boulevard, Bay Area`);
      }
      if (!addrTitle) {
        setAddrTitle('Current Detected Location');
      }
      setIsDetectingGps(false);
    }, 900);
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrTitle || !addrStreet) return;

    const coords = gpsDetectedCoords || {
      lat: 37.77 + (Math.random() - 0.5) * 0.06,
      lng: -122.42 + (Math.random() - 0.5) * 0.06,
    };

    addUserAddress(currentUser.id, {
      title: addrTitle,
      street: addrStreet,
      city: addrCity,
      state: addrState,
      zipCode: addrZip,
      landmark: addrLandmark,
      instructions: addrInstructions,
      coordinates: coords,
      isDefault: currentUser.addresses.length === 0,
    });

    setAddrTitle('');
    setAddrStreet('');
    setAddrLandmark('');
    setAddrInstructions('');
    setGpsDetectedCoords(null);
    setShowAddAddress(false);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone) {
      setRegMsg({ type: 'error', text: 'Please fill in all required registration fields.' });
      return;
    }

    const initialAddress: Address = {
      id: `addr-${Date.now()}`,
      title: regType === 'FLEET_OPERATOR' ? 'Primary Depot' : 'Home Residence',
      street: regStreet || '101 Delivery Way',
      city: regCity,
      state: 'CA',
      zipCode: regZip,
      coordinates: {
        lat: 37.7749 + (Math.random() - 0.5) * 0.05,
        lng: -122.4194 + (Math.random() - 0.5) * 0.05,
      },
      isDefault: true,
    };

    const res = registerNewUser({
      name: regName,
      email: regEmail,
      phone: regPhone,
      role: 'user',
      userType: regType,
      companyName: regType === 'FLEET_OPERATOR' ? regCompany : undefined,
      fleetSize: regType === 'FLEET_OPERATOR' ? regFleetCount : undefined,
      status: 'ACTIVE',
      addresses: [initialAddress],
    });

    if (res.success) {
      setRegMsg({ type: 'success', text: res.message });
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegCompany('');
      setActiveSubTab('profile');
    } else {
      setRegMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Account Identity Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <UserCheck className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-2xl shadow-inner">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{currentUser.name}</h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    currentUser.userType === 'FLEET_OPERATOR'
                      ? 'bg-indigo-900/80 text-indigo-300 border border-indigo-700'
                      : 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                  }`}
                >
                  {currentUser.userType === 'FLEET_OPERATOR' ? '🏢 Commercial Fleet Operator' : '🚗 Individual Vehicle Owner'}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700">
                  ID: {currentUser.id}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> {currentUser.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> {currentUser.phone}
                </span>
                {currentUser.companyName && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" /> {currentUser.companyName} ({currentUser.fleetSize} vehicles)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick User Account Switcher */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <span className="text-xs text-slate-400 whitespace-nowrap">Switch User:</span>
            <select
              id="account-switch-dropdown"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="bg-slate-900 text-slate-100 text-xs rounded-lg border border-slate-700 px-3 py-1.5 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              {users
                .filter((u) => u.role === 'user')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.userType === 'FLEET_OPERATOR' ? 'Fleet' : 'Individual'})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-2">
        <button
          id="tab-btn-profile"
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile & Contacts</span>
        </button>

        <button
          id="tab-btn-addresses"
          onClick={() => setActiveSubTab('addresses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'addresses'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses & GPS ({currentUser.addresses.length})</span>
        </button>

        <button
          id="tab-btn-security"
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'security'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Security & Password</span>
        </button>

        <button
          id="tab-btn-register"
          onClick={() => setActiveSubTab('register')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'register'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Account</span>
        </button>
      </div>

      {/* 1. EDIT PROFILE & CONTACTS */}
      {activeSubTab === 'profile' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                Manage Personal & Fleet Profile
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your contact numbers, dispatch email notifications, and corporate fleet details.
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-mono rounded-lg border border-slate-700">
              Account Status: {currentUser.status}
            </span>
          </div>

          {profileSuccessMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name / Contact Person *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address (for Invoices & Receipts) *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Primary Phone / Mobile Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Account Category
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.userType === 'FLEET_OPERATOR' ? 'Fleet Logistics Operator' : 'Individual Vehicle Owner'}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>

              {currentUser.userType === 'FLEET_OPERATOR' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Company / Organization Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Active Fleet Size (Taxis / Buses / Trucks)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={fleetSize}
                      onChange={(e) => setFleetSize(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. SAVED ADDRESSES & GPS DETECTION */}
      {activeSubTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                Saved Delivery Locations & Geo-Pins
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage fuel dispatch points, commercial depots, parking bays, and detect your current GPS coordinates.
              </p>
            </div>

            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddAddress ? 'Close Form' : 'Add New Delivery Address'}</span>
            </button>
          </div>

          {/* Add Address Form Modal/Drawer */}
          {showAddAddress && (
            <div className="bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Add New Delivery Location
                </h4>
                <button
                  type="button"
                  onClick={handleGpsDetect}
                  disabled={isDetectingGps}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-700/60 hover:bg-indigo-900 text-xs font-medium transition-all"
                >
                  <Compass className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                  <span>{isDetectingGps ? 'Detecting GPS...' : '📍 Detect Current GPS Location'}</span>
                </button>
              </div>

              {gpsDetectedCoords && (
                <div className="mb-4 p-3 rounded-xl bg-indigo-950/60 border border-indigo-800 text-indigo-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <span>
                      GPS Triangulation: <strong>{gpsDetectedCoords.lat}° N, {gpsDetectedCoords.lng}° W</strong> (High Accuracy)
                    </span>
                  </div>
                  <span className="text-[10px] bg-indigo-900 px-2 py-0.5 rounded text-indigo-300">Ready</span>
                </div>
              )}

              <form onSubmit={handleAddNewAddress} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Address Label / Spot Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Fleet Depot Bay 3, Home Garage, Office Parking"
                      value={addrTitle}
                      onChange={(e) => setAddrTitle(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Street Address & Premise *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 450 Logistics Highway, Gate B"
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      ZIP Code / Postal
                    </label>
                    <input
                      type="text"
                      value={addrZip}
                      onChange={(e) => setAddrZip(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Behind Central Depot Warehouse"
                      value={addrLandmark}
                      onChange={(e) => setAddrLandmark(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Delivery Bowser Access Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Clearance height 4.2m, call security at gate"
                      value={addrInstructions}
                      onChange={(e) => setAddrInstructions(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Address Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentUser.addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-5 rounded-2xl border transition-all ${
                  addr.isDefault
                    ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-800 text-emerald-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{addr.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                    </div>
                  </div>

                  {addr.isDefault && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-semibold uppercase tracking-wider">
                      Default Location
                    </span>
                  )}
                </div>

                {addr.landmark && (
                  <p className="text-xs text-slate-400 mt-3 pl-2 border-l-2 border-slate-700">
                    <span className="text-slate-500">Landmark:</span> {addr.landmark}
                  </p>
                )}

                {addr.instructions && (
                  <p className="text-xs text-slate-400 mt-2 pl-2 border-l-2 border-indigo-700/60">
                    <span className="text-indigo-400">Instructions:</span> {addr.instructions}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-[11px] font-mono text-slate-500">
                    GPS: {addr.coordinates.lat.toFixed(4)}, {addr.coordinates.lng.toFixed(4)}
                  </div>

                  <div className="flex items-center gap-2">
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefaultUserAddress(currentUser.id, addr.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                      >
                        Set Default
                      </button>
                    )}

                    {currentUser.addresses.length > 1 && (
                      <button
                        onClick={() => deleteUserAddress(currentUser.id, addr.id)}
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SECURITY & PASSWORD */}
      {activeSubTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Change Password Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <Lock className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-white text-base">Change Password</h3>
                <p className="text-xs text-slate-400">Update your login authentication key.</p>
              </div>
            </div>

            {passwordMsg && (
              <div
                className={`mb-4 p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
                    : 'bg-rose-950/80 border border-rose-800 text-rose-200'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Current Password *
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  New Password *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Reset / Forgot Password Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-white text-base">Forgot / Reset Password</h3>
                  <p className="text-xs text-slate-400">Generate a recovery token sent to your verified email.</p>
                </div>
              </div>

              {forgotMsg && (
                <div
                  className={`mb-4 p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                    forgotMsg.type === 'success'
                      ? 'bg-indigo-950/80 border border-indigo-800 text-indigo-200'
                      : 'bg-rose-950/80 border border-rose-800 text-rose-200'
                  }`}
                >
                  {forgotMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{forgotMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g., fleetops@metroexpress.com"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    Send Password Reset Token
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Security Standards & 2FA
              </div>
              <p className="text-[11px] leading-relaxed">
                All password hashes use bcrypt + salt rounds in accordance with security specifications. Session tokens are signed with HMAC SHA-256.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. REGISTER NEW ACCOUNT */}
      {activeSubTab === 'register' && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-xl max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Create New Customer / Fleet Account</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Register as an individual vehicle owner or commercial fleet operator for on-demand fuel delivery.
              </p>
            </div>
          </div>

          {regMsg && (
            <div
              className={`mb-6 p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3 ${
                regMsg.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/80 border border-rose-800 text-rose-200'
              }`}
            >
              {regMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>{regMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            {/* User Type Choice */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Select Account Type *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRegType('INDIVIDUAL')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    regType === 'INDIVIDUAL'
                      ? 'bg-emerald-950/60 border-emerald-500 text-white ring-1 ring-emerald-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm text-white flex items-center justify-between">
                    <span>🚗 Individual Owner</span>
                    {regType === 'INDIVIDUAL' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    For personal cars, bikes, emergency top-ups & residential generator fueling.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRegType('FLEET_OPERATOR')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    regType === 'FLEET_OPERATOR'
                      ? 'bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm text-white flex items-center justify-between">
                    <span>🏢 Fleet Operator</span>
                    {regType === 'FLEET_OPERATOR' && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    For taxi cabs, bus depots, logistics vans, trucking agencies & bulk diesel tanks.
                  </p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name / Operator Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Alex Johnson"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="alex@fleetlogistics.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Mobile / Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 432-8899"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {regType === 'FLEET_OPERATOR' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Company / Fleet Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Pacific Intercity Express"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Number of Vehicles
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={regFleetCount}
                      onChange={(e) => setRegFleetCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Default Delivery Street
                </label>
                <input
                  type="text"
                  placeholder="e.g., 780 Industrial Parkway"
                  value={regStreet}
                  onChange={(e) => setRegStreet(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-indigo-950/40 transition-all cursor-pointer"
              >
                Complete Registration & Activate Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
