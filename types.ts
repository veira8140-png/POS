
export enum Category {
  FOOD = 'Food & Drinks',
  HOUSEHOLD = 'Household',
  ELECTRONICS = 'Electronics',
  FASHION = 'Fashion',
  SERVICES = 'Services',
  OTHER = 'Other'
}

export enum PaymentMethod {
  CASH = 'CASH',
  MPESA = 'M-PESA',
  CARD = 'CARD'
}

export enum OwnerProfile {
  SURVIVAL = 'Survival Retail Owner',
  BURNED = 'Burned Business Owner',
  GROWTH = 'Growth-Minded Operator',
  COMPLIANCE = 'Compliance-Anxious Owner',
  HANDS_OFF = 'Hands-Off Owner'
}

export enum BusinessType {
  RETAIL = 'Retail Shop',
  RESTAURANT = 'Restaurant / Café',
  ELECTRONICS = 'Electronics Store',
  PHARMACY = 'Pharmacy / Chemist',
  LIQUOR = 'Liquor Store',
  CAR_YARD = 'Car Yard'
}

export enum UserRole {
  OWNER = 'Business Owner',
  ACCOUNTANT = 'Accountant',
  AUDITOR = 'Auditor',
  FINANCE_MANAGER = 'Finance Manager',
  STORE_MANAGER = 'Store Manager',
  CASHIER = 'Cashier',
  STOCK_MANAGER = 'Stock Manager'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: Category;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  timestamp: number;
  items: CartItem[];
  total: number;
  vat: number;
  costOfGoods: number; // For accounting
  paymentMethod: PaymentMethod;
  customerName?: string;
  isAnomaly?: boolean;
  anomalyReason?: string;
}

export interface AppState {
  products: Product[];
  transactions: Transaction[];
  businessName: string;
  kraPin: string;
  vatRate: number;
  ownerProfile: OwnerProfile;
  businessType: BusinessType;
  userRole: UserRole;
}
