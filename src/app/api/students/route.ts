import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, createdResponse, errorResponse, paginatedResponse, getPaginationParams } from "@/lib/response";
import type { CreateStudentInput } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams(searchParams);

    const search    = searchParams.get("search")   ?? "";
    const roomId    = searchParams.get("roomId")    ?? undefined;
    const status    = searchParams.get("status")    ?? undefined;
    const feeStatus = searchParams.get("feeStatus") ?? undefined;

    const where: any = {
      ...(search && { OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { cnic:     { contains: search } },
        { phone:    { contains: search } },
      ]}),
      ...(roomId    && { roomId }),
      ...(status    && { status }),
      ...(feeStatus && { fees: { some: { status: feeStatus } } }),
    };

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          room: { select: { roomNumber: true, floor: true } },
          fees: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
        skip, take: limit,
      }),
      prisma.student.count({ where }),
    ]);

    return paginatedResponse(students, total, page, limit);
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to fetch students", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateStudentInput = await req.json();

    const required = ["fullName", "fatherName", "cnic", "phone", "roomId", "bedNo", "joiningDate"];
    for (const field of required) {
      if (!body[field as keyof CreateStudentInput]) return errorResponse(`${field} is required`);
    }

    const existing = await prisma.student.findUnique({ where: { cnic: body.cnic } });
    if (existing) return errorResponse("Student with this CNIC already exists");

    const bedTaken = await prisma.student.findFirst({
      where: { roomId: body.roomId, bedNo: body.bedNo, status: "active" },
    });
    if (bedTaken) return errorResponse("This bed is already occupied");

    const room = await prisma.room.findUnique({ where: { id: body.roomId } });
    if (!room) return errorResponse("Room not found");

    const occupiedCount = await prisma.student.count({ where: { roomId: body.roomId, status: "active" } });
    if (occupiedCount >= room.capacity) return errorResponse("Room is at full capacity");

    const student = await prisma.student.create({
      data: {
        fullName:    body.fullName,
        fatherName:  body.fatherName,
        cnic:        body.cnic,
        phone:       body.phone,
        email:       body.email,
        roomId:      body.roomId,
        bedNo:       body.bedNo,
        joiningDate: new Date(body.joiningDate),
        photoUrl:    (body as any).photoUrl,
      },
      include: { room: { select: { roomNumber: true, floor: true } } },
    });

    return createdResponse(student, "Student registered successfully");
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to create student", 500);
  }
}
