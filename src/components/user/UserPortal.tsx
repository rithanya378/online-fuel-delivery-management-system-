import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AccountModule } from './AccountModule';
import { FuelOrderModule } from './FuelOrderModule';
import { OrderTrackingModule } from './OrderTrackingModule';
import { PaymentModule } from './PaymentModule';
import { VehicleGarageModule } from './VehicleGarageModule';
import { GasStationsModule } from './GasStationsModule';
import { SupportTicketsModule } from './SupportTicketsModule';
import { AddressManagerModule } from './AddressManagerModule';
import {
  UserCheck,
  Fuel,
  Truck,
  CreditCard,
  Building2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Car,
  LifeBuoy,
  Navigation,
} from 'lucide-react';

export const UserPortal: React.FC = () => {
  const { currentUser, orders, supportTickets } = useApp();

  type ModuleTab =
    | 'order'
    | 'tracking'
    | 'garage'
    | 'stations'
    | 'addresses'
    | 'tickets'
    | 'payment'
    | 'account';

  const [activeModuleTab, setActiveModuleTab] = useState<ModuleTab>('order');
  const [justPlacedOrderId, setJustPlacedOrderId] = useState<string | null>(null);
  const [preselectedStationId, setPreselectedStationId] = useState<string | undefined>(undefined);
  const [ticketPreselectedOrderId, setTicketPreselectedOrderId] = useState<string | undefined>(undefined);

  const userOrders = orders.filter((o) => o.userId === currentUser.id);
  const activeOrdersCount = userOrders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY'].includes(o.status)
  ).length;

  const userTickets = supportTickets.filter((t) => t.userId === currentUser.id);
  const openTicketsCount = userTickets.filter((t) => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length;
  const userVehiclesCount = currentUser.vehicles?.length || 0;
  const userAddressesCount = currentUser.addresses?.length || 0;

  const handleOrderPlaced = (orderId: string) => {
    setJustPlacedOrderId(orderId);
    setPreselectedStationId(undefined);
    setActiveModuleTab('tracking');
  };

  const handleStationSelectForOrder = (stationId: string) => {
    setPreselectedStationId(stationId);
    setActiveModuleTab('order');
  };

  const handleLodgeTicketForOrder = (orderId: string) => {
    setTicketPreselectedOrderId(orderId);
    setActiveModuleTab('tickets');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Main Sub-Module Selector Bar for Customer / Fleet User */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full xl:w-auto pb-1 xl:pb-0 scrollbar-thin">
          {/* Sub-Module 1: Fuel Ordering */}
          <button
            id="user-submod-order"
            onClick={() => {
              setPreselectedStationId(undefined);
              setActiveModuleTab('order');
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeModuleTab === 'order'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Fuel className="w-4 h-4 text-emerald-400" />
            <span>1. Order Fuel</span>
          </button>

          {/* Sub-Module 2: Order Tracking */}
          <button
            id="user-submod-tracking"
            onClick={() => setActiveModuleTab('tracking')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer relative ${
              activeModuleTab === 'tracking'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Truck className="w-4 h-4 text-teal-400" />
            <span>2. Track Orders</span>
            {activeOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 animate-pulse">
                {activeOrdersCount}
              </span>
            )}
          </button>

          {/* Sub-Module 3: Vehicle Garage */}
          <button
            id="user-submod-garage"
            onClick={() => setActiveModuleTab('garage')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeModuleTab === 'garage'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Car className="w-4 h-4 text-indigo-400" />
            <span>3. Garage ({userVehiclesCount})</span>
          </button>

          {/* Sub-Module 4: Gas Stations Finder */}
          <button
            id="user-submod-stations"
            onClick={() => setActiveModuleTab('stations')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeModuleTab === 'stations'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>4. Gas Stations</span>
          </button>

          {/* Sub-Module 5: Delivery Locations */}
          <button
            id="user-submod-addresses"
            onClick={() => setActiveModuleTab('addresses')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeModuleTab === 'addresses'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>5. Locations ({userAddressesCount})</span>
          </button>

          {/* Sub-Module 6: Grievances & Support */}
          <button
            id="user-submod-tickets"
            onClick={() => {
              setTicketPreselectedOrderId(undefined);
              setActiveModuleTab('tickets');
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer relative ${
              activeModuleTab === 'tickets'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-pink-400" />
            <span>6. Support & Grievance</span>
            {openTicketsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {openTicketsCount}
              </span>
            )}
          </button>

          {/* Sub-Module 7: Payment */}
          <button
            id="user-submod-payment"
            onClick={() => setActiveModuleTab('payment')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeModuleTab === 'payment'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>7. Payments</span>
          </button>

          {/* Sub-Module 8: Registration & Account Profile */}
          <button
            id="user-submod-account"
            onClick={() => setActiveModuleTab('account')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeModuleTab === 'account'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>8. Profile</span>
          </button>
        </div>

        {/* Quick User Identity Badge */}
        <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-300 font-medium">{currentUser.name}</span>
          <span className="text-slate-500 font-mono text-[11px]">
            [{currentUser.userType === 'FLEET_OPERATOR' ? 'Fleet' : 'Individual'}]
          </span>
        </div>
      </div>

      {/* Render Active Separate Sub-Module */}
      <div>
        {activeModuleTab === 'order' && (
          <FuelOrderModule
            onOrderPlaced={handleOrderPlaced}
            preselectedStationId={preselectedStationId}
          />
        )}

        {activeModuleTab === 'tracking' && (
          <OrderTrackingModule
            justPlacedOrderId={justPlacedOrderId}
            onNavigateToOrder={() => {
              setPreselectedStationId(undefined);
              setActiveModuleTab('order');
            }}
            onLodgeSupportTicket={handleLodgeTicketForOrder}
          />
        )}

        {activeModuleTab === 'garage' && <VehicleGarageModule />}

        {activeModuleTab === 'stations' && (
          <GasStationsModule onSelectStationForOrder={handleStationSelectForOrder} />
        )}

        {activeModuleTab === 'addresses' && <AddressManagerModule />}

        {activeModuleTab === 'tickets' && (
          <SupportTicketsModule initialOrderId={ticketPreselectedOrderId} />
        )}

        {activeModuleTab === 'payment' && <PaymentModule />}

        {activeModuleTab === 'account' && <AccountModule />}
      </div>
    </div>
  );
};

