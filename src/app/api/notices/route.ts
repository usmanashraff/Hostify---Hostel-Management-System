import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createdResponse, errorResponse, paginatedResponse, getPaginationParams } from "@/lib/response";
import type { CreateNoticeInput } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams(searchParams);

    const priority = searchParams.get("priority") ?? undefined;
    const isActive = searchParams.get("isActive");

    const where: any = {
      ...(priority               && { priority }),
      ...(isActive !== null      && { isActive: isActive === "true" }),
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    };

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        include: { postedBy: { select: { name: true, role: true } } },
        orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
        skip, take: limit,
      }),
      prisma.notice.count({ where }),
    ]);

    return paginatedResponse(
      notices.map((n) => ({ ...n, postedByName: n.postedBy.name })),
      total, page, limit
    );
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to fetch notices", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateNoticeInput & { postedById: string } = await req.json();

    if (!body.title || !body.content || !body.postedById) {
      return errorResponse("title, content, and postedById are required");
    }

    const poster = await prisma.user.findUnique({ where: { id: body.postedById } });
    if (!poster) return errorResponse("Posted by user not found");

    const notice = await prisma.notice.create({
      data: {
        title:      body.title,
        content:    body.content,
        priority:   (body.priority as any) ?? "normal",
        expiresAt:  body.expiresAt ? new Date(body.expiresAt) : null,
        postedById: body.postedById,
      },
      include: { postedBy: { select: { name: true, role: true } } },
    });

    return createdResponse(
      { ...notice, postedByName: notice.postedBy.name },
      "Notice published successfully"
    );
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to publish notice", 500);
  }
}
