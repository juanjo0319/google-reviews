import { createMMKV, type MMKV } from "react-native-mmkv";
import { api } from "./api";

let _storage: MMKV | null = null;
function getStorage(): MMKV {
  if (!_storage) {
    _storage = createMMKV({ id: "reviewai-offline-queue" });
  }
  return _storage;
}

const QUEUE_KEY = "pending_actions";

export interface QueuedAction {
  id: string;
  path: string;
  method: "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
  createdAt: number;
}

function getQueue(): QueuedAction[] {
  const raw = getStorage().getString(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedAction[]) {
  getStorage().set(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Enqueue an action to be retried when connectivity returns.
 */
export function enqueueAction(action: Omit<QueuedAction, "id" | "createdAt">) {
  const queue = getQueue();
  queue.push({
    ...action,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  });
  saveQueue(queue);
}

/**
 * Get the number of pending queued actions.
 */
export function getPendingCount(): number {
  return getQueue().length;
}

/**
 * Flush all queued actions (replay them). Returns count of successfully replayed actions.
 */
export async function flushQueue(): Promise<number> {
  const queue = getQueue();
  if (queue.length === 0) return 0;

  let successCount = 0;
  const failed: QueuedAction[] = [];

  for (const action of queue) {
    try {
      await api(action.path, {
        method: action.method,
        body: action.body,
      });
      successCount++;
    } catch {
      // Keep failed actions for next retry, but drop actions older than 24h
      const age = Date.now() - action.createdAt;
      if (age < 24 * 60 * 60 * 1000) {
        failed.push(action);
      }
    }
  }

  saveQueue(failed);
  return successCount;
}

/**
 * Clear all queued actions.
 */
export function clearQueue() {
  getStorage().remove(QUEUE_KEY);
}
