import { describe, it, expect } from "vitest";
import { buildCollegeWhere } from "@/lib/services/college-service";

describe("College Service Integration", () => {
  it("buildCollegeWhere combines filters", () => {
    const where = buildCollegeWhere({ search: "IIT", state: "Delhi", minFees: 100000, maxFees: 500000, minRating: 4 });
    expect(where.OR).toBeDefined();
    expect(where.state).toBe("Delhi");
    expect(where.fees).toEqual({ gte: 100000, lte: 500000 });
    expect(where.rating).toEqual({ gte: 4 });
  });

  it("buildCollegeWhere handles course filter", () => {
    const where = buildCollegeWhere({ course: "Computer Science" });
    expect(where.courses).toBeDefined();
  });
});
