import { Prisma, ExamType, Category, Gender } from "@prisma/client";
import { prisma } from "../db";
import type { RankPredictorInput } from "../validations";
import { getChanceLevel } from "../utils";

export interface PredictionResult {
  collegeId: string;
  collegeName: string;
  slug: string;
  city: string;
  state: string;
  nirfRank: number | null;
  course: string;
  openingRank: number;
  closingRank: number;
  admissionProbability: number;
  confidenceScore: number;
  chanceLevel: "HIGH" | "MEDIUM" | "LOW";
}

export function buildCollegeWhere(query: {
  search?: string;
  state?: string;
  ownership?: string;
  minFees?: number;
  maxFees?: number;
  minRating?: number;
  maxNirfRank?: number;
  course?: string;
}): Prisma.CollegeWhereInput {
  const where: Prisma.CollegeWhereInput = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { city: { contains: query.search, mode: "insensitive" } },
      { state: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.state) where.state = query.state;
  if (query.ownership) where.ownership = query.ownership as Prisma.EnumOwnershipFilter["equals"];
  if (query.minFees || query.maxFees) {
    where.fees = {};
    if (query.minFees) where.fees.gte = query.minFees;
    if (query.maxFees) where.fees.lte = query.maxFees;
  }
  if (query.minRating) where.rating = { gte: query.minRating };
  if (query.maxNirfRank) where.nirfRank = { lte: query.maxNirfRank, not: null };
  if (query.course) {
    where.courses = { some: { name: { contains: query.course, mode: "insensitive" } } };
  }
  return where;
}

export async function predictColleges(input: RankPredictorInput): Promise<PredictionResult[]> {
  // Use the latest cutoff year available for this exam/category/gender/state
  // combination instead of a hardcoded year, so the predictor doesn't silently
  // return zero results if the underlying data's year ever changes.
  const latest = await prisma.cutoff.aggregate({
    _max: { year: true },
    where: {
      exam: input.exam as ExamType,
      category: input.category as Category,
      gender: input.gender as Gender,
      homeState: input.homeState,
    },
  });

  if (!latest._max.year) {
    return [];
  }

  const cutoffs = await prisma.cutoff.findMany({
    where: {
      exam: input.exam as ExamType,
      category: input.category as Category,
      gender: input.gender as Gender,
      homeState: input.homeState,
      year: latest._max.year,
    },
    include: { college: { select: { id: true, name: true, slug: true, city: true, state: true, nirfRank: true } } },
    orderBy: { closingRank: "asc" },
  });

  const results: PredictionResult[] = [];

  for (const cutoff of cutoffs) {
    const { openingRank, closingRank } = cutoff;
    const rank = input.rank;
    let probability: number;
    let confidence: number;

    if (rank <= openingRank) {
      probability = 95;
      confidence = 90;
    } else if (rank <= closingRank) {
      const range = closingRank - openingRank || 1;
      const position = rank - openingRank;
      probability = Math.round(85 - (position / range) * 55);
      confidence = 75;
    } else if (rank <= closingRank * 1.15) {
      probability = Math.round(35 - ((rank - closingRank) / (closingRank * 0.15)) * 25);
      confidence = 50;
    } else {
      continue;
    }

    probability = Math.max(5, Math.min(99, probability));
    results.push({
      collegeId: cutoff.college.id,
      collegeName: cutoff.college.name,
      slug: cutoff.college.slug,
      city: cutoff.college.city,
      state: cutoff.college.state,
      nirfRank: cutoff.college.nirfRank,
      course: cutoff.course,
      openingRank,
      closingRank,
      admissionProbability: probability,
      confidenceScore: confidence,
      chanceLevel: getChanceLevel(probability),
    });
  }

  return results.sort((a, b) => b.admissionProbability - a.admissionProbability).slice(0, 20);
}