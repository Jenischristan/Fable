import { useSyncExternalStore } from "react";
import { getStoreVersion, subscribe } from "../mocks/store";

export function useMockData() {
  return useSyncExternalStore(subscribe, getStoreVersion, getStoreVersion);
}
