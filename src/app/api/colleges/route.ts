import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-utils";
import { collegeQuerySchema } from "@/lib/validations";
import { buildCollegeWhere } from "@/lib/services/college-service";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = collegeQuerySchema.parse(params);
    const where = buildCollegeWhere(query);
    const skip = (query.page - 1) * query.limit;

    const orderBy: Record<string, "asc" | "desc"> = {};
    if (query.sortBy === "nirfRank") {
      orderBy.nirfRank = query.sortOrder;
    } else {
      orderBy[query.sortBy] = query.sortOrder;
    }

    const [colleges, total, states] = await Promise.all([
      prisma.college.findMany({
        where,
        skip,
        take: query.limit,
        orderBy,
        select: {
          id: true, name: true, slug: true, logo: true, city: true, state: true,
          ownership: true, fees: true, avgPackage: true, highestPackage: true,
          rating: true, accreditation: true, nirfRank: true,
          courses: { select: { name: true }, take: 3 },
        },
      }),
      prisma.college.count({ where }),
      prisma.college.findMany({ select: { state: true }, distinct: ["state"], orderBy: { state: "asc" } }),
    ]);

    return apiSuccess({
      colleges,
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
      filters: { states: states.map((s) => s.state) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
