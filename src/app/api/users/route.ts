import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-utils";
import { registerSchema, saveCollegeSchema, shortlistSchema, comparisonSaveSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return apiError("Email already registered", 409);
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({ data: { name: data.name, email: data.email, passwordHash } });
    return apiSuccess({ id: user.id, email: user.email, name: user.name }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return apiError("Unauthorized", 401);
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, createdAt: true, _count: { select: { savedColleges: true, shortlists: true, comparisons: true } } },
    });
    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}
