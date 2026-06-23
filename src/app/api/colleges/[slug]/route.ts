import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-utils";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const college = await prisma.college.findUnique({
      where: { slug },
      include: {
        courses: true,
        placements: { orderBy: { year: "desc" } },
        reviews: { include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
        facilities: true,
        admissions: true,
        cutoffs: { take: 20, orderBy: { closingRank: "asc" } },
      },
    });
    if (!college) return apiError("College not found", 404);
    return apiSuccess(college);
  } catch (error) {
    return handleApiError(error);
  }
}
