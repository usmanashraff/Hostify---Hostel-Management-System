// prisma/seed.ts
// Run: npx ts-node prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── 1. Users (Staff) ────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin1234", 10);
  const staffPassword = await bcrypt.hash("staff1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@hostel.com" },
    update: {},
    create: {
      name: "Muhammad Imran",
      email: "admin@hostel.com",
      phone: "03001234567",
      passwordHash: adminPassword,
      role: "admin",
    },
  });

  const warden = await prisma.user.upsert({
    where: { email: "warden@hostel.com" },
    update: {},
    create: {
      name: "Dr. Khalid Mehmood",
      email: "warden@hostel.com",
      phone: "03019876543",
      passwordHash: staffPassword,
      role: "warden",
    },
  });

  const staff1 = await prisma.user.upsert({
    where: { email: "reception@hostel.com" },
    update: {},
    create: {
      name: "Tariq Hussain",
      email: "reception@hostel.com",
      phone: "03211112222",
      passwordHash: staffPassword,
      role: "staff",
    },
  });

  console.log("✅ Users seeded");

  // ── 2. Rooms ─────────────────────────────────────────────────────────────
  const roomData = [
    { roomNumber: "101", floor: 1, type: "FOUR_BED" as const, capacity: 4 },
    { roomNumber: "102", floor: 1, type: "FOUR_BED" as const, capacity: 4 },
    { roomNumber: "103", floor: 1, type: "TWO_BED"  as const, capacity: 2 },
    { roomNumber: "201", floor: 2, type: "SIX_BED"  as const, capacity: 6 },
    { roomNumber: "202", floor: 2, type: "FOUR_BED" as const, capacity: 4 },
    { roomNumber: "203", floor: 2, type: "TWO_BED"  as const, capacity: 2 },
  ];

  const rooms = await Promise.all(
    roomData.map((r) =>
      prisma.room.upsert({
        where: { roomNumber: r.roomNumber },
        update: {},
        create: r,
      })
    )
  );

  console.log("✅ Rooms seeded");

  // ── 3. Students ──────────────────────────────────────────────────────────
  const studentData = [
    { fullName: "Ali Hassan",       fatherName: "Ghulam Hassan",    cnic: "3520112345671", phone: "03001111111", roomIdx: 0, bedNo: 1 },
    { fullName: "Usman Tariq",      fatherName: "Tariq Mehmood",    cnic: "3520112345672", phone: "03002222222", roomIdx: 0, bedNo: 2 },
    { fullName: "Bilal Ahmed",      fatherName: "Ahmed Raza",       cnic: "3520112345673", phone: "03003333333", roomIdx: 0, bedNo: 3 },
    { fullName: "Faisal Iqbal",     fatherName: "Iqbal Hussain",    cnic: "3520112345674", phone: "03004444444", roomIdx: 0, bedNo: 4 },
    { fullName: "Hamza Khan",       fatherName: "Naseer Khan",      cnic: "3520112345675", phone: "03005555555", roomIdx: 1, bedNo: 1 },
    { fullName: "Zain ul Abideen", fatherName: "Abid Ali",         cnic: "3520112345676", phone: "03006666666", roomIdx: 1, bedNo: 2 },
    { fullName: "Saad Malik",       fatherName: "Javed Malik",      cnic: "3520112345677", phone: "03007777777", roomIdx: 2, bedNo: 1 },
    { fullName: "Asad Mehmood",     fatherName: "Mehmood Akhtar",   cnic: "3520112345678", phone: "03008888888", roomIdx: 3, bedNo: 1 },
    { fullName: "Omer Farooq",      fatherName: "Farooq Ahmad",     cnic: "3520112345679", phone: "03009999999", roomIdx: 3, bedNo: 2 },
    { fullName: "Kamran Shahid",    fatherName: "Shahid Pervaiz",   cnic: "3520112345680", phone: "03010000000", roomIdx: 4, bedNo: 1 },
  ];

  const students = await Promise.all(
    studentData.map((s) =>
      prisma.student.upsert({
        where: { cnic: s.cnic },
        update: {},
        create: {
          fullName: s.fullName,
          fatherName: s.fatherName,
          cnic: s.cnic,
          phone: s.phone,
          roomId: rooms[s.roomIdx].id,
          bedNo: s.bedNo,
          joiningDate: new Date("2025-01-15"),
          status: "active",
        },
      })
    )
  );

  console.log("✅ Students seeded");

  // ── 4. Fees ──────────────────────────────────────────────────────────────
  const months = ["2025-03", "2025-04", "2025-05"];
  const feeAmount = 5000;

  for (const student of students.slice(0, 7)) {
    for (const month of months) {
      const isPaid = Math.random() > 0.3;
      await prisma.fee.upsert({
        where: { studentId_month: { studentId: student.id, month } },
        update: {},
        create: {
          studentId: student.id,
          roomId: student.roomId,
          amount: feeAmount,
          month,
          status: isPaid ? "paid" : "unpaid",
          paymentMode: isPaid ? "cash" : undefined,
          paymentDate: isPaid ? new Date() : undefined,
        },
      });
    }
  }

  console.log("✅ Fees seeded");

  // ── 5. Complaints ────────────────────────────────────────────────────────
  await prisma.complaint.createMany({
    skipDuplicates: true,
    data: [
      { studentId: students[0].id, roomId: rooms[0].id, category: "electricity", description: "Light bulb is not working in room 101", status: "open" },
      { studentId: students[2].id, roomId: rooms[0].id, category: "water",       description: "Water tap leaking in bathroom",          status: "in_progress", resolutionNote: "Plumber called" },
      { studentId: students[4].id, roomId: rooms[1].id, category: "cleanliness", description: "Cleaning not done for 3 days",           status: "open" },
      { studentId: students[6].id, roomId: rooms[2].id, category: "other",       description: "Room door lock is broken",               status: "resolved",    resolutionNote: "Lock replaced on 10 May" },
      { studentId: students[8].id, roomId: rooms[3].id, category: "electricity", description: "Fan not working since last week",         status: "open" },
    ],
  });

  console.log("✅ Complaints seeded");

  // ── 6. Visitors ──────────────────────────────────────────────────────────
  await prisma.visitor.createMany({
    skipDuplicates: true,
    data: [
      { visitorName: "Ghulam Hassan",   visitorPhone: "03331234567", cnic: "3520112345691", purpose: "Family visit",    studentId: students[0].id, loggedById: staff1.id, status: "exited",  entryTime: new Date("2025-05-14T10:00:00"), exitTime: new Date("2025-05-14T12:00:00") },
      { visitorName: "Naseer Khan",     visitorPhone: "03339876543", cnic: "3520112345692", purpose: "Fee payment",     studentId: students[4].id, loggedById: staff1.id, status: "exited",  entryTime: new Date("2025-05-15T09:30:00"), exitTime: new Date("2025-05-15T10:00:00") },
      { visitorName: "Javed Malik",     visitorPhone: "03335551234", cnic: "3520112345693", purpose: "Family visit",    studentId: students[6].id, loggedById: staff1.id, status: "inside",  entryTime: new Date() },
      { visitorName: "Rehmat Ullah",    visitorPhone: "03336662345", cnic: "3520112345694", purpose: "Guest of admin",  studentId: null,           loggedById: admin.id,  status: "exited",  entryTime: new Date("2025-05-16T08:00:00"), exitTime: new Date("2025-05-16T08:45:00") },
    ],
  });

  console.log("✅ Visitors seeded");

  // ── 7. Notices ───────────────────────────────────────────────────────────
  await prisma.notice.createMany({
    skipDuplicates: true,
    data: [
      { title: "Fee submission deadline",  content: "All students must submit May fee by 20th May 2025. Late fee Rs. 200 per day.",       priority: "urgent", isActive: true, postedById: admin.id,  expiresAt: new Date("2025-05-20") },
      { title: "Water supply shutdown",    content: "Water supply will be off on 17 May from 9am to 2pm for maintenance.",                priority: "high",   isActive: true, postedById: warden.id, expiresAt: new Date("2025-05-17") },
      { title: "Curfew reminder",          content: "All students must return to hostel by 10:00 PM. No exceptions without prior permission.", priority: "normal", isActive: true, postedById: warden.id },
      { title: "Cleanliness drive",        content: "A hostel cleanliness inspection will be conducted on 18 May. Please keep rooms tidy.", priority: "normal", isActive: true, postedById: admin.id },
    ],
  });

  console.log("✅ Notices seeded");
  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin   → admin@hostel.com    / admin1234");
  console.log("   Warden  → warden@hostel.com   / staff1234");
  console.log("   Staff   → reception@hostel.com / staff1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
