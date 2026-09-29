import {
  Order,
  GasStation,
  FuelPrice,
  FuelTypeCode,
  User,
  Vehicle,
  PaymentRecord,
  CsvDatasetType,
  CsvValidationResult,
  CsvDatasetPreset,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  VehicleCategory,
  Address,
} from '../types';

/**
 * Standard RFC 4180 compliant CSV Parser.
 * Handles quoted cells with commas, newlines, escaped double quotes ("").
 */
export function parseCsvText(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  if (!csvText || !csvText.trim()) {
    return { headers: [], rows: [] };
  }

  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip next escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = lines[0].map((h) => h.replace(/^["']|["']$/g, '').trim());
  const cleanHeaders = rawHeaders.filter((h) => h.length > 0);

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.length === 0 || (line.length === 1 && !line[0])) continue;
    const rowObj: Record<string, string> = {};
    cleanHeaders.forEach((header, index) => {
      rowObj[header] = line[index] !== undefined ? line[index].replace(/^["']|["']$/g, '').trim() : '';
    });
    rows.push(rowObj);
  }

  return { headers: cleanHeaders, rows };
}

/**
 * Robust CSV Serializer with RFC 4180 quoting.
 */
export function generateCsv<T>(
  data: T[],
  columns: { header: string; getValue: (item: T) => any }[]
): string {
  const headerRow = columns.map((col) => escapeCsvCell(col.header)).join(',');
  const rows = data.map((item) =>
    columns.map((col) => escapeCsvCell(col.getValue(item))).join(',')
  );
  return [headerRow, ...rows].join('\r\n');
}

function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Triggers client-side download of a CSV file.
 */
export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Normalizes header string for fuzzy matching (removes punctuation, lowercase, underscores).
 */
export function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Auto-detects the dataset type from CSV header names.
 */
export function detectDatasetType(headers: string[]): CsvDatasetType | 'unknown' {
  const normalized = headers.map(normalizeKey);

  // Orders
  if (
    normalized.some((h) => h.includes('ordernumber') || h.includes('orderid') || h.includes('order')) &&
    normalized.some((h) => h.includes('quantity') || h.includes('litres') || h.includes('liters') || h.includes('fueltype'))
  ) {
    return 'orders';
  }

  // Stations
  if (
    normalized.some((h) => h.includes('stationname') || h.includes('codename') || h.includes('gasstation')) ||
    (normalized.some((h) => h.includes('manager')) && normalized.some((h) => h.includes('coverage') || h.includes('radius')))
  ) {
    return 'stations';
  }

  // Fuel Prices
  if (
    normalized.some((h) => h.includes('fueltypecode') || h.includes('fuelcode')) &&
    normalized.some((h) => h.includes('priceperlitre') || h.includes('price'))
  ) {
    return 'fuel_prices';
  }

  // Inventory
  if (
    normalized.some((h) => h.includes('availablelitres') || h.includes('capacitylitres') || h.includes('lowstockthreshold'))
  ) {
    return 'inventory';
  }

  // Users
  if (
    normalized.some((h) => h.includes('user') || h.includes('customer') || h.includes('fleetoperator')) &&
    normalized.some((h) => h.includes('email') || h.includes('phone') || h.includes('companyname'))
  ) {
    return 'users';
  }

  // Vehicles
  if (
    normalized.some((h) => h.includes('registration') || h.includes('regnumber') || h.includes('makemodel') || h.includes('vehiclenumber'))
  ) {
    return 'vehicles';
  }

  // Payments
  if (
    normalized.some((h) => h.includes('transactionid') || h.includes('txnid')) &&
    normalized.some((h) => h.includes('amount') || h.includes('paymentmethod'))
  ) {
    return 'payments';
  }

  // Tickets
  if (
    normalized.some((h) => h.includes('ticketnumber') || h.includes('ticketid') || h.includes('category')) &&
    normalized.some((h) => h.includes('subject') || h.includes('resolution'))
  ) {
    return 'tickets';
  }

  return 'unknown';
}

/**
 * Finds the matching value from a row using fuzzy column aliases.
 */
export function getRowVal(row: Record<string, string>, ...possibleAliases: string[]): string {
  const normAliases = possibleAliases.map(normalizeKey);
  for (const [key, val] of Object.entries(row)) {
    const normKey = normalizeKey(key);
    if (normAliases.includes(normKey)) {
      return val;
    }
  }
  return '';
}

/**
 * Validates and converts raw CSV rows into Fuel Orders.
 */
export function parseOrdersDataset(
  rows: Record<string, string>[],
  existingStations: GasStation[],
  existingUsers: User[],
  fuelPrices: Record<string, FuelPrice>
): { valid: Order[]; errors: string[]; warnings: string[] } {
  const valid: Order[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const orderNumber =
      getRowVal(row, 'order_number', 'ordernumber', 'order_id', 'orderid', 'order_no', 'id') ||
      `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const userName = getRowVal(row, 'user_name', 'username', 'customer_name', 'customer', 'name', 'client') || 'Fleet Operator';
    const userPhone = getRowVal(row, 'user_phone', 'userphone', 'phone', 'mobile', 'contact') || '+91 98000 00000';
    const userEmail = getRowVal(row, 'user_email', 'useremail', 'email') || 'customer@fuelflow.com';
    const userTypeStr = getRowVal(row, 'user_type', 'usertype', 'type').toUpperCase();
    const userType: 'INDIVIDUAL' | 'FLEET_OPERATOR' = userTypeStr.includes('INDIVIDUAL') ? 'INDIVIDUAL' : 'FLEET_OPERATOR';

    const rawFuelCode = getRowVal(row, 'fuel_type_code', 'fueltypecode', 'fuel_type', 'fueltype', 'fuel').toUpperCase();
    let fuelTypeCode: FuelTypeCode = 'PETROL';
    if (rawFuelCode.includes('BIO')) fuelTypeCode = 'BIO_DIESEL';
    else if (rawFuelCode.includes('PREMIUM') || rawFuelCode.includes('SPEED')) fuelTypeCode = 'PREMIUM_PETROL';
    else if (rawFuelCode.includes('DIESEL')) fuelTypeCode = 'DIESEL';
    else fuelTypeCode = 'PETROL';

    const fuelTypeName =
      fuelTypeCode === 'PETROL'
        ? 'Unleaded Petrol (RON 91/95)'
        : fuelTypeCode === 'DIESEL'
        ? 'Ultra-Low Sulfur Diesel (BS-VI)'
        : fuelTypeCode === 'PREMIUM_PETROL'
        ? 'Speed Plus 98 Octane Petrol'
        : 'Eco-B20 Biodiesel Blend';

    const quantityLitres = parseFloat(getRowVal(row, 'quantity_litres', 'quantitylitres', 'quantity', 'litres', 'liters', 'qty')) || 50;

    const defaultPrice = fuelPrices[fuelTypeCode]?.pricePerLitre || 100;
    const pricePerLitre = parseFloat(getRowVal(row, 'price_per_litre', 'priceperlitre', 'price', 'rate')) || defaultPrice;

    const fuelCost = quantityLitres * pricePerLitre;
    const deliveryCharge = parseFloat(getRowVal(row, 'delivery_charge', 'deliverycharge', 'delivery_fee', 'shipping')) || 65;
    const taxAmount = (fuelCost + deliveryCharge) * 0.18;
    const totalAmount = parseFloat(getRowVal(row, 'total_amount', 'totalamount', 'total', 'amount')) || (fuelCost + deliveryCharge + taxAmount);

    const stationName = getRowVal(row, 'gas_station_name', 'gasstationname', 'station_name', 'station', 'hub') || (existingStations[0]?.name || 'Station A');
    const matchedStation = existingStations.find(
      (s) => s.name.toLowerCase().includes(stationName.toLowerCase()) || s.codeName?.toLowerCase() === stationName.toLowerCase()
    ) || existingStations[0];

    const gasStationId = matchedStation ? matchedStation.id : 'station-1';
    const gasStationName = matchedStation ? matchedStation.name : stationName;
    const gasStationAddress = matchedStation ? matchedStation.address : 'Central Hub, Metro City';

    const street = getRowVal(row, 'delivery_address', 'deliveryaddress', 'address', 'street', 'location') || 'Tech Boulevard Sector 12';
    const city = getRowVal(row, 'city', 'zone') || 'Metro City';
    const state = getRowVal(row, 'state') || 'DL';
    const zipCode = getRowVal(row, 'zip_code', 'zipcode', 'pincode', 'postal') || '110001';

    const deliveryAddress: Address = {
      id: `addr-csv-${rowNum}`,
      title: 'CSV Delivery Location',
      street,
      city,
      state,
      zipCode,
      coordinates: {
        lat: parseFloat(getRowVal(row, 'lat', 'latitude')) || 28.6139 + (Math.random() - 0.5) * 0.05,
        lng: parseFloat(getRowVal(row, 'lng', 'lon', 'longitude')) || 77.209 + (Math.random() - 0.5) * 0.05,
      },
    };

    const rawStatus = getRowVal(row, 'status', 'order_status', 'orderstatus').toUpperCase();
    let status: OrderStatus = 'CONFIRMED';
    if (rawStatus.includes('DELIVERED') || rawStatus.includes('COMPLETED')) status = 'DELIVERED';
    else if (rawStatus.includes('OUT') || rawStatus.includes('TRANSIT')) status = 'OUT_FOR_DELIVERY';
    else if (rawStatus.includes('PROCESSING') || rawStatus.includes('PREPARING') || rawStatus.includes('ACCEPT')) status = 'ACCEPTED_BY_STATION';
    else if (rawStatus.includes('CANCEL')) status = 'CANCELLED';
    else if (rawStatus.includes('PENDING')) status = 'PENDING';
    else status = 'ORDER_CONFIRMED';

    const rawPayStatus = getRowVal(row, 'payment_status', 'paymentstatus', 'pay_status').toUpperCase();
    let paymentStatus: PaymentStatus = 'SUCCESSFUL';
    if (rawPayStatus.includes('REFUND')) paymentStatus = 'REFUNDED';
    else if (rawPayStatus.includes('PENDING')) paymentStatus = 'PENDING';
    else if (rawPayStatus.includes('FAIL')) paymentStatus = 'FAILED';

    const rawPayMethod = getRowVal(row, 'payment_method', 'paymentmethod', 'method', 'payment_mode').toUpperCase();
    let paymentMethod: PaymentMethod = 'UPI';
    if (rawPayMethod.includes('CARD')) paymentMethod = 'CREDIT_CARD';
    else if (rawPayMethod.includes('FLEET') || rawPayMethod.includes('CORP')) paymentMethod = 'FLEET_ACCOUNT';
    else if (rawPayMethod.includes('CASH') || rawPayMethod.includes('COD')) paymentMethod = 'CASH_ON_DELIVERY';
    else if (rawPayMethod.includes('NET')) paymentMethod = 'NET_BANKING';

    const transactionId = getRowVal(row, 'transaction_id', 'transactionid', 'txnid', 'txn') || `TXN-CSV-${Date.now().toString(36).toUpperCase()}-${index}`;

    const regNum = getRowVal(row, 'vehicle_number', 'vehiclenumber', 'reg_number', 'registration', 'plate');
    const vehicleDetails = regNum
      ? {
          makeModel: getRowVal(row, 'make_model', 'vehicle_model', 'model') || 'Fleet Hauler',
          registrationNumber: regNum,
          category: getRowVal(row, 'vehicle_category', 'category') || 'TRUCK',
          tankCapacityLitres: parseFloat(getRowVal(row, 'tank_capacity', 'capacity')) || 250,
        }
      : undefined;

    const createdAt = getRowVal(row, 'created_at', 'createdat', 'date', 'order_date', 'timestamp') || new Date(Date.now() - index * 3600000 * 4).toISOString();

    const orderObj: Order = {
      id: `ord-csv-${rowNum}-${Date.now()}`,
      orderNumber,
      userId: existingUsers[0]?.id || 'user-rahul',
      userName,
      userPhone,
      userEmail,
      userType,
      gasStationId,
      gasStationName,
      gasStationAddress,
      fuelTypeCode,
      fuelTypeName,
      quantityLitres,
      pricePerLitre,
      fuelCost,
      deliveryCharge,
      taxAmount,
      totalAmount,
      deliveryAddress,
      status,
      paymentStatus,
      paymentMethod,
      transactionId,
      deliveryDetails: {
        driverName: getRowVal(row, 'driver_name', 'driver') || (status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED' ? 'Suresh Kumar' : undefined),
        driverPhone: getRowVal(row, 'driver_phone') || (status === 'OUT_FOR_DELIVERY' ? '+91 98765 00000' : undefined),
        vehicleNumber: getRowVal(row, 'delivery_truck', 'bowser') || (status === 'OUT_FOR_DELIVERY' ? 'DL-01-BW-4421' : undefined),
        estimatedMinutes: status === 'OUT_FOR_DELIVERY' ? 24 : undefined,
      },
      vehicleDetails,
      createdAt,
      updatedAt: new Date().toISOString(),
    };

    valid.push(orderObj);
  });

  return { valid, errors, warnings };
}

/**
 * Validates and converts raw CSV rows into Gas Stations.
 */
export function parseStationsDataset(rows: Record<string, string>[]): { valid: GasStation[]; errors: string[]; warnings: string[] } {
  const valid: GasStation[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const name = getRowVal(row, 'station_name', 'stationname', 'name', 'gas_station', 'hub_name');
    if (!name) {
      errors.push(`Row ${rowNum}: Station Name is required.`);
      return;
    }

    const codeName = getRowVal(row, 'code_name', 'codename', 'station_code', 'code') || `Station ${String.fromCharCode(65 + index)}`;
    const managerName = getRowVal(row, 'manager_name', 'managername', 'manager', 'contact_person') || 'Operations Lead';
    const contactNumber = getRowVal(row, 'contact_number', 'contactnumber', 'phone', 'mobile') || '+91 98000 12345';
    const email = getRowVal(row, 'email', 'station_email') || `station${codeName.toLowerCase().replace(/\s+/g, '')}@fuelflow.com`;
    const address = getRowVal(row, 'address', 'street', 'location') || 'Industrial Distribution Zone';
    const city = getRowVal(row, 'city', 'zone') || 'Metro City';
    const lat = parseFloat(getRowVal(row, 'lat', 'latitude')) || 28.6139 + (Math.random() - 0.5) * 0.1;
    const lng = parseFloat(getRowVal(row, 'lng', 'lon', 'longitude')) || 77.209 + (Math.random() - 0.5) * 0.1;
    const coverageRadiusKm = parseFloat(getRowVal(row, 'coverage_radius_km', 'coverageradiuskm', 'radius', 'coverage_km')) || 25;
    const rating = parseFloat(getRowVal(row, 'rating', 'stars')) || 4.7;

    const petrolLitres = parseFloat(getRowVal(row, 'petrol_available', 'petrollitres', 'petrol_litres', 'petrol')) || 3500;
    const dieselLitres = parseFloat(getRowVal(row, 'diesel_available', 'diesellitres', 'diesel_litres', 'diesel')) || 5200;
    const premiumPetrolLitres = parseFloat(getRowVal(row, 'premium_petrol_available', 'premiumpetrollitres', 'premium_petrol')) || 1800;
    const bioDieselLitres = parseFloat(getRowVal(row, 'bio_diesel_available', 'biodiesellitres', 'bio_diesel')) || 2400;

    const station: GasStation = {
      id: `station-csv-${Date.now()}-${index}`,
      codeName,
      name,
      managerName,
      contactNumber,
      email,
      address,
      city,
      coordinates: { lat, lng },
      status: 'ACTIVE',
      supportedFuels: ['PETROL', 'DIESEL', 'PREMIUM_PETROL', 'BIO_DIESEL'],
      coverageRadiusKm,
      rating,
      totalRatingsCount: Math.floor(50 + Math.random() * 200),
      inventory: {
        PETROL: {
          fuelTypeCode: 'PETROL',
          availableLitres: petrolLitres,
          capacityLitres: 5000,
          lowStockThreshold: 300,
          criticalThreshold: 100,
          lastRestocked: new Date().toISOString(),
        },
        DIESEL: {
          fuelTypeCode: 'DIESEL',
          availableLitres: dieselLitres,
          capacityLitres: 8000,
          lowStockThreshold: 500,
          criticalThreshold: 200,
          lastRestocked: new Date().toISOString(),
        },
        PREMIUM_PETROL: {
          fuelTypeCode: 'PREMIUM_PETROL',
          availableLitres: premiumPetrolLitres,
          capacityLitres: 3000,
          lowStockThreshold: 250,
          criticalThreshold: 80,
          lastRestocked: new Date().toISOString(),
        },
        BIO_DIESEL: {
          fuelTypeCode: 'BIO_DIESEL',
          availableLitres: bioDieselLitres,
          capacityLitres: 4000,
          lowStockThreshold: 300,
          criticalThreshold: 100,
          lastRestocked: new Date().toISOString(),
        },
      },
    };

    valid.push(station);
  });

  return { valid, errors, warnings };
}

/**
 * Validates and converts raw CSV rows into Fuel Prices.
 */
export function parseFuelPricesDataset(rows: Record<string, string>[]): { valid: Record<string, FuelPrice>; errors: string[]; warnings: string[] } {
  const valid: Record<string, FuelPrice> = {};
  const errors: string[] = [];
  const warnings: string[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const rawFuelCode = getRowVal(row, 'fuel_type_code', 'fueltypecode', 'fuel_code', 'code', 'fuel_type', 'fuel').toUpperCase();
    let fuelTypeCode: FuelTypeCode = 'PETROL';
    if (rawFuelCode.includes('BIO')) fuelTypeCode = 'BIO_DIESEL';
    else if (rawFuelCode.includes('PREMIUM') || rawFuelCode.includes('SPEED')) fuelTypeCode = 'PREMIUM_PETROL';
    else if (rawFuelCode.includes('DIESEL')) fuelTypeCode = 'DIESEL';
    else fuelTypeCode = 'PETROL';

    const pricePerLitre = parseFloat(getRowVal(row, 'price_per_litre', 'priceperlitre', 'price', 'rate', 'price_inr'));
    if (isNaN(pricePerLitre) || pricePerLitre <= 0) {
      errors.push(`Row ${rowNum}: Invalid price per litre for ${fuelTypeCode}`);
      return;
    }

    const currency = getRowVal(row, 'currency', 'symbol') || '₹';
    const taxRatePercent = parseFloat(getRowVal(row, 'tax_rate_percent', 'taxratepercent', 'tax_rate', 'tax', 'gst')) || 18;
    const deliveryFeeBase = parseFloat(getRowVal(row, 'delivery_fee_base', 'deliveryfeebase', 'base_fee', 'base_delivery')) || 50;
    const deliveryFeePerKm = parseFloat(getRowVal(row, 'delivery_fee_per_km', 'deliveryfeeperkm', 'km_rate', 'per_km_fee')) || 5;

    valid[fuelTypeCode] = {
      fuelTypeCode,
      pricePerLitre,
      currency,
      taxRatePercent,
      deliveryFeeBase,
      deliveryFeePerKm,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'CSV Matrix Import',
    };
  });

  return { valid, errors, warnings };
}

/**
 * Validates and converts raw CSV rows into Users / Fleet Accounts.
 */
export function parseUsersDataset(rows: Record<string, string>[]): { valid: User[]; errors: string[]; warnings: string[] } {
  const valid: User[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const name = getRowVal(row, 'name', 'user_name', 'customer_name', 'full_name');
    if (!name) {
      errors.push(`Row ${rowNum}: User Name is required.`);
      return;
    }

    const email = getRowVal(row, 'email', 'user_email', 'contact_email') || `user${index + 1}@fuelflow.com`;
    const phone = getRowVal(row, 'phone', 'mobile', 'contact_number') || '+91 98000 00000';
    const userTypeStr = getRowVal(row, 'user_type', 'usertype', 'type').toUpperCase();
    const userType: 'INDIVIDUAL' | 'FLEET_OPERATOR' = userTypeStr.includes('FLEET') ? 'FLEET_OPERATOR' : 'INDIVIDUAL';
    const companyName = getRowVal(row, 'company_name', 'company', 'organization') || (userType === 'FLEET_OPERATOR' ? `${name} Logistics` : undefined);
    const fleetSize = parseInt(getRowVal(row, 'fleet_size', 'fleetsize', 'vehicles_count')) || (userType === 'FLEET_OPERATOR' ? 12 : undefined);

    const street = getRowVal(row, 'address', 'street', 'location') || 'Tech Park Sector 18';
    const city = getRowVal(row, 'city', 'zone') || 'Metro City';
    const state = getRowVal(row, 'state') || 'DL';
    const zipCode = getRowVal(row, 'zip_code', 'zipcode', 'pincode') || '110001';

    const user: User = {
      id: `user-csv-${Date.now()}-${index}`,
      name,
      email,
      phone,
      role: 'user',
      userType,
      companyName,
      fleetSize,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      addresses: [
        {
          id: `addr-usr-${index}`,
          title: 'Primary Base',
          street,
          city,
          state,
          zipCode,
          coordinates: {
            lat: 28.6139 + (Math.random() - 0.5) * 0.08,
            lng: 77.209 + (Math.random() - 0.5) * 0.08,
          },
          isDefault: true,
        },
      ],
      vehicles: [],
    };

    valid.push(user);
  });

  return { valid, errors, warnings };
}

/**
 * Universal Dataset Validator that takes CSV text, detects schema, and parses items.
 */
export function validateCsvDataset(
  csvText: string,
  existingStations: GasStation[],
  existingUsers: User[],
  fuelPrices: Record<string, FuelPrice>,
  forceType?: CsvDatasetType
): CsvValidationResult {
  const { headers, rows } = parseCsvText(csvText);

  if (headers.length === 0 || rows.length === 0) {
    return {
      isValid: false,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      warnings: ['CSV file is empty or contains no data rows.'],
      errors: ['No valid rows detected.'],
      detectedType: 'unknown',
      headers: [],
      mappedFields: {},
      parsedData: [],
    };
  }

  const detectedType = forceType || detectDatasetType(headers);
  let parsedData: any[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  switch (detectedType) {
    case 'orders': {
      const result = parseOrdersDataset(rows, existingStations, existingUsers, fuelPrices);
      parsedData = result.valid;
      errors.push(...result.errors);
      warnings.push(...result.warnings);
      break;
    }
    case 'stations': {
      const result = parseStationsDataset(rows);
      parsedData = result.valid;
      errors.push(...result.errors);
      warnings.push(...result.warnings);
      break;
    }
    case 'fuel_prices': {
      const result = parseFuelPricesDataset(rows);
      parsedData = Object.values(result.valid);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
      break;
    }
    case 'users': {
      const result = parseUsersDataset(rows);
      parsedData = result.valid;
      errors.push(...result.errors);
      warnings.push(...result.warnings);
      break;
    }
    default: {
      // Generic fallback parser
      parsedData = rows;
      warnings.push(`Generic tabular dataset detected with ${headers.length} columns.`);
      break;
    }
  }

  return {
    isValid: parsedData.length > 0,
    totalRows: rows.length,
    validRows: parsedData.length,
    invalidRows: Math.max(0, rows.length - parsedData.length),
    warnings,
    errors,
    detectedType,
    headers,
    mappedFields: headers.reduce((acc, h) => ({ ...acc, [h]: normalizeKey(h) }), {}),
    parsedData,
  };
}

/**
 * Pre-built Real-World CSV Dataset Presets ready for 1-click loading and testing.
 */
export const PRELOADED_CSV_PRESETS: CsvDatasetPreset[] = [
  {
    id: 'preset-orders-50',
    title: '50-Record Metro Fuel Delivery Orders Dataset',
    description: 'Comprehensive dataset with multi-zone dispatch records, corporate fleets, domestic cars, express delivery statuses, and UPI/Fleet billing.',
    type: 'orders',
    recordCount: 50,
    tags: ['Real-World Deliveries', 'Multi-Status', 'Fleets & Vehicles'],
    csvContent: `order_number,customer_name,user_phone,user_email,user_type,station_name,fuel_type,quantity_litres,price_per_litre,delivery_charge,total_amount,delivery_address,city,lat,lng,status,payment_method,payment_status,vehicle_number,make_model,created_at
ORD-894210,Apex Global Logistics,9876543210,ops@apexlogistics.com,FLEET_OPERATOR,Station A (Metro Energy Hub),DIESEL,850,94.00,120.00,94420.80,Depot Bay 4 North Industrial Corridor,Metro City,28.6250,77.2150,DELIVERED,FLEET_ACCOUNT,SUCCESSFUL,DL-01-AA-9988,BharatBenz 2823C Tipper,2026-08-27T08:15:00Z
ORD-894211,Rahul Sharma,9823456780,rahul.sharma@example.com,INDIVIDUAL,Station A (Metro Energy Hub),PETROL,35,105.00,55.00,4397.90,Flat 402 Palm Grove Enclave Sector 14,Metro City,28.6180,77.2050,DELIVERED,UPI,SUCCESSFUL,DL-04-CA-1234,Hyundai Creta 1.5L Turbo,2026-08-27T09:30:00Z
ORD-894212,TransContinental Cold Chain,9811223344,transport@transcold.in,FLEET_OPERATOR,Station B (Greenway Eco-Energy),BIO_DIESEL,1200,98.00,150.00,138945.00,Cold Hub Gate 2 Warehouse Zone A,Metro City,28.6420,77.1980,OUT_FOR_DELIVERY,FLEET_ACCOUNT,SUCCESSFUL,HR-55-XY-7711,Tata Prima 4028.S Container,2026-08-27T10:00:00Z
ORD-894213,Priya Patel,9899001122,priya.patel@designstudio.org,INDIVIDUAL,Station C (Express Highway Bowser Base),PREMIUM_PETROL,45,115.00,60.00,6177.30,Villa 18 Silverwood Estates Ring Road,Metro City,28.6010,77.2280,OUT_FOR_DELIVERY,CREDIT_CARD,SUCCESSFUL,DL-02-BM-8899,BMW 330i M Sport,2026-08-27T10:45:00Z
ORD-894214,Metro Concrete Readymix,9877665544,plant@metroconcrete.com,FLEET_OPERATOR,Station D (Aerocity Logistics Core),DIESEL,2400,94.00,200.00,266444.00,Batching Plant Site 9 Ring Bypass,Metro City,28.5850,77.2400,ACCEPTED_BY_STATION,FLEET_ACCOUNT,SUCCESSFUL,DL-01-MX-5544,Volvo FMX Concrete Mixer,2026-08-27T11:15:00Z
ORD-894215,Amit Verma,9812345678,amit.verma@techsolutions.com,INDIVIDUAL,Station A (Metro Energy Hub),PETROL,28,105.00,50.00,3528.20,B-104 Cyber Greens Residency,Metro City,28.6210,77.2110,ORDER_CONFIRMED,UPI,SUCCESSFUL,DL-08-AB-4321,Honda City i-VTEC,2026-08-27T11:45:00Z
ORD-894216,Evergreen Urban Transit,9833445566,fleet@urbantransit.org,FLEET_OPERATOR,Station B (Greenway Eco-Energy),BIO_DIESEL,1500,98.00,180.00,173667.00,Central Bus Terminal Platform 12,Metro City,28.6350,77.2020,ACCEPTED_BY_STATION,FLEET_ACCOUNT,SUCCESSFUL,DL-11-EB-1002,Ashok Leyland Electric-Diesel Bus,2026-08-27T12:00:00Z
ORD-894217,Dr. Sunita Rao,9844556677,sunita.rao@medcenter.org,INDIVIDUAL,Station C (Express Highway Bowser Base),PETROL,40,105.00,55.00,5020.90,Staff Quarters 14 City Hospital Road,Metro City,28.6080,77.2190,DELIVERED,CREDIT_CARD,SUCCESSFUL,DL-03-CD-8765,Toyota Fortuner Legender,2026-08-27T12:30:00Z
ORD-894218,Zenith Cloud Data Center,9855667788,infra@zenithdc.com,FLEET_OPERATOR,Station A (Metro Energy Hub),DIESEL,3000,94.00,250.00,333055.00,Data Park Substation Backup Vault 1,Metro City,28.6290,77.2080,DELIVERED,NET_BANKING,SUCCESSFUL,DG-SET-3000KVA,Caterpillar 3516B Diesel Generator,2026-08-27T13:00:00Z
ORD-894219,Kavita Nair,9866778899,kavita.nair@adcorp.in,INDIVIDUAL,Station D (Aerocity Logistics Core),PREMIUM_PETROL,50,115.00,65.00,6861.70,Skyline Penthouse 12 Sector 22,Metro City,28.5920,77.2350,ACCEPTED_BY_STATION,UPI,SUCCESSFUL,HR-26-ZZ-9900,Mercedes-Benz E-Class 300d,2026-08-27T13:30:00Z
ORD-894220,QuickSpur Courier Services,9877889900,dispatch@quickspur.com,FLEET_OPERATOR,Station C (Express Highway Bowser Base),DIESEL,600,94.00,100.00,66670.00,Sorting Center Dock 8 Ring Road,Metro City,28.6140,77.2250,OUT_FOR_DELIVERY,FLEET_ACCOUNT,SUCCESSFUL,DL-01-FD-3322,Mahindra Bolero Maxi Truck,2026-08-27T14:00:00Z
ORD-894221,Vikram Mehra,9888990011,vikram.mehra@lawpartners.com,INDIVIDUAL,Station A (Metro Energy Hub),PETROL,30,105.00,50.00,3776.00,74 Supreme Court Enclave,Metro City,28.6190,77.2140,ORDER_CONFIRMED,CREDIT_CARD,SUCCESSFUL,DL-07-AA-1122,Audi A4 Technology,2026-08-27T14:30:00Z
ORD-894222,AeroLink Aviation Ground Services,9899001133,groundops@aerolink.aero,FLEET_OPERATOR,Station D (Aerocity Logistics Core),DIESEL,1800,94.00,180.00,199892.00,Terminal 3 Cargo Airside Staging Area,Metro City,28.5800,77.2420,DELIVERED,FLEET_ACCOUNT,SUCCESSFUL,DL-01-AIR-09,Tug & Pushback Tractor Ground Unit,2026-08-27T15:00:00Z
ORD-894223,Neha Gupta,9811223355,neha.gupta@fintech.io,INDIVIDUAL,Station B (Greenway Eco-Energy),PETROL,20,105.00,50.00,2537.00,Apartment 303 Silicon Heights,Metro City,28.6380,77.1950,DELIVERED,UPI,SUCCESSFUL,DL-09-PQ-5544,Kia Seltos GT Line,2026-08-27T15:30:00Z
ORD-894224,Horizon Smart Infra Heavy Cranes,9822334466,infra@horizoncranes.in,FLEET_OPERATOR,Station A (Metro Energy Hub),DIESEL,2100,94.00,220.00,233191.60,Flyover Pier 84 Construction Yard,Metro City,28.6220,77.2180,DELIVERED,FLEET_ACCOUNT,SUCCESSFUL,HR-55-CR-9911,Sany SAC2500 All-Terrain Crane,2026-08-27T16:00:00Z
ORD-894225,Siddharth Joshi,9833445577,siddharth.j@consulting.com,INDIVIDUAL,Station C (Express Highway Bowser Base),PETROL,38,105.00,55.00,4773.10,House 12 Sector 15 Greens,Metro City,28.6050,77.2220,DELIVERED,UPI,SUCCESSFUL,DL-05-MN-2233,Volkswagen Virtus GT,2026-08-27T16:30:00Z
ORD-894226,Greenline Courier Vans,9844556688,ops@greenlinevans.com,FLEET_OPERATOR,Station B (Greenway Eco-Energy),BIO_DIESEL,900,98.00,120.00,104217.60,Logistics Hub 5 Outer Corridor,Metro City,28.6450,77.2000,DELIVERED,FLEET_ACCOUNT,SUCCESSFUL,DL-01-EV-4433,Tata Ace Gold Delivery Van,2026-08-27T17:00:00Z
ORD-894227,Ananya Sen,9855667799,ananya.sen@senmedia.tv,INDIVIDUAL,Station D (Aerocity Logistics Core),PREMIUM_PETROL,42,115.00,60.00,5770.20,Bungalow 7 Media Enclave,Metro City,28.5890,77.2380,DELIVERED,CREDIT_CARD,SUCCESSFUL,DL-01-MM-7788,Porsche Macan GTS,2026-08-27T17:30:00Z
ORD-894228,Highland Quarry Excavators,9866778800,machinery@highlandquarry.com,FLEET_OPERATOR,Station A (Metro Energy Hub),DIESEL,2800,94.00,250.00,310894.60,Stone Crusher Site 4 Hill Zone,Metro City,28.6310,77.2120,DELIVERED,FLEET_ACCOUNT,SUCCESSFUL,EXCAVATOR-CAT320,Caterpillar 320D Hydraulic Excavator,2026-08-27T18:00:00Z
ORD-894229,Karan Singhal,9877889911,karan.singhal@retailmart.com,INDIVIDUAL,Station B (Greenway Eco-Energy),PETROL,32,105.00,50.00,4023.80,Tower B 802 Lotus Court,Metro City,28.6320,77.2040,ORDER_CONFIRMED,UPI,SUCCESSFUL,DL-06-KS-8822,Tata Harrier Fearless,2026-08-27T18:30:00Z`,
  },
  {
    id: 'preset-stations-10',
    title: '10-Gas Station Regional Bowser Network CSV',
    description: 'Citywide refueling station network with geo-coordinates, manager details, live fuel stocks, capacity ratings, and service coverage zones.',
    type: 'stations',
    recordCount: 10,
    tags: ['Network Topology', 'Inventory Stock', 'GPS Coordinates'],
    csvContent: `station_code,station_name,manager_name,contact_number,email,address,city,lat,lng,coverage_radius_km,rating,petrol_available,diesel_available,premium_petrol_available,bio_diesel_available
Station A,Station A (Metro Energy Hub - Downtown),Robert Vance,+91 98765 43210,stationA@fuelflow.com,450 Northern Ring Road Industrial Sector 4,Metro City,28.6139,77.2090,25,4.8,4200,6800,1950,2800
Station B,Station B (Greenway Eco-Energy Terminal),Sunil Chawla,+91 98111 22334,stationB@fuelflow.com,Plot 12 Outer Expressway Green Corridor,Metro City,28.6502,77.1850,30,4.9,3800,7200,1200,3500
Station C,Station C (Express Highway Bowser Base),Meenakshi Sundaram,+91 98222 33445,stationC@fuelflow.com,NH-48 Toll Plaza Staging Dock Mile 14,Metro City,28.5720,77.2450,35,4.7,4500,8000,2100,1800
Station D,Station D (Aerocity Logistics Core),Harish Rawat,+91 98333 44556,stationD@fuelflow.com,Cargo Gate 7 Indira Aeropark West,Metro City,28.5560,77.0990,20,4.6,3100,5900,1400,2200
Station E,Station E (North Star Trans-Freight Hub),Rajesh Gopinath,+91 98444 55667,stationE@fuelflow.com,GT Karnal Bypass Transport Nagar Mile 2,Metro City,28.7200,77.1500,28,4.8,5000,9500,2200,3100
Station F,Station F (South Cyber Corridor Fuel Terminal),Deepa Kulkarni,+91 98555 66778,stationF@fuelflow.com,Golf Course Extension Road Cyber Zone,Metro City,28.4350,77.0850,22,4.9,4800,7500,2500,2000
Station G,Station G (Eastern Riverbank Staging Station),Arun Mazumdar,+91 98666 77889,stationG@fuelflow.com,Noida Expressway Sector 128 Distribution Core,Metro City,28.5150,77.3750,26,4.7,4100,6200,1600,2900
Station H,Station H (Western Logistics Freight Junction),Gurpreet Singh,+91 98777 88990,stationH@fuelflow.com,Rohtak Road Industrial Area Gate 3,Metro City,28.6850,77.0500,30,4.6,3900,8400,1300,3400
Station I,Station I (Southern Industrial Port Staging),Manoj Nair,+91 98888 99001,stationI@fuelflow.com,Faridabad Sector 25 Heavy Machinery Belt,Metro City,28.3800,77.3100,25,4.8,4600,8900,1800,2600
Station J,Station J (Central Metro Rapid Dispatch),Alok Deshmukh,+91 98999 00112,stationJ@fuelflow.com,Connaught Outer Circle Dispatch Terminal,Metro City,28.6300,77.2200,15,4.9,3500,5000,2800,1500`,
  },
  {
    id: 'preset-prices-matrix',
    title: 'Central Dynamic Fuel Price Matrix CSV',
    description: 'Current baseline rates for Unleaded Petrol, BS-VI Diesel, Speed Plus 98 Octane, and Eco-B20 Biodiesel with tax and delivery variables.',
    type: 'fuel_prices',
    recordCount: 4,
    tags: ['Pricing Matrix', 'Tax Rates', 'Delivery Base Fees'],
    csvContent: `fuel_type_code,fuel_name,price_per_litre,currency,tax_rate_percent,delivery_fee_base,delivery_fee_per_km,density,min_order_qty,max_order_qty,is_active
PETROL,Unleaded Petrol (RON 91/95),105.00,₹,18,50.00,5.00,0.74 kg/L,5,3000,TRUE
DIESEL,Ultra-Low Sulfur Diesel (BS-VI),94.00,₹,18,50.00,5.00,0.83 kg/L,10,8000,TRUE
PREMIUM_PETROL,Speed Plus 98 Octane Petrol,115.00,₹,18,50.00,5.00,0.75 kg/L,5,2000,TRUE
BIO_DIESEL,Eco-B20 Biodiesel Blend,98.00,₹,18,50.00,5.00,0.85 kg/L,10,5000,TRUE`,
  },
  {
    id: 'preset-users-fleet',
    title: 'Commercial Fleets & Enterprise Customer Accounts CSV',
    description: 'Corporate logistics companies, data centers, bus transit fleets, and individual vehicle owners with registration numbers and dispatch addresses.',
    type: 'users',
    recordCount: 12,
    tags: ['Fleet Accounts', 'Commercial Customers', 'Corporate B2B'],
    csvContent: `name,email,phone,user_type,company_name,fleet_size,city,address,status
Apex Global Logistics,ops@apexlogistics.com,+91 98765 43210,FLEET_OPERATOR,Apex Global Logistics Ltd,45,Metro City,Depot Bay 4 North Industrial Corridor,ACTIVE
TransContinental Cold Chain,transport@transcold.in,+91 98112 23344,FLEET_OPERATOR,TransContinental Logistics Inc,32,Metro City,Cold Hub Gate 2 Warehouse Zone A,ACTIVE
Metro Concrete Readymix,plant@metroconcrete.com,+91 98776 65544,FLEET_OPERATOR,Metro Concrete Solutions,28,Metro City,Batching Plant Site 9 Ring Bypass,ACTIVE
Evergreen Urban Transit,fleet@urbantransit.org,+91 98334 45566,FLEET_OPERATOR,Evergreen Public Transit Fleet,60,Metro City,Central Bus Terminal Platform 12,ACTIVE
Zenith Cloud Data Center,infra@zenithdc.com,+91 98556 67788,FLEET_OPERATOR,Zenith Datacenters Asia,15,Metro City,Data Park Substation Backup Vault 1,ACTIVE
AeroLink Aviation Services,groundops@aerolink.aero,+91 98990 01133,FLEET_OPERATOR,AeroLink Ground Handlers,18,Metro City,Terminal 3 Cargo Airside Staging Area,ACTIVE
Horizon Smart Infra Cranes,infra@horizoncranes.in,+91 98223 34466,FLEET_OPERATOR,Horizon Heavy Civil Infrastructure,22,Metro City,Flyover Pier 84 Construction Yard,ACTIVE
Highland Quarry Excavators,machinery@highlandquarry.com,+91 98667 78800,FLEET_OPERATOR,Highland Earthworks & Mining,35,Metro City,Stone Crusher Site 4 Hill Zone,ACTIVE
Rahul Sharma,rahul.sharma@example.com,+91 98234 56780,INDIVIDUAL,,1,Metro City,Flat 402 Palm Grove Enclave Sector 14,ACTIVE
Priya Patel,priya.patel@designstudio.org,+91 98990 01122,INDIVIDUAL,,1,Metro City,Villa 18 Silverwood Estates Ring Road,ACTIVE
Dr. Sunita Rao,sunita.rao@medcenter.org,+91 98445 56677,INDIVIDUAL,,2,Metro City,Staff Quarters 14 City Hospital Road,ACTIVE
Amit Verma,amit.verma@techsolutions.com,+91 98123 45678,INDIVIDUAL,,1,Metro City,B-104 Cyber Greens Residency,ACTIVE`,
  },
];
