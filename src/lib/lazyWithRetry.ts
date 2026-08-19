import { lazy, type ComponentType } from "react";

const RELOAD_KEY = "chunk-reload-attempted";

/**
 * React.lazy wrapper that survives stale deploys.
 * If a hashed chunk 404s (because a new build replaced it), retry once,
 * then force a single full reload to pick up the new asset manifest.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const mod = await factory();
      sessionStorage.removeItem(RELOAD_KEY);
      return mod;
    } catch (error) {
      // Retry once — transient network blips resolve here.
      try {
        const mod = await factory();
        sessionStorage.removeItem(RELOAD_KEY);
        return mod;
      } catch (retryError) {
        const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY) === "true";
        if (!alreadyReloaded) {
          sessionStorage.setItem(RELOAD_KEY, "true");
          window.location.reload();
          // Never resolves; page is reloading.
          return new Promise<{ default: T }>(() => {});
        }
        throw retryError;
      }
    }
  });
}
