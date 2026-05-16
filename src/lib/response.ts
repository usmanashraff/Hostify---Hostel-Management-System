import { NextResponse } from 'next/server';
import type { ApiResponse, PaginatedResponse } from '@/types';

export function successResponse<T>(data: T, message?: string, status = 200) {
  const body: ApiResponse<T> = { success: true, data, message };
  return NextResponse.json(body, { status });
}

export function createdResponse<T>(data: T, message = 'Created successfully') {
  return successResponse(data, message, 201);
}

export function errorResponse(error: string, status = 400) {
  const body: ApiResponse<null> = { success: false, error };
  return NextResponse.json(body, { status });
}

export function notFoundResponse(resource = 'Resource') {
  return errorResponse(`${resource} not found`, 404);
}

export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  const body: PaginatedResponse<T> = { success: true, data, total, page, limit };
  return NextResponse.json(body);
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '50'));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}
