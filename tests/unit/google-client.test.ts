import { describe, it, expect } from "vitest";
import { mapStarRating } from "@/lib/google/client";

describe("mapStarRating", () => {
  it("maps all valid Google star rating enums", () => {
    expect(mapStarRating("ONE")).toBe(1);
    expect(mapStarRating("TWO")).toBe(2);
    expect(mapStarRating("THREE")).toBe(3);
    expect(mapStarRating("FOUR")).toBe(4);
    expect(mapStarRating("FIVE")).toBe(5);
  });

  it("returns 0 for unknown ratings", () => {
    expect(mapStarRating("ZERO")).toBe(0);
    expect(mapStarRating("SIX")).toBe(0);
    expect(mapStarRating("")).toBe(0);
    expect(mapStarRating("invalid")).toBe(0);
  });
});
