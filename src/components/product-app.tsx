"use client";

import { AppShell } from "./app-shell";
import { AnalyticsScreen } from "./screens/analytics-screen";
import { DownloadsScreen } from "./screens/downloads-screen";
import { PublicationsScreen } from "./screens/publications-screen";
import { StrategiesScreen } from "./screens/strategies-screen";
import { StrategyScreen } from "./screens/strategy-screen";

export function ProductApp({ slug }: { slug: string[] }) {
  const [page, id, section] = slug;
  let screen = <StrategiesScreen />;
  if (page === "strategy") screen = <StrategyScreen strategyId={id} section={section ?? "overview"} />;
  if (page === "analytics") screen = <AnalyticsScreen initialStrategyId={id} />;
  if (page === "publications") screen = <PublicationsScreen />;
  if (page === "downloads") screen = <DownloadsScreen />;
  return <AppShell>{screen}</AppShell>;
}
