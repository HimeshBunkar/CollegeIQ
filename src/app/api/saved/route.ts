import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-utils";
import { saveCollegeSchema } from "@/lib/validations";

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);
    const saved = await prisma.savedCollege.findMany({
      where: { userId: session.user.id },
      include: { college: { select: { id: true, name: true, slug: true, logo: true, city: true, state: true, fees: true, avgPackage: true, rating: true, nirfRank: true } } },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess(saved);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);
    const { collegeId } = saveCollegeSchema.parse(await request.json());
    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) return apiError("College not found", 404);
    const saved = await prisma.$transaction(async (tx) => {
      const item = await tx.savedCollege.upsert({
        where: { userId_collegeId: { userId: session.user.id, collegeId } },
        create: { userId: session.user.id, collegeId },
        update: {},
        include: { college: true },
      });
      await tx.activityLog.create({ data: { userId: session.user.id, action: "SAVE_COLLEGE", metadata: { collegeId } } });
      return item;
    });
    return apiSuccess(saved, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);
    const collegeId = request.nextUrl.searchParams.get("collegeId");
    if (!collegeId) return apiError("collegeId required", 400);
    await prisma.savedCollege.delete({ where: { userId_collegeId: { userId: session.user.id, collegeId } } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
