import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentRecord, Order, PaymentMethod } from '../../types';
import { InvoiceModal } from '../common/InvoiceModal';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  FileText,
  DollarSign,
  Zap,
  Building2,
  ShieldCheck,
  QrCode,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';

export const PaymentModule: React.FC = () => {
  const { currentUser, payments, orders } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'history' | 'refunds' | 'gateway_tester'>('history');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Filter payments for currentUser
  const userPayments = payments.filter((p) => p.userId === currentUser.id);

  // Filter cancelled orders with refunds
  const refundedOrders = orders.filter(
    (o) => o.userId === currentUser.id && o.paymentStatus === 'REFUNDED'
  );

  // Gateway Simulation State
  const [simMethod, setSimMethod] = useState<PaymentMethod>('UPI');
  const [simAmount, setSimAmount] = useState<number>(75.0);
  const [simScenario, setSimScenario] = useState<'SUCCESS' | 'FAIL_INSUFFICIENT' | 'FAIL_TIMEOUT'>('SUCCESS');
  const [simResult, setSimResult] = useState<{ status: 'SUCCESS' | 'FAILED'; message: string; txnId?: string } | null>(null);
  const [isProcessingSim, setIsProcessingSim] = useState(false);

  const filteredPayments = userPayments.filter(
    (p) =>
      p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSpent = userPayments
    .filter((p) => p.paymentStatus === 'SUCCESSFUL')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = userPayments
    .filter((p) => p.paymentStatus === 'REFUNDED')
    .reduce((sum, p) => sum + p.amount, 0);

  // Test Gateway Execution
  const handleRunGatewaySimulation = () => {
    setIsProcessingSim(true);
    setSimResult(null);

    setTimeout(() => {
      setIsProcessingSim(false);
      if (simScenario === 'SUCCESS') {
        setSimResult({
          status: 'SUCCESS',
          message: 'Payment Authorized & Captured Successfully via Dummy Payment Gateway API.',
          txnId: `TXN-SIM-${Math.floor(100000 + Math.random() * 900000)}`,
        });
      } else if (simScenario === 'FAIL_INSUFFICIENT') {
        setSimResult({
          status: 'FAILED',
          message: 'Payment Declined: Insufficient balance or credit limit exceeded on issuer card.',
        });
      } else {
        setSimResult({
          status: 'FAILED',
          message: 'Gateway Network Timeout: Bank server took too long to respond (Simulated HTTP 504).',
        });
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Fuel Spend (Lifetime)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-2">
            ${totalSpent.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            {userPayments.filter((p) => p.paymentStatus === 'SUCCESSFUL').length} Settled Invoices
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Refunds Processed</span>
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-2">
            ${totalRefunded.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {refundedOrders.length} Cancelled & 100% Refunded
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Payment Gateway</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white mt-2 flex items-center gap-1.5">
            <span>Dummy Gateway Sandbox</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            UPI, Visa/Mastercard, NetBanking & Fleet
          </span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'history'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Payment History & Invoices ({userPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('refunds')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'refunds'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Refund Status Tracker ({refundedOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gateway_tester')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'gateway_tester'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-300" />
          <span>Payment Gateway Simulator & Sandbox</span>
        </button>
      </div>

      {/* 1. PAYMENT HISTORY & INVOICE LEDGER */}
      {activeSubTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Payment Transactions & Official Receipts
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every transaction contains a cryptographic transaction ID, payment method, and instant PDF tax invoice.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search transaction ID, order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching payment transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Transaction ID</th>
                    <th className="py-3 px-3">Order Ref</th>
                    <th className="py-3 px-3">Payment Method</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredPayments.map((p) => {
                    const relatedOrder = orders.find((o) => o.id === p.orderId);

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-white flex items-center gap-2">
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{p.transactionId}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {p.orderNumber}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                            {p.paymentMethod.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400 text-sm">
                          ${p.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              p.paymentStatus === 'SUCCESSFUL'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : p.paymentStatus === 'REFUNDED'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {p.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {new Date(p.paidAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {relatedOrder ? (
                            <button
                              onClick={() => setSelectedInvoiceOrder(relatedOrder)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-400" />
                              <span>View Receipt</span>
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px]">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. REFUND STATUS TRACKER */}
      {activeSubTab === 'refunds' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              Cancelled Orders Refund Tracker
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live restitution logs for orders cancelled by user, station, or admin. Full funds return automatically to the original source.
            </p>
          </div>

          {refundedOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No refunded orders found. All placed orders have proceeded smoothly.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {refundedOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-slate-950 p-5 rounded-2xl border border-amber-900/60 shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm font-mono">{ord.orderNumber}</h4>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        Original Order Date: {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-amber-950 border border-amber-700 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Refund Completed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                    <div className="bg-slate-900 p-2.5 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Refund Amount:</span>
                      <span className="text-amber-400 font-mono font-extrabold text-sm">
                        ${ord.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Original Method:</span>
                      <span className="text-white font-medium">
                        {ord.paymentMethod.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Reason for Cancellation:
                    </span>
                    <p className="mt-0.5 text-slate-200">
                      "{ord.cancellationReason || 'User schedule adjustment'}" (by {ord.cancelledBy || 'USER'})
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                    <span>Refund Ref: RFD-{ord.transactionId.replace('TXN-', '')}</span>
                    <span>Status: 100% Settled</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. DUMMY PAYMENT GATEWAY SIMULATOR (Sandbox / College Project Test Terminal) */}
      {activeSubTab === 'gateway_tester' && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-xl max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Dummy Payment Gateway API Sandbox</h3>
              <p className="text-xs text-slate-400">
                Interactive simulator for college evaluation and gateway resilience testing (Credit Card, UPI QR, Net Banking & Error Handling).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Simulate Payment Instrument *
                </label>
                <select
                  value={simMethod}
                  onChange={(e) => setSimMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="UPI">UPI Instant Payment (Google Pay / PhonePe / Paytm)</option>
                  <option value="CREDIT_CARD">Credit / Debit Card (Visa, Mastercard, Amex)</option>
                  <option value="NET_BANKING">Net Banking (Commercial Banking Gateway)</option>
                  <option value="FLEET_ACCOUNT">Fleet Corporate Credit Line</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Test Transaction Amount ($ USD)
                </label>
                <input
                  type="number"
                  min="1"
                  value={simAmount}
                  onChange={(e) => setSimAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Simulate Gateway Gateway Response Scenario:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSimScenario('SUCCESS')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    simScenario === 'SUCCESS'
                      ? 'bg-emerald-950/80 border-emerald-500 text-white ring-1 ring-emerald-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-emerald-400">✅ HTTP 200: Success</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Captures transaction and issues receipt</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSimScenario('FAIL_INSUFFICIENT')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    simScenario === 'FAIL_INSUFFICIENT'
                      ? 'bg-rose-950/80 border-rose-500 text-white ring-1 ring-rose-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-rose-400">❌ HTTP 402: Declined</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Card declined / insufficient limit</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSimScenario('FAIL_TIMEOUT')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    simScenario === 'FAIL_TIMEOUT'
                      ? 'bg-amber-950/80 border-amber-500 text-white ring-1 ring-amber-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-amber-400">⚠️ HTTP 504: Timeout</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Bank endpoint failure simulator</p>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleRunGatewaySimulation}
                disabled={isProcessingSim}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isProcessingSim ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Communicating with Mock Payment Gateway...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Execute Sandbox Gateway Call (${simAmount.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>

            {simResult && (
              <div
                className={`p-4 rounded-xl text-xs sm:text-sm animate-in fade-in space-y-1 ${
                  simResult.status === 'SUCCESS'
                    ? 'bg-emerald-950/90 border border-emerald-700 text-emerald-200'
                    : 'bg-rose-950/90 border border-rose-700 text-rose-200'
                }`}
              >
                <div className="font-bold flex items-center gap-2">
                  {simResult.status === 'SUCCESS' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>Status: {simResult.status}</span>
                </div>
                <p className="text-xs">{simResult.message}</p>
                {simResult.txnId && (
                  <p className="text-[11px] font-mono text-emerald-300 pt-1">
                    Generated Mock Gateway Reference: {simResult.txnId}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
