import { createServerFn } from "@tanstack/react-start";

export const getUserDashboardDataServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getUserDashboardDataCore } = await import("./auth.server");
  return await getUserDashboardDataCore();
});
