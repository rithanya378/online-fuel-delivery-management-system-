import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  User,
  GasStation,
  FuelType,
  FuelPrice,
  FuelTypeCode,
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentRecord,
  PaymentMethod,
  NotificationItem,
  AuditLog,
  Address,
  AdminTab,
  StationTab,
  UserTab,
  ActivityFeedItem,
  Vehicle,
  SupportTicket,
  StationInventoryLog,
  StationChangeRequest,
  CsvDatasetType,
  CsvImportMode,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_GAS_STATIONS,
  INITIAL_FUEL_TYPES,
  INITIAL_FUEL_PRICES,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ACTIVITIES,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_STATION_INVENTORY_LOGS,
  INITIAL_STATION_CHANGE_REQUESTS,
} from '../data/mockData';

// Haversine distance calculator in KM
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

export interface PlaceOrderParams {
  userId?: string;
  fuelTypeCode: FuelTypeCode;
  quantityLitres: number;
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  deliveryInstructions?: string;
  vehicleDetails?: {
    makeModel: string;
    registrationNumber: string;
    category?: string;
    tankCapacityLitres?: number;
  };
  preferredStationId?: string;
  gasStationId?: string;
  scheduledDeliveryTime?: string;
}

interface StationAssignmentCandidate {
  station: GasStation;
  distanceKm: number;
  hasFuel: boolean;
  availableLitres: number;
  isEligible: boolean;
  reason?: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface AppContextType {
  // Authentication & Brand Landing
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  authScreen: 'landing' | 'login' | 'register';
  setAuthScreen: (screen: 'landing' | 'login' | 'register') => void;
  login: (email: string, password: string) => { success: boolean; message?: string; role?: Role };
  logout: () => void;
  quickLoginAs: (role: Role, specificId?: string) => void;

  // Navigation & Role
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  activeView: 'app' | 'specification';
  setActiveView: (view: 'app' | 'specification') => void;
  selectedStationId: string;
  setSelectedStationId: (id: string) => void;
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;

  // Sub-Navigation Tabs
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  stationTab: StationTab;
  setStationTab: (tab: StationTab) => void;
  userTab: UserTab;
  setUserTab: (tab: UserTab) => void;

  // Mobile & Sidebar state
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Toasts
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;

  // Data Collections
  users: User[];
  stations: GasStation[];
  fuelTypes: FuelType[];
  fuelPrices: Record<string, FuelPrice>;
  orders: Order[];
  payments: PaymentRecord[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  activities: ActivityFeedItem[];
  supportTickets: SupportTicket[];
  stationInventoryLogs: StationInventoryLog[];
  stationChangeRequests: StationChangeRequest[];

  // User details
  currentUser: User;
  currentStation: GasStation;

  // Station Selection Engine
  evaluateStationCandidates: (
    fuelType: FuelTypeCode,
    quantity: number,
    address: Address
  ) => StationAssignmentCandidate[];
  calculateOrderPricing: (
    fuelTypeCode: FuelTypeCode,
    quantityLitres: number,
    distanceKm: number
  ) => {
    pricePerLitre: number;
    fuelCost: number;
    deliveryFee: number;
    deliveryCharge: number;
    taxAmount: number;
    totalAmount: number;
  };

  // Actions
  placeOrder: (params: PlaceOrderParams) => Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }>;
  updateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    driverInfo?: { driverName: string; driverPhone: string; vehicleNumber: string }
  ) => void;
  advanceOrderStatusToNext: (orderId: string) => void;
  triggerInsufficientFuelFlow: (orderId: string, customReason?: string) => void;
  cancelOrder: (orderId: string, reason: string, cancelledBy: 'USER' | 'GAS_STATION' | 'ADMIN') => void;
  updateCentralFuelPrice: (
    fuelTypeCode: FuelTypeCode,
    newPrice: number,
    adminName: string,
    reason: string
  ) => void;
  updateStationInventory: (
    stationId: string,
    fuelTypeCode: FuelTypeCode,
    newQuantity: number,
    actionType: 'RESTOCK' | 'ADJUSTMENT' | 'AUDIT' | 'CALIBRATION',
    details?: {
      referenceNumber?: string;
      notes?: string;
      performedBy?: string;
      dipReadingCm?: number;
    }
  ) => void;
  submitStationChangeRequest: (
    stationId: string,
    requestedFields: StationChangeRequest['requestedFields'],
    reason: string
  ) => { success: boolean; requestId?: string; message: string };
  approveStationChangeRequest: (requestId: string, adminNotes?: string) => void;
  rejectStationChangeRequest: (requestId: string, adminNotes?: string) => void;
  addGasStation: (stationData: Omit<GasStation, 'id' | 'rating' | 'totalRatingsCount'>) => void;
  editGasStation: (stationId: string, updates: Partial<GasStation>) => void;
  deleteGasStation: (stationId: string) => void;
  approveStationRegistration: (stationId: string) => void;
  assignFuelTypesToStation: (stationId: string, fuelCodes: FuelTypeCode[]) => void;
  addFuelType: (fuelData: Omit<FuelType, 'id'>) => void;
  updateFuelType: (fuelCode: FuelTypeCode, updates: Partial<FuelType>) => void;
  deleteFuelType: (fuelCode: FuelTypeCode) => void;
  toggleStationStatus: (stationId: string) => void;
  toggleUserStatus: (userId: string) => void;
  addUserAddress: (userId: string, address: Omit<Address, 'id'>) => void;
  editUserAddress: (userId: string, address: Address) => void;
  deleteUserAddress: (userId: string, addressId: string) => void;
  setDefaultUserAddress: (userId: string, addressId: string) => void;
  addUserVehicle: (userId: string, vehicle: Omit<Vehicle, 'id'>) => void;
  editUserVehicle: (userId: string, vehicle: Vehicle) => void;
  deleteUserVehicle: (userId: string, vehicleId: string) => void;
  setDefaultUserVehicle: (userId: string, vehicleId: string) => void;
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>) => SupportTicket;
  updateSupportTicketStatus: (ticketId: string, status: SupportTicket['status'], resolutionNotes?: string) => void;
  updateUserProfile: (userId: string, updates: Partial<User>) => void;
  changeUserPassword: (userId: string, oldPass: string, newPass: string) => { success: boolean; message: string };
  resetUserPassword: (email: string) => { success: boolean; message: string };
  registerNewUser: (user: Omit<User, 'id' | 'createdAt'>) => { success: boolean; userId: string; message: string };
  submitOrderReview: (orderId: string, rating: number, comment: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToSampleData: () => void;
  importCsvOrders: (importedOrders: Order[], mode: CsvImportMode) => void;
  importCsvStations: (importedStations: GasStation[], mode: CsvImportMode) => void;
  importCsvPrices: (importedPrices: Record<string, FuelPrice>, mode: CsvImportMode) => void;
  importCsvUsers: (importedUsers: User[], mode: CsvImportMode) => void;
  importGenericCsvDataset: (type: CsvDatasetType, data: any[], mode: CsvImportMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'online_fuel_delivery_state_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & Brand Landing State (Starts on Logo/Landing page first)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authScreen, setAuthScreen] = useState<'landing' | 'login' | 'register'>('landing');

  const [currentRole, setCurrentRole] = useState<Role>('admin');
  const [activeView, setActiveView] = useState<'app' | 'specification'>('app');
  const [selectedStationId, setSelectedStationId] = useState<string>('station-1');
  const [selectedUserId, setSelectedUserId] = useState<string>('user-rahul');

  // Sub-Navigation Tabs
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [stationTab, setStationTab] = useState<StationTab>('dashboard');
  const [userTab, setUserTab] = useState<UserTab>('dashboard');

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Search
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Core Data
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [stations, setStations] = useState<GasStation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_stations`);
    return saved ? JSON.parse(saved) : INITIAL_GAS_STATIONS;
  });

  const [fuelTypes, setFuelTypes] = useState<FuelType[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_fueltypes`);
    return saved ? JSON.parse(saved) : INITIAL_FUEL_TYPES;
  });

  const [fuelPrices, setFuelPrices] = useState<Record<string, FuelPrice>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_prices`);
    return saved ? JSON.parse(saved) : INITIAL_FUEL_PRICES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [activities, setActivities] = useState<ActivityFeedItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_support_tickets`);
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
  });

  const [stationInventoryLogs, setStationInventoryLogs] = useState<StationInventoryLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_station_inv_logs`);
    return saved ? JSON.parse(saved) : INITIAL_STATION_INVENTORY_LOGS;
  });

  const [stationChangeRequests, setStationChangeRequests] = useState<StationChangeRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_station_change_reqs`);
    return saved ? JSON.parse(saved) : INITIAL_STATION_CHANGE_REQUESTS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_stations`, JSON.stringify(stations));
  }, [stations]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_fueltypes`, JSON.stringify(fuelTypes));
  }, [fuelTypes]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_prices`, JSON.stringify(fuelPrices));
  }, [fuelPrices]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
  }, [activities]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_support_tickets`, JSON.stringify(supportTickets));
  }, [supportTickets]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_station_inv_logs`, JSON.stringify(stationInventoryLogs));
  }, [stationInventoryLogs]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_station_change_reqs`, JSON.stringify(stationChangeRequests));
  }, [stationChangeRequests]);

  // Derived current active entities
  const currentUser = users.find((u) => u.id === selectedUserId) || users[0];
  const currentStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  // Evaluate candidate gas stations
  const evaluateStationCandidates = (
    fuelType: FuelTypeCode,
    quantity: number,
    address: Address
  ): StationAssignmentCandidate[] => {
    return stations
      .map((st) => {
        const distance = calculateDistanceKm(
          st.coordinates.lat,
          st.coordinates.lng,
          address.coordinates.lat,
          address.coordinates.lng
        );
        const inv = st.inventory[fuelType];
        const available = inv ? inv.availableLitres : 0;
        const supportsFuel = st.supportedFuels.includes(fuelType);
        const isActive = st.status === 'ACTIVE';
        const hasEnoughFuel = available >= quantity;
        const withinRadius = distance <= st.coverageRadiusKm;

        let isEligible = true;
        let reason = 'Ready for dispatch';

        if (!isActive) {
          isEligible = false;
          reason = 'Station temporarily inactive/closed';
        } else if (!supportsFuel) {
          isEligible = false;
          reason = `Does not stock ${fuelType}`;
        } else if (!hasEnoughFuel) {
          isEligible = false;
          reason = `Insufficient inventory (${available}L available, ${quantity}L requested)`;
        } else if (!withinRadius) {
          isEligible = false;
          reason = `Outside delivery radius (${distance}km > ${st.coverageRadiusKm}km coverage)`;
        }

        return {
          station: st,
          distanceKm: distance,
          hasFuel: supportsFuel && hasEnoughFuel,
          availableLitres: available,
          isEligible,
          reason,
        };
      })
      .sort((a, b) => {
        if (a.isEligible && !b.isEligible) return -1;
        if (!a.isEligible && b.isEligible) return 1;
        return a.distanceKm - b.distanceKm;
      });
  };

  // Calculate Order Pricing
  const calculateOrderPricing = (
    fuelTypeCode: FuelTypeCode,
    quantityLitres: number,
    distanceKm: number
  ) => {
    const priceConfig = fuelPrices[fuelTypeCode] || INITIAL_FUEL_PRICES.PETROL;
    const pricePerLitre = priceConfig.pricePerLitre;
    const fuelCost = Math.round(pricePerLitre * quantityLitres * 100) / 100;
    const deliveryFee =
      Math.round((priceConfig.deliveryFeeBase + distanceKm * priceConfig.deliveryFeePerKm) * 100) / 100;
    const taxAmount = Math.round(fuelCost * (priceConfig.taxRatePercent / 100) * 100) / 100;
    const totalAmount = Math.round((fuelCost + deliveryFee + taxAmount) * 100) / 100;
    return {
      pricePerLitre,
      fuelCost,
      deliveryFee,
      deliveryCharge: deliveryFee,
      taxAmount,
      totalAmount,
    };
  };

  // Place Order Action
  const placeOrder = async (
    params: PlaceOrderParams
  ): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> => {
    const targetUserId = params.userId || currentUser.id;
    const user = users.find((u) => u.id === targetUserId) || currentUser;
    if (!user) return { success: false, error: 'User account not found' };

    const candidates = evaluateStationCandidates(params.fuelTypeCode, params.quantityLitres, params.deliveryAddress);
    
    // Check if user selected preferred station
    let assignedStation: GasStation | null = null;
    let selectedCandidate: StationAssignmentCandidate | null = null;

    const preferredId = params.preferredStationId || params.gasStationId;
    if (preferredId && preferredId !== 'AUTO') {
      const prefCand = candidates.find((c) => c.station.id === preferredId && c.isEligible);
      if (prefCand) {
        assignedStation = prefCand.station;
        selectedCandidate = prefCand;
      }
    }

    if (!assignedStation) {
      selectedCandidate = candidates.find((c) => c.isEligible) || null;
      if (selectedCandidate) {
        assignedStation = selectedCandidate.station;
      }
    }

    if (!assignedStation || !selectedCandidate) {
      const topIneligible = candidates[0];
      const errorMsg = topIneligible
        ? `No eligible gas station: ${topIneligible.reason}`
        : 'No gas stations within delivery radius';
      addToast({ type: 'error', title: 'Order Placement Failed', message: errorMsg });
      return { success: false, error: errorMsg };
    }

    const priceConfig = fuelPrices[params.fuelTypeCode] || INITIAL_FUEL_PRICES.PETROL;
    const pricePerLitre = priceConfig.pricePerLitre;
    const fuelCost = Math.round(pricePerLitre * params.quantityLitres * 100) / 100;
    const deliveryCharge =
      Math.round((priceConfig.deliveryFeeBase + selectedCandidate.distanceKm * priceConfig.deliveryFeePerKm) * 100) / 100;
    const taxAmount = Math.round(fuelCost * (priceConfig.taxRatePercent / 100) * 100) / 100;
    const totalAmount = Math.round((fuelCost + deliveryCharge + taxAmount) * 100) / 100;

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const transactionId = `TXN-${params.paymentMethod}-${Math.floor(10000 + Math.random() * 90000)}-PAID`;
    const fuelName = fuelTypes.find((f) => f.code === params.fuelTypeCode)?.name || params.fuelTypeCode;
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      userEmail: user.email,
      userType: user.userType,
      gasStationId: assignedStation.id,
      gasStationName: assignedStation.name,
      gasStationAddress: assignedStation.address,
      fuelTypeCode: params.fuelTypeCode,
      fuelTypeName: fuelName,
      quantityLitres: params.quantityLitres,
      pricePerLitre,
      fuelCost,
      deliveryCharge,
      taxAmount,
      totalAmount,
      deliveryAddress: params.deliveryAddress,
      vehicleDetails: params.vehicleDetails,
      otpCode,
      status: 'CONFIRMED',
      paymentStatus: 'SUCCESSFUL',
      paymentMethod: params.paymentMethod,
      transactionId,
      deliveryDetails: {
        driverName: 'Suresh Verma',
        driverPhone: '+91 98444 11223',
        vehicleNumber: 'DL-01-BW-4091',
        assignedAt: new Date().toISOString(),
        estimatedMinutes: Math.max(15, Math.round(selectedCandidate.distanceKm * 3 + 10)),
        currentLocation: {
          lat: assignedStation.coordinates.lat,
          lng: assignedStation.coordinates.lng,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deduct stock from station
    setStations((prev) =>
      prev.map((st) => {
        if (st.id === assignedStation.id) {
          const currentInv = st.inventory[params.fuelTypeCode];
          if (currentInv) {
            return {
              ...st,
              inventory: {
                ...st.inventory,
                [params.fuelTypeCode]: {
                  ...currentInv,
                  availableLitres: Math.max(0, currentInv.availableLitres - params.quantityLitres),
                },
              },
            };
          }
        }
        return st;
      })
    );

    // Add Order & Payment
    setOrders((prev) => [newOrder, ...prev]);

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      transactionId,
      orderId,
      orderNumber,
      userId: user.id,
      userName: user.name,
      amount: totalAmount,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'SUCCESSFUL',
      paidAt: new Date().toISOString(),
    };
    setPayments((prev) => [newPayment, ...prev]);

    // Notifications
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'user',
      recipientId: user.id,
      title: `✓ Order ${orderNumber} confirmed`,
      message: `Your order for ${params.quantityLitres}L of ${fuelName} was accepted by ${assignedStation.name}.`,
      category: 'ORDER',
      orderId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Activity feed
    const newAct: ActivityFeedItem = {
      id: `act-${Date.now()}`,
      title: `New order ${orderNumber} received`,
      description: `${user.name} ordered ${params.quantityLitres}L ${fuelName} from ${assignedStation.codeName || assignedStation.name}`,
      category: 'ORDER',
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newAct, ...prev]);

    addToast({
      type: 'success',
      title: 'Order Placed Successfully!',
      message: `${orderNumber} assigned to ${assignedStation.codeName || assignedStation.name}. Total: ₹${totalAmount.toFixed(2)}`,
    });

    return { success: true, orderId, orderNumber };
  };

  // Update Order Status
  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    driverInfo?: { driverName: string; driverPhone: string; vehicleNumber: string }
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedDetails = { ...o.deliveryDetails };
          if (driverInfo) {
            updatedDetails.driverName = driverInfo.driverName;
            updatedDetails.driverPhone = driverInfo.driverPhone;
            updatedDetails.vehicleNumber = driverInfo.vehicleNumber;
          }
          if (newStatus === 'OUT_FOR_DELIVERY') {
            updatedDetails.dispatchedAt = new Date().toISOString();
          }
          if (newStatus === 'DELIVERED') {
            updatedDetails.deliveredAt = new Date().toISOString();
          }
          return {
            ...o,
            status: newStatus,
            deliveryDetails: updatedDetails,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );

    addToast({
      type: 'info',
      title: 'Order Status Updated',
      message: `Order transitioned to ${newStatus.replace(/_/g, ' ')}`,
    });
  };

  // Advance Order to next status in pipeline
  const advanceOrderStatusToNext = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    let nextStatus: OrderStatus = order.status;
    let driverInfo: { driverName: string; driverPhone: string; vehicleNumber: string } | undefined = undefined;

    switch (order.status) {
      case 'PLACED':
      case 'PENDING':
        nextStatus = 'PAYMENT_SUCCESSFUL';
        break;
      case 'PAYMENT_SUCCESSFUL':
        nextStatus = 'ORDER_CONFIRMED';
        break;
      case 'ORDER_CONFIRMED':
      case 'CONFIRMED':
        nextStatus = 'ACCEPTED_BY_STATION';
        break;
      case 'ACCEPTED_BY_STATION':
        nextStatus = 'PREPARING';
        break;
      case 'PREPARING':
      case 'PROCESSING':
        nextStatus = 'OUT_FOR_DELIVERY';
        driverInfo = {
          driverName: order.deliveryDetails?.driverName || 'Suresh Verma',
          driverPhone: order.deliveryDetails?.driverPhone || '+91 98444 11223',
          vehicleNumber: order.deliveryDetails?.vehicleNumber || 'DL-01-BW-4091 (Hazard Bowser)',
        };
        break;
      case 'OUT_FOR_DELIVERY':
        nextStatus = 'DELIVERED';
        break;
      default:
        break;
    }

    if (nextStatus !== order.status) {
      updateOrderStatus(orderId, nextStatus, driverInfo);
    }
  };

  // Trigger Insufficient Fuel Exception Flow:
  // PLACED -> STATION CHECKS INVENTORY -> INSUFFICIENT FUEL -> ORDER CANCELLED -> REFUND INITIATED
  const triggerInsufficientFuelFlow = (orderId: string, customReason?: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const reason =
      customReason ||
      `Station inventory check failed: Inadequate ${order.fuelTypeName} stock at depot (${order.gasStationName}). Order auto-cancelled & full refund initiated.`;

    // Return inventory to station if any was deducted
    setStations((prev) =>
      prev.map((st) => {
        if (st.id === order.gasStationId) {
          const inv = st.inventory[order.fuelTypeCode];
          if (inv) {
            return {
              ...st,
              inventory: {
                ...st.inventory,
                [order.fuelTypeCode]: {
                  ...inv,
                  availableLitres: Math.min(inv.capacityLitres, inv.availableLitres + order.quantityLitres),
                },
              },
            };
          }
        }
        return st;
      })
    );

    // Update order status to REFUND_INITIATED
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'REFUND_INITIATED' as OrderStatus,
              paymentStatus: 'REFUND_INITIATED' as PaymentStatus,
              cancellationReason: reason,
              cancelledBy: 'GAS_STATION' as const,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    // Update payment record
    setPayments((prev) =>
      prev.map((p) =>
        p.orderId === orderId
          ? {
              ...p,
              paymentStatus: 'REFUND_INITIATED' as PaymentStatus,
              refundedAt: new Date().toISOString(),
              refundTransactionId: `REF-${Date.now()}`,
            }
          : p
      )
    );

    // Create Notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'user',
      recipientId: order.userId,
      title: `⚠️ Insufficient Fuel: Order ${order.orderNumber} Cancelled & Refunded`,
      message: `Station checked depot inventory: Insufficient ${order.fuelTypeName} available. 100% refund of ₹${order.totalAmount.toFixed(2)} has been initiated to your original payment method.`,
      category: 'ORDER',
      orderId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    // Create Activity
    const act: ActivityFeedItem = {
      id: `act-${Date.now()}`,
      title: `Insufficient Fuel: ${order.orderNumber} Cancelled & Refund Initiated`,
      description: `${order.gasStationName} reported insufficient ${order.fuelTypeName} for ${order.userName}. Total refund ₹${order.totalAmount.toFixed(2)} issued.`,
      category: 'STATION',
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [act, ...prev]);

    addToast({
      type: 'warning',
      title: 'Insufficient Fuel Exception Triggered',
      message: `Order ${order.orderNumber} cancelled by station. Full refund of ₹${order.totalAmount.toFixed(2)} initiated to customer.`,
    });
  };

  // Cancel Order
  const cancelOrder = (orderId: string, reason: string, cancelledBy: 'USER' | 'GAS_STATION' | 'ADMIN') => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Strict safety rule: User can only cancel BEFORE processing (PENDING or CONFIRMED)
    if (
      cancelledBy === 'USER' &&
      ['PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.status)
    ) {
      addToast({
        type: 'error',
        title: 'Cancellation Prohibited',
        message: 'Under Petroleum Safety Regulations, orders cannot be cancelled once fuel dispensing/processing has commenced or the bowser is dispatched.',
      });
      return;
    }

    // Return inventory to station
    setStations((prev) =>
      prev.map((st) => {
        if (st.id === order.gasStationId) {
          const inv = st.inventory[order.fuelTypeCode];
          if (inv) {
            return {
              ...st,
              inventory: {
                ...st.inventory,
                [order.fuelTypeCode]: {
                  ...inv,
                  availableLitres: Math.min(inv.capacityLitres, inv.availableLitres + order.quantityLitres),
                },
              },
            };
          }
        }
        return st;
      })
    );

    // Update order status
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'CANCELLED' as OrderStatus,
              paymentStatus: 'REFUNDED' as PaymentStatus,
              cancellationReason: reason,
              cancelledBy,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    // Update payment record to REFUNDED
    setPayments((prev) =>
      prev.map((p) =>
        p.orderId === orderId
          ? {
              ...p,
              paymentStatus: 'REFUNDED',
              refundedAt: new Date().toISOString(),
              refundReason: reason,
            }
          : p
      )
    );

    // Activity log
    const act: ActivityFeedItem = {
      id: `act-${Date.now()}`,
      title: `${cancelledBy === 'GAS_STATION' ? order.gasStationName : cancelledBy} cancelled order ${order.orderNumber}`,
      description: `Reason: ${reason}. ₹${order.totalAmount.toFixed(2)} refunded.`,
      category: 'CANCEL',
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [act, ...prev]);

    addToast({
      type: 'warning',
      title: `Order ${order.orderNumber} Cancelled`,
      message: `Inventory returned to tank. Full refund of ₹${order.totalAmount.toFixed(2)} issued.`,
    });
  };

  // Update Fuel Price (Admin Only)
  const updateCentralFuelPrice = (
    fuelTypeCode: FuelTypeCode,
    newPrice: number,
    adminName: string,
    reason: string
  ) => {
    setFuelPrices((prev) => {
      const existing = prev[fuelTypeCode] || INITIAL_FUEL_PRICES[fuelTypeCode];
      return {
        ...prev,
        [fuelTypeCode]: {
          ...existing,
          pricePerLitre: newPrice,
          lastUpdated: new Date().toISOString(),
          updatedBy: adminName,
        },
      };
    });

    const act: ActivityFeedItem = {
      id: `act-${Date.now()}`,
      title: `Admin changed ${fuelTypeCode} price across network`,
      description: `New rate: ₹${newPrice.toFixed(2)}/L (${reason})`,
      category: 'PRICE',
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [act, ...prev]);

    addToast({
      type: 'success',
      title: 'Central Price Updated',
      message: `${fuelTypeCode} updated to ₹${newPrice.toFixed(2)} / L across all stations.`,
    });
  };

  // Update Station Inventory
  const updateStationInventory = (
    stationId: string,
    fuelTypeCode: FuelTypeCode,
    newQuantity: number,
    actionType: 'RESTOCK' | 'ADJUSTMENT' | 'AUDIT' | 'CALIBRATION',
    details?: {
      referenceNumber?: string;
      notes?: string;
      performedBy?: string;
      dipReadingCm?: number;
    }
  ) => {
    const targetStation = stations.find((s) => s.id === stationId);
    const previousAvailable = targetStation?.inventory[fuelTypeCode]?.availableLitres || 0;

    setStations((prev) =>
      prev.map((st) => {
        if (st.id === stationId) {
          const inv = st.inventory[fuelTypeCode];
          if (inv) {
            return {
              ...st,
              inventory: {
                ...st.inventory,
                [fuelTypeCode]: {
                  ...inv,
                  availableLitres: Math.min(inv.capacityLitres, Math.max(0, newQuantity)),
                  lastRestocked: actionType === 'RESTOCK' ? new Date().toISOString() : inv.lastRestocked,
                },
              },
            };
          }
        }
        return st;
      })
    );

    // Record in Station Inventory Log
    const fuelMeta = fuelTypes.find((f) => f.code === fuelTypeCode);
    const invLog: StationInventoryLog = {
      id: `inv-log-${Date.now()}`,
      stationId,
      stationName: targetStation?.name || 'Station',
      fuelTypeCode,
      fuelTypeName: fuelMeta?.name || fuelTypeCode,
      actionType,
      quantityLitres: Math.abs(newQuantity - previousAvailable),
      previousAvailableLitres: previousAvailable,
      newAvailableLitres: newQuantity,
      referenceNumber: details?.referenceNumber || (actionType === 'RESTOCK' ? `TANKER-INVOICE-${Date.now().toString().slice(-4)}` : `DIP-TEST-${Date.now().toString().slice(-4)}`),
      notes: details?.notes || (actionType === 'RESTOCK' ? 'Underground tank discharge & refill.' : 'Inventory telemetry calibration.'),
      performedBy: details?.performedBy || targetStation?.managerName || 'Station Operator',
      timestamp: new Date().toISOString(),
    };
    setStationInventoryLogs((prev) => [invLog, ...prev]);

    // Send Station Notification if stock is low
    const targetInv = targetStation?.inventory[fuelTypeCode];
    if (targetInv && newQuantity <= targetInv.lowStockThreshold) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        recipientRole: 'station',
        recipientId: stationId,
        title: `⚠️ Low Stock Alert: ${fuelTypeCode}`,
        message: `${targetStation.name} ${fuelTypeCode} inventory is now ${newQuantity.toLocaleString()} L, below safe threshold of ${targetInv.lowStockThreshold} L.`,
        category: 'INVENTORY',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    const station = targetStation || stations.find((s) => s.id === stationId);
    const act: ActivityFeedItem = {
      id: `act-${Date.now()}`,
      title: `${station?.codeName || station?.name || 'Station'} updated ${fuelTypeCode} inventory`,
      description: `Storage adjusted to ${newQuantity.toLocaleString()} L (${actionType})`,
      category: 'INVENTORY',
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [act, ...prev]);

    addToast({
      type: 'success',
      title: 'Inventory Updated',
      message: `${fuelTypeCode} stock adjusted to ${newQuantity.toLocaleString()} L. Logged to inventory audit register.`,
    });
  };

  // Submit Station Change Request (Admin Approval Required)
  const submitStationChangeRequest = (
    stationId: string,
    requestedFields: StationChangeRequest['requestedFields'],
    reason: string
  ) => {
    const station = stations.find((s) => s.id === stationId);
    if (!station) return { success: false, message: 'Station not found.' };

    const newReq: StationChangeRequest = {
      id: `scr-${Date.now()}`,
      stationId,
      stationName: station.name,
      managerName: station.managerName,
      contactNumber: station.contactNumber,
      requestedFields,
      reason,
      status: 'PENDING',
      adminNotes: '',
      createdAt: new Date().toISOString(),
    };

    setStationChangeRequests((prev) => [newReq, ...prev]);

    // Notify Central Admin
    const adminNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'admin',
      recipientId: 'ALL',
      title: `Station Change Request: ${station.name}`,
      message: `${station.name} requested profile updates: ${reason}`,
      category: 'SYSTEM',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [adminNotif, ...prev]);

    addToast({
      type: 'info',
      title: 'Change Request Dispatched',
      message: 'Station detail change submitted for Central Refinery Admin approval.',
    });

    return { success: true, requestId: newReq.id, message: 'Request submitted to Central Admin.' };
  };

  const approveStationChangeRequest = (requestId: string, adminNotes?: string) => {
    const req = stationChangeRequests.find((r) => r.id === requestId);
    if (!req) return;

    // Apply updates to the Gas Station
    setStations((prev) =>
      prev.map((st) => {
        if (st.id === req.stationId) {
          return {
            ...st,
            ...req.requestedFields,
          };
        }
        return st;
      })
    );

    // Update request status
    setStationChangeRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED',
              adminNotes: adminNotes || 'Approved by Central Admin.',
              reviewedAt: new Date().toISOString(),
            }
          : r
      )
    );

    // Notify Station
    const stationNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'station',
      recipientId: req.stationId,
      title: '✅ Station Details Change Approved',
      message: `Admin approved your profile changes: ${req.reason}`,
      category: 'SYSTEM',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [stationNotif, ...prev]);

    addToast({
      type: 'success',
      title: 'Station Changes Approved',
      message: `Station details updated for ${req.stationName}.`,
    });
  };

  const rejectStationChangeRequest = (requestId: string, adminNotes?: string) => {
    const req = stationChangeRequests.find((r) => r.id === requestId);
    if (!req) return;

    setStationChangeRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED',
              adminNotes: adminNotes || 'Declined by Central Admin.',
              reviewedAt: new Date().toISOString(),
            }
          : r
      )
    );

    // Notify Station
    const stationNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'station',
      recipientId: req.stationId,
      title: '❌ Station Change Request Declined',
      message: `Admin declined changes. Reason: ${adminNotes || 'Does not meet refinery compliance.'}`,
      category: 'SYSTEM',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [stationNotif, ...prev]);

    addToast({
      type: 'warning',
      title: 'Change Request Declined',
      message: `Declined request for ${req.stationName}.`,
    });
  };

  // Add Gas Station
  const addGasStation = (stationData: Omit<GasStation, 'id' | 'rating' | 'totalRatingsCount'>) => {
    const id = `station-${Date.now()}`;
    const newStation: GasStation = {
      ...stationData,
      id,
      rating: 4.8,
      totalRatingsCount: 1,
    };
    setStations((prev) => [...prev, newStation]);

    const act: ActivityFeedItem = {
      id: `act-${Date.now()}`,
      title: `New gas station registered: ${newStation.name}`,
      description: `Onboarded at ${newStation.address}`,
      category: 'STATION',
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [act, ...prev]);

    addToast({
      type: 'success',
      title: 'Gas Station Added',
      message: `${newStation.name} has been enrolled into the delivery network.`,
    });
  };

  // Edit Gas Station
  const editGasStation = (stationId: string, updates: Partial<GasStation>) => {
    setStations((prev) =>
      prev.map((s) => (s.id === stationId ? { ...s, ...updates } : s))
    );

    const act: ActivityFeedItem = {
      id: `act-${Date.now()}`,
      title: `Gas station details modified: ${updates.name || stationId}`,
      description: `Updated operational parameters and contacts`,
      category: 'STATION',
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [act, ...prev]);

    addToast({
      type: 'success',
      title: 'Station Updated',
      message: 'Station details have been saved successfully.',
    });
  };

  // Delete Gas Station
  const deleteGasStation = (stationId: string) => {
    const stationToDelete = stations.find((s) => s.id === stationId);
    setStations((prev) => prev.filter((s) => s.id !== stationId));

    const act: ActivityFeedItem = {
      id: `act-${Date.now()}`,
      title: `Gas station removed: ${stationToDelete?.name || stationId}`,
      description: `Decommissioned depot from distribution grid`,
      category: 'STATION',
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [act, ...prev]);

    addToast({
      type: 'info',
      title: 'Station Removed',
      message: `${stationToDelete?.name || 'Station'} has been deleted from the network.`,
    });
  };

  // Approve Gas Station Registration
  const approveStationRegistration = (stationId: string) => {
    const station = stations.find((s) => s.id === stationId);
    if (!station) return;

    setStations((prev) =>
      prev.map((s) => (s.id === stationId ? { ...s, status: 'ACTIVE' } : s))
    );

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'station',
      recipientId: stationId,
      title: '🎉 Station Registration Approved!',
      message: `Your gas station "${station.name}" has been officially approved and activated by Central Command. You are now receiving fuel delivery dispatches!`,
      category: 'SYSTEM',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    const act: ActivityFeedItem = {
      id: `act-${Date.now()}`,
      title: `Gas Station Approved: ${station.name}`,
      description: `Authorized license and connected live bowser telemetry`,
      category: 'STATION',
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [act, ...prev]);

    addToast({
      type: 'success',
      title: 'Station Approved',
      message: `${station.name} is now ACTIVE on the platform network.`,
    });
  };

  // Assign Fuel Types to Station
  const assignFuelTypesToStation = (stationId: string, fuelCodes: FuelTypeCode[]) => {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id === stationId) {
          const updatedInventory = { ...s.inventory };
          // Ensure every assigned fuel has an inventory entry
          fuelCodes.forEach((code) => {
            if (!updatedInventory[code]) {
              updatedInventory[code] = {
                fuelTypeCode: code,
                availableLitres: 2000,
                capacityLitres: 5000,
                lowStockThreshold: 300,
                criticalThreshold: 100,
                lastRestocked: new Date().toISOString(),
              };
            }
          });
          return {
            ...s,
            supportedFuels: fuelCodes,
            inventory: updatedInventory,
          };
        }
        return s;
      })
    );

    addToast({
      type: 'success',
      title: 'Fuel Types Assigned',
      message: `Updated supported fuel types for station.`,
    });
  };

  // Add Fuel Type
  const addFuelType = (fuelData: Omit<FuelType, 'id'>) => {
    const id = `ft-${Date.now()}`;
    const newFuel: FuelType = {
      ...fuelData,
      id,
    };
    setFuelTypes((prev) => [...prev, newFuel]);

    // Also initialize a central price entry if not present
    if (!fuelPrices[newFuel.code]) {
      setFuelPrices((prev) => ({
        ...prev,
        [newFuel.code]: {
          fuelTypeCode: newFuel.code,
          pricePerLitre: 100.0,
          currency: '₹',
          taxRatePercent: 18,
          deliveryFeeBase: 50.0,
          deliveryFeePerKm: 5.0,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Admin (Central Command)',
        },
      }));
    }

    addToast({
      type: 'success',
      title: 'Fuel Type Added',
      message: `${newFuel.name} is now enabled for network ordering.`,
    });
  };

  // Update Fuel Type
  const updateFuelType = (fuelCode: FuelTypeCode, updates: Partial<FuelType>) => {
    setFuelTypes((prev) =>
      prev.map((f) => (f.code === fuelCode ? { ...f, ...updates } : f))
    );

    addToast({
      type: 'success',
      title: 'Fuel Parameters Updated',
      message: `Updated configuration parameters for ${fuelCode}.`,
    });
  };

  // Delete Fuel Type
  const deleteFuelType = (fuelCode: FuelTypeCode) => {
    setFuelTypes((prev) => prev.filter((f) => f.code !== fuelCode));
    addToast({
      type: 'info',
      title: 'Fuel Type Removed',
      message: `Deactivated ${fuelCode} from product catalog.`,
    });
  };

  const toggleStationStatus = (stationId: string) => {
    setStations((prev) =>
      prev.map((s) => (s.id === stationId ? { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : s))
    );
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u))
    );
  };

  // Address helpers
  const addUserAddress = (userId: string, addressData: Omit<Address, 'id'>) => {
    const newAddr: Address = {
      ...addressData,
      id: `addr-${Date.now()}`,
    };
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const isFirst = u.addresses.length === 0;
          return {
            ...u,
            addresses: [...u.addresses, { ...newAddr, isDefault: isFirst ? true : newAddr.isDefault }],
          };
        }
        return u;
      })
    );
    addToast({ type: 'success', title: 'Address Saved', message: `Saved "${newAddr.title}" to your address book.` });
  };

  const editUserAddress = (userId: string, address: Address) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            addresses: u.addresses.map((a) => (a.id === address.id ? address : a)),
          };
        }
        return u;
      })
    );
    addToast({ type: 'info', title: 'Address Updated', message: `Updated "${address.title}".` });
  };

  const deleteUserAddress = (userId: string, addressId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            addresses: u.addresses.filter((a) => a.id !== addressId),
          };
        }
        return u;
      })
    );
    addToast({ type: 'info', title: 'Address Removed', message: 'Address deleted from profile.' });
  };

  const setDefaultUserAddress = (userId: string, addressId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            addresses: u.addresses.map((a) => ({
              ...a,
              isDefault: a.id === addressId,
            })),
          };
        }
        return u;
      })
    );
    addToast({ type: 'success', title: 'Default Address Updated', message: 'Set as primary delivery location.' });
  };

  // Vehicle helpers
  const addUserVehicle = (userId: string, vehicleData: Omit<Vehicle, 'id'>) => {
    const newVeh: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
    };
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const vehicles = u.vehicles || [];
          const isFirst = vehicles.length === 0;
          return {
            ...u,
            vehicles: [...vehicles, { ...newVeh, isDefault: isFirst ? true : newVeh.isDefault }],
          };
        }
        return u;
      })
    );
    addToast({
      type: 'success',
      title: 'Vehicle Added',
      message: `Added ${newVeh.makeModel} (${newVeh.registrationNumber}) to your vehicle garage.`,
    });
  };

  const editUserVehicle = (userId: string, vehicle: Vehicle) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            vehicles: (u.vehicles || []).map((v) => (v.id === vehicle.id ? vehicle : v)),
          };
        }
        return u;
      })
    );
    addToast({ type: 'info', title: 'Vehicle Updated', message: `Updated details for ${vehicle.registrationNumber}.` });
  };

  const deleteUserVehicle = (userId: string, vehicleId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            vehicles: (u.vehicles || []).filter((v) => v.id !== vehicleId),
          };
        }
        return u;
      })
    );
    addToast({ type: 'info', title: 'Vehicle Removed', message: 'Vehicle deleted from your profile.' });
  };

  const setDefaultUserVehicle = (userId: string, vehicleId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            vehicles: (u.vehicles || []).map((v) => ({
              ...v,
              isDefault: v.id === vehicleId,
            })),
          };
        }
        return u;
      })
    );
    addToast({ type: 'success', title: 'Primary Vehicle Set', message: 'Selected vehicle set as default for refueling.' });
  };

  // Support Ticket / Complaint Helpers
  const createSupportTicket = (
    ticketData: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>
  ): SupportTicket => {
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `ticket-${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSupportTickets((prev) => [newTicket, ...prev]);

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'user',
      recipientId: ticketData.userId,
      title: `🎫 Complaint #${newTicket.ticketNumber} Logged`,
      message: `Your ticket regarding "${ticketData.subject}" has been received and assigned to our resolution desk.`,
      category: 'SYSTEM',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addToast({
      type: 'success',
      title: 'Complaint Logged Successfully',
      message: `Ticket #${newTicket.ticketNumber} registered. Our safety desk is on it.`,
    });
    return newTicket;
  };

  const updateSupportTicketStatus = (
    ticketId: string,
    status: SupportTicket['status'],
    resolutionNotes?: string
  ) => {
    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status,
              resolutionNotes: resolutionNotes || t.resolutionNotes,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    addToast({ type: 'info', title: 'Ticket Updated', message: `Ticket status set to ${status}.` });
  };

  const updateUserProfile = (userId: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
    addToast({ type: 'success', title: 'Profile Updated', message: 'Your personal details were saved.' });
  };

  const changeUserPassword = (userId: string, oldPass: string, newPass: string) => {
    if (!oldPass || !newPass) return { success: false, message: 'All password fields are required.' };
    return { success: true, message: 'Security password changed successfully.' };
  };

  const resetUserPassword = (email: string) => {
    return { success: true, message: `Password reset link sent to ${email}.` };
  };

  const registerNewUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const id = `user-${Date.now()}`;
    const newUser: User = {
      ...userData,
      id,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setSelectedUserId(id);
    addToast({ type: 'success', title: 'Registration Complete', message: `Welcome, ${newUser.name}!` });
    return { success: true, userId: id, message: 'User registered successfully' };
  };

  const submitOrderReview = (orderId: string, rating: number, comment: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              review: {
                rating,
                comment,
                reviewedAt: new Date().toISOString(),
              },
            }
          : o
      )
    );
    addToast({ type: 'success', title: 'Review Submitted', message: 'Thank you for your rating and feedback!' });
  };

  const login = (email: string, pass: string): { success: boolean; message?: string; role?: Role } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Please enter your email address.' };
    }
    if (!pass || pass.trim() === '') {
      return { success: false, message: 'Please enter your password.' };
    }

    // 1. Check Admin
    if (
      cleanEmail === 'admin@fuelflow.com' ||
      cleanEmail === 'admin@fuelflow-systems.internal' ||
      cleanEmail.includes('admin')
    ) {
      const adminUser = users.find((u) => u.role === 'admin') || users[0];
      setCurrentRole('admin');
      if (adminUser) setSelectedUserId(adminUser.id);
      setIsAuthenticated(true);
      setActiveView('app');
      setAdminTab('dashboard');
      addToast({
        type: 'success',
        title: 'Welcome, Administrator',
        message: 'Authenticated to Central Command & Logistics Suite.',
      });
      return { success: true, role: 'admin' };
    }

    // 2. Check Gas Station Manager
    const matchingStation = stations.find(
      (st) =>
        st.email.toLowerCase() === cleanEmail ||
        cleanEmail.includes(st.codeName?.toLowerCase().replace(/\s+/g, '') || 'nomatch')
    );
    if (matchingStation || cleanEmail.includes('station')) {
      const targetStation = matchingStation || stations[0];
      setCurrentRole('station');
      setSelectedStationId(targetStation.id);
      setIsAuthenticated(true);
      setActiveView('app');
      setStationTab('dashboard');
      addToast({
        type: 'success',
        title: `Welcome, ${targetStation.managerName}`,
        message: `Authenticated to ${targetStation.name} dispatch portal.`,
      });
      return { success: true, role: 'station' };
    }

    // 3. Check Customer / Fleet User
    const matchingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matchingUser) {
      setCurrentRole('user');
      setSelectedUserId(matchingUser.id);
      setIsAuthenticated(true);
      setActiveView('app');
      setUserTab('dashboard');
      addToast({
        type: 'success',
        title: `Welcome back, ${matchingUser.name}`,
        message: 'Authenticated to your Fuel Delivery & Fleet Portal.',
      });
      return { success: true, role: 'user' };
    }

    // Fallback: create an active session user
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: cleanEmail.split('@')[0].replace('.', ' ').replace(/^\w/, (c) => c.toUpperCase()),
      email: cleanEmail,
      phone: '+91 98990 12345',
      role: 'user',
      userType: cleanEmail.includes('fleet') || cleanEmail.includes('logistics') ? 'FLEET_OPERATOR' : 'INDIVIDUAL',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      addresses: [
        {
          id: `addr-${Date.now()}`,
          title: '🏠 Primary Location',
          street: '100 Energy Way, Sector 8',
          city: 'Metro City',
          state: 'DL',
          zipCode: '110001',
          coordinates: { lat: 28.6139, lng: 77.209 },
          isDefault: true,
        },
      ],
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentRole('user');
    setSelectedUserId(newUser.id);
    setIsAuthenticated(true);
    setActiveView('app');
    setUserTab('dashboard');
    addToast({
      type: 'success',
      title: `Account Ready: ${newUser.name}`,
      message: 'New session authenticated.',
    });
    return { success: true, role: 'user' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthScreen('landing');
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been securely signed out.',
    });
  };

  const quickLoginAs = (role: Role, specificId?: string) => {
    if (role === 'admin') {
      const adminUser = users.find((u) => u.role === 'admin') || users[0];
      setCurrentRole('admin');
      if (adminUser) setSelectedUserId(adminUser.id);
      setIsAuthenticated(true);
      setActiveView('app');
      setAdminTab('dashboard');
      addToast({
        type: 'success',
        title: 'Logged in as Admin',
        message: 'Full Central Command privileges enabled.',
      });
    } else if (role === 'station') {
      const stId = specificId || 'station-1';
      const st = stations.find((s) => s.id === stId) || stations[0];
      setCurrentRole('station');
      setSelectedStationId(st.id);
      setIsAuthenticated(true);
      setActiveView('app');
      setStationTab('dashboard');
      addToast({
        type: 'success',
        title: `Logged in as ${st.codeName || st.name}`,
        message: `Station manager ${st.managerName} session active.`,
      });
    } else {
      const uId = specificId || 'user-rahul';
      const u = users.find((usr) => usr.id === uId) || users[0];
      setCurrentRole('user');
      setSelectedUserId(u.id);
      setIsAuthenticated(true);
      setActiveView('app');
      setUserTab('dashboard');
      addToast({
        type: 'success',
        title: `Logged in as ${u.name}`,
        message: 'Customer fuel ordering workspace active.',
      });
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast({ type: 'info', title: 'Notifications Cleared', message: 'All notifications marked as read.' });
  };

  const resetToSampleData = () => {
    setUsers(INITIAL_USERS);
    setStations(INITIAL_GAS_STATIONS);
    setFuelTypes(INITIAL_FUEL_TYPES);
    setFuelPrices(INITIAL_FUEL_PRICES);
    setOrders(INITIAL_ORDERS);
    setPayments(INITIAL_PAYMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setActivities(INITIAL_ACTIVITIES);
    setSupportTickets(INITIAL_SUPPORT_TICKETS);
    setStationInventoryLogs(INITIAL_STATION_INVENTORY_LOGS);
    setStationChangeRequests(INITIAL_STATION_CHANGE_REQUESTS);
    setSelectedUserId('user-rahul');
    setSelectedStationId('station-1');
    localStorage.removeItem(`${STORAGE_KEY}_users`);
    localStorage.removeItem(`${STORAGE_KEY}_stations`);
    localStorage.removeItem(`${STORAGE_KEY}_fueltypes`);
    localStorage.removeItem(`${STORAGE_KEY}_prices`);
    localStorage.removeItem(`${STORAGE_KEY}_orders`);
    localStorage.removeItem(`${STORAGE_KEY}_payments`);
    localStorage.removeItem(`${STORAGE_KEY}_notifs`);
    localStorage.removeItem(`${STORAGE_KEY}_audit`);
    localStorage.removeItem(`${STORAGE_KEY}_activities`);
    localStorage.removeItem(`${STORAGE_KEY}_support_tickets`);
    localStorage.removeItem(`${STORAGE_KEY}_station_inv_logs`);
    localStorage.removeItem(`${STORAGE_KEY}_station_change_reqs`);
    addToast({ type: 'info', title: 'System Reset', message: 'State restored to realistic baseline sample data.' });
  };

  const importCsvOrders = (importedOrders: Order[], mode: CsvImportMode) => {
    if (!importedOrders || importedOrders.length === 0) return;
    setOrders((prev) => {
      let next: Order[];
      if (mode === 'replace') {
        next = importedOrders;
      } else {
        const existingIds = new Set(prev.map((o) => o.orderNumber));
        const newUnique = importedOrders.filter((o) => !existingIds.has(o.orderNumber));
        next = [...importedOrders, ...prev];
      }
      localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(next));
      return next;
    });
    addToast({
      type: 'success',
      title: 'CSV Orders Dataset Loaded',
      message: `Successfully ${mode === 'replace' ? 'replaced' : 'imported'} ${importedOrders.length} fuel delivery orders.`,
    });
  };

  const importCsvStations = (importedStations: GasStation[], mode: CsvImportMode) => {
    if (!importedStations || importedStations.length === 0) return;
    setStations((prev) => {
      let next: GasStation[];
      if (mode === 'replace') {
        next = importedStations;
      } else {
        const existingNames = new Set(prev.map((s) => s.name.toLowerCase()));
        const uniqueStations = importedStations.filter((s) => !existingNames.has(s.name.toLowerCase()));
        next = [...prev, ...uniqueStations];
      }
      localStorage.setItem(`${STORAGE_KEY}_stations`, JSON.stringify(next));
      return next;
    });
    addToast({
      type: 'success',
      title: 'CSV Stations Dataset Loaded',
      message: `Successfully loaded ${importedStations.length} gas stations into the routing network.`,
    });
  };

  const importCsvPrices = (importedPrices: Record<string, FuelPrice>, mode: CsvImportMode) => {
    if (!importedPrices || Object.keys(importedPrices).length === 0) return;
    setFuelPrices((prev) => {
      const next = mode === 'replace' ? { ...importedPrices } : { ...prev, ...importedPrices };
      localStorage.setItem(`${STORAGE_KEY}_prices`, JSON.stringify(next));
      return next;
    });
    addToast({
      type: 'success',
      title: 'Fuel Price Matrix Updated from CSV',
      message: `Updated pricing rates for ${Object.keys(importedPrices).length} fuel grades.`,
    });
  };

  const importCsvUsers = (importedUsers: User[], mode: CsvImportMode) => {
    if (!importedUsers || importedUsers.length === 0) return;
    setUsers((prev) => {
      let next: User[];
      if (mode === 'replace') {
        next = importedUsers;
      } else {
        const existingEmails = new Set(prev.map((u) => u.email.toLowerCase()));
        const uniqueUsers = importedUsers.filter((u) => !existingEmails.has(u.email.toLowerCase()));
        next = [...prev, ...uniqueUsers];
      }
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(next));
      return next;
    });
    addToast({
      type: 'success',
      title: 'CSV Users Dataset Loaded',
      message: `Imported ${importedUsers.length} customer and fleet operator accounts.`,
    });
  };

  const importGenericCsvDataset = (type: CsvDatasetType, data: any[], mode: CsvImportMode) => {
    if (type === 'orders') {
      importCsvOrders(data as Order[], mode);
    } else if (type === 'stations') {
      importCsvStations(data as GasStation[], mode);
    } else if (type === 'fuel_prices') {
      importCsvPrices(data.reduce((acc, p) => ({ ...acc, [p.fuelTypeCode]: p }), {}), mode);
    } else if (type === 'users') {
      importCsvUsers(data as User[], mode);
    } else {
      addToast({
        type: 'info',
        title: 'CSV Dataset Processed',
        message: `Parsed ${data.length} records of type: ${type}`,
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        authScreen,
        setAuthScreen,
        login,
        logout,
        quickLoginAs,
        currentRole,
        setCurrentRole,
        activeView,
        setActiveView,
        selectedStationId,
        setSelectedStationId,
        selectedUserId,
        setSelectedUserId,
        adminTab,
        setAdminTab,
        stationTab,
        setStationTab,
        userTab,
        setUserTab,
        isSidebarOpen,
        setIsSidebarOpen,
        searchQuery,
        setSearchQuery,
        toasts,
        addToast,
        removeToast,
        users,
        stations,
        fuelTypes,
        fuelPrices,
        orders,
        payments,
        notifications,
        auditLogs,
        activities,
        supportTickets,
        stationInventoryLogs,
        stationChangeRequests,
        currentUser,
        currentStation,
        evaluateStationCandidates,
        calculateOrderPricing,
        placeOrder,
        updateOrderStatus,
        advanceOrderStatusToNext,
        triggerInsufficientFuelFlow,
        cancelOrder,
        updateCentralFuelPrice,
        updateStationInventory,
        submitStationChangeRequest,
        approveStationChangeRequest,
        rejectStationChangeRequest,
        addGasStation,
        editGasStation,
        deleteGasStation,
        approveStationRegistration,
        assignFuelTypesToStation,
        addFuelType,
        updateFuelType,
        deleteFuelType,
        toggleStationStatus,
        toggleUserStatus,
        addUserAddress,
        editUserAddress,
        deleteUserAddress,
        setDefaultUserAddress,
        addUserVehicle,
        editUserVehicle,
        deleteUserVehicle,
        setDefaultUserVehicle,
        createSupportTicket,
        updateSupportTicketStatus,
        updateUserProfile,
        changeUserPassword,
        resetUserPassword,
        registerNewUser,
        submitOrderReview,
        markNotificationRead,
        markAllNotificationsRead,
        resetToSampleData,
        importCsvOrders,
        importCsvStations,
        importCsvPrices,
        importCsvUsers,
        importGenericCsvDataset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
