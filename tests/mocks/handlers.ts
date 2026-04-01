import { http, HttpResponse } from "msw";

export const handlers = [
  // --- Google OAuth token refresh ---
  http.post("https://oauth2.googleapis.com/token", () => {
    return HttpResponse.json({
      access_token: "mock-refreshed-access-token",
      expires_in: 3600,
      token_type: "Bearer",
    });
  }),

  // --- Google Business Profile APIs ---
  http.get(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    () => {
      return HttpResponse.json({
        accounts: [
          {
            name: "accounts/123",
            accountName: "Test Business",
            type: "PERSONAL",
            role: "PRIMARY_OWNER",
            state: { status: "VERIFIED" },
          },
        ],
      });
    }
  ),

  http.get(
    "https://mybusinessbusinessinformation.googleapis.com/v1/accounts/:accountId/locations",
    () => {
      return HttpResponse.json({
        locations: [
          {
            name: "locations/456",
            title: "Downtown Location",
            storefrontAddress: {
              addressLines: ["123 Main St"],
              locality: "Springfield",
              administrativeArea: "IL",
              postalCode: "62701",
            },
            phoneNumbers: { primaryPhone: "+1234567890" },
            metadata: { placeId: "ChIJ_test_place_id" },
          },
        ],
      });
    }
  ),

  http.get(
    "https://mybusiness.googleapis.com/v4/:accountId/:locationId/reviews",
    () => {
      return HttpResponse.json({
        reviews: [
          {
            name: "accounts/123/locations/456/reviews/789",
            reviewId: "review-789",
            reviewer: {
              displayName: "Jane Doe",
              profilePhotoUrl: "https://example.com/photo.jpg",
            },
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
        totalReviewCount: 2,
        nextPageToken: undefined,
      });
    }
  ),

  http.put(
    "https://mybusiness.googleapis.com/v4/:reviewPath/reply",
    async ({ request }) => {
      const body = (await request.json()) as { comment: string };
      return HttpResponse.json({
        comment: body.comment,
        updateTime: new Date().toISOString(),
      });
    }
  ),

  http.delete(
    "https://mybusiness.googleapis.com/v4/:reviewPath/reply",
    () => {
      return new HttpResponse(null, { status: 204 });
    }
  ),

  // --- Anthropic Claude API ---
  http.post("https://api.anthropic.com/v1/messages", () => {
    return HttpResponse.json({
      id: "msg_mock_123",
      type: "message",
      role: "assistant",
      content: [
        {
          type: "text",
          text: JSON.stringify({
            sentiment: "positive",
            confidence: 0.92,
            key_themes: ["food", "service"],
            key_positives: ["great food", "good service"],
            key_negatives: [],
            requires_urgent_response: false,
            is_spam: false,
          }),
        },
      ],
      model: "claude-haiku-4-5-20251001",
      usage: { input_tokens: 150, output_tokens: 80 },
    });
  }),

  // --- Stripe ---
  http.post("https://api.stripe.com/v1/checkout/sessions", () => {
    return HttpResponse.json({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/test",
    });
  }),

  http.post("https://api.stripe.com/v1/billing_portal/sessions", () => {
    return HttpResponse.json({
      id: "bps_test_123",
      url: "https://billing.stripe.com/test",
    });
  }),
];
