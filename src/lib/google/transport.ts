/**
 * Token-bucket rate limiter for Google API requests.
 */
export class TokenBucket {
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
export const rateLimiter = new TokenBucket(5);

// --- Exponential backoff with jitter ---

export async function backoff(attempt: number): Promise<void> {
  const baseMs = Math.min(1000 * Math.pow(2, attempt), 30000);
  const jitter = Math.random() * baseMs * 0.5;
  await new Promise((resolve) => setTimeout(resolve, baseMs + jitter));
}

/**
 * Make an authenticated API request with rate limiting and retries.
 * Retries on 429 (rate limit) and 403 (quota exceeded) with exponential backoff.
 */
export async function request<T>(
  url: string,
  getToken: () => Promise<string>,
  options: RequestInit = {},
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    await rateLimiter.acquire();
    const token = await getToken();

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
