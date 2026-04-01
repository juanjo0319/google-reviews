// --- Test data fixtures ---

export const testUser = {
  id: "user-001",
  name: "Test User",
  email: "test@example.com",
  image: null,
};

export const testOrg = {
  id: "org-001",
  name: "Test Organization",
  slug: "test-org",
  plan_tier: "pro" as const,
  stripe_customer_id: "cus_test123",
};

export const testOrgFree = {
  ...testOrg,
  id: "org-002",
  name: "Free Org",
  slug: "free-org",
  plan_tier: "free" as const,
  stripe_customer_id: null,
};

export const testLocation = {
  id: "loc-001",
  organization_id: "org-001",
  google_account_id: "accounts/123",
  google_location_id: "locations/456",
  name: "Downtown Location",
  address: "123 Main St, Springfield, IL",
  phone: "+1234567890",
  google_place_id: "ChIJ_test",
  is_verified: true,
  last_synced_at: null,
};

export const testReviews = [
  {
    id: "rev-001",
    location_id: "loc-001",
    organization_id: "org-001",
    google_review_id: "review-789",
    reviewer_name: "Jane Doe",
    reviewer_photo_url: "https://example.com/photo.jpg",
    star_rating: 4,
    comment: "Great food and service! Will come back.",
    sentiment: "positive" as const,
    sentiment_score: 0.92,
    sentiment_themes: ["food", "service"],
    requires_urgent_response: false,
    is_spam: false,
    review_created_at: "2026-03-15T10:00:00Z",
  },
  {
    id: "rev-002",
    location_id: "loc-001",
    organization_id: "org-001",
    google_review_id: "review-790",
    reviewer_name: "John Smith",
    reviewer_photo_url: null,
    star_rating: 1,
    comment: "Terrible experience. Cold food, rude staff.",
    sentiment: "negative" as const,
    sentiment_score: 0.15,
    sentiment_themes: ["food quality", "staff"],
    requires_urgent_response: true,
    is_spam: false,
    review_created_at: "2026-03-14T08:00:00Z",
  },
  {
    id: "rev-003",
    location_id: "loc-001",
    organization_id: "org-001",
    google_review_id: "review-791",
    reviewer_name: "Spam Bot",
    reviewer_photo_url: null,
    star_rating: 5,
    comment: "Buy cheap watches at www.spam.com!!!",
    sentiment: "positive" as const,
    sentiment_score: 0.5,
    sentiment_themes: [],
    requires_urgent_response: false,
    is_spam: true,
    review_created_at: "2026-03-13T12:00:00Z",
  },
];

export const testBrandVoice = {
  id: "bv-001",
  organization_id: "org-001",
  location_id: null,
  tone: "professional and warm",
  formality: 7,
  humor_level: 3,
  use_emoji: false,
  signature_name: "The ReviewAI Team",
  preferred_phrases: ["Thank you for your feedback", "We appreciate your visit"],
  avoid_phrases: ["sorry for the inconvenience"],
  response_length: "2-4 sentences",
  custom_examples: [
    {
      review: "Great place, loved it!",
      response:
        "Thank you so much for the kind words! We're thrilled you had a great experience.",
    },
  ],
  values: ["quality", "hospitality"],
};

export const testGoogleReviews = [
  {
    name: "accounts/123/locations/456/reviews/789",
    reviewId: "review-789",
    reviewer: {
      displayName: "Jane Doe",
      profilePhotoUrl: "https://example.com/photo.jpg",
    },
    starRating: "FOUR" as const,
    comment: "Great food and service! Will come back.",
    createTime: "2026-03-15T10:00:00Z",
    updateTime: "2026-03-15T10:00:00Z",
  },
  {
    name: "accounts/123/locations/456/reviews/790",
    reviewId: "review-790",
    reviewer: { displayName: "John Smith" },
    starRating: "ONE" as const,
    comment: "Terrible experience. Cold food, rude staff.",
    createTime: "2026-03-14T08:00:00Z",
    updateTime: "2026-03-14T08:00:00Z",
  },
];

export const testStripeWebhookEvents = {
  checkoutCompleted: {
    id: "evt_test_checkout",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_123",
        customer: "cus_test123",
        subscription: "sub_test123",
        metadata: { orgId: "org-001", planTier: "pro" },
      },
    },
  },
  subscriptionDeleted: {
    id: "evt_test_sub_deleted",
    type: "customer.subscription.deleted",
    data: {
      object: {
        id: "sub_test123",
        status: "canceled",
        items: { data: [{ price: { id: "price_pro" } }] },
        cancel_at: null,
        metadata: { planTier: "pro" },
      },
    },
  },
};
