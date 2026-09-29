export type Role = 'admin' | 'station' | 'user';

export type FuelTypeCode = 'PETROL' | 'DIESEL' | 'PREMIUM_PETROL' | 'BIO_DIESEL';

export type OrderStatus =
  | 'PLACED'
  | 'PAYMENT_SUCCESSFUL'
  | 'ORDER_CONFIRMED'
  | 'ACCEPTED_BY_STATION'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CHECKING_INVENTORY'
  | 'INSUFFICIENT_FUEL'
  | 'CANCELLED'
  | 'REFUND_INITIATED'
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING';

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUND_INITIATED'
  | 'REFUNDED';

export type PaymentMethod = 'CREDIT_CARD' | 'UPI' | 'NET_BANKING' | 'CASH_ON_DELIVERY' | 'FLEET_ACCOUNT';

export type StockStatus = 'NORMAL' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';

export type AdminTab =
  | 'dashboard'
  | 'datasets'
  | 'users'
  | 'stations'
  | 'fuel_management'
  | 'fuel_prices'
  | 'inventory'
  | 'orders'
  | 'payments'
  | 'reports'
  | 'reviews'
  | 'notifications'
  | 'audit_logs'
  | 'settings';

export type StationTab =
  | 'dashboard'
  | 'orders'
  | 'inventory'
  | 'inventory_history'
  | 'notifications'
  | 'profile'
  | 'delivery_map'
  | 'reviews';

export type UserTab =
  | 'dashboard'
  | 'order_fuel'
  | 'my_orders'
  | 'track_order'
  | 'stations'
  | 'addresses'
  | 'vehicles'
  | 'payments'
  | 'complaints'
  | 'notifications'
  | 'profile';

export type VehicleCategory =
  | 'CAR'
  | 'SUV'
  | 'BIKE'
  | 'TRUCK'
  | 'COMMERCIAL_TRUCK'
  | 'FLEET'
  | 'GENERATOR'
  | 'HEAVY_EQUIPMENT';

export interface Vehicle {
  id: string;
  category: VehicleCategory;
  makeModel: string;
  registrationNumber: string;
  fuelType?: FuelTypeCode;
  preferredFuelType?: FuelTypeCode;
  tankCapacityLitres?: number;
  isDefault?: boolean;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  orderId?: string;
  orderNumber?: string;
  category:
    | 'DELIVERY_DELAY'
    | 'FUEL_QUALITY_METER'
    | 'PAYMENT_BILLING'
    | 'DRIVER_BEHAVIOR'
    | 'SAFETY_SPILL'
    | 'OTHER';
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  userType: 'INDIVIDUAL' | 'FLEET_OPERATOR';
  companyName?: string;
  fleetSize?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  addresses: Address[];
  vehicles?: Vehicle[];
}

export interface Address {
  id: string;
  title: string; // e.g., "Home", "Office", "Main Depot", "Warehouse A"
  street: string;
  city: string;
  state: string;
  zipCode: string;
  landmark?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isDefault?: boolean;
  instructions?: string;
}

export interface FuelType {
  id: string;
  code: FuelTypeCode;
  name: string;
  description: string;
  octaneOrCetane?: string;
  density: string;
  minOrderQuantity?: number; // e.g. 5 Litres
  maxOrderQuantity?: number; // e.g. 5000 Litres
  isActive: boolean;
}

export interface FuelPrice {
  fuelTypeCode: FuelTypeCode;
  pricePerLitre: number;
  currency: string;
  taxRatePercent: number; // e.g. 18%
  deliveryFeeBase: number;
  deliveryFeePerKm: number;
  lastUpdated: string;
  updatedBy: string;
}

export interface StationInventory {
  fuelTypeCode: FuelTypeCode;
  availableLitres: number;
  capacityLitres: number;
  lowStockThreshold: number;
  criticalThreshold: number;
  lastRestocked: string;
}

