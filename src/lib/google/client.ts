import { GoogleTokenStore } from "./token-store";
import { request } from "./transport";

// --- Google star rating enum -> integer mapping ---

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

// --- GBP Client ---

export class GoogleBusinessProfileClient {
  private tokenStore: GoogleTokenStore;

  constructor(organizationId: string) {
    this.tokenStore = new GoogleTokenStore(organizationId);
  }

  /** Load tokens from DB. Must be called before making API requests. */
  async initialize(): Promise<void> {
    await this.tokenStore.load();
  }

  /** Authenticated request helper using token store + transport. */
  private req<T>(url: string, options: RequestInit = {}, maxRetries = 3): Promise<T> {
    return request<T>(
      url,
      () => this.tokenStore.ensureValidToken(),
      options,
      maxRetries
    );
  }

  // --- Account Management API v1 ---

  async listAccounts(): Promise<GoogleAccount[]> {
    const data = await this.req<{ accounts?: GoogleAccount[] }>(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts"
    );
    return data.accounts ?? [];
  }

  // --- Business Information API v1 ---

  async listLocations(accountId: string): Promise<GoogleLocation[]> {
    const data = await this.req<{ locations?: GoogleLocation[] }>(
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

    return this.req<ListReviewsResponse>(
      `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews?${params}`
    );
  }

  async getReview(reviewName: string): Promise<GoogleReview> {
    return this.req<GoogleReview>(
      `https://mybusiness.googleapis.com/v4/${reviewName}`
    );
  }

  async replyToReview(
    reviewName: string,
    comment: string
  ): Promise<{ comment: string; updateTime: string }> {
    return this.req(
      `https://mybusiness.googleapis.com/v4/${reviewName}/reply`,
      {
        method: "PUT",
        body: JSON.stringify({ comment }),
      }
    );
  }

  async deleteReply(reviewName: string): Promise<void> {
    await this.req(
      `https://mybusiness.googleapis.com/v4/${reviewName}/reply`,
      { method: "DELETE" }
    );
  }

  async batchGetReviews(
    accountId: string,
    locationNames: string[]
  ): Promise<{ locationReviews: { reviews: GoogleReview[] }[] }> {
    return this.req(
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
