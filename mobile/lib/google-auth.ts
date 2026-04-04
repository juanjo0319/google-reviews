import {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
} from "expo-auth-session";
import { api } from "./api";

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// Google OAuth discovery document
const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

/**
 * Build the redirect URI for Google OAuth.
 * Uses the Expo auth proxy in development, native scheme in production.
 */
export function getGoogleRedirectUri() {
  return makeRedirectUri({
    scheme: "reviewai",
    path: "google-callback",
  });
}

/**
 * Create a Google OAuth auth request hook for connecting GBP.
 * Use this in a component:
 *
 * ```tsx
 * const [request, response, promptAsync] = useGoogleBusinessAuth();
 * ```
 */
export function useGoogleBusinessAuth() {
  const redirectUri = getGoogleRedirectUri();

  return useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ["https://www.googleapis.com/auth/business.manage"],
      responseType: ResponseType.Code,
      usePKCE: true,
      redirectUri,
      extraParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
    discovery
  );
}

/**
 * Exchange the Google auth code with the backend.
 * Call this after receiving a successful auth response.
 */
export async function exchangeGoogleCode(
  code: string,
  redirectUri: string,
  orgId: string
): Promise<void> {
  await api("/api/mobile/google/callback", {
    method: "POST",
    body: { code, redirectUri, orgId },
  });
}

export { discovery };
