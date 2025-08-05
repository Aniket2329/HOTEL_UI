import { PrismaClient } from "@prisma/client";

// Create a global variable to store the Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client instance (singleton pattern for development)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Database utility functions
export class DatabaseService {
  // Connect to database
  static async connect() {
    try {
      await prisma.$connect();
      console.log("✅ Database connected successfully");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      process.exit(1);
    }
  }

  // Disconnect from database
  static async disconnect() {
    await prisma.$disconnect();
    console.log("🔌 Database disconnected");
  }

  // Health check
  static async healthCheck() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "healthy", message: "Database is responsive" };
    } catch (error) {
      return {
        status: "unhealthy",
        message: "Database connection failed",
        error,
      };
    }
  }

  // Seed database with initial data
  static async seed() {
    try {
      console.log("🌱 Seeding database...");

      // Create admin user
      const adminUser = await prisma.user.upsert({
        where: { username: "admin" },
        update: {},
        create: {
          username: "admin",
          email: "admin@hotel.com",
          password: "password", // In production, this should be hashed
          role: "ADMIN",
        },
      });

      // Create sample rooms
      const rooms = await Promise.all([
        prisma.room.upsert({
          where: { number: "101" },
          update: {},
          create: {
            number: "101",
            type: "SINGLE",
            price: 4500, // ₹4,500 per night
            status: "AVAILABLE",
            amenities: JSON.stringify(["WiFi", "TV", "AC", "Room Service"]),
            description: "Comfortable single room with city view",
          },
        }),
        prisma.room.upsert({
          where: { number: "205" },
          update: {},
          create: {
            number: "205",
            type: "DOUBLE",
            price: 6000, // ₹6,000 per night
            status: "AVAILABLE",
            amenities: JSON.stringify([
              "WiFi",
              "TV",
              "AC",
              "Mini Bar",
              "Room Service",
            ]),
            description: "Spacious double room with garden view",
          },
        }),
        prisma.room.upsert({
          where: { number: "301" },
          update: {},
          create: {
            number: "301",
            type: "SUITE",
            price: 12000, // ₹12,000 per night
            status: "AVAILABLE",
            amenities: JSON.stringify([
              "WiFi",
              "TV",
              "AC",
              "Mini Bar",
              "Balcony",
              "Jacuzzi",
              "Room Service",
            ]),
            description: "Luxury suite with ocean view and private balcony",
          },
        }),
        prisma.room.upsert({
          where: { number: "405" },
          update: {},
          create: {
            number: "405",
            type: "DELUXE",
            price: 9000, // ₹9,000 per night
            status: "AVAILABLE",
            amenities: JSON.stringify([
              "WiFi",
              "TV",
              "AC",
              "Mini Bar",
              "Balcony",
              "Room Service",
            ]),
            description: "Deluxe room with premium amenities",
          },
        }),
      ]);

      // Create sample guests
      const sampleGuests = await Promise.all([
        prisma.guest.upsert({
          where: { email: "john.doe@example.com" },
          update: {},
          create: {
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "+1-555-0123",
            address: "123 Main St, New York, NY 10001",
          },
        }),
        prisma.guest.upsert({
          where: { email: "jane.smith@example.com" },
          update: {},
          create: {
            name: "Jane Smith",
            email: "jane.smith@example.com",
            phone: "+1-555-0456",
            address: "456 Oak Ave, Los Angeles, CA 90210",
          },
        }),
      ]);

      // Create sample reservations
      await prisma.reservation.upsert({
        where: { id: 1 },
        update: {},
        create: {
          id: 1,
          guestId: sampleGuests[0].id,
          roomId: rooms[1].id, // Room 205
          checkIn: new Date("2024-02-15T15:00:00Z"),
          checkOut: new Date("2024-02-18T11:00:00Z"),
          numberOfGuests: 2,
          totalAmount: 18000, // 3 nights × ₹6000 (converted to INR)
          status: "CONFIRMED",
          specialRequests: "Late check-in requested",
        },
      });

      console.log("✅ Database seeded successfully");
      console.log(`👤 Admin user: ${adminUser.username}`);
      console.log(`🏨 Created ${rooms.length} rooms`);
      console.log(`👥 Created ${sampleGuests.length} guests`);
    } catch (error) {
      console.error("❌ Database seeding failed:", error);
      throw error;
    }
  }
}

// Export Prisma client for use in other files
export default prisma;
