import { useState, useEffect, useCallback, useRef } from "react";
import { api, ApiError } from "@/lib/api";
import { getStaleCache, setCache, isCacheFresh } from "@/lib/cache";

interface UseCachedFetchOptions {
  /** Cache key — must be unique per query */
  cacheKey: string;
  /** Cache TTL in ms (default 5 min) */
  ttl?: number;
  /** Skip fetching (e.g. if orgId is null) */
  skip?: boolean;
}

interface UseCachedFetchResult<T> {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

/**
 * Stale-while-revalidate data fetching hook.
 *
 * 1. Returns cached data immediately (if any)
 * 2. Fetches fresh data in background
 * 3. Updates state when fresh data arrives
 * 4. Supports pull-to-refresh
 */
export function useCachedFetch<T>(
  path: string,
  options: UseCachedFetchOptions
): UseCachedFetchResult<T> {
  const { cacheKey, ttl = 5 * 60 * 1000, skip = false } = options;

  // Try to load from cache immediately
  const cachedData = skip ? null : getStaleCache<T>(cacheKey);
  const cacheFresh = skip ? false : isCacheFresh(cacheKey, ttl);

  const [data, setData] = useState<T | null>(cachedData);
  const [loading, setLoading] = useState(!cachedData && !skip);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (skip) return;

    try {
      const result = await api<T>(path);
      if (!mountedRef.current) return;

      setData(result);
      setCache(cacheKey, result);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;

      const message =
        err instanceof ApiError ? err.message : "Failed to load data";
      setError(message);
      // Keep showing cached data on error
    }
  }, [path, cacheKey, skip]);

  // Initial fetch — skip if cache is fresh
  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }

    if (cacheFresh && cachedData) {
      setLoading(false);
      return;
    }

    // If we have stale data, fetch in background (no loading state)
    if (cachedData) {
      fetchData();
      setLoading(false);
    } else {
      // No cache — show loading
      setLoading(true);
      fetchData().finally(() => {
        if (mountedRef.current) setLoading(false);
      });
    }
  }, [fetchData, skip]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    if (mountedRef.current) setRefreshing(false);
  }, [fetchData]);

  return { data, loading, refreshing, error, refresh: fetchData, onRefresh };
}
