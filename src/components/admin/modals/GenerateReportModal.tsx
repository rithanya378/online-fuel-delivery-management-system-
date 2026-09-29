import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { FileSpreadsheet, X, Download, Calendar, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GenerateReportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addToast } = useApp();
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'tax' | 'station'>('sales');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      addToast({
        type: 'success',
        title: 'Report Generated',
        message: `${reportType.toUpperCase()} report exported as ${format.toUpperCase()} successfully.`,
      });
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Generate Operations Report</h3>
              <p className="text-[11px] text-slate-400">Export audited analytics and accounting records</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Report Category</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'sales', label: 'Fuel Sales & GMV' },
                { id: 'inventory', label: 'Depot Stock & Restock' },
                { id: 'station', label: 'Station Efficiency' },
                { id: 'tax', label: 'GST / Tax Ledger' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setReportType(item.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-colors ${
                    reportType === item.id
                      ? 'bg-blue-950/80 border-blue-600 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Date Interval</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="today">Today (24 Hours)</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days (Current Month)</option>
              <option value="this_quarter">This Quarter</option>
              <option value="full_year">Financial Year 2026</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Export Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-colors ${
                  format === 'csv'
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                CSV / Excel Spreadsheet
              </button>
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-colors ${
                  format === 'pdf'
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                PDF Executive Summary
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-950/50 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'Download Export'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
