import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  register,
  login,
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,
  getRooms,
  getRoomByReservation,
  healthCheck,
} from "./routes/hotel";
import { DatabaseService } from "./lib/database";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Hotel Management API routes
  app.get("/api/health", healthCheck);
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.get("/api/reservations", getReservations);
  app.post("/api/reservations", createReservation);
  app.put("/api/reservations/:id", updateReservation);
  app.delete("/api/reservations/:id", deleteReservation);
  app.get("/api/rooms", getRooms);
  app.get("/api/reservations/:reservationId/room", getRoomByReservation);

  // Initialize database on server start
  DatabaseService.connect()
    .then(() => DatabaseService.seed())
    .catch(console.error);

  return app;
}