export interface GasStation {
  id: string;
  codeName?: string; // e.g. "Station A", "Station B", "Station C", "Station D"
  name: string;
  managerName: string;
  contactNumber: string;
  email: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL';
  supportedFuels: FuelTypeCode[];
  inventory: Record<FuelTypeCode, StationInventory>;
  rating: number;
  totalRatingsCount: number;
  coverageRadiusKm: number;
  managerPhone?: string;
  operatingHours?: string;
}

export interface DeliveryDetails {
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  assignedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  estimatedMinutes?: number;
  currentLocation?: { lat: number; lng: number };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  userType: 'INDIVIDUAL' | 'FLEET_OPERATOR';
  gasStationId: string;
  gasStationName: string;
  gasStationAddress: string;
  fuelTypeCode: FuelTypeCode;
  fuelTypeName: string;
  quantityLitres: number;
  pricePerLitre: number;
  fuelCost: number;
  deliveryCharge: number;
  taxAmount: number;
  totalAmount: number;
  deliveryAddress: Address;
  deliveryInstructions?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId: string;
  cancellationReason?: string;
  cancelledBy?: 'USER' | 'GAS_STATION' | 'ADMIN' | 'SYSTEM';
  deliveryDetails: DeliveryDetails;
  vehicleDetails?: {
    makeModel: string;
    registrationNumber: string;
    category?: VehicleCategory | string;
    tankCapacityLitres?: number;
  };
  otpCode?: string;
  timeline?: {
    status: OrderStatus;
    title: string;
    description: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
  review?: {
    rating: number;
    comment: string;
    reviewedAt: string;
  };
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt: string;
  refundedAt?: string;
  refundReason?: string;
}

export interface NotificationItem {
  id: string;
  recipientRole: Role;
  recipientId?: string; // specific user or station id, or 'ALL'
  title: string;
  message: string;
  category: 'ORDER' | 'INVENTORY' | 'PRICE' | 'SYSTEM' | 'PAYMENT';
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface ReviewItem {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userName: string;
  gasStationId: string;
  gasStationName: string;
  fuelTypeName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ActivityFeedItem {
  id: string;
  title: string;
  description?: string;
  category: 'PRICE' | 'INVENTORY' | 'ORDER' | 'CANCEL' | 'STATION' | 'USER';
  timeAgo: string;
  timestamp: string;
}

export interface StationInventoryLog {
  id: string;
  stationId: string;
  stationName: string;
  fuelTypeCode: FuelTypeCode;
  fuelTypeName: string;
  actionType: 'RESTOCK' | 'DISPATCH' | 'ADJUSTMENT' | 'CALIBRATION' | 'INITIAL' | 'AUDIT';
  quantityLitres: number;
  previousAvailableLitres: number;
  newAvailableLitres: number;
  referenceNumber?: string;
  notes?: string;
  performedBy: string;
  timestamp: string;
}

export interface StationChangeRequest {
  id: string;
  stationId: string;
  stationName: string;
  managerName: string;
  contactNumber: string;
  requestedFields: {
    name?: string;
    managerName?: string;
    contactNumber?: string;
    email?: string;
    address?: string;
    city?: string;
    coverageRadiusKm?: number;
  };
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export type CsvDatasetType =
  | 'orders'
  | 'stations'
  | 'fuel_prices'
  | 'inventory'
  | 'users'
  | 'vehicles'
  | 'payments'
  | 'tickets';

export type CsvImportMode = 'replace' | 'append' | 'merge';

export interface CsvValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warnings: string[];
  errors: string[];
  detectedType: CsvDatasetType | 'unknown';
  headers: string[];
  mappedFields: Record<string, string>;
  parsedData: any[];
}

export interface CsvDatasetPreset {
  id: string;
  title: string;
  description: string;
  type: CsvDatasetType;
  recordCount: number;
  csvContent: string;
  tags: string[];
}



