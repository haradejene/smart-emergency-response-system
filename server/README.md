# 🚑 Emergency Detection Backend

A real-time backend system designed to detect vehicle accidents using sensor data, process incidents intelligently, and notify administrators instantly via WebSockets.

---

## 📌 Overview

This backend powers an accident detection system that analyzes motion sensor data from client devices and determines whether a crash has occurred. Upon detection, it processes location data, stores incidents, and broadcasts alerts in real time.

The system is designed with scalability, reliability, and real-world deployment considerations in mind.

---

## ⚙️ Tech Stack

- **Node.js** – Runtime environment
- **Express.js** – Backend framework
- **Prisma ORM** – Database access & migrations
- **PostgreSQL (Neon)** – Primary database
- **Socket.io** – Real-time communication
- **Zod** – Request validation
- **Winston** – Logging
- **Helmet & CORS** – Security middleware
- **Express Rate Limit** – API protection

---

## 📁 Project Structure

```
server/
├── prisma/
│   └── migrations/
│
└── src/
    ├── controllers/     # Handles request/response logic
    ├── middleware/      # Validation, security, rate limiting
    ├── routes/          # API route definitions
    ├── services/        # Core logic (accident detection, geocoding)
    ├── utils/           # Helper functions
    ├── websocket/       # Socket.io configuration
    └── server.js        # Entry point
```

---

## 🚀 Features

### 🧠 Intelligent Accident Detection

- Processes motion sensor data (x, y, z axes)
- Uses **time-window analysis** instead of single data points
- Detects crash patterns:
  - Sudden high impact (G-force spike)
  - Followed by near-zero motion

### 📍 Location Processing

- Converts GPS coordinates into human-readable addresses
- Integrates with geocoding services (e.g., Google Maps / Mapbox)

### 🔄 Real-Time Alerts

- Uses **Socket.io** to notify dashboards instantly
- Supports event-based communication:
  - `incident:new`
  - `incident:update`

### 🛡️ Security & Validation

- Rate limiting to prevent abuse
- Strict request validation using Zod
- Secure headers via Helmet
- Controlled CORS policy

### 📊 Incident Management

- Tracks incidents with statuses:
  - `PENDING`
  - `DISPATCHED`
  - `RESOLVED`
  - `FALSE_ALARM`

### ⚡ Cooldown Logic

- Prevents duplicate alerts from the same crash
- Uses in-memory tracking (extendable to Redis)

---

## 🧪 Scripts

```bash
npm run dev        # Run server with nodemon
npm start          # Run production server
npm run test:socket # Test WebSocket functionality

# Prisma
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file:

```
DATABASE_URL=your_database_url
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

---

## 🗄️ Database Setup (Prisma)

```bash
npx prisma generate
npx prisma migrate dev
```

---

## 🔌 API Overview

### 📍 POST /api/incidents

Receives sensor + location data and processes accident detection.

**Payload Example:**

```json
{
  "device_id": "abc123",
  "x": 12.3,
  "y": -4.5,
  "z": 9.8,
  "latitude": 8.54,
  "longitude": 39.27
}
```

---

## 🔄 WebSocket Events

| Event             | Description                |
| ----------------- | -------------------------- |
| `incident:new`    | Triggered on new accident  |
| `incident:update` | Triggered on status change |

---

## ❤️ Health Check

```
GET /health
```

Checks:

- Server status
- Database connection
- WebSocket availability

---

## 🧠 Engineering Highlights

- Separation of concerns using service-based architecture
- Real-time system using WebSockets
- Scalable database design with Prisma
- Production-ready middleware stack

---

## 🔮 Future Improvements

- Redis for distributed cooldown handling
- JWT authentication for dashboard users
- Docker containerization
- Advanced ML-based crash detection
- Persistent sensor logging & analytics

---

## 👨‍💻 Contributors

Backend team project – built collaboratively.

---

## 📄 License

ISC
