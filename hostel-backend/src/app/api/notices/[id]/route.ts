import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/response";
import { UpdateNoticeInput } from "@/types";

type Params = { params: { id: string } };

// GET /api/notices/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const notice = await prisma.notice.findUnique({
      where: { id: params.id },
      include: { postedBy: { select: { name: true, role: true } } },
    });

    if (!notice) return notFoundResponse("Notice");
    return successResponse({ ...notice, postedByName: notice.postedBy.name });
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to fetch notice", 500);
  }
}

// PATCH /api/notices/[id]  — edit or deactivate
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body: UpdateNoticeInput = await req.json();

    const exists = await prisma.notice.findUnique({ where: { id: params.id } });
    if (!exists) return notFoundResponse("Notice");

    const notice = await prisma.notice.update({
      where: { id: params.id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.content && { content: body.content }),
        ...(body.priority && { priority: body.priority as any }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.expiresAt !== undefined && {
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        }),
      },
      include: { postedBy: { select: { name: true } } },
    });

    return successResponse(
      { ...notice, postedByName: notice.postedBy.name },
      "Notice updated successfully"
    );
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to update notice", 500);
  }
}

// DELETE /api/notices/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const exists = await prisma.notice.findUnique({ where: { id: params.id } });
    if (!exists) return notFoundResponse("Notice");

    await prisma.notice.delete({ where: { id: params.id } });
    return successResponse(null, "Notice deleted");
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to delete notice", 500);
  }
}
