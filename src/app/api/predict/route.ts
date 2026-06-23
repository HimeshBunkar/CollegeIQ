import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-utils";
import { rankPredictorSchema } from "@/lib/validations";
import { predictColleges } from "@/lib/services/college-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = rankPredictorSchema.parse(body);
    const predictions = await predictColleges(input);

    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await prisma.activityLog.create({
        data: { userId: session.user.id, action: "RANK_PREDICTION", metadata: input },
      });
    }

    const grouped = {
      high: predictions.filter((p) => p.chanceLevel === "HIGH"),
      medium: predictions.filter((p) => p.chanceLevel === "MEDIUM"),
      low: predictions.filter((p) => p.chanceLevel === "LOW"),
    };

    return apiSuccess({ predictions, grouped, total: predictions.length });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const states = await prisma.cutoff.findMany({ select: { homeState: true }, distinct: ["homeState"], orderBy: { homeState: "asc" } });
    return apiSuccess({ states: states.map((s) => s.homeState), exams: ["JEE_MAIN", "JOSAA", "CSAB"], categories: ["GENERAL", "OBC", "SC", "ST", "EWS"], genders: ["MALE", "FEMALE", "OTHER"] });
  } catch (error) {
    return handleApiError(error);
  }
}
