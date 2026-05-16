import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/response";
import { UpdateStudentInput } from "@/types";

type Params = { params: { id: string } };

// GET /api/students/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        room: true,
        fees: { orderBy: { createdAt: "desc" } },
        complaints: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!student) return notFoundResponse("Student");
    return successResponse(student);
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to fetch student", 500);
  }
}

// PATCH /api/students/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body: UpdateStudentInput = await req.json();

    const exists = await prisma.student.findUnique({ where: { id: params.id } });
    if (!exists) return notFoundResponse("Student");

    // If changing bed, check availability
    if (body.bedNo && body.roomId) {
      const bedTaken = await prisma.student.findFirst({
        where: {
          roomId: body.roomId,
          bedNo: body.bedNo,
          status: "active",
          NOT: { id: params.id },
        },
      });
      if (bedTaken) return errorResponse("This bed is already occupied");
    }

    const student = await prisma.student.update({
      where: { id: params.id },
      data: {
        ...body,
        ...(body.joiningDate && { joiningDate: new Date(body.joiningDate) }),
      },
      include: {
        room: { select: { roomNumber: true, floor: true } },
      },
    });

    return successResponse(student, "Student updated successfully");
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to update student", 500);
  }
}

// DELETE /api/students/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const exists = await prisma.student.findUnique({ where: { id: params.id } });
    if (!exists) return notFoundResponse("Student");

    // Soft delete — mark as inactive
    await prisma.student.update({
      where: { id: params.id },
      data: { status: "inactive" },
    });

    return successResponse(null, "Student removed successfully");
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to delete student", 500);
  }
}
