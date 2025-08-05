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
  User as ApiUser,
  Room as ApiRoom,
  Reservation as ApiReservation
} from "@shared/hotel-api";
import prisma from "../lib/database";

// Helper function to convert Prisma models to API types
const mapRoomToApi = (room: any): ApiRoom => ({
  id: room.id,
  number: room.number,
  type: room.type.toLowerCase(),
  price: room.price,
  status: room.status.toLowerCase(),
  amenities: JSON.parse(room.amenities || '[]'),
});

const mapReservationToApi = (reservation: any): ApiReservation => ({
  id: reservation.id,
  guestName: reservation.guest.name,
  guestEmail: reservation.guest.email,
  guestPhone: reservation.guest.phone,
  roomId: reservation.roomId,
  roomNumber: reservation.room.number,
  checkIn: reservation.checkIn.toISOString(),
  checkOut: reservation.checkOut.toISOString(),
  numberOfGuests: reservation.numberOfGuests,
  totalAmount: reservation.totalAmount,
  status: reservation.status.toLowerCase(),
  createdAt: reservation.createdAt.toISOString(),
  updatedAt: reservation.updatedAt.toISOString(),
});

const mapUserToApi = (user: any): ApiUser => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role.toLowerCase(),
});

// Registration
export const register: RequestHandler = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists"
      });
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password, // In production, hash the password
        role: 'STAFF'
      }
    });

    const response: LoginResponse = {
      success: true,
      user: mapUserToApi(newUser),
      token: `jwt-token-${newUser.id}-${Date.now()}`,
      message: "Registration successful"
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Authentication
export const login: RequestHandler = async (req, res) => {
  try {
    const { username, password }: LoginRequest = req.body;

    if (!username || !password) {
      const response: LoginResponse = {
        success: false,
        message: "Username and password are required"
      };
      return res.status(400).json(response);
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { username }
    });

    // Simple password check (in production, use bcrypt for hashed passwords)
    if (user && user.password === password) {
      const response: LoginResponse = {
        success: true,
        user: mapUserToApi(user),
        token: `demo-jwt-token-${user.id}-${Date.now()}`,
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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get all reservations
export const getReservations: RequestHandler = async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        guest: true,
        room: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response: GetReservationsResponse = {
      success: true,
      reservations: reservations.map(mapReservationToApi),
      total: reservations.length
    };

    res.json(response);
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reservations"
    });
  }
};

// Create new reservation
export const createReservation: RequestHandler = async (req, res) => {
  try {
    const reservationData: CreateReservationRequest = req.body;

    // Validate required fields
    if (!reservationData.guestName || !reservationData.guestEmail || !reservationData.roomId) {
      return res.status(400).json({
        success: false,
        message: "Guest name, email, and room ID are required"
      });
    }

    // Check if room exists and is available
    const room = await prisma.room.findUnique({
      where: { id: reservationData.roomId }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    if (room.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: "Room is not available"
      });
    }

    // Check for conflicting reservations
    const checkIn = new Date(reservationData.checkIn);
    const checkOut = new Date(reservationData.checkOut);

    const conflictingReservation = await prisma.reservation.findFirst({
      where: {
        roomId: reservationData.roomId,
        status: {
          in: ['CONFIRMED', 'CHECKED_IN']
        },
        OR: [
          {
            checkIn: {
              lte: checkOut
            },
            checkOut: {
              gte: checkIn
            }
          }
        ]
      }
    });

    if (conflictingReservation) {
      return res.status(400).json({
        success: false,
        message: "Room is already booked for the selected dates"
      });
    }

    // Create or find guest
    let guest = await prisma.guest.findUnique({
      where: { email: reservationData.guestEmail }
    });

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          name: reservationData.guestName,
          email: reservationData.guestEmail,
          phone: reservationData.guestPhone,
        }
      });
    }

    // Calculate total amount (simplified calculation)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * room.price;

    // Create reservation
    const newReservation = await prisma.reservation.create({
      data: {
        guestId: guest.id,
        roomId: reservationData.roomId,
        checkIn,
        checkOut,
        numberOfGuests: reservationData.numberOfGuests,
        totalAmount,
        status: 'CONFIRMED',
      },
      include: {
        guest: true,
        room: true,
      }
    });

    // Update room status to occupied
    await prisma.room.update({
      where: { id: reservationData.roomId },
      data: { status: 'OCCUPIED' }
    });

    const response: CreateReservationResponse = {
      success: true,
      reservation: mapReservationToApi(newReservation),
      message: "Reservation created successfully"
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create reservation"
    });
  }
};

