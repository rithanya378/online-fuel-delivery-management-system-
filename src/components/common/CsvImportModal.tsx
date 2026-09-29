import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CsvDatasetType,
  CsvImportMode,
  CsvValidationResult,
  Order,
  GasStation,
  FuelPrice,
  User,
} from '../../types';
import {
  validateCsvDataset,
  downloadCsv,
  PRELOADED_CSV_PRESETS,
  generateCsv,
} from '../../utils/csvEngine';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Download,
  Sparkles,
  ArrowRight,
  Database,
  RefreshCw,
  Eye,
  Layers,
} from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: CsvDatasetType;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'orders',
}) => {
  const {
    stations,
    users,
    fuelPrices,
    importCsvOrders,
    importCsvStations,
    importCsvPrices,
    importCsvUsers,
    importGenericCsvDataset,
    addToast,
  } = useApp();

  const [selectedType, setSelectedType] = useState<CsvDatasetType | 'auto'>(defaultType || 'auto');
  const [csvText, setCsvText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [importMode, setImportMode] = useState<CsvImportMode>('replace');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewPage, setPreviewPage] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleValidate = (textToValidate: string, typeHint?: CsvDatasetType | 'auto') => {
    const hint = typeHint !== undefined ? typeHint : selectedType;
    const forceType = hint === 'auto' ? undefined : hint;
    const result = validateCsvDataset(textToValidate, stations, users, fuelPrices, forceType);
    setValidationResult(result);
    if (result.detectedType !== 'unknown' && selectedType === 'auto') {
      setSelectedType(result.detectedType);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      handleValidate(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      handleValidate(content);
    };
    reader.readAsText(file);
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = PRELOADED_CSV_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setFileName(`${preset.id}.csv`);
    setCsvText(preset.csvContent);
    setSelectedType(preset.type);
    handleValidate(preset.csvContent, preset.type);
    setActiveTab('upload');
    addToast({
      type: 'info',
      title: 'Sample CSV Loaded',
      message: `Loaded ${preset.title} (${preset.recordCount} records).`,
    });
  };

  const handleDownloadTemplate = () => {
    const targetType = selectedType === 'auto' ? 'orders' : selectedType;
    if (targetType === 'orders') {
      const template = 'order_number,customer_name,user_phone,user_email,user_type,station_name,fuel_type,quantity_litres,price_per_litre,delivery_charge,total_amount,delivery_address,city,lat,lng,status,payment_method,payment_status,vehicle_number,make_model,created_at\nORD-10001,John Doe,+91 98765 00000,john@example.com,INDIVIDUAL,Station A,PETROL,40,105,50,4956,12 Park Lane,Metro City,28.6139,77.2090,DELIVERED,UPI,SUCCESSFUL,DL-01-AB-1234,Honda City,2026-08-27T10:00:00Z';
      downloadCsv('orders_template.csv', template);
    } else if (targetType === 'stations') {
      const template = 'station_code,station_name,manager_name,contact_number,email,address,city,lat,lng,coverage_radius_km,rating,petrol_available,diesel_available,premium_petrol_available,bio_diesel_available\nStation K,Station K (North Hub),Alex Ray,+91 98000 11223,stationK@fuelflow.com,Sector 9 Expressway,Metro City,28.62,77.21,25,4.8,4000,6000,1500,2000';
      downloadCsv('stations_template.csv', template);
    } else if (targetType === 'fuel_prices') {
      const template = 'fuel_type_code,fuel_name,price_per_litre,currency,tax_rate_percent,delivery_fee_base,delivery_fee_per_km,density,min_order_qty,max_order_qty,is_active\nPETROL,Unleaded Petrol,105.00,₹,18,50.00,5.00,0.74 kg/L,5,3000,TRUE';
      downloadCsv('fuel_prices_template.csv', template);
    } else if (targetType === 'users') {
      const template = 'name,email,phone,user_type,company_name,fleet_size,city,address,status\nMetro Fleet Corp,fleet@metrocorp.com,+91 98111 00000,FLEET_OPERATOR,Metro Fleet Logistics,25,Metro City,Depot 4 Gate 1,ACTIVE';
      downloadCsv('users_template.csv', template);
    }
  };

  const handleExecuteImport = () => {
    if (!validationResult || !validationResult.isValid || validationResult.parsedData.length === 0) {
      addToast({
        type: 'error',
        title: 'Cannot Import Dataset',
        message: 'Please ensure valid CSV data is loaded and verified.',
      });
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const targetType = selectedType === 'auto' ? validationResult.detectedType : selectedType;

      if (targetType === 'orders') {
        importCsvOrders(validationResult.parsedData as Order[], importMode);
      } else if (targetType === 'stations') {
        importCsvStations(validationResult.parsedData as GasStation[], importMode);
      } else if (targetType === 'fuel_prices') {
        const pricesRecord: Record<string, FuelPrice> = {};
        (validationResult.parsedData as FuelPrice[]).forEach((p) => {
          pricesRecord[p.fuelTypeCode] = p;
        });
        importCsvPrices(pricesRecord, importMode);
      } else if (targetType === 'users') {
        importCsvUsers(validationResult.parsedData as User[], importMode);
      } else {
        importGenericCsvDataset(targetType as CsvDatasetType, validationResult.parsedData, importMode);
      }

      setIsProcessing(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                CSV Dataset Importer & Parser
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  RFC 4180
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Load custom CSV files or pre-configured datasets into the live system
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Selection Row: Dataset Type & Modes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Target Dataset */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Target Dataset Type:
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  const val = e.target.value as CsvDatasetType | 'auto';
                  setSelectedType(val);
                  if (csvText) handleValidate(csvText, val);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="auto">⚡ Auto-Detect from CSV Headers</option>
                <option value="orders">📦 Fuel Delivery Orders (Orders Dataset)</option>
                <option value="stations">⛽ Gas Stations & Routing Network</option>
                <option value="fuel_prices">💲 Central Fuel Prices & Tax Matrix</option>
                <option value="users">👥 Customers & Enterprise Fleets</option>
              </select>
            </div>

            {/* Import Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Import Mode:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    importMode === 'replace'
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Replace Entire
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('append')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    importMode === 'append'
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Append / Merge
                </button>
              </div>
            </div>

            {/* Template Download */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                CSV Template:
              </label>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                Download Blank Template
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Upload, Paste, Samples) */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload .CSV File
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'paste'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Paste CSV Raw Text
            </button>
            <button
              onClick={() => setActiveTab('samples')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'samples'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Preloaded Real-World CSV Datasets
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-3xl p-8 text-center bg-slate-950/40 transition-colors flex flex-col items-center justify-center space-y-3 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,text/csv,text/plain"
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  {fileName ? fileName : 'Choose CSV file or drag & drop here'}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Supports comma-delimited (.csv) and UTF-8 encoded files
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 hover:bg-slate-700"
              >
                Select Local File
              </button>
            </div>
          )}

          {/* Tab 2: Paste Raw CSV */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Raw CSV Spreadsheet Data:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCsvText('');
                    setValidationResult(null);
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-400 font-medium"
                >
                  Clear Text
                </button>
              </div>
              <textarea
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  handleValidate(e.target.value);
                }}
                rows={7}
                placeholder="Paste CSV text here with column headers in first row..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 scrollbar-thin"
              />
            </div>
          )}

          {/* Tab 3: Preloaded Sample Datasets */}
          {activeTab === 'samples' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRELOADED_CSV_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                        {preset.type.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        {preset.recordCount} rows
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-2">{preset.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => downloadCsv(`${preset.id}.csv`, preset.csvContent)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download .csv
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadPreset(preset.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md cursor-pointer flex items-center gap-1"
                    >
                      Load Dataset <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Validation & Verification Panel */}
          {validationResult && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              {/* Validation Summary Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  {validationResult.isValid ? (
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <XCircle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      Detected Type:{' '}
                      <span className="text-emerald-400 uppercase font-mono">
                        {validationResult.detectedType}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {validationResult.validRows} valid records detected out of{' '}
                      {validationResult.totalRows} raw CSV lines.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
                    ✓ {validationResult.validRows} Valid
                  </span>
                  {validationResult.invalidRows > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800">
                      ✗ {validationResult.invalidRows} Errors
                    </span>
                  )}
                </div>
              </div>

              {/* Warnings / Errors */}
              {validationResult.warnings.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-4 h-4" /> Parsing Notices:
                  </div>
                  {validationResult.warnings.map((w, idx) => (
                    <p key={idx} className="text-[11px] text-amber-300">
                      • {w}
                    </p>
                  ))}
                </div>
              )}

              {/* Data Preview Table */}
              {validationResult.parsedData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-400" />
                      Live Data Preview (Showing top 5 of {validationResult.parsedData.length}{' '}
                      records)
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      Headers: {validationResult.headers.join(', ')}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto max-h-56 scrollbar-thin">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[9px] font-bold sticky top-0">
                        <tr>
                          <th className="p-3">#</th>
                          {validationResult.detectedType === 'orders' && (
                            <>
                              <th className="p-3">Order #</th>
                              <th className="p-3">Customer</th>
                              <th className="p-3">Station</th>
                              <th className="p-3">Fuel</th>
                              <th className="p-3">Litres</th>
                              <th className="p-3">Total Amount</th>
                              <th className="p-3">Status</th>
                            </>
                          )}
                          {validationResult.detectedType === 'stations' && (
                            <>
                              <th className="p-3">Code</th>
                              <th className="p-3">Station Name</th>
                              <th className="p-3">Manager</th>
                              <th className="p-3">City</th>
                              <th className="p-3">Petrol (L)</th>
                              <th className="p-3">Diesel (L)</th>
                            </>
                          )}
                          {validationResult.detectedType === 'fuel_prices' && (
                            <>
                              <th className="p-3">Fuel Code</th>
                              <th className="p-3">Price / L</th>
                              <th className="p-3">Tax %</th>
                              <th className="p-3">Base Fee</th>
                              <th className="p-3">Km Fee</th>
                            </>
                          )}
                          {validationResult.detectedType === 'users' && (
                            <>
                              <th className="p-3">Name</th>
                              <th className="p-3">Type</th>
                              <th className="p-3">Email</th>
                              <th className="p-3">Phone</th>
                              <th className="p-3">Company</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {validationResult.parsedData.slice(0, 5).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/60">
                            <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                            {validationResult.detectedType === 'orders' && (
                              <>
                                <td className="p-3 font-mono font-bold text-emerald-400">
                                  {item.orderNumber}
                                </td>
                                <td className="p-3 font-medium text-white">{item.userName}</td>
                                <td className="p-3 text-slate-300">{item.gasStationName}</td>
                                <td className="p-3 font-bold text-amber-400">
                                  {item.fuelTypeCode}
                                </td>
                                <td className="p-3 font-mono font-bold text-white">
                                  {item.quantityLitres} L
                                </td>
                                <td className="p-3 font-mono font-bold text-emerald-400">
                                  ₹{item.totalAmount?.toFixed(2)}
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                    {item.status}
                                  </span>
                                </td>
                              </>
                            )}
                            {validationResult.detectedType === 'stations' && (
                              <>
                                <td className="p-3 font-bold text-emerald-400">{item.codeName}</td>
                                <td className="p-3 font-medium text-white">{item.name}</td>
                                <td className="p-3 text-slate-300">{item.managerName}</td>
                                <td className="p-3 text-slate-400">{item.city}</td>
                                <td className="p-3 font-mono text-amber-400 font-bold">
                                  {item.inventory?.PETROL?.availableLitres}
                                </td>
                                <td className="p-3 font-mono text-cyan-400 font-bold">
                                  {item.inventory?.DIESEL?.availableLitres}
                                </td>
                              </>
                            )}
                            {validationResult.detectedType === 'fuel_prices' && (
                              <>
                                <td className="p-3 font-bold text-emerald-400">
                                  {item.fuelTypeCode}
                                </td>
                                <td className="p-3 font-mono font-bold text-white">
                                  ₹{item.pricePerLitre?.toFixed(2)}
                                </td>
                                <td className="p-3 font-mono text-slate-400">
                                  {item.taxRatePercent}%
                                </td>
                                <td className="p-3 font-mono text-slate-400">
                                  ₹{item.deliveryFeeBase}
                                </td>
                                <td className="p-3 font-mono text-slate-400">
                                  ₹{item.deliveryFeePerKm}/km
                                </td>
                              </>
                            )}
                            {validationResult.detectedType === 'users' && (
                              <>
                                <td className="p-3 font-bold text-white">{item.name}</td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
                                    {item.userType}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-400">{item.email}</td>
                                <td className="p-3 font-mono text-slate-400">{item.phone}</td>
                                <td className="p-3 text-slate-300">
                                  {item.companyName || '—'}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={
                !validationResult ||
                !validationResult.isValid ||
                validationResult.parsedData.length === 0 ||
                isProcessing
              }
              onClick={handleExecuteImport}
              className={`px-6 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                validationResult && validationResult.isValid && validationResult.parsedData.length > 0
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Applying Dataset...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Apply & Load CSV Dataset ({validationResult?.validRows || 0} Records)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
