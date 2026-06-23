import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400, errors?: unknown) {
  return NextResponse.json({ success: false, error: message, errors }, { status });
}

export function handleApiError(error: unknown) {
  // Invalid input shape (failed Zod schema validation)
  if (error instanceof ZodError) {
    return apiError("Validation failed", 422, error.flatten().fieldErrors);
  }

  // Malformed JSON body — e.g. empty body, broken JSON, wrong content-type
  if (error instanceof SyntaxError) {
    return apiError("Malformed JSON body", 400);
  }

  // Known Prisma errors — map to sensible HTTP statuses instead of a blanket 500
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2025": // Record to update/delete does not exist
        return apiError("Record not found", 404);
      case "P2003": // Foreign key constraint failed
        return apiError("Invalid reference — related record does not exist", 400);
      case "P2002": // Unique constraint violation
        return apiError("Record already exists", 409);
      default:
        console.error("Unhandled Prisma error:", error.code, error.message);
        return apiError("Database error", 500);
    }
  }

  console.error(error);
  return apiError("Internal server error", 500);
}

export function parseIntParam(value: string | null, fallback: number): number {
  const n = parseInt(value ?? "", 10);
  return isNaN(n) ? fallback : n;
}