// Update reservation
export const updateReservation: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const reservationId = parseInt(id);
    const updates: UpdateReservationRequest = req.body;

    const existingReservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { guest: true, room: true }
    });

    if (!existingReservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found"
      });
    }

    // Prepare update data
    const updateData: any = {};

    if (updates.checkIn) updateData.checkIn = new Date(updates.checkIn);
    if (updates.checkOut) updateData.checkOut = new Date(updates.checkOut);
    if (updates.numberOfGuests) updateData.numberOfGuests = updates.numberOfGuests;
    if (updates.status) updateData.status = updates.status.toUpperCase();

    // Update guest information if provided
    if (updates.guestName || updates.guestEmail || updates.guestPhone) {
      const guestUpdates: any = {};
      if (updates.guestName) guestUpdates.name = updates.guestName;
      if (updates.guestEmail) guestUpdates.email = updates.guestEmail;
      if (updates.guestPhone) guestUpdates.phone = updates.guestPhone;

      await prisma.guest.update({
        where: { id: existingReservation.guestId },
        data: guestUpdates
      });
    }

    // Update reservation
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: updateData,
      include: {
        guest: true,
        room: true,
      }
    });

    const response: CreateReservationResponse = {
      success: true,
      reservation: mapReservationToApi(updatedReservation),
      message: "Reservation updated successfully"
    };

    res.json(response);
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update reservation"
    });
  }
};

// Delete reservation
export const deleteReservation: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const reservationId = parseInt(id);

    const existingReservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { room: true }
    });

    if (!existingReservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found"
      });
    }

    // Delete reservation
    await prisma.reservation.delete({
      where: { id: reservationId }
    });

    // Update room status back to available
    await prisma.room.update({
      where: { id: existingReservation.roomId },
      data: { status: 'AVAILABLE' }
    });

    const response: DeleteReservationResponse = {
      success: true,
      message: "Reservation deleted successfully"
    };

    res.json(response);
  } catch (error) {
    console.error('Delete reservation error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete reservation"
    });
  }
};

// Get all rooms
export const getRooms: RequestHandler = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: {
        number: 'asc'
      }
    });

    const response: GetRoomsResponse = {
      success: true,
      rooms: rooms.map(mapRoomToApi)
    };

    res.json(response);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rooms"
    });
  }
};

// Get room by reservation ID
export const getRoomByReservation: RequestHandler = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const id = parseInt(reservationId);

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        room: true,
        guest: true
      }
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found"
      });
    }

    res.json({
      success: true,
      roomNumber: reservation.room.number,
      reservation: mapReservationToApi(reservation)
    });
  } catch (error) {
    console.error('Get room by reservation error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch room information"
    });
  }
};

// Health check endpoint
export const healthCheck: RequestHandler = async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get basic stats
    const [totalRooms, totalReservations, availableRooms] = await Promise.all([
      prisma.room.count(),
      prisma.reservation.count(),
      prisma.room.count({ where: { status: 'AVAILABLE' } })
    ]);

    res.json({
      success: true,
      message: "Hotel Management API is healthy",
      stats: {
        totalRooms,
        totalReservations,
        availableRooms,
        occupancyRate: totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
};
