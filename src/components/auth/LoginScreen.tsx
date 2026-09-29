import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import {
  Fuel,
  Flame,
  ShieldCheck,
  Building2,
  User as UserIcon,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Sparkles,
  UserPlus,
  Truck,
  MapPin,
  Phone,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, setAuthScreen, registerNewUser, resetUserPassword, addToast, stations } = useApp();

  const [selectedRoleTab, setSelectedRoleTab] = useState<Role>('admin');
  const [email, setEmail] = useState('admin@fuelflow.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regUserType, setRegUserType] = useState<'INDIVIDUAL' | 'FLEET_OPERATOR'>('INDIVIDUAL');
  const [regAddressTitle, setRegAddressTitle] = useState('🏠 Home');
  const [regStreet, setRegStreet] = useState('');
  const [regCity, setRegCity] = useState('Metro City');
  const [regZip, setRegZip] = useState('110001');

  const handleRoleTabChange = (role: Role) => {
    setSelectedRoleTab(role);
    setErrorMessage(null);
    if (role === 'admin') {
      setEmail('admin@fuelflow.com');
      setPassword('admin123');
    } else if (role === 'station') {
      setEmail('stationA@fuelflow.com');
      setPassword('station123');
    } else {
      setEmail('rahul.kumar@gmail.com');
      setPassword('user123');
    }
  };

  const setDemoCredentials = (targetEmail: string, targetPass: string, role: Role) => {
    setSelectedRoleTab(role);
    setEmail(targetEmail);
    setPassword(targetPass);
    setErrorMessage(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.message || 'Login failed. Please check your credentials.');
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    const regResult = registerNewUser({
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      role: 'user',
      userType: regUserType,
      status: 'ACTIVE',
      addresses: [
        {
          id: `addr-${Date.now()}`,
          title: regAddressTitle,
          street: regStreet.trim() || '124 Energy Highway',
          city: regCity,
          state: 'DL',
          zipCode: regZip,
          coordinates: { lat: 28.6139, lng: 77.209 },
          isDefault: true,
        },
      ],
    });

    if (regResult.success) {
      // Auto login
      login(regEmail.trim(), regPassword.trim());
    } else {
      setErrorMessage(regResult.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Back to Landing Page link */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={() => setAuthScreen('landing')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Brand Welcome Page</span>
        </button>

        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-full">
          Secure Authentication
        </span>
      </div>

      {/* Main Authentication Container Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl relative z-10">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 p-0.5 shadow-lg shadow-emerald-950/80 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <Fuel className="w-7 h-7 text-emerald-400" />
              <Flame className="w-4 h-4 text-amber-400 absolute top-1 right-1" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {isRegisterMode ? 'Create FuelFlow Account' : 'Sign in to FuelFlow'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegisterMode
              ? 'Register for on-demand fuel delivery & fleet refuel'
              : 'Enter your email & password to access your dedicated workspace'}
          </p>
        </div>

        {isForgotMode ? (
          /* Forgot Password / Reset Link Form */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!forgotEmail.trim()) {
                setErrorMessage('Please enter your account email address.');
                return;
              }
              const res = resetUserPassword(forgotEmail.trim());
              if (res.success) {
                setForgotSuccess(res.message);
                setErrorMessage(null);
              } else {
                setErrorMessage(res.message);
              }
            }}
            className="space-y-4"
          >
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}
            {forgotSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Password Reset Ready</span>
                </div>
                <p className="text-[11px] text-slate-300">{forgotSuccess}</p>
                <p className="text-[11px] text-amber-300">
                  Temporary password for demo login: <span className="font-mono font-bold">FuelFlow@2026</span>
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. rahul.kumar@gmail.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                We will verify your account and generate an instant temporary access token or password reset.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
            >
              Request Password Reset Link
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(false);
                  setErrorMessage(null);
                  setForgotSuccess(null);
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Remembered your password? <span className="font-bold underline">Return to Sign In</span>
              </button>
            </div>
          </form>
        ) : !isRegisterMode ? (
          <>
            {/* Role Tab Selector */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRoleTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('station')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRoleTab === 'station'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Station</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('user')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRoleTab === 'user'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>User</span>
              </button>
            </div>

            {/* Error message alert if any */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@fuelflow.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setForgotEmail(email);
                      setForgotSuccess(null);
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-500 hover:text-slate-300 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-submit-login"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition-all cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In to {selectedRoleTab.toUpperCase()} Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Preset Bar */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Demo Accounts (1-Click)
                </span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDemoCredentials('admin@fuelflow.com', 'admin123', 'admin')}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    email === 'admin@fuelflow.com'
                      ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold block text-emerald-400">🛡️ Admin</span>
                  <span className="text-[10px] text-slate-400 font-mono">admin@fuelflow.com</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDemoCredentials('stationA@fuelflow.com', 'station123', 'station')}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    email === 'stationA@fuelflow.com'
                      ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold block text-amber-400">⛽ Station A Manager</span>
                  <span className="text-[10px] text-slate-400 font-mono">stationA@fuelflow.com</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDemoCredentials('rahul.kumar@gmail.com', 'user123', 'user')}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    email === 'rahul.kumar@gmail.com'
                      ? 'bg-blue-950/80 border-blue-600 text-blue-300'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold block text-blue-400">👤 User (Rahul Kumar)</span>
                  <span className="text-[10px] text-slate-400 font-mono">rahul.kumar@gmail.com</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDemoCredentials('operations@swiftcabslogistics.com', 'fleet123', 'user')}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    email === 'operations@swiftcabslogistics.com'
                      ? 'bg-purple-950/80 border-purple-600 text-purple-300'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold block text-purple-400">🚚 Fleet (Swift Cabs)</span>
                  <span className="text-[10px] text-slate-400 font-mono">operations@swiftcabs...</span>
                </button>
              </div>
            </div>

            {/* Toggle to Registration */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Don't have an account? <span className="font-bold underline">Sign Up as Customer</span>
              </button>
            </div>
          </>
        ) : (
          /* Register New Customer Account Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. John Doe"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Create a strong password"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegUserType('INDIVIDUAL')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                    regUserType === 'INDIVIDUAL'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => setRegUserType('FLEET_OPERATOR')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                    regUserType === 'FLEET_OPERATOR'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Fleet Operator
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Delivery Address
              </label>
              <input
                type="text"
                value={regStreet}
                onChange={(e) => setRegStreet(e.target.value)}
                placeholder="Street name & apartment/depot"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 cursor-pointer"
            >
              Complete Registration & Sign In
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Already have an account? <span className="font-bold underline">Sign In</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
