/**
 * Hotel Management API Types
 * Shared between client and server
 */

export interface User {
  id: number;
  username: string;
  email?: string;
  role: 'admin' | 'staff' | 'manager';
}

export interface Room {
  id: number;
  number: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  price: number;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  amenities: string[];
}

export interface Reservation {
  id: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: number;
  roomNumber: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  numberOfGuests: number;
  totalAmount: number;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// API Request/Response Types
export interface RegisterRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface CreateReservationRequest {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: number;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
}

export interface CreateReservationResponse {
  success: boolean;
  reservation?: Reservation;
  message?: string;
}

export interface GetReservationsResponse {
  success: boolean;
  reservations: Reservation[];
  total: number;
}

export interface UpdateReservationRequest {
  id: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn?: string;
  checkOut?: string;
  numberOfGuests?: number;
  status?: Reservation['status'];
}

export interface DeleteReservationResponse {
  success: boolean;
  message: string;
}

export interface GetRoomsResponse {
  success: boolean;
  rooms: Room[];
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}
