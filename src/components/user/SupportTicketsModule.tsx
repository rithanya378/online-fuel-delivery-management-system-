import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SupportTicket } from '../../types';
import {
  LifeBuoy,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  FileText,
  Truck,
  Phone,
  ChevronRight,
  AlertTriangle,
  HelpCircle,
  Flame,
} from 'lucide-react';

interface SupportTicketsModuleProps {
  initialOrderId?: string;
}

export const SupportTicketsModule: React.FC<SupportTicketsModuleProps> = ({ initialOrderId }) => {
  const { currentUser, orders, supportTickets, createSupportTicket } = useApp();

  const userTickets = supportTickets.filter((t) => t.userId === currentUser.id);
  const userOrders = orders.filter((o) => o.userId === currentUser.id);

  const [isCreating, setIsCreating] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(userTickets[0]?.id || null);

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('DELIVERY_DELAY');
  const [priority, setPriority] = useState<SupportTicket['priority']>('MEDIUM');
  const [relatedOrderId, setRelatedOrderId] = useState<string>(initialOrderId || '');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const selectedTicket = userTickets.find((t) => t.id === selectedTicketId) || userTickets[0];

  const resetForm = () => {
    setSubject('');
    setCategory('DELIVERY_DELAY');
    setPriority('MEDIUM');
    setRelatedOrderId('');
    setDescription('');
    setIsCreating(false);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setFormError('Please enter a summary subject for your complaint.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please describe the issue in detail.');
      return;
    }

    const created = createSupportTicket({
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      userEmail: currentUser.email,
      orderId: relatedOrderId || undefined,
      category,
      priority,
      subject: subject.trim(),
      description: description.trim(),
    });

    resetForm();
    setSelectedTicketId(created.id);
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Open
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1 animate-pulse">
            <AlertCircle className="w-3 h-3" /> Under Review
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (p: SupportTicket['priority']) => {
    switch (p) {
      case 'URGENT':
        return <span className="text-[10px] text-rose-400 font-bold uppercase bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">Urgent</span>;
      case 'HIGH':
        return <span className="text-[10px] text-amber-400 font-bold uppercase bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">High</span>;
      default:
        return <span className="text-[10px] text-slate-400 font-bold uppercase bg-slate-800 px-1.5 py-0.5 rounded">Standard</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Customer Grievance & Safety Resolution Desk
              <span className="text-xs bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800 font-mono">
                {userTickets.length} Complaints Logged
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict 24/7 resolution protocol for doorstep fuel dispensing disputes, meter calibration audits, and delivery queries.
            </p>
          </div>
        </div>

        {!isCreating && (
          <button
            id="btn-raise-complaint"
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/40 flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Raise New Complaint / Ticket</span>
          </button>
        )}
      </div>

      {/* Raise Ticket Form */}
      {isCreating && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-indigo-400" />
              <span>Log Grievance / Safety Ticket</span>
            </div>
            <button
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Issue Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="DELIVERY_DELAY">Delivery Bowser Delay</option>
                  <option value="FUEL_QUANTITY">Quantity / Meter Reading Discrepancy</option>
                  <option value="FUEL_QUALITY">Fuel Quality / Density Query</option>
                  <option value="PAYMENT_BILLING">Payment / Billing Discrepancy</option>
                  <option value="SAFETY_HAZARD">Safety / Spill Hazard Protocol</option>
                  <option value="DRIVER_BEHAVIOR">Driver / Operator Conduct</option>
                  <option value="OTHER">General Support Query</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Urgency Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="LOW">Low - General Inquiry</option>
                  <option value="MEDIUM">Medium - Standard Request</option>
                  <option value="HIGH">High - Requires Attention</option>
                  <option value="URGENT">Urgent - Safety / High Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Link Past Order (Optional)</label>
                <select
                  value={relatedOrderId}
                  onChange={(e) => setRelatedOrderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">-- No specific order --</option>
                  {userOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} ({o.quantityLitres}L {o.fuelTypeName} - {new Date(o.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Subject Summary <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Meter reading differed by 2.5 Litres at delivery gate"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Detailed Incident Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Please describe what happened, dispenser time, and any verification checks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-950/40 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Grievance to Safety Desk</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets Master-Detail View */}
      {userTickets.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-md space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-white">No Grievance Tickets Logged</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All your fuel deliveries and payments are operating seamlessly. If you experience any meter issues or delivery delays, raise a ticket here for priority resolution.
          </p>
          <button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Raise Support Ticket</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tickets List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Your Tickets ({userTickets.length})
            </h4>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
              {userTickets.map((t) => {
                const isSelected = t.id === (selectedTicket?.id || userTickets[0].id);
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500 shadow-lg'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs text-white">{t.ticketNumber}</span>
                      {getStatusBadge(t.status)}
                    </div>

                    <h5 className="font-bold text-xs text-slate-200 mt-2 line-clamp-1">{t.subject}</h5>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                      {getPriorityBadge(t.priority)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Selected Ticket Detail */}
          {selectedTicket && (
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold text-white">{selectedTicket.ticketNumber}</span>
                    {getStatusBadge(selectedTicket.status)}
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                  <h3 className="text-base font-bold text-slate-200 mt-1">{selectedTicket.subject}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Category: <strong>{selectedTicket.category.replace(/_/g, ' ')}</strong> • Logged on{' '}
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Description Body */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Complaint Description
                </span>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Linked Order Details if any */}
              {selectedTicket.orderId && (
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Linked Delivery Order</span>
                      <span className="font-mono font-bold text-white">{selectedTicket.orderId}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Resolution Desk Activity */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Safety Resolution Officer Notes
                </span>

                {selectedTicket.resolutionNotes ? (
                  <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300">Central Safety Desk Response</span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Updated {new Date(selectedTicket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100/90 leading-relaxed">
                      {selectedTicket.resolutionNotes}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Assigned to Central Safety Officer. Investigation of meter log telemetry and bowser GPS route is actively in progress.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
