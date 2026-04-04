import { createMMKV, type MMKV } from "react-native-mmkv";

let _storage: MMKV | null = null;

function getStorage(): MMKV {
  if (!_storage) {
    _storage = createMMKV({ id: "reviewai-i18n" });
  }
  return _storage;
}

/** Thin wrapper that lazily initializes MMKV */
export const storage = {
  getString(key: string): string | undefined {
    return getStorage().getString(key);
  },
  set(key: string, value: string) {
    getStorage().set(key, value);
  },
};
