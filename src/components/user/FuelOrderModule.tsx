import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FuelTypeCode, PaymentMethod, Vehicle, Order } from '../../types';
import confetti from 'canvas-confetti';
import {
  Fuel,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
  Zap,
  Info,
  Calendar,
  Building2,
  ChevronRight,
  ShieldCheck,
  Flame,
  ArrowRight,
  Sliders,
  DollarSign,
  Clock,
  Car,
  Plus,
  QrCode,
  Lock,
} from 'lucide-react';
import { OrderConfirmationModal } from './OrderConfirmationModal';

interface FuelOrderModuleProps {
  onOrderPlaced: (orderId: string) => void;
  preselectedStationId?: string;
}

export const FuelOrderModule: React.FC<FuelOrderModuleProps> = ({
  onOrderPlaced,
  preselectedStationId,
}) => {
  const {
    currentUser,
    fuelTypes,
    fuelPrices,
    stations,
    evaluateStationCandidates,
    placeOrder,
    setUserTab,
  } = useApp();

  const userVehicles = currentUser.vehicles || [];
  const defaultVehicle = userVehicles.find((v) => v.isDefault) || userVehicles[0];

  // Ordering Wizard State
  const [selectedFuel, setSelectedFuel] = useState<FuelTypeCode>(
    defaultVehicle?.preferredFuelType || 'PETROL'
  );
  const [quantity, setQuantity] = useState<number>(
    defaultVehicle?.tankCapacityLitres || (currentUser.userType === 'FLEET_OPERATOR' ? 250 : 45)
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    currentUser.addresses[0]?.id || ''
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(defaultVehicle?.id || 'none');
  const [preferredStationId, setPreferredStationId] = useState<string>(preselectedStationId || 'auto');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  // Confirmed Order Modal State
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Vehicle selection effect
  const handleVehicleChange = (vehId: string) => {
    setSelectedVehicleId(vehId);
    if (vehId !== 'none' && vehId !== 'custom') {
      const v = userVehicles.find((veh) => veh.id === vehId);
      if (v) {
        if (v.preferredFuelType) setSelectedFuel(v.preferredFuelType);
        if (v.tankCapacityLitres) setQuantity(v.tankCapacityLitres);
      }
    }
  };

  const currentAddress =
    currentUser.addresses.find((a) => a.id === selectedAddressId) || currentUser.addresses[0];

  // Candidates evaluation
  const stationCandidates = currentAddress
    ? evaluateStationCandidates(selectedFuel, quantity, currentAddress)
    : [];

  const selectedCandidate =
    preferredStationId !== 'auto'
      ? stationCandidates.find((c) => c.station.id === preferredStationId) || stationCandidates.find((c) => c.isEligible)
      : stationCandidates.find((c) => c.isEligible);

  // Price calculations
  const priceConfig = fuelPrices[selectedFuel] || {
    fuelTypeCode: selectedFuel,
    pricePerLitre: 1.18,
    currency: '$',
    taxRatePercent: 12,
    deliveryFeeBase: 5.0,
    deliveryFeePerKm: 0.75,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Admin Central',
  };

  const fuelCost = Math.round(quantity * priceConfig.pricePerLitre * 100) / 100;
  const distanceKm = selectedCandidate?.distanceKm || 5.2;
  const deliveryCharge =
    Math.round((priceConfig.deliveryFeeBase + distanceKm * priceConfig.deliveryFeePerKm) * 100) / 100;
  const subtotal = fuelCost + deliveryCharge;
  const taxAmount = Math.round(((subtotal * priceConfig.taxRatePercent) / 100) * 100) / 100;
  const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

  // Selected vehicle details payload
  const chosenVehicleObj = userVehicles.find((v) => v.id === selectedVehicleId);
  const vehiclePayload = chosenVehicleObj
    ? {
        makeModel: chosenVehicleObj.makeModel,
        registrationNumber: chosenVehicleObj.registrationNumber,
        tankCapacityLitres: chosenVehicleObj.tankCapacityLitres,
      }
    : undefined;

  // Handle Order Submit
  const handleConfirmOrder = async () => {
    if (!currentAddress) {
      setOrderError('Please select or add a delivery address first.');
      return;
    }
    if (!selectedCandidate) {
      setOrderError('No eligible gas station nearby can fulfill this fuel quantity right now.');
      return;
    }

    setIsSubmitting(true);
    setOrderError(null);

    const result = await placeOrder({
      userId: currentUser.id,
      fuelTypeCode: selectedFuel,
      quantityLitres: quantity,
      deliveryAddress: currentAddress,
      paymentMethod,
      deliveryInstructions,
      preferredStationId: preferredStationId !== 'auto' ? preferredStationId : undefined,
      vehicleDetails: vehiclePayload,
    });

    setIsSubmitting(false);

    if (result.success && result.orderId) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      // Construct confirmed order object for modal
      const placedOrderObj: Order = {
        id: result.orderId,
        orderNumber: result.orderNumber || `ORD-${Date.now().toString().slice(-4)}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userPhone: currentUser.phone,
        userType: currentUser.userType,
        gasStationId: selectedCandidate.station.id,
        gasStationName: selectedCandidate.station.name,
        gasStationAddress: selectedCandidate.station.address,
        fuelTypeCode: selectedFuel,
        fuelTypeName: fuelTypes.find((f) => f.code === selectedFuel)?.name || selectedFuel,
        quantityLitres: quantity,
        pricePerLitre: priceConfig.pricePerLitre,
        fuelCost,
        deliveryCharge,
        taxAmount,
        totalAmount,
        status: 'PENDING',
        paymentMethod,
        paymentStatus: 'SUCCESSFUL',
        transactionId: `TXN-${Date.now().toString().slice(-8)}`,
        deliveryAddress: currentAddress,
        deliveryInstructions,
        vehicleDetails: vehiclePayload,
        deliveryDetails: {
          driverName: selectedCandidate.station.managerName || 'Suresh Kumar',
          driverPhone: selectedCandidate.station.contactNumber || selectedCandidate.station.managerPhone || '+91 98765 43210',
          vehicleNumber: 'DL-01-BW-5520 (Mobile Bowser)',
          estimatedMinutes: Math.round(distanceKm * 3.5 + 10),
          currentLocation: selectedCandidate.station.coordinates,
        },
        otpCode: '4892',
        timeline: [
          {
            status: 'PENDING',
            title: 'Order Placed & Payment Verified',
            description: 'Order confirmed and registered in central refinery registry.',
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setConfirmedOrder(placedOrderObj);
    } else {
      setOrderError(result.error || 'Failed to place order.');
    }
  };

  // Preset quantities
  const presetQuantities =
    currentUser.userType === 'FLEET_OPERATOR'
      ? [100, 250, 500, 1000, 2500]
      : [20, 35, 50, 80, 120];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Central Pricing Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-800/40 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Doorstep Fuel Ordering Wizard</h3>
            <p className="text-xs text-slate-400">
              Select vehicle target, fuel grade, volume, and dispatch nearest certified mobile bowser.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Central Government Pricing:
          </span>
          <span className="text-slate-200 font-mono font-bold">
            ${priceConfig.pricePerLitre.toFixed(2)}/L
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Order Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Target Vehicle / Generator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Target Vehicle or Asset (Optional)
              </h4>
              <button
                type="button"
                onClick={() => setUserTab('vehicles')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Manage Garage
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleVehicleChange('none')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedVehicleId === 'none'
                    ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">Direct Tank Refuel</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Generic vehicle or barrel delivery</p>
              </button>

              {userVehicles.map((veh) => {
                const isSelected = selectedVehicleId === veh.id;
                return (
                  <button
                    key={veh.id}
                    type="button"
                    onClick={() => handleVehicleChange(veh.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-emerald-400" /> {veh.makeModel}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-emerald-400 font-mono mt-1 font-bold">
                      {veh.registrationNumber}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      {veh.tankCapacityLitres}L Tank • {veh.preferredFuelType}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Fuel Type */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Select Fuel Type & Grade
              </h4>
              <span className="text-xs text-slate-400">Real-time Verified Supply</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fuelTypes.map((fuel) => {
                const isSelected = selectedFuel === fuel.code;
                const price = fuelPrices[fuel.code]?.pricePerLitre || 1.15;
                const isPetrol = fuel.code.includes('PETROL');

                return (
                  <button
                    key={fuel.id}
                    type="button"
                    onClick={() => setSelectedFuel(fuel.code)}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? isPetrol
                          ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500'
                          : 'bg-amber-950/70 border-amber-500 text-white shadow-lg shadow-amber-950/30 ring-1 ring-amber-500'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-lg ${
                            isPetrol ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          <Fuel className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{fuel.name}</div>
                          <div className="text-[11px] text-slate-400">{fuel.octaneOrCetane}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-white font-mono">
                          ${price.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">/ Litre</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                      {fuel.description}
                    </p>

                    {isSelected && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400 font-medium">
                        <span>Selected for delivery</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Quantity Selection & Presets */}
          {(() => {
            const activeFuelObj = fuelTypes.find((f) => f.code === selectedFuel);
            const minQty = activeFuelObj?.minOrderQuantity || 5;
            const maxQty =
              currentUser.userType === 'FLEET_OPERATOR'
                ? Math.max(activeFuelObj?.maxOrderQuantity || 5000, 5000)
                : activeFuelObj?.maxOrderQuantity || 500;

            return (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    Enter Required Fuel Quantity
                  </h4>
                  <span className="text-xs text-emerald-400 font-mono font-bold">
                    {quantity} Litres Selected
                  </span>
                </div>

                {/* Quick Fill Preset Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {presetQuantities
                    .filter((p) => p >= minQty && p <= maxQty)
                    .map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuantity(preset)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          quantity === preset
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {preset} L
                      </button>
                    ))}
                </div>

                {/* Range Slider & Manual Input */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <div className="sm:col-span-3 space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Min: {minQty} L</span>
                      <span>Max: {maxQty.toLocaleString()} L</span>
                    </div>
                    <input
                      type="range"
                      min={minQty}
                      max={maxQty}
                      step="5"
                      value={Math.min(Math.max(quantity, minQty), maxQty)}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || minQty)}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <div className="relative">
                      <input
                        type="number"
                        min={minQty}
                        max={maxQty}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">L</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Step 4: Delivery Location & Instructions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  4
                </span>
                Delivery Location & Access Bay
              </h4>
              <button
                type="button"
                onClick={() => setShowAvailabilityModal(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" /> Check Station Coverage
              </button>
            </div>

            {currentUser.addresses.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center justify-between">
                <span>No delivery addresses found. Please add a saved address.</span>
                <button
                  onClick={() => setUserTab('addresses')}
                  className="px-3 py-1 bg-amber-600 text-slate-950 font-bold rounded-lg"
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {currentUser.addresses.map((addr) => {
                  const isSelected = addr.id === (selectedAddressId || currentUser.addresses[0]?.id);
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {addr.title}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{addr.street}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {addr.city}, {addr.state} {addr.zipCode}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Gate 4 access code #2201, dispense into Generator Tank B directly"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Step 5: Payment Gateway Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  5
                </span>
                Payment Method & Gateway
              </h4>
              <span className="text-xs text-slate-400">Encrypted 256-Bit SSL</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { code: 'UPI' as PaymentMethod, label: 'UPI / QR Scan', icon: Zap },
                { code: 'CREDIT_CARD' as PaymentMethod, label: 'Credit / Debit', icon: CreditCard },
                { code: 'NET_BANKING' as PaymentMethod, label: 'Net Banking', icon: Building2 },
                { code: 'FLEET_ACCOUNT' as PaymentMethod, label: 'Fleet Corporate', icon: ShieldCheck },
              ].map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.code;
                return (
                  <button
                    key={pm.code}
                    type="button"
                    onClick={() => setPaymentMethod(pm.code)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-1 text-slate-300" />
                    <span className="text-xs">{pm.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Simulated UPI Scan Preview */}
            {paymentMethod === 'UPI' && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-white font-bold block">UPI Auto-Debit & Instant Verification</span>
                    <span className="text-slate-400 text-[11px]">Instant settlement upon safety OTP release</span>
                  </div>
                </div>
                <span className="text-emerald-400 font-mono font-bold text-xs bg-emerald-950 px-2 py-1 rounded border border-emerald-800">
                  VPA: fuelpay@central
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Automated Station Match & Price Summary */}
        <div className="space-y-6">
          {/* Automated Station Matcher Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Auto-Matched Gas Station</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                Algorithm: Closest + Stocked
              </span>
            </h4>

            {selectedCandidate ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-white text-sm">{selectedCandidate.station.name}</h5>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedCandidate.station.address}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-xs font-mono font-bold border border-emerald-800">
                    {selectedCandidate.distanceKm} km away
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Tank Inventory:</span>
                    <span className="text-white font-mono font-bold">
                      {selectedCandidate.availableLitres.toLocaleString()} L in Tank
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Est. Dispatch ETA:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {Math.round(selectedCandidate.distanceKm * 3.5 + 10)} mins
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Station is verified, active & has sufficient capacity.</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>No Station Can Fulfill Request</span>
                </div>
                <p className="text-rose-300 text-[11px]">
                  Either fuel quantity exceeds nearby inventory or address is outside coverage radius. Try reducing quantity or adjusting location.
                </p>
              </div>
            )}
          </div>

          {/* Automatic Price Calculation & Bill Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Automatic Price Calculation</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Fuel Base Cost ({quantity}L @ ${priceConfig.pricePerLitre.toFixed(2)}/L):</span>
                <span className="font-mono text-white font-semibold">${fuelCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Doorstep Bowser Delivery Fee ({distanceKm} km):</span>
                <span className="font-mono text-white font-semibold">${deliveryCharge.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>State Fuel Tax / Cess ({priceConfig.taxRatePercent}%):</span>
                <span className="font-mono text-slate-300 font-medium">${taxAmount.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-white block">Total Payable</span>
                  <span className="text-[10px] text-slate-400">All taxes & bowser dispatch included</span>
                </div>
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {orderError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{orderError}</span>
              </div>
            )}

            <button
              id="btn-place-fuel-order"
              type="button"
              onClick={handleConfirmOrder}
              disabled={isSubmitting || !selectedCandidate}
              className={`w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                isSubmitting || !selectedCandidate
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Routing Nearest Bowser...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  <span>Place Doorstep Fuel Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Station Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-white text-base">Network Stations Coverage Matrix</h4>
              </div>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Evaluating network stations for <strong>{quantity}L of {selectedFuel}</strong> at{' '}
              <strong>{currentAddress?.street || 'Selected Location'}</strong>:
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {stationCandidates.map((c) => (
                <div
                  key={c.station.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                    c.isEligible
                      ? 'bg-slate-950 border-emerald-500/40 text-slate-200'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 opacity-75'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{c.station.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({c.distanceKm} km)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.station.address}</p>
                    <p className={`text-[10px] mt-1 font-semibold ${c.isEligible ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {c.reason}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-white block">
                      {c.availableLitres.toLocaleString()} L
                    </span>
                    <span className="text-[10px] text-slate-500">Available</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onClose={() => {
            setConfirmedOrder(null);
            onOrderPlaced(confirmedOrder.id);
          }}
          onTrackOrder={() => {
            setConfirmedOrder(null);
            onOrderPlaced(confirmedOrder.id);
          }}
          onViewInvoice={() => {
            setConfirmedOrder(null);
            setUserTab('my_orders');
          }}
        />
      )}
    </div>
  );
};
