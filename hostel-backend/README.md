# Hostel Management System — Backend (Next.js)

## 7 Database Tables
| # | Table | Purpose |
|---|-------|---------|
| 1 | User | Admin, warden, staff accounts + roles |
| 2 | Student | Registered students + room/bed assignment |
| 3 | Room | Room inventory with bed capacity |
| 4 | Fee | Monthly fee records per student |
| 5 | Complaint | Maintenance/issue complaints |
| 6 | Visitor | Gate entry/exit log |
| 7 | Notice | Announcements and notices |

---

## Setup

```bash
npm install
npm install prisma @prisma/client bcryptjs
npm install -D @types/bcryptjs ts-node

cp .env.example .env.local

npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
npm run dev
```

Seed credentials:
- admin@hostel.com / admin1234
- warden@hostel.com / staff1234
- reception@hostel.com / staff1234

---

## API Reference

GET  /api/dashboard
GET  /api/users            POST /api/users
GET  /api/users/[id]       PATCH /api/users/[id]       DELETE /api/users/[id]
GET  /api/students         POST /api/students
GET  /api/students/[id]    PATCH /api/students/[id]    DELETE /api/students/[id]
GET  /api/rooms            POST /api/rooms
GET  /api/rooms/[id]                                   DELETE /api/rooms/[id]
GET  /api/fees             POST /api/fees
GET  /api/complaints       POST /api/complaints
GET  /api/complaints/[id]  PATCH /api/complaints/[id]  DELETE /api/complaints/[id]
GET  /api/visitors         POST /api/visitors
GET  /api/visitors/[id]    PATCH /api/visitors/[id]
GET  /api/notices          POST /api/notices
GET  /api/notices/[id]     PATCH /api/notices/[id]     DELETE /api/notices/[id]
