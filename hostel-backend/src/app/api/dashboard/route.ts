import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";

// GET /api/dashboard
export async function GET(_req: NextRequest) {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [
      totalStudents,
      totalBeds,
      pendingFees,
      openComplaints,
      visitorsInside,
      activeNotices,
      recentStudents,
      recentComplaints,
      recentVisitors,
      recentNotices,
    ] = await Promise.all([
      prisma.student.count({ where: { status: "active" } }),
      prisma.room.aggregate({ _sum: { capacity: true } }),
      prisma.fee.count({ where: { month: currentMonth, status: { in: ["unpaid", "partial"] } } }),
      prisma.complaint.count({ where: { status: "open" } }),
      prisma.visitor.count({ where: { status: "inside" } }),
      prisma.notice.count({
        where: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
      }),
      prisma.student.findMany({
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { id: true, fullName: true, createdAt: true, room: { select: { roomNumber: true } } },
      }),
      prisma.complaint.findMany({
        where: { status: "open" },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { student: { select: { fullName: true } }, room: { select: { roomNumber: true } } },
      }),
      prisma.visitor.findMany({
        where: { status: "inside" },
        orderBy: { entryTime: "desc" },
        take: 3,
        include: { student: { select: { fullName: true } } },
      }),
      prisma.notice.findMany({
        where: { isActive: true },
        orderBy: { publishedAt: "desc" },
        take: 2,
        select: { id: true, title: true, priority: true, publishedAt: true },
      }),
    ]);

    const totalCapacity = totalBeds._sum.capacity ?? 0;
    const occupiedBeds = totalStudents;
    const vacantBeds = totalCapacity - occupiedBeds;

    const activityFeed = [
      ...recentStudents.map((s) => ({
        id: `student-${s.id}`,
        action: "New student checked in",
        description: `${s.fullName} — Room ${s.room.roomNumber}`,
        timestamp: s.createdAt.toISOString(),
        type: "student",
      })),
      ...recentComplaints.map((c) => ({
        id: `complaint-${c.id}`,
        action: "Complaint filed",
        description: `${c.student.fullName} — ${c.category} (Room ${c.room.roomNumber})`,
        timestamp: c.createdAt.toISOString(),
        type: "complaint",
      })),
      ...recentVisitors.map((v) => ({
        id: `visitor-${v.id}`,
        action: "Visitor logged in",
        description: `${v.visitorName} visiting ${v.student?.fullName ?? "hostel"}`,
        timestamp: v.entryTime.toISOString(),
        type: "visitor",
      })),
      ...recentNotices.map((n) => ({
        id: `notice-${n.id}`,
        action: "Notice published",
        description: `${n.title} [${n.priority}]`,
        timestamp: n.publishedAt.toISOString(),
        type: "notice",
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return successResponse({
      stats: { totalStudents, occupiedBeds, vacantBeds, totalCapacity, pendingFees, openComplaints, visitorsInside, activeNotices },
      activityFeed,
    });
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to fetch dashboard data", 500);
  }
}
