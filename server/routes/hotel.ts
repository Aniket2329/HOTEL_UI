import { RequestHandler } from "express";
import {
  LoginRequest,
  LoginResponse,
  CreateReservationRequest,
  CreateReservationResponse,
  GetReservationsResponse,
  UpdateReservationRequest,
  DeleteReservationResponse,
  GetRoomsResponse,
  Reservation,
  Room,
  User
} from "@shared/hotel-api";

// Mock data - replace with real database
let mockReservations: Reservation[] = [
  {
    id: "res-1",
    guestName: "John Doe",
    guestEmail: "john@example.com",
    guestPhone: "+1-555-0123",
    roomId: "room-101",
    roomNumber: "101",
    checkIn: "2024-01-15T15:00:00Z",
    checkOut: "2024-01-18T11:00:00Z",
    numberOfGuests: 2,
    totalAmount: 450,
    status: "confirmed",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z"
  },
  {
    id: "res-2",
    guestName: "Jane Smith",
    guestEmail: "jane@example.com",
    guestPhone: "+1-555-0456",
    roomId: "room-205",
    roomNumber: "205",
    checkIn: "2024-01-20T15:00:00Z",
    checkOut: "2024-01-22T11:00:00Z",
    numberOfGuests: 1,
    totalAmount: 300,
    status: "checked_in",
    createdAt: "2024-01-12T14:30:00Z",
    updatedAt: "2024-01-20T15:15:00Z"
  }
];

let mockRooms: Room[] = [
  {
    id: "room-101",
    number: "101",
    type: "single",
    price: 150,
    status: "occupied",
    amenities: ["WiFi", "TV", "AC"]
  },
  {
    id: "room-205",
    number: "205",
    type: "double",
    price: 200,
    status: "occupied",
    amenities: ["WiFi", "TV", "AC", "Mini Bar"]
  },
  {
    id: "room-301",
    number: "301",
    type: "suite",
    price: 400,
    status: "available",
    amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony", "Jacuzzi"]
  }
];

const mockUser: User = {
  id: "user-1",
  username: "admin",
  email: "admin@hotel.com",
  role: "admin"
};

// Authentication
export const login: RequestHandler = (req, res) => {
  const { username, password }: LoginRequest = req.body;

  // Simple demo authentication
  if (username && password) {
    const response: LoginResponse = {
      success: true,
      user: mockUser,
      token: "demo-jwt-token-" + Date.now(),
      message: "Login successful"
    };
    res.json(response);
  } else {
    const response: LoginResponse = {
      success: false,
      message: "Invalid credentials"
    };
    res.status(401).json(response);
  }
};

// Get all reservations
export const getReservations: RequestHandler = (req, res) => {
  const response: GetReservationsResponse = {
    success: true,
    reservations: mockReservations,
    total: mockReservations.length
  };
  res.json(response);
};

// Create new reservation
export const createReservation: RequestHandler = (req, res) => {
  const reservationData: CreateReservationRequest = req.body;
  
  const newReservation: Reservation = {
    id: `res-${Date.now()}`,
    ...reservationData,
    roomNumber: mockRooms.find(r => r.id === reservationData.roomId)?.number || "Unknown",
    totalAmount: 300, // Calculate based on room price and dates
    status: "confirmed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  mockReservations.push(newReservation);

  const response: CreateReservationResponse = {
    success: true,
    reservation: newReservation,
    message: "Reservation created successfully"
  };
  
  res.status(201).json(response);
};

// Update reservation
export const updateReservation: RequestHandler = (req, res) => {
  const { id } = req.params;
  const updates: UpdateReservationRequest = req.body;

  const reservationIndex = mockReservations.findIndex(r => r.id === id);
  
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Reservation not found"
    });
  }

  // Update the reservation
  mockReservations[reservationIndex] = {
    ...mockReservations[reservationIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  const response: CreateReservationResponse = {
    success: true,
    reservation: mockReservations[reservationIndex],
    message: "Reservation updated successfully"
  };

  res.json(response);
};

// Delete reservation
export const deleteReservation: RequestHandler = (req, res) => {
  const { id } = req.params;
  
  const reservationIndex = mockReservations.findIndex(r => r.id === id);
  
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Reservation not found"
    });
  }

  mockReservations.splice(reservationIndex, 1);

  const response: DeleteReservationResponse = {
    success: true,
    message: "Reservation deleted successfully"
  };

  res.json(response);
};

// Get all rooms
export const getRooms: RequestHandler = (req, res) => {
  const response: GetRoomsResponse = {
    success: true,
    rooms: mockRooms
  };
  res.json(response);
};

// Get room by reservation ID
export const getRoomByReservation: RequestHandler = (req, res) => {
  const { reservationId } = req.params;
  
  const reservation = mockReservations.find(r => r.id === reservationId);
  
  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: "Reservation not found"
    });
  }

  res.json({
    success: true,
    roomNumber: reservation.roomNumber,
    reservation: reservation
  });
};
