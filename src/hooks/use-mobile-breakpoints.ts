"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(query: string) {
  return (onChange: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  };
}

export function useMediaQuery(query: string) {
  const subscribeToQuery = useCallback(
    (onChange: () => void) => subscribe(query)(onChange),
    [query],
  );
  return useSyncExternalStore(
    subscribeToQuery,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useMobileBreakpoints() {
  const belowLg = useMediaQuery("(max-width: 1023px)");
  const belowSm = useMediaQuery("(max-width: 639px)");
  return { belowLg, belowSm };
}

export function useMounted() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}
