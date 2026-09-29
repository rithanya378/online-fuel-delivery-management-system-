import React from 'react';
import { Order } from '../../types';
import { Fuel, Printer, X, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Invoice Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">FuelFlow Official Invoice</h2>
              <p className="text-xs text-slate-400">Doorstep Refueling & Fleet Logistics Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-6 space-y-6 text-xs sm:text-sm">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px] uppercase font-semibold">Invoice No.</span>
              <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] uppercase font-semibold">Date & Time</span>
              <span className="text-slate-800 font-medium">
                {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] uppercase font-semibold">Order Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                {order.status}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] uppercase font-semibold">Payment Status</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                order.paymentStatus === 'SUCCESSFUL'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.paymentStatus === 'REFUNDED'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Billed To & Fulfilling Gas Station */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2">Billed To (Customer)</h4>
              <p className="font-bold text-slate-800 text-sm">{order.userName}</p>
              <p className="text-slate-600 mt-0.5">{order.userEmail} | {order.userPhone}</p>
              <p className="text-slate-600 mt-2 font-medium">Delivery Destination:</p>
              <p className="text-slate-500 text-xs leading-relaxed">
                {order.deliveryAddress.title} - {order.deliveryAddress.street}, {order.deliveryAddress.city} {order.deliveryAddress.zipCode}
              </p>
              {order.deliveryAddress.landmark && (
                <p className="text-slate-400 text-xs italic">Landmark: {order.deliveryAddress.landmark}</p>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2">Fulfilling Gas Station</h4>
              <p className="font-bold text-slate-800 text-sm">{order.gasStationName}</p>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{order.gasStationAddress}</p>
              
              {order.deliveryDetails.driverName && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                  <p className="font-semibold text-slate-700">Dispatch Details:</p>
                  <p className="text-slate-600">Driver: {order.deliveryDetails.driverName} ({order.deliveryDetails.driverPhone || 'N/A'})</p>
                  <p className="text-slate-600">Bowser Unit: {order.deliveryDetails.vehicleNumber || 'Standard Unit'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="py-3 px-4 font-semibold">Fuel Description</th>
                  <th className="py-3 px-4 font-semibold text-center">Quantity (L)</th>
                  <th className="py-3 px-4 font-semibold text-right">Price / Litre</th>
                  <th className="py-3 px-4 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{order.fuelTypeName}</p>
                    <span className="text-xs text-slate-500">Standard fuel grade supplied via metered pump</span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">{order.quantityLitres} L</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">${order.pricePerLitre.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">${order.fuelCost.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cost Summary */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Fuel Cost:</span>
                <span className="font-mono font-medium">${order.fuelCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Doorstep Delivery & Hazard Handling:</span>
                <span className="font-mono font-medium">${order.deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Applicable State Energy Tax (12%):</span>
                <span className="font-mono font-medium">${order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t border-slate-300">
                <span>Grand Total Paid:</span>
                <span className="font-mono text-emerald-700">${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-slate-500 text-right pt-1">
                Txn Ref: <span className="font-mono">{order.transactionId}</span> via {order.paymentMethod}
              </div>
            </div>
          </div>

          {/* Cancellation Notice if applicable */}
          {order.status === 'CANCELLED' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Order Cancellation & Refund Record:</span>
              </div>
              <p>Cancelled By: {order.cancelledBy || 'System'}</p>
              <p>Reason: "{order.cancellationReason}"</p>
              <p className="mt-1 font-semibold text-emerald-700">Refund Status: Successfully processed back to {order.paymentMethod}.</p>
            </div>
          )}

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-200 text-center text-slate-400 text-[11px]">
            <p>This is a computer-generated tax invoice verified under the Online Fuel Delivery Management System specification.</p>
            <p className="mt-0.5">Central Regulatory Pricing Enforced. Tampering with meter seals or fuel pricing is prohibited.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
