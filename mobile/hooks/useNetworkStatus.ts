import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { flushQueue } from "@/lib/offline-queue";

/**
 * Hook that tracks network connectivity and auto-flushes the offline queue
 * when connectivity is restored.
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? true;

      if (!connected) {
        setWasOffline(true);
      }

      // Coming back online — flush queued actions
      if (connected && wasOffline) {
        flushQueue().then((count) => {
          if (count > 0) {
            console.log(`Flushed ${count} offline actions`);
          }
        });
        setWasOffline(false);
      }

      setIsConnected(connected);
    });

    return () => unsubscribe();
  }, [wasOffline]);

  return { isConnected };
}
