import { createServerFn } from "@tanstack/react-start";

export const getUserDashboardDataServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getUserDashboardDataCore } = await import("./auth.server");
  return await getUserDashboardDataCore();
});

export const updateProfileServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      name?: string | undefined;
      phone?: string | undefined;
      companyName?: string | undefined;
      businessType?: string | undefined;
      city?: string | undefined;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { updateProfileCore } = await import("./auth.server");
    return await updateProfileCore(data);
  });
