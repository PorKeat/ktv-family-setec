// types/database.ts
import { ObjectId } from "mongodb";

// Customer type
export interface Customer {
  _id?: ObjectId;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Room type
export interface Room {
  _id?: ObjectId;
  roomId: string;
  name: string;
  type: "Standard" | "VIP" | "Family";
  pricePerHour: number;
  description: string;
  available: boolean;
  capacity: number;
  equipment?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// TimeSlot for bookings
export interface TimeSlot {
  startAt: Date;
  endAt: Date;
}

// Booking type
export interface Booking {
  _id?: ObjectId;
  bookingId: string;
  customerId: string;
  roomId: string;
  bookingAt: Date;
  timeSlot: TimeSlot;
  duration: number; // in hours
  totalPrice: number;
  status: "Pending" | "Confirmed" | "Active" | "Completed" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}

// Product type
export interface Product {
  _id?: ObjectId;
  productId: string;
  name: string;
  price: number;
  category: "Food" | "Drink" | "Snack";
  description: string;
  available: boolean;
  stock?: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order detail within an order
export interface OrderDetail {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Order type
export interface Order {
  _id?: ObjectId;
  orderId: string;
  customerId: string;
  bookingId?: string;
  orderDate: Date;
  status: "Pending" | "Preparing" | "Ready" | "Delivered" | "Cancelled";
  orderDetails: OrderDetail[];
  subtotal: number;
  discount?: number;
  totalAmount: number;
  paymentMethod: "Cash" | "Card" | "Transfer" | "E-wallet";
  createdAt: Date;
  updatedAt: Date;
}

// Membership type
export interface Membership {
  _id?: ObjectId;
  membershipId: string;
  customerId: string;
  type: "Bronze" | "Silver" | "Gold" | "Platinum";
  discount: number; // percentage
  startDate: Date;
  expiryDate: Date;
  benefits?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Collection data interface
export interface AllCollectionData {
  customers: Customer[];
  rooms: Room[];
  bookings: Booking[];
  products: Product[];
  orders: Order[];
  memberships: Membership[];
}

// Statistics interface
export interface DashboardStats {
  totalCustomers: number;
  totalRooms: number;
  totalBookings: number;
  totalProducts: number;
  totalOrders: number;
  totalMemberships: number;
  availableRooms: number;
  activeBookings: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AllDataResponse extends ApiResponse<AllCollectionData> {
  stats?: DashboardStats;
  timestamp?: string;
}

export interface ListResponse<T> extends ApiResponse<T[]> {
  count: number;
}

export interface ProductsResponse extends ListResponse<Product> {
  grouped?: Record<string, Product[]>;
}

export interface OrdersResponse extends ListResponse<Order> {
  totalRevenue?: number;
}

// Dashboard specific types
export interface PopularProduct {
  _id: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface RoomUtilization {
  _id: string;
  bookingCount: number;
  totalHours: number;
}

export interface DashboardSummary {
  totalCustomers: number;
  totalRooms: number;
  availableRooms: number;
  occupancyRate: string;
}

export interface TodayStats {
  bookings: number;
  activeBookings: number;
  orders: number;
  revenue: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  today: TodayStats;
  popularProducts: PopularProduct[];
  roomUtilization: RoomUtilization[];
}
