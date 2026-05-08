# Smart Emergency Response System (SERS)

A real-time accident detection and emergency alert platform for IoT-enabled devices. Automatically detects accidents using accelerometer data and GPS location, with manual SOS triggers. Broadcasts alerts via WebSocket to connected responders and users.

## 🚀 Features

- **Automatic Accident Detection**: Monitors accelerometer data for sudden impacts (configurable threshold)
- **Manual SOS Button**: Emergency trigger with confirmation countdown
- **Real-Time Alerts**: WebSocket-based instant notifications to responders
- **Responder Dashboard**: Manage incoming alerts with status updates and location previews
- **Sensor Monitoring**: Live display of accelerometer and geolocation data
- **Progressive Web App (PWA)**: Installable mobile app with offline capabilities
- **Demo Mode**: Test functionality with mock sensor data
- **Rate Limiting & Validation**: Prevents abuse and ensures data integrity
- **Health Monitoring**: API endpoints for system status checks

## 🏗️ Architecture

```mermaid
graph TD
    A[IoT Device/Smartphone] --> B[Client PWA<br/>React + TypeScript]
    B --> C[Accelerometer Hook]
    B --> D[Geolocation Hook]
    B --> E[WebSocket Hook]
    C --> F[Sensor Data]
    D --> F
    F --> G[POST /api/sensor-data]
    G --> H[Server<br/>Express + Socket.io]
    H --> I[Validation Middleware]
    I --> J[Detection Service]
    J --> K{Threshold Check<br/>Force > 30}
    K -->|Yes| L[Create Incident<br/>Prisma DB]
    L --> M[Broadcast Alert<br/>WebSocket]
    M --> N[Responder Dashboard]
    M --> O[User Alerts]
    K -->|No| P[No Action]
    B --> Q[EOS Button]
    Q --> R[Manual Alert]
    R --> M
    H --> S[Health Check<br/>GET /api/health]
```

## 📁 Project Structure

```
smart-emergency-response-system/
├── client/                          # React PWA Frontend
│   ├── src/
│   │   ├── components/              # UI Components
│   │   │   ├── AlertHistory/        # Past alerts display
│   │   │   ├── EmergencyButton/     # SOS trigger
│   │   │   ├── LocationMap/         # Map visualization
│   │   │   ├── PermissionsGate/     # Permission handling
│   │   │   ├── ResponderDashboard/  # Responder interface
│   │   │   ├── SensorMonitor/       # Sensor status
│   │   │   └── Toast/               # Notifications
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAccelerometer.ts  # Motion sensor hook
│   │   │   ├── useGeolocation.ts    # GPS hook
│   │   │   └── useWebSocket.ts      # WebSocket hook
│   │   ├── services/                # Client services
│   │   └── types/                   # TypeScript definitions
│   └── package.json
├── server/                          # Node.js Backend
│   ├── src/
│   │   ├── controllers/             # Route handlers
│   │   ├── middleware/              # Express middleware
│   │   ├── routes/                  # API routes
│   │   ├── services/                # Business logic
│   │   ├── utils/                   # Utilities
│   │   └── websocket/               # Socket.io setup
│   ├── prisma/                      # Database schema & migrations
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript for type-safe component development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive, utility-first styling
- **Socket.io-client** for real-time WebSocket communication
- **PWA plugins** for installable app functionality

### Backend
- **Node.js 20** with Express.js for RESTful API
- **Socket.io** for bidirectional real-time communication
- **Prisma ORM** for type-safe database operations
- **PostgreSQL** for reliable data persistence
- **Winston** for structured logging
- **Zod** for runtime type validation

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/haradejene/smart-emergency-response-system.git
   cd smart-emergency-response-system
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   cp .env.example .env  # Configure your environment variables
   npx prisma migrate dev
   npx prisma generate
   npm run dev
   ```

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

4. **Access the application**
   - Client: http://localhost:3000
   - Server API: http://localhost:4000
   - API Docs: http://localhost:4000/api-docs

## 📖 Usage

### For Users
1. **Grant Permissions**: Allow location and motion sensor access
2. **Monitor Sensors**: View real-time accelerometer and GPS data
3. **Emergency Trigger**: Press the SOS button for manual alerts
4. **View Alerts**: Check alert history and current status

### For Responders
1. **Access Dashboard**: Switch to responder view
2. **Monitor Alerts**: Real-time incoming emergency notifications
3. **Update Status**: Acknowledge, dispatch, or cancel incidents
4. **Location Preview**: View incident locations on maps

### Demo Mode
Enable demo mode in the app to test with mock sensor data without real hardware.

## 🔧 Configuration

### Environment Variables (Server)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sers_db"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
ACCELERATION_THRESHOLD=30
CONFIRMATION_WINDOW=3000
COOLDOWN_PERIOD=45000
```

### Detection Parameters
- **Acceleration Threshold**: Minimum force (m/s²) to trigger detection (default: 30)
- **Confirmation Window**: Time window for sustained high acceleration (default: 3s)
- **Cooldown Period**: Minimum time between alerts per device (default: 45s)

## 📡 API Documentation

The server provides Swagger UI documentation at `/api-docs`.

### Key Endpoints
- `POST /api/sensor-data` - Ingest sensor readings
- `GET /api/health` - System health check

View full API specs: [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies for reliable emergency response
- Designed for IoT devices and mobile applications
- Focus on user safety and rapid response times

---

For more details, explore the [client](client/) and [server](server/) directories.
