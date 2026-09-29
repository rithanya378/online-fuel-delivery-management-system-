import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FuelTypeCode, PaymentMethod } from '../../types';
import {
  Fuel,
  MapPin,
  Clock,
  CreditCard,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Sparkles,
  DollarSign,
  ChevronRight,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderFuelModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    fuelTypes,
    fuelPrices,
    stations,
    evaluateStationCandidates,
    calculateOrderPricing,
    placeOrder,
  } = useApp();

  const [fuelTypeCode, setFuelTypeCode] = useState<FuelTypeCode>('PETROL');
  const [quantityLitres, setQuantityLitres] = useState<number>(30);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    currentUser?.addresses[0]?.id || ''
  );
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [deliveryNotes, setDeliveryNotes] = useState('Please honk when near security gate');
  const [selectedStationId, setSelectedStationId] = useState<string>('AUTO');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active delivery address object
  const activeAddress = useMemo(() => {
    return (
      currentUser?.addresses.find((a) => a.id === selectedAddressId) ||
      currentUser?.addresses[0] || {
        id: 'temp',
        title: 'Current GPS Location',
        street: 'Connaught Place Outer Ring Road',
        city: 'Metro City',
        state: 'Delhi',
        zipCode: '110001',
        coordinates: { lat: 28.6315, lng: 77.2167 },
      }
    );
  }, [currentUser, selectedAddressId]);

  // Evaluate candidate stations
  const candidateStations = useMemo(() => {
    return evaluateStationCandidates(fuelTypeCode, quantityLitres, activeAddress);
  }, [evaluateStationCandidates, fuelTypeCode, quantityLitres, activeAddress]);

  // Best auto-selected station
  const bestStation = candidateStations.find((c) => c.isEligible)?.station || null;

  // Final station to be used
  const chosenStation =
    selectedStationId === 'AUTO'
      ? bestStation
      : stations.find((s) => s.id === selectedStationId) || null;

  // Real-time pricing calculations
  const pricing = useMemo(() => {
    const distanceKm = candidateStations.find((c) => c.station.id === chosenStation?.id)?.distanceKm || 4.2;
    return calculateOrderPricing(fuelTypeCode, quantityLitres, distanceKm);
  }, [calculateOrderPricing, fuelTypeCode, quantityLitres, chosenStation, candidateStations]);

  if (!isOpen) return null;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosenStation) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const scheduledTimeStr = isScheduled ? `${scheduledDate} at ${scheduledTime}` : undefined;

      placeOrder({
        fuelTypeCode,
        quantityLitres,
        deliveryAddress: {
          ...activeAddress,
          instructions: deliveryNotes,
        },
        gasStationId: chosenStation.id,
        scheduledDeliveryTime: scheduledTimeStr,
        paymentMethod,
      });

      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Doorstep Fuel Delivery Order</h3>
              <p className="text-xs text-slate-400">
                Safe, certified mobile dispensing bowser direct to your vehicle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Step 1: Select Fuel Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Select Fuel Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {fuelTypes.map((fuel) => {
                const isSelected = fuelTypeCode === fuel.code;
                const price = fuelPrices[fuel.code]?.pricePerLitre || 100;

                return (
                  <button
                    type="button"
                    key={fuel.code}
                    onClick={() => setFuelTypeCode(fuel.code)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-950/90 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-extrabold truncate">{fuel.name}</div>
                    <div className="text-emerald-400 font-mono font-bold text-xs mt-1">
                      ₹{price.toFixed(2)} / L
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Quantity in Litres */}
          {(() => {
            const activeFuelObj = fuelTypes.find((f) => f.code === fuelTypeCode);
            const minQty = activeFuelObj?.minOrderQuantity || 5;
            const maxQty = activeFuelObj?.maxOrderQuantity || 500;

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    2. Required Quantity:{' '}
                    <span className="text-emerald-400 font-mono">{quantityLitres} Litres</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[10, 25, 50, 100, 250]
                      .filter((p) => p >= minQty && p <= maxQty)
                      .map((preset) => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => setQuantityLitres(preset)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            quantityLitres === preset
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {preset}L
                        </button>
                      ))}
                  </div>
                </div>

                <input
                  type="range"
                  min={minQty}
                  max={maxQty}
                  step="5"
                  value={Math.min(Math.max(quantityLitres, minQty), maxQty)}
                  onChange={(e) => setQuantityLitres(Number(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Min Allowed: {minQty} Litres</span>
                  <span>Max Allowed: {maxQty} Litres</span>
                </div>
              </div>
            );
          })()}

          {/* Step 3: Delivery Location */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              3. Delivery Address & Vehicle Location
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentUser?.addresses.map((addr) => (
                <button
                  type="button"
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedAddressId === addr.id
                      ? 'bg-emerald-950/80 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{addr.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">
                    {addr.street}, {addr.city}
                  </div>
                </button>
              ))}
            </div>

            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Vehicle plate number, parking spot number, or gate notes..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Step 4: Gas Station Matching (Auto vs Manual) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                4. Gas Station Match & Underground Stock
              </label>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                <Sparkles className="w-3 h-3" /> Auto-Optimized Proximity
              </span>
            </div>

            <div className="space-y-2">
              {/* Option 1: AI Auto Match */}
              <button
                type="button"
                onClick={() => setSelectedStationId('AUTO')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  selectedStationId === 'AUTO'
                    ? 'bg-emerald-950/80 border-emerald-500 text-white ring-1 ring-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Smart Auto-Select Best Depot</span>
                      {bestStation && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-900 text-emerald-300 font-bold">
                          Assigned: {bestStation.codeName}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Dispatches closest certified bowser with sufficient stock to guarantee ~15 min ETA
                    </div>
                  </div>
                </div>
                {selectedStationId === 'AUTO' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </button>

              {/* Station Candidates List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {candidateStations.map(({ station, distanceKm, isEligible, availableLitres, reason }) => (
                  <button
                    type="button"
                    key={station.id}
                    disabled={!isEligible}
                    onClick={() => setSelectedStationId(station.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      selectedStationId === station.id
                        ? 'bg-emerald-950/80 border-emerald-500 text-white'
                        : isEligible
                        ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white">{station.name}</span>
                      <span className="font-mono text-emerald-400">{distanceKm.toFixed(1)} km</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span>Stock: {availableLitres.toLocaleString()} L</span>
                      {isEligible ? (
                        <span className="text-emerald-400 font-bold">In Range</span>
                      ) : (
                        <span className="text-rose-400 font-bold">{reason}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 5: Payment Method */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              5. Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'UPI', label: 'UPI / QR Code' },
                { id: 'CREDIT_CARD', label: 'Card / Corporate' },
                { id: 'CASH_ON_DELIVERY', label: 'Pay on Delivery' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    paymentMethod === m.id
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Itemized Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Fuel Cost ({quantityLitres} L × ₹{pricing.pricePerLitre.toFixed(2)}/L):
              </span>
              <span className="font-mono font-bold text-white">₹{pricing.fuelCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Doorstep Bowser Mobile Dispatch Fee:</span>
              <span className="font-mono font-bold text-white">₹{pricing.deliveryCharge.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Taxes & GST (18% on service):</span>
              <span className="font-mono font-bold text-white">₹{pricing.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-base font-extrabold text-emerald-400">
              <span>Total Payable Amount:</span>
              <span className="font-mono text-lg">₹{pricing.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!chosenStation || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-xl shadow-emerald-950/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isSubmitting ? 'Authorizing Dispatch...' : `Confirm & Pay ₹${pricing.totalAmount.toFixed(2)}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
