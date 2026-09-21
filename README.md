# METRYA — Smart Legal Metrology Verification & Digital Certification Platform

> **Tagline:** Modernizing the verification and certification lifecycle for weighing and measuring instruments with dynamic tolerance calculations, digital inspections, and tamper-evident QR certificates.

---

## 📌 Notice
*Metrya is a prototype system inspired by the SIH problem statement for an online verification and certification platform for weighing and measuring instruments. It is designed to demonstrate digital workflows and is not an official government system.*

---

## 🚀 Key Features

1. **Role-Based Access Control (RBAC)**
   - Four distinct user roles: **Instrument Owner (`USER`)**, **Legal Metrology Officer (`LMO`)**, **Testing Centre (`GATC`)**, and **Super Administrator (`SUPER_ADMIN`)**.
   - Strict server-side token, identity, role, and resource ownership verification.

2. **Instrument Registry & Geolocation**
   - Register commercial and industrial weighing/measuring devices with manufacturer details, rated capacities, accuracy classes (Class I, II, III, IIII), unit of measure, and facility address.
   - Unique Instrument ID generation (e.g. `INS-2026-000101`).

3. **Controlled State Machine Workflow**
   - Strict status transition logic:
     $$\text{DRAFT} \longrightarrow \text{SUBMITTED} \longrightarrow \text{UNDER\_REVIEW} \longrightarrow \text{ASSIGNED} \longrightarrow \text{SCHEDULED} \longrightarrow \text{INSPECTION\_IN\_PROGRESS} \longrightarrow \text{INSPECTION\_COMPLETED} \longrightarrow \text{APPROVED} \longrightarrow \text{CERTIFICATE\_GENERATED}$$
   - Status history tracking with timestamped actor logs and comments.

4. **Digital Inspection & Metrological Calculation Engine**
   - Dynamic evaluation of test points against configurable Legal Metrology rules:
     $$\text{Error} = \text{Observed Value} - \text{Reference Value}$$
     $$\text{Percentage Error} = \left(\frac{\text{Observed Value} - \text{Reference Value}}{\text{Reference Value}}\right) \times 100$$
   - Live compliance pills determining `PASS` / `FAIL` per test point against Maximum Permissible Error (MPE) thresholds.
   - Physical checklist (Digital display condition, calibration seal integrity, nameplate markings, spirit level alignment, and electrical safety).

5. **Tamper-Evident Digital Certificates & QR Verification**
   - Automatic generation of verified certificates with unique numbers (e.g. `MET-CERT-2026-000101`).
   - High-resolution QR code embedded in both frontend previews and official downloadable PDF documents.
   - Public Verification endpoint (`/verify/:certificateNumber`) delivering sanitized public compliance status (`VALID`, `EXPIRED`, `REVOKED`, `NOT FOUND`).

6. **Automated Expiry Daemon & Validity Monitoring**
   - Background daemon monitoring certificate validity cycles.
   - Multi-threshold alerts dispatched at 30 days, 15 days, 7 days, and 1 day prior to expiration.

7. **Directorate Analytics, Rules Engine & Data Export**
   - Executive dashboard featuring monthly verification throughput trends, instrument category distributions, and officer workload rankings.
   - Configurable legal tolerance rules manager for Super Admins.
   - 1-Click export of applications, certificates, and instrument registries to CSV.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, React Router v7, Axios, Lucide React, Recharts, Custom Metrology CSS Design System.
- **Backend:** Node.js, Express.js, MongoDB, Mongoose ODM, JSON Web Tokens (JWT), bcryptjs, Multer, PDFKit, QRCode, Helmet, Morgan, Express-Rate-Limit.
- **Database:** MongoDB (Local or MongoDB Atlas).

---

## 👥 Demo Accounts & Credentials

| Role | Email | Password | Primary Functions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@demo.com` | `Password123!` | System analytics, rule configuration, audit logs, CSV exports |
| **LMO Officer** | `lmo@demo.com` | `Password123!` | Review applications, field inspections, approval/rejection decisions |
| **GATC Centre** | `gatc@demo.com` | `Password123!` | Laboratory calibration bays, testing slots, measurement records |
| **Business Owner** | `user@demo.com` | `Password123!` | Register instruments, apply for verification, download certificates |
| **Retail User** | `retail@demo.com` | `Password123!` | Retail scale verification tracking |

---

## 🏗️ Architecture & Folder Structure

```text
Metrya/
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection & system constants
│   │   ├── controllers/        # REST endpoint handlers
│   │   ├── middleware/         # JWT Auth, RBAC, Multer & Error handler
│   │   ├── models/             # Mongoose schemas (10 collections)
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Tolerance engine, PDFKit & QR generator
│   │   ├── utils/              # ID generators, seed data & audit logger
│   │   └── jobs/               # Automated expiry monitor daemon
│   ├── tests/                  # End-to-end integration test runner
│   ├── uploads/                # Uploaded photos & generated certificate PDFs
│   ├── server.js               # Express application entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Sidebar, Modals, Badges, Timeline)
│   │   ├── context/            # AuthContext & NotificationContext
│   │   ├── layouts/            # PublicLayout & DashboardLayout
│   │   ├── pages/              # Landing, PublicVerify, Dashboards, Inspections, etc.
│   │   ├── routes/             # AppRoutes & ProtectedRoute guards
│   │   ├── services/           # Axios API client & modular services
│   │   └── styles/             # Metrology Slate & Navy CSS design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup & Local Installation

### Prerequisites
- **Node.js**: v18+ (tested on v24)
- **MongoDB**: Running locally or MongoDB Atlas connection string

### 1. Backend Setup
```bash
cd backend
npm install
# Create/verify .env file
npm run seed     # Seeds demo users, instruments, rules, and certificates
npm start        # Starts API server on port 5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

### 3. Run Automated Tests
```bash
cd backend
node tests/e2eTest.js
```

---

## 📡 Key API Endpoints

- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET  /api/public/verify/:identifier` — Public certificate / QR verification
- `GET  /api/instruments` — List registered instruments
- `POST /api/instruments` — Register a new instrument
- `GET  /api/applications` — List verification applications
- `POST /api/applications/:id/schedule` — Schedule inspection slot
- `POST /api/inspections` — Record digital inspection measurements & checklist
- `POST /api/inspections/calculate-tolerance` — Live metrology formula calculation
- `POST /api/certificates/generate/:applicationId` — Issue digital certificate & generate PDF
- `GET  /api/certificates/:id/download` — Download official certificate PDF
- `GET  /api/admin/analytics` — Executive department KPI metrics and trends
- `GET  /api/admin/export-report` — Export CSV reports (applications, certificates, instruments)

---

## 🚢 Production Deployment

- **Frontend (Vercel):** Build command `npm run build`, Output directory `dist`, Environment variable `VITE_API_URL=https://your-backend.onrender.com/api`.
- **Backend (Render):** Start command `node server.js`, Environment variables `PORT=5000`, `MONGO_URI=<Atlas URI>`, `JWT_SECRET=<Secret>`, `CLIENT_URL=<Vercel URL>`.
- **Database (MongoDB Atlas):** Configure IP access list and standard connection string.
