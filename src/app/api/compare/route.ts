import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const ids = request.nextUrl.searchParams.getAll("c");
    if (ids.length < 2 || ids.length > 3) {
      return apiError("Provide 2-3 college IDs via ?c=1&c=2", 400);
    }
    const colleges = await prisma.college.findMany({
      where: { id: { in: ids } },
      include: {
        placements: { orderBy: { year: "desc" }, take: 1 },
        courses: { take: 5 },
      },
    });
    if (colleges.length !== ids.length) return apiError("One or more colleges not found", 404);
    const ordered = ids.map((id) => colleges.find((c) => c.id === id)!);
    return apiSuccess(ordered);
  } catch (error) {
    return handleApiError(error);
  }
}
