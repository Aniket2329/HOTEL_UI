# Hotel Management System - Database Guide

## 🗄️ Database Setup

Your Hotel Management System now uses **Prisma ORM with SQLite** for data persistence.

### **Database Schema Overview**

```
Users        - System users (admin, staff, manager)
Rooms        - Hotel room inventory
Guests       - Customer information
Reservations - Booking records with relationships
```

## 🔧 **Available Commands**

```bash
# Database operations
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed with sample data
npm run db:studio      # Open Prisma Studio (GUI)
npm run db:reset       # Reset database and re-seed

# Development
npm run dev           # Start with auto-seeding
```

## 📊 **API Endpoints Now Available**

### **Authentication**

```bash
POST /api/auth/login
# Body: { "username": "admin", "password": "password" }
```

### **Reservations**

```bash
GET    /api/reservations           # Get all reservations
POST   /api/reservations           # Create new reservation
PUT    /api/reservations/:id       # Update reservation
DELETE /api/reservations/:id       # Delete reservation
GET    /api/reservations/:id/room  # Get room by reservation
```

### **Rooms**

```bash
GET /api/rooms                     # Get all rooms
```

### **System**

```bash
GET /api/health                    # Health check + stats
```

## 💾 **Sample Data Included**

**Admin User:**

- Username: `admin`
- Password: `password`
- Role: `ADMIN`

**Sample Rooms:**

- Room 101 (Single) - $150/night
- Room 205 (Double) - $200/night
- Room 301 (Suite) - $400/night
- Room 405 (Deluxe) - $300/night

**Sample Guests & Reservations:**

- John Doe with active reservation
- Jane Smith with sample booking

## 🔄 **Upgrading to Production Database**

### **Option 1: PostgreSQL (Recommended)**

1. **Install PostgreSQL driver:**

```bash
npm install pg @types/pg
```

2. **Update `.env`:**

```env
DATABASE_URL="postgresql://username:password@localhost:5432/hotel_db"
```

3. **Update `prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. **Run migration:**

```bash
npm run db:migrate
npm run db:seed
```

### **Option 2: Use Cloud Database Services**

**Quick Setup with MCP Integrations:**

- **[Supabase](#open-mcp-popover)** - PostgreSQL + Auth + Real-time
- **[Neon](#open-mcp-popover)** - Serverless PostgreSQL
- **[Prisma Postgres](#open-mcp-popover)** - Managed PostgreSQL

Click [Open MCP popover](#open-mcp-popover) to connect to these services.

## 🔒 **Security Notes**

1. **Password Hashing** - Currently using plain text (demo only)

   ```bash
   npm install bcrypt @types/bcrypt
   ```

2. **JWT Authentication** - Currently using demo tokens

   ```bash
   npm install jsonwebtoken @types/jsonwebtoken
   ```

3. **Environment Variables** - Store secrets securely:
   ```env
   DATABASE_URL="your-production-db-url"
   JWT_SECRET="your-super-secret-key"
   ```

## 🎯 **Next Steps**

1. **Explore Data**: Run `npm run db:studio` for GUI
2. **Test API**: Use the health endpoint to verify
3. **Scale Up**: Upgrade to PostgreSQL for production
4. **Add Features**: Extend schema as needed

Your Hotel Management System now has a fully functional database with real data persistence!
