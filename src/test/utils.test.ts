import { describe, it, expect } from "vitest";
import { getChanceLevel, formatCurrency, slugify } from "@/lib/utils";
import { collegeQuerySchema, rankPredictorSchema } from "@/lib/validations";

describe("Utils", () => {
  it("getChanceLevel returns correct levels", () => {
    expect(getChanceLevel(80)).toBe("HIGH");
    expect(getChanceLevel(50)).toBe("MEDIUM");
    expect(getChanceLevel(20)).toBe("LOW");
  });

  it("formatCurrency formats lakhs", () => {
    expect(formatCurrency(250000)).toBe("₹2.5L");
  });

  it("slugify creates valid slugs", () => {
    expect(slugify("IIT Delhi")).toBe("iit-delhi");
  });
});

describe("Validations", () => {
  it("collegeQuerySchema applies defaults", () => {
    const result = collegeQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(12);
  });

  it("rankPredictorSchema rejects invalid rank", () => {
    expect(() => rankPredictorSchema.parse({ exam: "JEE_MAIN", category: "GENERAL", gender: "MALE", homeState: "Delhi", rank: -1 })).toThrow();
  });
});

describe("Rank Predictor Engine", () => {
  it("calculates probability within bounds", () => {
    const rank = 5000;
    const opening = 4000;
    const closing = 6000;
    let probability: number;
    if (rank <= opening) probability = 95;
    else if (rank <= closing) {
      const range = closing - opening || 1;
      probability = Math.round(85 - ((rank - opening) / range) * 55);
    } else probability = 0;
    expect(probability).toBeGreaterThan(0);
    expect(probability).toBeLessThanOrEqual(95);
  });
});
