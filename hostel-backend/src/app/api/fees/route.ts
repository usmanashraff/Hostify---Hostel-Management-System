import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  getPaginationParams,
} from "@/lib/response";
import { RecordPaymentInput } from "@/types";

// GET /api/fees?month=2025-05&status=unpaid
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams(searchParams);

    const month = searchParams.get("month") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const studentId = searchParams.get("studentId") ?? undefined;

    const where: any = {
      ...(month && { month }),
      ...(status && { status }),
      ...(studentId && { studentId }),
    };

    const [fees, total] = await Promise.all([
      prisma.fee.findMany({
        where,
        include: {
          student: { select: { fullName: true } },
          room: { select: { roomNumber: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.fee.count({ where }),
    ]);

    // Summary totals for the month
    const summary = month
      ? await prisma.fee.aggregate({
          where: { month },
          _sum: { amount: true },
          _count: true,
        })
      : null;

    const paidTotal = month
      ? await prisma.fee.aggregate({
          where: { month, status: "paid" },
          _sum: { amount: true },
        })
      : null;

    return paginatedResponse(
      fees.map((f) => ({
        ...f,
        studentName: f.student.fullName,
        roomNumber: f.room.roomNumber,
      })),
      total,
      page,
      limit
    );
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to fetch fees", 500);
  }
}

// POST /api/fees  — record a payment
export async function POST(req: NextRequest) {
  try {
    const body: RecordPaymentInput = await req.json();

    if (!body.studentId || !body.amount || !body.month || !body.paymentMode) {
      return errorResponse("studentId, amount, month, and paymentMode are required");
    }

    const student = await prisma.student.findUnique({
      where: { id: body.studentId },
      include: { room: true },
    });
    if (!student) return errorResponse("Student not found");

    // Check if fee for this month already fully paid
    const existing = await prisma.fee.findFirst({
      where: { studentId: body.studentId, month: body.month, status: "paid" },
    });
    if (existing) return errorResponse("Fee for this month is already fully paid");

    const fee = await prisma.fee.upsert({
      where: {
        // composite unique — add @@unique([studentId, month]) in schema
        id: (
          await prisma.fee.findFirst({
            where: { studentId: body.studentId, month: body.month },
          })
        )?.id ?? "new",
      },
      create: {
        studentId: body.studentId,
        roomId: student.roomId,
        amount: body.amount,
        month: body.month,
        status: "paid",
        paymentMode: body.paymentMode as any,
        paymentDate: new Date(),
        notes: body.notes,
      },
      update: {
        amount: body.amount,
        status: "paid",
        paymentMode: body.paymentMode as any,
        paymentDate: new Date(),
        notes: body.notes,
      },
      include: {
        student: { select: { fullName: true } },
        room: { select: { roomNumber: true } },
      },
    });

    return createdResponse(fee, "Payment recorded successfully");
  } catch (err) {
    console.error(err);
    return errorResponse("Failed to record payment", 500);
  }
}
