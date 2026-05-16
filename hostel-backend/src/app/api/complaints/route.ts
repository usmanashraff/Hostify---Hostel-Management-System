import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  getPaginationParams,
} from "@/lib/response";
import { CreateComplaintInput } from "@/types";

// GET /api/complaints?status=open&category=water
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams(searchParams);

    const status = searchParams.get("status") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const studentId = searchParams.get("studentId") ?? undefined;

    const where: any = {
      ...(status && { status }),
      ...(category && { category }),
      ...(studentId && { studentId }),
    };

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          student: { select: { fullName: true } },
          room: { select: { roomNumber: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.complaint.count({ where }),
    ]);

    return paginatedResponse(
      complaints.map((c) => ({
        ...c,
        studentName: c.student.fullName,
        roomNumber: c.room.roomNumber,
      })),
      total,
      page,
      limit
    );
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to fetch complaints", 500);
  }
}

// POST /api/complaints
export async function POST(req: NextRequest) {
  try {
    const body: CreateComplaintInput = await req.json();

    if (!body.studentId || !body.roomId || !body.category || !body.description) {
      return errorResponse("studentId, roomId, category, and description are required");
    }

    const student = await prisma.student.findUnique({ where: { id: body.studentId } });
    if (!student) return errorResponse("Student not found");

    const complaint = await prisma.complaint.create({
      data: {
        studentId: body.studentId,
        roomId: body.roomId,
        category: body.category as any,
        description: body.description,
        status: "open",
      },
      include: {
        student: { select: { fullName: true } },
        room: { select: { roomNumber: true } },
      },
    });

    return createdResponse(
      { ...complaint, studentName: complaint.student.fullName, roomNumber: complaint.room.roomNumber },
      "Complaint submitted successfully"
    );
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to submit complaint", 500);
  }
}
