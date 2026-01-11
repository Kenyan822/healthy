export * from "./chains";
export * from "./menus";
export * from "./keywords";

import { SiteStats } from "@/types";

export const mockSiteStats: SiteStats = {
  totalChains: 15,
  totalMenus: 200,
  totalStations: 120,
  lastUpdated: "2024-01-15",
};
