import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createdResponse, errorResponse, paginatedResponse, getPaginationParams } from "@/lib/response";
import type { CreateVisitorInput } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams(searchParams);

    const status    = searchParams.get("status")    ?? undefined;
    const date      = searchParams.get("date")      ?? undefined;
    const studentId = searchParams.get("studentId") ?? undefined;
    const search    = searchParams.get("search")    ?? "";

    const where: any = {
      ...(status    && { status }),
      ...(studentId && { studentId }),
      ...(search    && { OR: [
        { visitorName:  { contains: search, mode: "insensitive" } },
        { cnic:         { contains: search } },
        { visitorPhone: { contains: search } },
      ]}),
      ...(date && {
        entryTime: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lte: new Date(`${date}T23:59:59.999Z`),
        },
      }),
    };

    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        where,
        include: {
          student:  { select: { fullName: true, room: { select: { roomNumber: true } } } },
          loggedBy: { select: { name: true } },
        },
        orderBy: { entryTime: "desc" },
        skip, take: limit,
      }),
      prisma.visitor.count({ where }),
    ]);

    const formatted = visitors.map((v) => ({
      ...v,
      studentName:  v.student?.fullName,
      roomNumber:   v.student?.room?.roomNumber,
      loggedByName: v.loggedBy.name,
    }));

    return paginatedResponse(formatted, total, page, limit);
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to fetch visitors", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateVisitorInput & { loggedById: string } = await req.json();

    if (!body.visitorName || !body.purpose || !body.loggedById) {
      return errorResponse("visitorName, purpose, and loggedById are required");
    }

    const staff = await prisma.user.findUnique({ where: { id: body.loggedById } });
    if (!staff) return errorResponse("Staff member not found");

    if (body.studentId) {
      const student = await prisma.student.findUnique({ where: { id: body.studentId } });
      if (!student) return errorResponse("Student not found");
    }

    const visitor = await prisma.visitor.create({
      data: {
        visitorName:  body.visitorName,
        visitorPhone: body.visitorPhone,
        cnic:         body.cnic,
        purpose:      body.purpose,
        studentId:    body.studentId,
        loggedById:   body.loggedById,
        remarks:      body.remarks,
        status:       "inside",
      },
      include: {
        student:  { select: { fullName: true, room: { select: { roomNumber: true } } } },
        loggedBy: { select: { name: true } },
      },
    });

    return createdResponse(
      {
        ...visitor,
        studentName:  visitor.student?.fullName,
        roomNumber:   visitor.student?.room?.roomNumber,
        loggedByName: visitor.loggedBy.name,
      },
      "Visitor entry logged"
    );
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to log visitor", 500);
  }
}
