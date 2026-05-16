import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  getPaginationParams,
} from "@/lib/response";
import { CreateUserInput } from "@/types";
import bcrypt from "bcryptjs";

// GET /api/users
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams(searchParams);
    const role = searchParams.get("role") ?? undefined;
    const search = searchParams.get("search") ?? "";

    const where: any = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          // never return passwordHash
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return paginatedResponse(users, total, page, limit);
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to fetch users", 500);
  }
}

// POST /api/users  — create staff account
export async function POST(req: NextRequest) {
  try {
    const body: CreateUserInput = await req.json();

    if (!body.name || !body.email || !body.password || !body.role) {
      return errorResponse("name, email, password, and role are required");
    }

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return errorResponse("Email already registered");

    if (body.password.length < 8) {
      return errorResponse("Password must be at least 8 characters");
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        passwordHash,
        role: body.role as any,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return createdResponse(user, "Staff account created successfully");
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to create user", 500);
  }
}
