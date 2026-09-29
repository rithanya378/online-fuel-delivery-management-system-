import React, { useState } from 'react';
import { FuelDemandPrediction } from './FuelDemandPrediction';
import { useApp } from '../../context/AppContext';
import { FuelTypeCode, Order } from '../../types';

import { AdminDashboard } from './AdminDashboard';
import { AdminOrdersManager } from './AdminOrdersManager';
import { AdminStationsManager } from './AdminStationsManager';
import { AdminInventoryMonitor } from './AdminInventoryMonitor';
import { AdminFuelPricesManager } from './AdminFuelPricesManager';
import { AdminUsersManager } from './AdminUsersManager';
import { AdminCsvDatasets } from './AdminCsvDatasets';

import { AddStationModal } from './modals/AddStationModal';
import { ManageFuelPricesModal } from './modals/ManageFuelPricesModal';
import { RestockModal } from './modals/RestockModal';
import { GenerateReportModal } from './modals/GenerateReportModal';
import { OrderDetailsModal } from './modals/OrderDetailsModal';
import { CancelOrderModal } from './modals/CancelOrderModal';

import {
  FileSpreadsheet,
  Star,
  Bell,
  FileText,
  Settings,
  CreditCard,
  Download,
  RotateCcw,
  Brain,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    adminTab,
    payments,
    auditLogs,
    notifications,
    orders,
    markNotificationRead,
    markAllNotificationsRead,
    resetToSampleData,
  } = useApp();

  // ================================
  // MODAL STATES
  // ================================

  const [isAddStationOpen, setIsAddStationOpen] = useState(false);
  const [isFuelPriceOpen, setIsFuelPriceOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);

  const [restockStationId, setRestockStationId] =
    useState<string | undefined>();

  const [restockFuelCode, setRestockFuelCode] =
    useState<FuelTypeCode | undefined>();

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [isOrderDetailsOpen, setIsOrderDetailsOpen] =
    useState(false);

  const [isCancelOrderOpen, setIsCancelOrderOpen] =
    useState(false);

  // ================================
  // RESTOCK HANDLER
  // ================================

  const handleOpenRestock = (
    stationId: string,
    fuelCode: FuelTypeCode
  ) => {
    setRestockStationId(stationId);
    setRestockFuelCode(fuelCode);
    setIsRestockOpen(true);
  };

  // ================================
  // VIEW ORDER
  // ================================

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  // ================================
  // CANCEL ORDER
  // ================================

  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsCancelOrderOpen(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

      {/* =========================================================
          DASHBOARD
      ========================================================= */}

    {adminTab === 'dashboard' && (
  <>
    <AdminDashboard
      onOpenAddStationModal={() => setIsAddStationOpen(true)}
      onOpenAddFuelModal={() => setIsAddStationOpen(true)}
      onOpenPriceModal={() => setIsFuelPriceOpen(true)}
      onOpenReportModal={() => setIsReportOpen(true)}
      onOpenRestockModal={handleOpenRestock}
      onViewOrderDetails={handleViewOrder}
    />

    {/* ML Fuel Demand Prediction */}
    <FuelDemandPrediction />
  </>
)} 

      {/* =========================================================
          DATASETS
      ========================================================= */}

      {adminTab === 'datasets' && (
        <AdminCsvDatasets />
      )}

      {/* =========================================================
          FUEL DEMAND PREDICTION - ML
      ========================================================= */}

      {(adminTab as string) === 'fuel_prediction' && (
        <div className="space-y-6 animate-in fade-in duration-200">

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">

            <div className="flex items-center gap-3">

              <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-800">
                <Brain className="w-7 h-7 text-emerald-400" />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  AI Fuel Demand Prediction
                </h1>

                <p className="text-xs text-slate-400 mt-1">
                  Machine Learning based fuel demand forecasting
                  for intelligent inventory management
                </p>
              </div>

            </div>

          </div>

          <FuelDemandPrediction />

        </div>
      )}

      {/* =========================================================
          ORDERS
      ========================================================= */}

      {adminTab === 'orders' && (
        <AdminOrdersManager
          onViewOrderDetails={handleViewOrder}
          onOpenCancelModal={handleCancelOrder}
        />
      )}

      {/* =========================================================
          STATIONS
      ========================================================= */}

      {adminTab === 'stations' && (
        <AdminStationsManager
          onOpenAddStationModal={() =>
            setIsAddStationOpen(true)
          }
          onOpenRestockModal={handleOpenRestock}
        />
      )}

      {/* =========================================================
          INVENTORY
      ========================================================= */}

      {adminTab === 'inventory' && (
        <AdminInventoryMonitor
          onOpenRestockModal={handleOpenRestock}
        />
      )}

      {/* =========================================================
          FUEL PRICES
      ========================================================= */}

      {adminTab === 'fuel_prices' && (
        <AdminFuelPricesManager />
      )}

      {/* =========================================================
          FUEL MANAGEMENT
      ========================================================= */}

      {adminTab === 'fuel_management' && (
        <AdminFuelPricesManager />
      )}

      {/* =========================================================
          USERS
      ========================================================= */}

      {adminTab === 'users' && (
        <AdminUsersManager />
      )}

      {/* =========================================================
          PAYMENTS
      ========================================================= */}

      {adminTab === 'payments' && (
        <div className="space-y-6 animate-in fade-in duration-200">

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">

            <div>

              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">

                <CreditCard className="w-6 h-6 text-emerald-400" />

                Payments & Revenue Ledger

              </h1>

              <p className="text-xs text-slate-400 mt-1">
                Real-time UPI, credit card, and corporate fleet account transactions
              </p>

            </div>

            <div className="text-right">

              <span className="text-xs text-slate-400 block">
                Total GMV:
              </span>

              <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                ₹12,45,800.00
              </span>

            </div>

          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">

            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs">

                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">

                  <tr>

                    <th className="p-4">
                      Transaction ID
                    </th>

                    <th className="p-4">
                      Order #
                    </th>

                    <th className="p-4">
                      Payer Name
                    </th>

                    <th className="p-4">
                      Amount
                    </th>

                    <th className="p-4">
                      Payment Mode
                    </th>

                    <th className="p-4">
                      Status
                    </th>

                    <th className="p-4">
                      Timestamp
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-800/60 text-slate-300">

                  {payments.map((p) => (

                    <tr
                      key={p.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >

                      <td className="p-4 font-mono font-bold text-emerald-400">
                        {p.transactionId}
                      </td>

                      <td className="p-4 font-mono text-white">
                        {p.orderNumber}
                      </td>

                      <td className="p-4 text-white font-medium">
                        {p.userName}
                      </td>

                      <td className="p-4 font-mono font-bold text-white">
                        ₹{p.amount.toFixed(2)}
                      </td>

                      <td className="p-4 text-slate-400">
                        {p.paymentMethod}
                      </td>

                      <td className="p-4">

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            p.paymentStatus === 'SUCCESSFUL'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : p.paymentStatus === 'REFUNDED'
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}
                        >
                          {p.paymentStatus}
                        </span>

                      </td>

                      <td className="p-4 font-mono text-slate-500 text-[11px]">
                        {new Date(p.paidAt).toLocaleString()}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      )}

      {/* =========================================================
          REPORTS
      ========================================================= */}

      {adminTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-200">

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">

            <div>

              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">

                <FileSpreadsheet className="w-6 h-6 text-blue-400" />

                Financial & Operations Reports

              </h1>

              <p className="text-xs text-slate-400 mt-1">
                Export audited delivery and revenue spreadsheets
              </p>

            </div>

            <button
              onClick={() => setIsReportOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-950/40 cursor-pointer"
            >
              Generate New Export
            </button>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">

              <h3 className="text-base font-bold text-white">
                Monthly Revenue Statement
              </h3>

              <p className="text-xs text-slate-400">
                Total gross merchandise volume, taxes, and service fees
              </p>

              <button
                onClick={() => setIsReportOpen(true)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Download Statement
              </button>

            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">

              <h3 className="text-base font-bold text-white">
                Fuel Consumption Audit
              </h3>

              <p className="text-xs text-slate-400">
                Total litres distributed by fuel type across all zones
              </p>

              <button
                onClick={() => setIsReportOpen(true)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Download Audit
              </button>

            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">

              <h3 className="text-base font-bold text-white">
                Station Performance Matrix
              </h3>

              <p className="text-xs text-slate-400">
                Order acceptance rate, cancellation ratios, and ratings
              </p>

              <button
                onClick={() => setIsReportOpen(true)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Download Matrix
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =========================================================
          REVIEWS
      ========================================================= */}

      {adminTab === 'reviews' && (
        <div className="space-y-6 animate-in fade-in duration-200">

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">

            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">

              <Star className="w-6 h-6 text-amber-400" />

              Customer Reviews & Feedback

            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Verified reviews from completed deliveries
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {orders
              .filter((o) => o.review)
              .map((ord) => (

                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"
                >

                  <div className="flex items-center justify-between">

                    <span className="font-bold text-white text-xs">
                      {ord.userName}
                    </span>

                    <span className="flex items-center gap-1 text-amber-400 font-bold text-xs">

                      <Star className="w-3.5 h-3.5 fill-amber-400" />

                      {ord.review?.rating} / 5

                    </span>

                  </div>

                  <p className="text-xs text-slate-300 italic">
                    "{ord.review?.comment}"
                  </p>

                  <div className="text-[10px] text-slate-500 font-mono">
                    Order {ord.orderNumber} • {ord.gasStationName} • {ord.fuelTypeName}
                  </div>

                </div>

              ))}

          </div>

        </div>
      )}

      {/* =========================================================
          NOTIFICATIONS
      ========================================================= */}

      {adminTab === 'notifications' && (
        <div className="space-y-6 animate-in fade-in duration-200">

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">

            <div>

              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">

                <Bell className="w-6 h-6 text-emerald-400" />

                System Notifications & Alerts

              </h1>

              <p className="text-xs text-slate-400 mt-1">
                Central alerts, threshold warnings, and dispatches
              </p>

            </div>

            <button
              onClick={markAllNotificationsRead}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
            >
              Mark All Read
            </button>

          </div>

          <div className="space-y-2.5">

            {notifications.map((notif) => (

              <div
                key={notif.id}
                onClick={() =>
                  markNotificationRead(notif.id)
                }
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  !notif.isRead
                    ? 'bg-slate-900/90 border-emerald-500/50'
                    : 'bg-slate-900/50 border-slate-800/80'
                }`}
              >

                <div className="flex items-center justify-between">

                  <span className="font-bold text-white text-xs">
                    {notif.title}
                  </span>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>

                </div>

                <p className="text-xs text-slate-400 mt-1">
                  {notif.message}
                </p>

              </div>

            ))}

          </div>

        </div>
      )}

      {/* =========================================================
          AUDIT LOGS
      ========================================================= */}

      {adminTab === 'audit_logs' && (
        <div className="space-y-6 animate-in fade-in duration-200">

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">

            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">

              <FileText className="w-6 h-6 text-purple-400" />

              Security Audit Logs & Compliance Trails

            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Immutable activity records of price changes, stock adjustments, and account authorizations
            </p>

          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">

            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs">

                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">

                  <tr>

                    <th className="p-4">Action</th>
                    <th className="p-4">Actor</th>
                    <th className="p-4">Entity</th>
                    <th className="p-4">Details</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4">Timestamp</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-800/60 text-slate-300">

                  {auditLogs.map((log) => (

                    <tr
                      key={log.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >

                      <td className="p-4 font-mono font-bold text-emerald-400">
                        {log.action}
                      </td>

                      <td className="p-4 text-white font-medium">
                        {log.actorName}
                      </td>

                      <td className="p-4 font-mono text-slate-400">
                        {log.entity}
                      </td>

                      <td className="p-4 text-slate-300">
                        {log.details}
                      </td>

                      <td className="p-4 font-mono text-slate-500">
                        {log.ipAddress}
                      </td>

                      <td className="p-4 font-mono text-slate-500 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      )}

      {/* =========================================================
          SETTINGS
      ========================================================= */}

      {adminTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-200">

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">

            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">

              <Settings className="w-6 h-6 text-slate-400" />

              System Settings & Architecture

            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Platform parameters and testing environment controls
            </p>

          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">

            <h3 className="text-base font-bold text-white">
              Reset Mock Database State
            </h3>

            <p className="text-xs text-slate-400">
              Restore all mock orders, stations, users, and pricing models to initial baseline sample values.
            </p>

            <button
              onClick={resetToSampleData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950/40 cursor-pointer"
            >

              <RotateCcw className="w-4 h-4" />

              <span>
                Reset All Mock Data to Default
              </span>

            </button>

          </div>

        </div>
      )}

      {/* =========================================================
          MODALS
      ========================================================= */}

      <AddStationModal
        isOpen={isAddStationOpen}
        onClose={() =>
          setIsAddStationOpen(false)
        }
      />

      <ManageFuelPricesModal
        isOpen={isFuelPriceOpen}
        onClose={() =>
          setIsFuelPriceOpen(false)
        }
      />

      <GenerateReportModal
        isOpen={isReportOpen}
        onClose={() =>
          setIsReportOpen(false)
        }
      />

      <RestockModal
        isOpen={isRestockOpen}
        onClose={() =>
          setIsRestockOpen(false)
        }
        initialStationId={restockStationId}
        initialFuelCode={restockFuelCode}
      />

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isOrderDetailsOpen}
        onClose={() =>
          setIsOrderDetailsOpen(false)
        }
        onOpenCancelModal={(ord) => {

          setIsOrderDetailsOpen(false);

          setSelectedOrder(ord);

          setIsCancelOrderOpen(true);

        }}
      />

      <CancelOrderModal
        order={selectedOrder}
        isOpen={isCancelOrderOpen}
        onClose={() =>
          setIsCancelOrderOpen(false)
        }
        cancelledBy="ADMIN"
      />

    </div>
  );
};