import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/response";
import type { UpdateComplaintInput } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const complaint = await prisma.complaint.findUnique({
      where:   { id },
      include: {
        student: { select: { fullName: true, phone: true } },
        room:    { select: { roomNumber: true, floor: true } },
      },
    });
    if (!complaint) return notFoundResponse("Complaint");
    return successResponse(complaint);
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to fetch complaint", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body: UpdateComplaintInput = await req.json();
    if (!body.status) return errorResponse("status is required");

    const exists = await prisma.complaint.findUnique({ where: { id } });
    if (!exists) return notFoundResponse("Complaint");

    const complaint = await prisma.complaint.update({
      where: { id },
      data:  {
        status:         body.status as any,
        ...(body.resolutionNote && { resolutionNote: body.resolutionNote }),
      },
      include: {
        student: { select: { fullName: true } },
        room:    { select: { roomNumber: true } },
      },
    });

    return successResponse(complaint, "Complaint updated successfully");
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to update complaint", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const exists = await prisma.complaint.findUnique({ where: { id } });
    if (!exists) return notFoundResponse("Complaint");

    await prisma.complaint.delete({ where: { id } });
    return successResponse(null, "Complaint deleted");
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to delete complaint", 500);
  }
}
