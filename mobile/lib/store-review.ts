import * as StoreReview from "expo-store-review";
import { createMMKV, type MMKV } from "react-native-mmkv";

let _storage: MMKV | null = null;
function getStorage(): MMKV {
  if (!_storage) {
    _storage = createMMKV({ id: "reviewai-store-review" });
  }
  return _storage;
}

const PUBLISH_COUNT_KEY = "publish_count";
const PROMPTED_KEY = "review_prompted";
const THRESHOLD = 5;

/**
 * Track a published response. After 5 publishes, prompt for App Store review.
 */
export async function trackPublishAndMaybePrompt() {
  const storage = getStorage();
  const count = (storage.getNumber(PUBLISH_COUNT_KEY) ?? 0) + 1;
  storage.set(PUBLISH_COUNT_KEY, count);

  // Only prompt once, after threshold
  if (count >= THRESHOLD && !storage.getBoolean(PROMPTED_KEY)) {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable) {
      storage.set(PROMPTED_KEY, true);
      await StoreReview.requestReview();
    }
  }
}
