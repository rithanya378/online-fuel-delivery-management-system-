import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CsvDatasetType, Order, GasStation, FuelPrice, User, PaymentRecord } from '../../types';
import { downloadCsv, generateCsv, PRELOADED_CSV_PRESETS } from '../../utils/csvEngine';
import { CsvImportModal } from '../common/CsvImportModal';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Search,
  Sparkles,
  RefreshCcw,
  CheckCircle2,
  Filter,
  Layers,
  Database,
  ArrowUpDown,
  FileCode,
  Table,
  Truck,
  Building2,
  DollarSign,
  Users,
  CreditCard,
  Plus,
  HelpCircle,
  Copy,
} from 'lucide-react';

export const AdminCsvDatasets: React.FC = () => {
  const {
    orders,
    stations,
    fuelPrices,
    users,
    payments,
    importCsvOrders,
    importCsvStations,
    importCsvPrices,
    importCsvUsers,
    resetToSampleData,
    setAdminTab,
    addToast,
  } = useApp();

  const [activeDataset, setActiveDataset] = useState<CsvDatasetType>('orders');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Statistics calculation across datasets
  const totalVolumeLitres = useMemo(
    () => orders.reduce((acc, o) => acc + (o.quantityLitres || 0), 0),
    [orders]
  );
  const totalRevenue = useMemo(
    () => orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0),
    [orders]
  );

  // Export handlers
  const handleExportCurrentDataset = () => {
    if (activeDataset === 'orders') {
      const csv = generateCsv<Order>(orders, [
        { header: 'order_number', getValue: (o: Order) => o.orderNumber },
        { header: 'customer_name', getValue: (o: Order) => o.userName },
        { header: 'user_phone', getValue: (o: Order) => o.userPhone },
        { header: 'user_email', getValue: (o: Order) => o.userEmail },
        { header: 'user_type', getValue: (o: Order) => o.userType },
        { header: 'station_name', getValue: (o: Order) => o.gasStationName },
        { header: 'fuel_type', getValue: (o: Order) => o.fuelTypeCode },
        { header: 'quantity_litres', getValue: (o: Order) => o.quantityLitres },
        { header: 'price_per_litre', getValue: (o: Order) => o.pricePerLitre },
        { header: 'delivery_charge', getValue: (o: Order) => o.deliveryCharge },
        { header: 'tax_amount', getValue: (o: Order) => o.taxAmount },
        { header: 'total_amount', getValue: (o: Order) => o.totalAmount },
        { header: 'delivery_address', getValue: (o: Order) => o.deliveryAddress.street },
        { header: 'city', getValue: (o: Order) => o.deliveryAddress.city },
        { header: 'lat', getValue: (o: Order) => o.deliveryAddress.coordinates.lat },
        { header: 'lng', getValue: (o: Order) => o.deliveryAddress.coordinates.lng },
        { header: 'status', getValue: (o: Order) => o.status },
        { header: 'payment_method', getValue: (o: Order) => o.paymentMethod },
        { header: 'payment_status', getValue: (o: Order) => o.paymentStatus },
        { header: 'transaction_id', getValue: (o: Order) => o.transactionId },
        { header: 'vehicle_number', getValue: (o: Order) => o.vehicleDetails?.registrationNumber || '' },
        { header: 'created_at', getValue: (o: Order) => o.createdAt },
      ]);
      downloadCsv(`fuel_orders_dataset_${Date.now()}.csv`, csv);
      addToast({
        type: 'success',
        title: 'Orders Dataset Exported',
        message: `Exported ${orders.length} orders to CSV.`,
      });
    } else if (activeDataset === 'stations') {
      const csv = generateCsv<GasStation>(stations, [
        { header: 'station_code', getValue: (s: GasStation) => s.codeName || '' },
        { header: 'station_name', getValue: (s: GasStation) => s.name },
        { header: 'manager_name', getValue: (s: GasStation) => s.managerName },
        { header: 'contact_number', getValue: (s: GasStation) => s.contactNumber },
        { header: 'email', getValue: (s: GasStation) => s.email },
        { header: 'address', getValue: (s: GasStation) => s.address },
        { header: 'city', getValue: (s: GasStation) => s.city },
        { header: 'lat', getValue: (s: GasStation) => s.coordinates.lat },
        { header: 'lng', getValue: (s: GasStation) => s.coordinates.lng },
        { header: 'coverage_radius_km', getValue: (s: GasStation) => s.coverageRadiusKm },
        { header: 'rating', getValue: (s: GasStation) => s.rating },
        { header: 'petrol_available', getValue: (s: GasStation) => s.inventory.PETROL?.availableLitres || 0 },
        { header: 'diesel_available', getValue: (s: GasStation) => s.inventory.DIESEL?.availableLitres || 0 },
        { header: 'premium_petrol_available', getValue: (s: GasStation) => s.inventory.PREMIUM_PETROL?.availableLitres || 0 },
        { header: 'bio_diesel_available', getValue: (s: GasStation) => s.inventory.BIO_DIESEL?.availableLitres || 0 },
      ]);
      downloadCsv(`gas_stations_dataset_${Date.now()}.csv`, csv);
      addToast({
        type: 'success',
        title: 'Stations Dataset Exported',
        message: `Exported ${stations.length} gas stations to CSV.`,
      });
    } else if (activeDataset === 'fuel_prices') {
      const pricesArray: FuelPrice[] = Object.values(fuelPrices);
      const csv = generateCsv<FuelPrice>(pricesArray, [
        { header: 'fuel_type_code', getValue: (p: FuelPrice) => p.fuelTypeCode },
        { header: 'price_per_litre', getValue: (p: FuelPrice) => p.pricePerLitre },
        { header: 'currency', getValue: (p: FuelPrice) => p.currency },
        { header: 'tax_rate_percent', getValue: (p: FuelPrice) => p.taxRatePercent },
        { header: 'delivery_fee_base', getValue: (p: FuelPrice) => p.deliveryFeeBase },
        { header: 'delivery_fee_per_km', getValue: (p: FuelPrice) => p.deliveryFeePerKm },
        { header: 'last_updated', getValue: (p: FuelPrice) => p.lastUpdated },
      ]);
      downloadCsv(`fuel_prices_dataset_${Date.now()}.csv`, csv);
      addToast({
        type: 'success',
        title: 'Prices Matrix Exported',
        message: `Exported ${pricesArray.length} fuel prices to CSV.`,
      });
    } else if (activeDataset === 'users') {
      const csv = generateCsv<User>(users, [
        { header: 'name', getValue: (u: User) => u.name },
        { header: 'email', getValue: (u: User) => u.email },
        { header: 'phone', getValue: (u: User) => u.phone },
        { header: 'user_type', getValue: (u: User) => u.userType },
        { header: 'company_name', getValue: (u: User) => u.companyName || '' },
        { header: 'fleet_size', getValue: (u: User) => u.fleetSize || '' },
        { header: 'city', getValue: (u: User) => u.addresses[0]?.city || 'Metro City' },
        { header: 'address', getValue: (u: User) => u.addresses[0]?.street || '' },
        { header: 'status', getValue: (u: User) => u.status },
        { header: 'created_at', getValue: (u: User) => u.createdAt },
      ]);
      downloadCsv(`users_dataset_${Date.now()}.csv`, csv);
      addToast({
        type: 'success',
        title: 'Users Dataset Exported',
        message: `Exported ${users.length} accounts to CSV.`,
      });
    } else if (activeDataset === 'payments') {
      const csv = generateCsv<PaymentRecord>(payments, [
        { header: 'transaction_id', getValue: (p: PaymentRecord) => p.transactionId },
        { header: 'order_number', getValue: (p: PaymentRecord) => p.orderNumber },
        { header: 'payer_name', getValue: (p: PaymentRecord) => p.userName },
        { header: 'amount', getValue: (p: PaymentRecord) => p.amount },
        { header: 'payment_method', getValue: (p: PaymentRecord) => p.paymentMethod },
        { header: 'payment_status', getValue: (p: PaymentRecord) => p.paymentStatus },
        { header: 'paid_at', getValue: (p: PaymentRecord) => p.paidAt },
      ]);
      downloadCsv(`payments_ledger_${Date.now()}.csv`, csv);
      addToast({
        type: 'success',
        title: 'Payments Ledger Exported',
        message: `Exported ${payments.length} payment records to CSV.`,
      });
    }
  };

  const handleCopyRowAsCsv = (rowText: string, id: string) => {
    navigator.clipboard.writeText(rowText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: 'CSV formatted row copied.',
    });
  };

  // Filtered dataset lists
  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.userName.toLowerCase().includes(q) ||
        o.gasStationName.toLowerCase().includes(q) ||
        o.fuelTypeCode.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const filteredStations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return stations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.managerName.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.codeName && s.codeName.toLowerCase().includes(q))
    );
  }, [stations, searchQuery]);

  const filteredPrices = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return (Object.values(fuelPrices) as FuelPrice[]).filter(
      (p: FuelPrice) =>
        p.fuelTypeCode.toLowerCase().includes(q) ||
        p.pricePerLitre.toString().includes(q)
    );
  }, [fuelPrices, searchQuery]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.companyName && u.companyName.toLowerCase().includes(q))
    );
  }, [users, searchQuery]);

  const filteredPayments = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return payments.filter(
      (p) =>
        p.transactionId.toLowerCase().includes(q) ||
        p.orderNumber.toLowerCase().includes(q) ||
        p.userName.toLowerCase().includes(q)
    );
  }, [payments, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Stats & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <FileSpreadsheet className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  CSV Dataset Center & Data Hub
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  LIVE ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Universal CSV Parser, Dataset Import/Export & Schema Harmonization
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Import / Upload CSV</span>
            </button>

            <button
              onClick={handleExportCurrentDataset}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Active CSV</span>
            </button>

            <button
              onClick={resetToSampleData}
              title="Reset to default baseline sample dataset"
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dataset Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 block">Total Fuel Orders</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">
              {orders.length} Records
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 block">Total Volume Logged</span>
            <span className="text-xl font-extrabold text-white font-mono">
              {totalVolumeLitres.toLocaleString()} Litres
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 block">Active Gas Stations</span>
            <span className="text-xl font-extrabold text-cyan-400 font-mono">
              {stations.length} Hubs
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 block">Customer & Fleet Accounts</span>
            <span className="text-xl font-extrabold text-amber-400 font-mono">
              {users.length} Profiles
            </span>
          </div>
        </div>
      </div>

      {/* Dataset Category Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveDataset('orders')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeDataset === 'orders'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Fuel Orders Dataset ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveDataset('stations')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeDataset === 'stations'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Gas Stations Network ({stations.length})</span>
        </button>

        <button
          onClick={() => setActiveDataset('fuel_prices')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeDataset === 'fuel_prices'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Fuel Price Matrix ({Object.keys(fuelPrices).length})</span>
        </button>

        <button
          onClick={() => setActiveDataset('users')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeDataset === 'users'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Fleet Registry ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveDataset('payments')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeDataset === 'payments'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payments Ledger ({payments.length})</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search across ${activeDataset} dataset...`}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Showing:</span>
          <span className="font-bold text-white font-mono">
            {activeDataset === 'orders' && filteredOrders.length}
            {activeDataset === 'stations' && filteredStations.length}
            {activeDataset === 'fuel_prices' && filteredPrices.length}
            {activeDataset === 'users' && filteredUsers.length}
            {activeDataset === 'payments' && filteredPayments.length}
          </span>
          <span>records</span>
        </div>
      </div>

      {/* Dataset Data Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
          {/* ORDERS TABLE */}
          {activeDataset === 'orders' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold sticky top-0 z-10">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer & Account</th>
                  <th className="p-4">Station</th>
                  <th className="p-4">Fuel & Volume</th>
                  <th className="p-4">Rate & Amount</th>
                  <th className="p-4">Delivery Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-right">CSV Row</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {o.orderNumber}
                      <span className="block text-[10px] text-slate-500 font-mono">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{o.userName}</div>
                      <div className="text-[11px] text-slate-400">{o.userPhone}</div>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 mt-1 inline-block">
                        {o.userType}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">{o.gasStationName}</td>
                    <td className="p-4">
                      <span className="font-bold text-amber-400">{o.fuelTypeCode}</span>
                      <span className="block font-mono font-bold text-white text-sm">
                        {o.quantityLitres} Litres
                      </span>
                    </td>
                    <td className="p-4 font-mono">
                      <div className="text-white font-bold text-sm">₹{o.totalAmount.toFixed(2)}</div>
                      <div className="text-[11px] text-slate-400">₹{o.pricePerLitre}/L</div>
                    </td>
                    <td className="p-4 max-w-[200px]">
                      <div className="text-white text-xs truncate">{o.deliveryAddress.street}</div>
                      <div className="text-[11px] text-slate-400">{o.deliveryAddress.city}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded border ${
                          o.status === 'DELIVERED'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : o.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-teal-950 text-teal-300 border-teal-800 animate-pulse'
                            : o.status === 'CANCELLED'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-xs text-white">{o.paymentMethod}</div>
                      <span className="text-[10px] text-emerald-400 font-mono">{o.paymentStatus}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() =>
                          handleCopyRowAsCsv(
                            `"${o.orderNumber}","${o.userName}","${o.fuelTypeCode}",${o.quantityLitres},${o.totalAmount},"${o.status}"`,
                            o.id
                          )
                        }
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        title="Copy as CSV string"
                      >
                        {copiedId === o.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* STATIONS TABLE */}
          {activeDataset === 'stations' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold sticky top-0 z-10">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Station Name</th>
                  <th className="p-4">Manager & Phone</th>
                  <th className="p-4">City & Coverage</th>
                  <th className="p-4">Petrol Stock</th>
                  <th className="p-4">Diesel Stock</th>
                  <th className="p-4">Speed 98</th>
                  <th className="p-4">Bio-Diesel</th>
                  <th className="p-4 text-right">CSV Row</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredStations.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-emerald-400">{s.codeName}</td>
                    <td className="p-4 font-bold text-white">{s.name}</td>
                    <td className="p-4">
                      <div className="font-medium text-white">{s.managerName}</div>
                      <div className="text-[11px] text-slate-400">{s.contactNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-white">{s.city}</div>
                      <div className="text-[11px] text-slate-400">{s.coverageRadiusKm} km radius</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-amber-400">
                      {s.inventory.PETROL?.availableLitres || 0} L
                    </td>
                    <td className="p-4 font-mono font-bold text-cyan-400">
                      {s.inventory.DIESEL?.availableLitres || 0} L
                    </td>
                    <td className="p-4 font-mono font-bold text-rose-400">
                      {s.inventory.PREMIUM_PETROL?.availableLitres || 0} L
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {s.inventory.BIO_DIESEL?.availableLitres || 0} L
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() =>
                          handleCopyRowAsCsv(
                            `"${s.codeName}","${s.name}","${s.managerName}","${s.city}",${s.coverageRadiusKm}`,
                            s.id
                          )
                        }
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        title="Copy as CSV string"
                      >
                        {copiedId === s.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* FUEL PRICES TABLE */}
          {activeDataset === 'fuel_prices' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold sticky top-0 z-10">
                <tr>
                  <th className="p-4">Fuel Grade</th>
                  <th className="p-4">Base Price / Litre</th>
                  <th className="p-4">Tax (GST %)</th>
                  <th className="p-4">Base Delivery Fee</th>
                  <th className="p-4">Per Km Surcharge</th>
                  <th className="p-4">Last Updated</th>
                  <th className="p-4 text-right">CSV Row</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredPrices.map((p) => (
                  <tr key={p.fuelTypeCode} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      {p.fuelTypeCode}
                    </td>
                    <td className="p-4 font-mono font-extrabold text-emerald-400 text-base">
                      {p.currency}
                      {p.pricePerLitre.toFixed(2)}
                    </td>
                    <td className="p-4 font-mono text-white font-bold">{p.taxRatePercent}%</td>
                    <td className="p-4 font-mono text-slate-300">
                      {p.currency}
                      {p.deliveryFeeBase}
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      {p.currency}
                      {p.deliveryFeePerKm} / km
                    </td>
                    <td className="p-4 font-mono text-slate-500 text-[11px]">
                      {new Date(p.lastUpdated).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() =>
                          handleCopyRowAsCsv(
                            `"${p.fuelTypeCode}",${p.pricePerLitre},${p.taxRatePercent},${p.deliveryFeeBase},${p.deliveryFeePerKm}`,
                            p.fuelTypeCode
                          )
                        }
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        title="Copy as CSV string"
                      >
                        {copiedId === p.fuelTypeCode ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* USERS TABLE */}
          {activeDataset === 'users' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold sticky top-0 z-10">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Account Type</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Company / Fleet</th>
                  <th className="p-4">Primary Address</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">CSV Row</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white">{u.name}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {u.userType}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{u.email}</td>
                    <td className="p-4 font-mono text-slate-300">{u.phone}</td>
                    <td className="p-4 text-white font-medium">
                      {u.companyName ? `${u.companyName} (${u.fleetSize || 10} fleet)` : '—'}
                    </td>
                    <td className="p-4 text-slate-400 text-[11px]">
                      {u.addresses[0]?.street || 'Metro City'}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() =>
                          handleCopyRowAsCsv(
                            `"${u.name}","${u.email}","${u.phone}","${u.userType}","${u.companyName || ''}"`,
                            u.id
                          )
                        }
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        title="Copy as CSV string"
                      >
                        {copiedId === u.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PAYMENTS TABLE */}
          {activeDataset === 'payments' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold sticky top-0 z-10">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Payer Name</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Paid At</th>
                  <th className="p-4 text-right">CSV Row</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-emerald-400">{p.transactionId}</td>
                    <td className="p-4 font-mono text-white">{p.orderNumber}</td>
                    <td className="p-4 text-white font-medium">{p.userName}</td>
                    <td className="p-4 font-mono font-bold text-white">₹{p.amount.toFixed(2)}</td>
                    <td className="p-4 text-slate-400">{p.paymentMethod}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-500 text-[11px]">
                      {new Date(p.paidAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() =>
                          handleCopyRowAsCsv(
                            `"${p.transactionId}","${p.orderNumber}","${p.userName}",${p.amount},"${p.paymentStatus}"`,
                            p.id
                          )
                        }
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        title="Copy as CSV string"
                      >
                        {copiedId === p.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Preloaded CSV Dataset Cards */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Pre-Configured Real-World CSV Datasets
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly test with pre-built CSV datasets for orders, stations, pricing, and fleets
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">4 Presets Ready</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRELOADED_CSV_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                    {preset.type}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    {preset.recordCount} rows
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1.5">{preset.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{preset.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                <button
                  onClick={() => downloadCsv(`${preset.id}.csv`, preset.csvContent)}
                  className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" /> Download .csv
                </button>
                <button
                  onClick={() => {
                    setIsImportModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  Load in Importer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        defaultType={activeDataset}
      />
    </div>
  );
};
