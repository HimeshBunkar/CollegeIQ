import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-utils";
import { comparisonSaveSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return apiError("Unauthorized", 401);
    const comparisons = await prisma.comparison.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess(comparisons);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return apiError("Unauthorized", 401);
    const data = comparisonSaveSchema.parse(await request.json());

    // collegeIds is a plain String[] with no DB-level foreign key,
    // so existence has to be checked manually to avoid storing garbage IDs.
    const uniqueIds = [...new Set(data.collegeIds)];
    const existingCount = await prisma.college.count({ where: { id: { in: uniqueIds } } });
    if (existingCount !== uniqueIds.length) {
      return apiError("One or more collegeIds are invalid", 400);
    }

    const comparison = await prisma.comparison.create({
      data: { userId: session.user.id, collegeIds: uniqueIds, name: data.name },
    });
    return apiSuccess(comparison, 201);
  } catch (error) {
    return handleApiError(error);
  }
}