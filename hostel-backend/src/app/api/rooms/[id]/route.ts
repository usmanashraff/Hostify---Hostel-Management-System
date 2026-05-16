import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/response";

type Params = { params: { id: string } };

// GET /api/rooms/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        students: {
          where: { status: "active" },
          select: { id: true, fullName: true, bedNo: true, phone: true, joiningDate: true },
        },
      },
    });

    if (!room) return notFoundResponse("Room");

    const beds = Array.from({ length: room.capacity }, (_, i) => {
      const bedNo = i + 1;
      const student = room.students.find((s) => s.bedNo === bedNo);
      return { bedNo, isOccupied: !!student, student: student ?? null };
    });

    return successResponse({ ...room, beds, occupied: room.students.length });
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to fetch room", 500);
  }
}

// DELETE /api/rooms/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: { students: { where: { status: "active" } } },
    });

    if (!room) return notFoundResponse("Room");
    if (room.students.length > 0) {
      return errorResponse("Cannot delete a room with active students");
    }

    await prisma.room.delete({ where: { id: params.id } });
    return successResponse(null, "Room deleted successfully");
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to delete room", 500);
  }
}
