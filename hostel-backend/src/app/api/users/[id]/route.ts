import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/response";
import { UpdateUserInput } from "@/types";
import bcrypt from "bcryptjs";

type Params = { params: { id: string } };

const safeSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
};

// GET /api/users/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: safeSelect,
    });

    if (!user) return notFoundResponse("User");
    return successResponse(user);
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to fetch user", 500);
  }
}

// PATCH /api/users/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body: UpdateUserInput & { password?: string } = await req.json();

    const exists = await prisma.user.findUnique({ where: { id: params.id } });
    if (!exists) return notFoundResponse("User");

    const updateData: any = {
      ...(body.name && { name: body.name }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.role && { role: body.role }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    };

    // Allow password reset
    if (body.password) {
      if (body.password.length < 8) return errorResponse("Password must be at least 8 characters");
      updateData.passwordHash = await bcrypt.hash(body.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: safeSelect,
    });

    return successResponse(user, "User updated successfully");
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to update user", 500);
  }
}

// DELETE /api/users/[id]  — soft delete (deactivate)
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const exists = await prisma.user.findUnique({ where: { id: params.id } });
    if (!exists) return notFoundResponse("User");

    await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return successResponse(null, "User deactivated successfully");
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to deactivate user", 500);
  }
}
