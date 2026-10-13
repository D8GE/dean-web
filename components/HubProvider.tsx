"use client";

import { createContext, useContext } from "react";
import type { HubSnapshot } from "@/lib/hub";

const HubContext = createContext<HubSnapshot | null>(null);

export function HubProvider({ hub, children }: { hub: HubSnapshot; children: React.ReactNode }) {
  return <HubContext.Provider value={hub}>{children}</HubContext.Provider>;
}

export function useHub(): HubSnapshot {
  const hub = useContext(HubContext);
  if (!hub) throw new Error("useHub must be used within HubProvider");
  return hub;
}
