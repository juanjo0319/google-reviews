import { createAdminClient } from "@/lib/supabase/admin";

// --- Google star rating enum → integer mapping ---

const STAR_RATING_MAP: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

export function mapStarRating(rating: string): number {
  return STAR_RATING_MAP[rating] ?? 0;
}

// --- Types ---

export interface GoogleAccount {
  name: string; // "accounts/123"
  accountName: string;
  type: string;
  role: string;
  state: { status: string };
  accountNumber?: string;
}

export interface GoogleLocation {
  name: string; // "locations/456"
  title: string;
  storefrontAddress?: {
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
    regionCode?: string;
  };
  phoneNumbers?: { primaryPhone?: string };
  metadata?: { placeId?: string; mapsUri?: string };
  profile?: { description?: string };
}

export interface GoogleReview {
  name: string; // "accounts/123/locations/456/reviews/789"
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
  };
  starRating: string; // "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE"
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

export interface ListReviewsResponse {
  reviews: GoogleReview[];
  averageRating?: number;
  totalReviewCount?: number;
  nextPageToken?: string;
}

// --- Token bucket rate limiter (5 req/sec) ---

class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per ms

  constructor(maxPerSecond: number) {
    this.maxTokens = maxPerSecond;
    this.tokens = maxPerSecond;
    this.refillRate = maxPerSecond / 1000;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    // Wait until a token is available
    const waitMs = Math.ceil((1 - this.tokens) / this.refillRate);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    this.refill();
    this.tokens -= 1;
  }

  private refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}

// Shared rate limiter: 5 requests/sec to stay under 300 QPM
const rateLimiter = new TokenBucket(5);

// --- Exponential backoff with jitter ---

async function backoff(attempt: number): Promise<void> {
  const baseMs = Math.min(1000 * Math.pow(2, attempt), 30000);
  const jitter = Math.random() * baseMs * 0.5;
  await new Promise((resolve) => setTimeout(resolve, baseMs + jitter));
}

// --- GBP Client ---

export class GoogleBusinessProfileClient {
  private organizationId: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: Date | null = null;
  private tokenRecordId: string | null = null;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  /** Load tokens from DB. Must be called before making API requests. */
  async initialize(): Promise<void> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("google_oauth_tokens")
      .select("id, access_token, refresh_token, expires_at")
      .eq("organization_id", this.organizationId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      throw new Error(
        `No Google OAuth tokens found for organization ${this.organizationId}`
      );
    }

    this.tokenRecordId = data.id;
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.expiresAt = data.expires_at ? new Date(data.expires_at) : null;
  }

  /** Refresh the access token if expired or about to expire (5-min buffer). */
  private async ensureValidToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available. User must re-authenticate.");
    }

    const bufferMs = 5 * 60 * 1000; // 5 minutes
    const needsRefresh =
      !this.accessToken ||
      !this.expiresAt ||
      this.expiresAt.getTime() - Date.now() < bufferMs;

    if (!needsRefresh) {
      return this.accessToken!;
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        `Token refresh failed: ${data.error} - ${data.error_description}`
      );
    }

    this.accessToken = data.access_token;
    this.expiresAt = new Date(Date.now() + data.expires_in * 1000);
    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
    }

    // Persist updated tokens
    if (this.tokenRecordId) {
      const supabase = createAdminClient();
      await supabase
        .from("google_oauth_tokens")
        .update({
          access_token: this.accessToken ?? undefined,
          refresh_token: this.refreshToken ?? undefined,
          expires_at: this.expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", this.tokenRecordId);
    }

    return this.accessToken!;
  }

  /**
   * Make an authenticated API request with rate limiting and retries.
   * Retries on 429 (rate limit) and 403 (quota exceeded) with exponential backoff.
   */
  private async request<T>(
    url: string,
    options: RequestInit = {},
    maxRetries = 3
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      await rateLimiter.acquire();
      const token = await this.ensureValidToken();

      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (response.ok) {
        // Some DELETE endpoints return 204 with no body
        if (response.status === 204) return {} as T;
        return response.json();
      }

      // Retryable errors
      if (
        (response.status === 429 || response.status === 403) &&
        attempt < maxRetries
      ) {
        console.warn(
          `GBP API ${response.status} on ${url}, retrying (attempt ${attempt + 1}/${maxRetries})`
        );
        await backoff(attempt);
        continue;
      }

      const errorBody = await response.text();
      throw new Error(
        `GBP API error ${response.status}: ${errorBody}`
      );
    }

    throw new Error("Max retries exceeded");
  }

  // --- Account Management API v1 ---

  async listAccounts(): Promise<GoogleAccount[]> {
    const data = await this.request<{ accounts?: GoogleAccount[] }>(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts"
    );
    return data.accounts ?? [];
  }

  // --- Business Information API v1 ---

  async listLocations(accountId: string): Promise<GoogleLocation[]> {
    const data = await this.request<{ locations?: GoogleLocation[] }>(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations?readMask=name,title,storefrontAddress,phoneNumbers,metadata`
    );
    return data.locations ?? [];
  }

  // --- My Business API v4 (Reviews) ---

  async listReviews(
    accountId: string,
    locationId: string,
    pageSize = 50,
    pageToken?: string,
    orderBy = "updateTime desc"
  ): Promise<ListReviewsResponse> {
    const params = new URLSearchParams({
      pageSize: String(pageSize),
      orderBy,
    });
    if (pageToken) params.set("pageToken", pageToken);

    return this.request<ListReviewsResponse>(
      `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews?${params}`
    );
  }

  async getReview(reviewName: string): Promise<GoogleReview> {
    return this.request<GoogleReview>(
      `https://mybusiness.googleapis.com/v4/${reviewName}`
    );
  }

  async replyToReview(
    reviewName: string,
    comment: string
  ): Promise<{ comment: string; updateTime: string }> {
    return this.request(
      `https://mybusiness.googleapis.com/v4/${reviewName}/reply`,
      {
        method: "PUT",
        body: JSON.stringify({ comment }),
      }
    );
  }

  async deleteReply(reviewName: string): Promise<void> {
    await this.request(
      `https://mybusiness.googleapis.com/v4/${reviewName}/reply`,
      { method: "DELETE" }
    );
  }

  async batchGetReviews(
    accountId: string,
    locationNames: string[]
  ): Promise<{ locationReviews: { reviews: GoogleReview[] }[] }> {
    return this.request(
      `https://mybusiness.googleapis.com/v4/${accountId}/locations:batchGetReviews`,
      {
        method: "POST",
        body: JSON.stringify({ locationNames }),
      }
    );
  }
}

/**
 * Factory: create and initialize a GBP client for the given organization.
 */
export async function createGBPClient(
  organizationId: string
): Promise<GoogleBusinessProfileClient> {
  const client = new GoogleBusinessProfileClient(organizationId);
  await client.initialize();
  return client;
}
