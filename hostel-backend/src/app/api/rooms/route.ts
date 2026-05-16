import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  getPaginationParams,
} from "@/lib/response";
import { CreateRoomInput } from "@/types";

// GET /api/rooms
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams(searchParams);
    const filter = searchParams.get("filter"); // "available" | "full"

    const rooms = await prisma.room.findMany({
      include: {
        students: {
          where: { status: "active" },
          select: { id: true, fullName: true, bedNo: true },
        },
      },
      orderBy: [{ floor: "asc" }, { roomNumber: "asc" }],
      skip,
      take: limit,
    });

    // Build bed-level view
    const roomsWithBeds = rooms.map((room) => {
      const beds = Array.from({ length: room.capacity }, (_, i) => {
        const bedNo = i + 1;
        const student = room.students.find((s) => s.bedNo === bedNo);
        return {
          bedNo,
          isOccupied: !!student,
          studentId: student?.id,
          studentName: student?.fullName,
        };
      });

      return {
        ...room,
        occupied: room.students.length,
        beds,
      };
    });

    // Filter after building bed view
    const filtered =
      filter === "available"
        ? roomsWithBeds.filter((r) => r.occupied < r.capacity)
        : filter === "full"
        ? roomsWithBeds.filter((r) => r.occupied === r.capacity)
        : roomsWithBeds;

    return paginatedResponse(filtered, filtered.length, page, limit);
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to fetch rooms", 500);
  }
}

// POST /api/rooms
export async function POST(req: NextRequest) {
  try {
    const body: CreateRoomInput = await req.json();

    if (!body.roomNumber || !body.floor || !body.type) {
      return errorResponse("roomNumber, floor, and type are required");
    }

    const existing = await prisma.room.findUnique({
      where: { roomNumber: body.roomNumber },
    });
    if (existing) return errorResponse("Room number already exists");

    const capacityMap = { "2-bed": 2, "4-bed": 4, "6-bed": 6 };
    const typeMap: Record<string, any> = {
      "2-bed": "TWO_BED",
      "4-bed": "FOUR_BED",
      "6-bed": "SIX_BED",
    };

    const room = await prisma.room.create({
      data: {
        roomNumber: body.roomNumber,
        floor: body.floor,
        type: typeMap[body.type],
        capacity: capacityMap[body.type],
      },
    });

    return createdResponse(room, "Room created successfully");
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to create room", 500);
  }
}
