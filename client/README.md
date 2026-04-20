# 🚑 Smart Emergency Response — Frontend<div align="center">


![React](https://img.shields.io/badge/React-18.x-61dafb?style=for-the-badge&logo=react)

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)

![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38bdf8?style=for-the-badge&logo=tailwind-css)

![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=for-the-badge&logo=vite)**A high-performance, mobile-first web application for real-time emergency detection and SOS signaling.**


[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Troubleshooting](#-common-issues)</div>


---## 📖 Overview


This is the client-side application for the **Smart Emergency Response System**. It leverages modern smartphone hardware—specifically the **accelerometer** and **GPS**—to detect potential accidents and provide an immediate communication link to emergency services.### Core Features* 🚨 **Auto-Detection:** Real-time monitoring of G-force impacts via accelerometer.* 📍 **Precise Tracking:** Live GPS integration for accurate rescue coordination.* 🔴 **Manual SOS:** One-tap emergency trigger with a safety countdown to prevent false alarms.* 📱 **Responsive Design:** Optimized for mobile browsers using Tailwind CSS.* ⚡ **Real-time Sync:** Low-latency data transmission via Socket.io.


---## 🛠️ Tech Stack


| Layer | Technology |

| :--- | :--- |

| **Framework** | React 18 (Functional Components & Hooks) |

| **Language** | TypeScript (Strict Type Safety) |

| **Styling** | Tailwind CSS (Utility-first CSS) |

| **Real-time** | Socket.IO Client |

| **Build Tool** | Vite (Ultra-fast HMR) |


---## 📁 Project Structure```text

client/

├── src/

│   ├── components/      # UI Elements (SOS Button, Map, Monitor)

│   ├── hooks/           # Custom Logic (Sensors, Geolocation, Socket)

│   ├── services/        # API and Data Processing

│   ├── types/           # TypeScript Interfaces

│   ├── App.tsx          # Root Layout

│   └── main.tsx         # Entry Point

├── public/              # Static Assets

└── tailwind.config.js   # Style Configuration

🚀 Getting Started

1. Installation

Clone the repository and navigate to the client folder:

Bash


cd client

npm install

2. Configure Backend URL

Update the WebSocket connection in src/hooks/useWebSocket.ts:

TypeScript


const SOCKET_URL = "http://YOUR_LOCAL_IP:5000"; // Use Local IP for mobile testing

3. Run Development Server

Bash


npm run dev

The app will be available at http://localhost:5173.

📱 Mobile Testing Guide

To test the sensor functionality, you must access the app from a physical smartphone:

Network: Ensure your phone and PC are on the same Wi-Fi.

Access: Open your phone's browser and enter http://<YOUR_PC_IP>:5173.

Permissions: * Click "Start Monitoring".

Allow Location Access.

Allow Motion & Orientation (Required for iOS).

Test: Shake the device to simulate impact or press the SOS button.

🧪 Test Scenarios

ScenarioActionExpected ResultImpact DetectionShake phone vigorouslysensor_data event sent with high G-forceManual TriggerPress Red SOS Button5-second countdown startsFalse AlarmPress "Cancel" during SOSEmergency event is abortedLocation SyncMove to a different roomMap marker updates in real-time🔌 API & Socket Events

The frontend interacts with the server using the following events:

Emit sensor_data: Sends { x, y, z, latitude, longitude } every 500ms.

Emit emergency: Triggered when SOS is confirmed.

Listen alert_confirmed: Received when the backend acknowledges an emergency.

🐛 Common Issues

[!IMPORTANT]

HTTPS Requirement: Most mobile browsers (especially Safari) require an HTTPS connection or a localhost origin to access sensors. For production, ensure an SSL certificate is active.

"WebSocket Connection Failed": Verify the backend is running and your firewall isn't blocking port 5000.

"Sensor Data Not Updating": Ensure you have granted permission. On iOS, navigate to Settings > Safari > Motion & Orientation Access.

"Geolocation Timeout": Ensure your device's GPS is turned on and you are not in a location that blocks satellite signals (like a basement).


<div align="center">

<p>Academic project for <strong>Adama Science and Technology University</strong></p>

<sub>Built with ❤️ using the React Ecosystem</sub>

</div>