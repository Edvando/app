
export type UserRole = 'sender' | 'driver';

export interface DriverDetails {
  fullName: string;
  cpf: string;
  cnh: string;
  vehicleModel: string;
  vehiclePlate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rating: number;
  avatar: string;
  balance: number;
  isDriverVerified: boolean;
  driverDetails?: DriverDetails;
}

export type OrderStatus = 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

export interface DeliveryOrder {
  id: string;
  senderId: string;
  driverId?: string;
  pickupAddress: string;
  deliveryAddress: string;
  productType: string;
  dimensions: string;
  weight: string;
  price: number;
  status: OrderStatus;
  createdAt: number;
  description?: string;
  latLng?: { lat: number; lng: number };
}

export interface AppState {
  currentUser: User | null;
  orders: DeliveryOrder[];
  isDarkMode: boolean;
}
