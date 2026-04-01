import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUpsert, mockUpdate, mockUpdateEq } = vi.hoisted(() => {
  const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
  const mockUpsert = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi
        .fn()
        .mockResolvedValue({ data: { id: "rev-new-001" }, error: null }),
    }),
  });
  return { mockUpsert, mockUpdate, mockUpdateEq };
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "reviews") {
        return { upsert: mockUpsert, update: mockUpdate };
      }
      if (table === "locations") {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: {
                    id: "loc-001",
                    google_account_id: "accounts/123",
                    google_location_id: "locations/456",
                    last_synced_at: null,
                    organization_id: "org-001",
                  },
                  error: null,
                }),
            }),
          }),
          update: mockUpdate,
        };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
    },
  }),
}));

vi.mock("@/lib/google/client", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/google/client")>();
  return {
    ...original,
    createGBPClient: vi.fn().mockResolvedValue({
      listReviews: vi.fn().mockResolvedValue({
        reviews: [
          {
            name: "accounts/123/locations/456/reviews/789",
            reviewId: "review-789",
            reviewer: { displayName: "Jane Doe", profilePhotoUrl: "https://example.com/photo.jpg" },
            starRating: "FOUR",
            comment: "Great food and service! Will come back.",
            createTime: "2026-03-15T10:00:00Z",
            updateTime: "2026-03-15T10:00:00Z",
          },
          {
            name: "accounts/123/locations/456/reviews/790",
            reviewId: "review-790",
            reviewer: { displayName: "John Smith" },
            starRating: "ONE",
            comment: "Terrible experience. Cold food, rude staff.",
            createTime: "2026-03-14T08:00:00Z",
            updateTime: "2026-03-14T08:00:00Z",
          },
        ],
        nextPageToken: undefined,
      }),
    }),
  };
});

vi.mock("@/lib/ai/analyze-review", () => ({
  analyzeAndUpdateReview: vi.fn().mockResolvedValue(undefined),
}));

import { mapStarRating } from "@/lib/google/client";

describe("Review sync pipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi
          .fn()
          .mockResolvedValue({ data: { id: "rev-new-001" }, error: null }),
      }),
    });
    mockUpdate.mockReturnValue({ eq: mockUpdateEq });
  });

  describe("Star rating enum mapping", () => {
    it("maps all Google enums to integers", () => {
      expect(mapStarRating("ONE")).toBe(1);
      expect(mapStarRating("TWO")).toBe(2);
      expect(mapStarRating("THREE")).toBe(3);
      expect(mapStarRating("FOUR")).toBe(4);
      expect(mapStarRating("FIVE")).toBe(5);
    });

    it("returns 0 for unknown values", () => {
      expect(mapStarRating("STAR_RATING_UNSPECIFIED")).toBe(0);
    });
  });

  describe("syncReviewsForLocation", () => {
    it("upserts reviews with onConflict google_review_id", async () => {
      const { syncReviewsForLocation } = await import("@/lib/google/sync");
      await syncReviewsForLocation("org-001", "loc-001");

      expect(mockUpsert).toHaveBeenCalledTimes(2);

      const firstCall = mockUpsert.mock.calls[0];
      expect(firstCall[0].google_review_id).toBe("review-789");
      expect(firstCall[1]).toEqual({ onConflict: "google_review_id" });

      const secondCall = mockUpsert.mock.calls[1];
      expect(secondCall[0].google_review_id).toBe("review-790");
    });

    it("maps star ratings correctly in upserted data", async () => {
      const { syncReviewsForLocation } = await import("@/lib/google/sync");
      await syncReviewsForLocation("org-001", "loc-001");

      // First review: FOUR -> 4
      expect(mockUpsert.mock.calls[0][0].star_rating).toBe(4);
      // Second review: ONE -> 1
      expect(mockUpsert.mock.calls[1][0].star_rating).toBe(1);
    });

    it("updates last_synced_at after sync", async () => {
      const { syncReviewsForLocation } = await import("@/lib/google/sync");
      await syncReviewsForLocation("org-001", "loc-001");

      expect(mockUpdate).toHaveBeenCalled();
    });

    it("returns correct synced count", async () => {
      const { syncReviewsForLocation } = await import("@/lib/google/sync");
      const result = await syncReviewsForLocation("org-001", "loc-001");

      expect(result.synced).toBe(2);
      expect(result.errors).toBe(0);
    });
  });
});
