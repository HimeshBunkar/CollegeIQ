import { z } from "zod";

export const collegeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().optional(),
  state: z.string().optional(),
  ownership: z.enum(["GOVERNMENT", "PRIVATE", "DEEMED", "AUTONOMOUS"]).optional(),
  minFees: z.coerce.number().optional(),
  maxFees: z.coerce.number().optional(),
  minRating: z.coerce.number().optional(),
  maxNirfRank: z.coerce.number().optional(),
  course: z.string().optional(),
  sortBy: z.enum(["name", "fees", "rating", "nirfRank", "avgPackage"]).default("nirfRank"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const rankPredictorSchema = z.object({
  exam: z.enum(["JEE_MAIN", "JOSAA", "CSAB"]),
  category: z.enum(["GENERAL", "OBC", "SC", "ST", "EWS"]),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  homeState: z.string().min(1),
  rank: z.coerce.number().int().min(1).max(2000000),
});

export const saveCollegeSchema = z.object({ collegeId: z.string().min(1) });
export const shortlistSchema = z.object({ name: z.string().min(1).max(100), collegeIds: z.array(z.string()).optional() });
export const comparisonSaveSchema = z.object({ collegeIds: z.array(z.string()).min(2).max(3), name: z.string().optional() });
export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export type CollegeQuery = z.infer<typeof collegeQuerySchema>;
export type RankPredictorInput = z.infer<typeof rankPredictorSchema>;
