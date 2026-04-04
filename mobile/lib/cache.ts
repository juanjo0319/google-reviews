import { createMMKV, type MMKV } from "react-native-mmkv";

let _storage: MMKV | null = null;

function getStorage(): MMKV {
  if (!_storage) {
    _storage = createMMKV({ id: "reviewai-cache" });
  }
  return _storage;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data if it exists and is within TTL.
 */
export function getCached<T>(key: string, ttl = DEFAULT_TTL): T | null {
  const raw = getStorage().getString(key);
  if (!raw) return null;

  try {
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > ttl) return null;
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Get cached data regardless of TTL (for stale-while-revalidate).
 */
export function getStaleCache<T>(key: string): T | null {
  const raw = getStorage().getString(key);
  if (!raw) return null;

  try {
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Check if cached data is still fresh (within TTL).
 */
export function isCacheFresh(key: string, ttl = DEFAULT_TTL): boolean {
  const raw = getStorage().getString(key);
  if (!raw) return false;

  try {
    const entry: CacheEntry<unknown> = JSON.parse(raw);
    return Date.now() - entry.timestamp <= ttl;
  } catch {
    return false;
  }
}

/**
 * Store data in cache with current timestamp.
 */
export function setCache<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  getStorage().set(key, JSON.stringify(entry));
}

/**
 * Remove a specific cache entry.
 */
export function clearCacheKey(key: string): void {
  getStorage().remove(key);
}

/**
 * Clear all cache entries.
 */
export function clearAllCache(): void {
  getStorage().clearAll();
}

// --- Cache key builders ---

export const cacheKeys = {
  dashboardStats: (orgId: string) => `dashboard_stats_${orgId}`,
  reviews: (orgId: string, params: string) => `reviews_${orgId}_${params}`,
  reviewDetail: (reviewId: string) => `review_${reviewId}`,
  locations: (orgId: string) => `locations_${orgId}`,
  notifications: (orgId: string) => `notifications_${orgId}`,
  brandVoice: (orgId: string) => `brand_voice_${orgId}`,
  notificationPrefs: (orgId: string) => `notification_prefs_${orgId}`,
  usage: (orgId: string) => `usage_${orgId}`,
  teamMembers: (orgId: string) => `team_${orgId}`,
};
