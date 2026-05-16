# <p align="center">🏠 Hostify — Premium Hostel Management</p>

<p align="center">
  <img src="./dashboard-mockup.png" alt="Hostify Dashboard Mockup" width="800" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
</p>

<p align="center">
  <strong>The ultimate solution for modern hostel administration.</strong><br>
  Built with precision using Next.js 16, Prisma 7, and PostgreSQL.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
</p>

---

## ✨ Features

Hostify is designed to streamline every aspect of hostel management with a focus on user experience and data integrity.

- 👥 **Student Management** — Comprehensive profiles with photo uploads, CNIC tracking, and room history.
- 🛏️ **Smart Room Allocation** — Real-time bed availability tracking and floor-wise room management.
- 💳 **Fee Automation** — Monthly fee collection, digital receipts, and overdue payment tracking.
- 🚧 **Complaint Portal** — Maintenance tracking for electricity, water, and cleanliness issues.
- 🚪 **Visitor Logs** — Secure entry/exit logging for guests with real-time "Inside" status.
- 📢 **Notice Board** — High-priority announcements for residents.
- 📊 **Insightful Dashboard** — At-a-glance occupancy rates, financial metrics, and activity feeds.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0+)
- **PostgreSQL** (Local or Remote instance)

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/hostelite?schema=public"

# Authentication Security
NEXTAUTH_SECRET="your-secure-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Installation
```bash
# Clone the repository and install dependencies
npm install

# Initialize Prisma & Sync Schema
npx prisma generate
npx prisma migrate dev --name init

# Seed initial demo data
npm run prisma:seed
```

### 4. Launch
```bash
npm run dev
```

---

## 🔑 Default Credentials

After seeding, access the system with these pre-configured roles:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@hostel.com` | `admin1234` |
| **Staff** | `reception@hostel.com` | `staff1234` |

---

## 📂 Project Structure

```text
├── prisma/               # Database schema & migrations
├── public/               # Static assets & user uploads
├── src/
│   ├── app/              # Next.js App Router (Routes & API)
│   ├── components/       # UI Library & Page Components
│   ├── lib/              # Utils, API clients & database init
│   ├── types/            # TypeScript definitions
│   └── proxy.ts          # Authentication middleware
├── prisma.config.ts      # Prisma 7 configuration
└── tailwind.config.ts    # Styling configuration
```

---

## 🛠 Advanced Configuration

Hostify uses the latest **Prisma 7** architecture with **Driver Adapters** for optimized database connectivity. It also implements the **Next.js 16 Proxy** convention for secure, edge-compatible authentication.

---

<p align="center">
  Built with ❤️ for Hostel Administrators everywhere.
</p>
