import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Manages loading, refreshing, and persisting Google OAuth tokens for an organization.
 */
export class GoogleTokenStore {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: Date | null = null;
  private tokenRecordId: string | null = null;
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  /** Load tokens from DB. Must be called before making API requests. */
  async load(): Promise<void> {
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
  async ensureValidToken(): Promise<string> {
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
}
