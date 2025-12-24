
export enum OrderStatus {
  RECEIVED = 'RECEIVED',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  ONLINE = 'ONLINE'
}

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
}

export interface Category {
  _id: string;
  name: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  _id: string;
  tableNumber: string;
  items: {
    menuItem: MenuItem;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  token: string;
}

export interface RestaurantSettings {
  name: string;
  logo: string;
  currency: string;
  contactNumber: string;
  address: string;
}
