import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const visitor = await prisma.visitor.findUnique({
      where:   { id },
      include: {
        student:  { select: { fullName: true, room: { select: { roomNumber: true } } } },
        loggedBy: { select: { name: true } },
      },
    });
    if (!visitor) return notFoundResponse("Visitor");

    return successResponse({
      ...visitor,
      studentName:  visitor.student?.fullName,
      roomNumber:   visitor.student?.room?.roomNumber,
      loggedByName: visitor.loggedBy.name,
    });
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to fetch visitor", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body: { remarks?: string; exitTime?: string } = await req.json();

    const visitor = await prisma.visitor.findUnique({ where: { id } });
    if (!visitor) return notFoundResponse("Visitor");

    if (visitor.status === "exited") return errorResponse("Visitor has already exited");

    const updated = await prisma.visitor.update({
      where: { id },
      data:  {
        status:   "exited",
        exitTime: body.exitTime ? new Date(body.exitTime) : new Date(),
        remarks:  body.remarks ?? visitor.remarks,
      },
      include: {
        student:  { select: { fullName: true } },
        loggedBy: { select: { name: true } },
      },
    });

    return successResponse(
      { ...updated, studentName: updated.student?.fullName, loggedByName: updated.loggedBy.name },
      "Visitor exit recorded"
    );
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to record exit", 500);
  }
}
