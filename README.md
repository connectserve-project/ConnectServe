# 🌍 ConnectServe

**Social Media & Community Service Management Platform**

ConnectServe bridges community volunteers, non-profit organizations (NGOs), and platform administrators in one place. It blends a social networking layer — profiles, feed, likes, comments, real-time chat, notifications — with a full volunteering/community-service management layer: event publishing, applications, attendance, hour tracking, gamified badges, and downloadable PDF certificates.

<p>
  <img alt="Node" src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black">
  <img alt="Express" src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white">
  <img alt="Socket.IO" src="https://img.shields.io/badge/Realtime-Socket.IO-010101?logo=socket.io&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green">
</p>

---

## 📖 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [API Overview](#-api-overview)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Key Features

### 👥 Multi-Role User Architecture
- **Volunteers** — discover opportunities, apply to events, log verified hours, unlock milestone badges (Bronze / Silver / Gold / Platinum), download certificates, post updates, and message organizers.
- **Organizations / NGOs** — publish events, manage applicant rosters, approve/reject applications, mark attendance, and auto-issue certificates.
- **Administrators** — platform analytics dashboards, user governance, NGO verification, and a content moderation queue.

### 📱 Social Networking
- Personalized feed with media, hashtags, and tagged events
- Likes, threaded comments, and share modals
- Real-time 1:1 chat via Socket.IO (typing indicators, attachments)
- Live in-app notifications with unread counters

### 🌱 Community Service Management
- Multi-filter event discovery (category, location type, date, keyword)
- One-click applications with organizer notes
- Digital attendance marking that auto-logs volunteer hours
- Tamper-evident digital certificates with public verification
- Gamified leaderboard with milestone badges

### ☁️ Media & Infrastructure
- Cloudinary-backed uploads for avatars, banners, post images, and chat attachments
- Responsive, device-optimized image delivery
- Fully responsive UI (mobile → large desktop)

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18 (Vite), React Router, Tailwind CSS, Socket.IO Client, Axios, Recharts, jsPDF, html2canvas, Lucide Icons |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Database** | PostgreSQL (via Supabase) using Sequelize ORM |
| **Auth & Security** | JWT, bcryptjs, Helmet, CORS, express-validator |
| **Media & Email** | Multer + Cloudinary SDK, Nodemailer / Resend / Brevo |

---

## 📁 Project Structure

```
ConnectServe/
├── client/                  # React (Vite) frontend
│   ├── src/
│   │   ├── components/      # UI components (layout, posts, events, certificates, chat, admin)
│   │   ├── pages/           # Route-level pages (Feed, Events, Chat, Dashboards, etc.)
│   │   ├── context/         # Auth / Theme / Socket contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # Axios API service modules
│   │   └── utils/           # Constants, formatters, badge logic
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                  # Express backend
│   ├── config/               # db.js (Sequelize/PostgreSQL), cloudinary.js
│   ├── models/                # Sequelize models
│   ├── controllers/           # MVC controllers
│   ├── routes/                # REST route handlers
│   ├── middleware/            # Auth, RBAC, upload, error handling
│   ├── utils/                 # Seed scripts, email service, badge calculator
│   └── server.js               # HTTP + Socket.IO entry point
└── package.json              # Root scripts (build/start)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ (v24+ supported)
- npm v9+
- A PostgreSQL database (a free [Supabase](https://supabase.com) project works out of the box)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/ConnectServe.git
cd ConnectServe
```

### 2. Configure environment variables
Create a `.env` file inside `server/` (see [Environment Variables](#-environment-variables) below).

### 3. Install dependencies
```bash
npm run build
```
This installs and builds the client, then installs the server dependencies.

### 4. Run the app

**Development (client + server together on Windows):**
```bash
run.bat
```

**Or run each side manually:**
```bash
# Terminal 1 — backend (http://localhost:5000)
npm run server

# Terminal 2 — frontend (http://localhost:5173)
npm run client
```

**Production:**
```bash
npm start
```

---

## 🔑 Environment Variables

Create `server/.env` with the following:

```env
# Server
PORT=5000
CLIENT_URL=http://localhost:5173

# Database (Supabase / PostgreSQL)
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
# — or configure individually —
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=

# Auth
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (choose one provider)
NODEMAILER_EMAIL=
NODEMAILER_PASSWORD=
RESEND_API_KEY=
BREVO_API_KEY=
```

Create `client/.env.development` (already included) with:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run build` | Install & build client, then install server deps |
| `npm start` | Start the production server |
| `npm run server` | Start the backend in dev mode |
| `npm run client` | Start the Vite frontend dev server |
| `npm run seed` | Seed the database with sample data |

---

## 🔌 API Overview

| Route | Description |
|---|---|
| `/api/auth` | Register, login, JWT authentication |
| `/api/users` | Profiles, follow/unfollow, search |
| `/api/posts` | Feed, likes, comments |
| `/api/events` | Event CRUD, discovery, filters |
| `/api/registrations` | Apply, approve/reject, attendance |
| `/api/certificates` | Generate & verify certificates |
| `/api/chat` | Conversations & messages |
| `/api/notifications` | In-app notifications |
| `/api/admin` | Analytics, moderation, NGO verification |

---

## 🗺 Roadmap
- [ ] Push notifications (web/mobile)
- [ ] Organization analytics export (CSV/PDF)
- [ ] Multi-language support
- [ ] Public API documentation (Swagger)

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ for volunteers and the communities they serve.</p>
