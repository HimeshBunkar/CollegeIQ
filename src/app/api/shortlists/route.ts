import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-utils";
import { shortlistSchema, comparisonSaveSchema } from "@/lib/validations";

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);
    const shortlists = await prisma.shortlist.findMany({
      where: { userId: session.user.id },
      include: { items: { include: { college: { select: { id: true, name: true, slug: true, logo: true, city: true, state: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess(shortlists);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);
    const data = shortlistSchema.parse(await request.json());

    // Validate every collegeId exists before inserting. Without this, a bad ID
    // throws a Prisma FK error deep inside the transaction instead of a clean 400.
    const uniqueIds = data.collegeIds?.length ? [...new Set(data.collegeIds)] : [];
    if (uniqueIds.length) {
      const existingCount = await prisma.college.count({ where: { id: { in: uniqueIds } } });
      if (existingCount !== uniqueIds.length) {
        return apiError("One or more collegeIds are invalid", 400);
      }
    }

    const shortlist = await prisma.$transaction(async (tx) => {
      const list = await tx.shortlist.create({ data: { userId: session.user.id, name: data.name } });
      if (uniqueIds.length) {
        await tx.shortlistItem.createMany({
          data: uniqueIds.map((collegeId) => ({ shortlistId: list.id, collegeId })),
        });
      }
      return tx.shortlist.findUnique({ where: { id: list.id }, include: { items: { include: { college: true } } } });
    });
    return apiSuccess(shortlist, 201);
  } catch (error) {
    return handleApiError(error);
  }
}