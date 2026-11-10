import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
  CreateQuoteInput,
  CreateBookingInput,
  CreateOrderInput,
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
} from "./data.server";

// =============================================================================
// 1. QUOTES RPC FUNCTIONS
// =============================================================================

export const getQuoteSubmissionConfigServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const { isQuoteEmailOtpRequired } = await import("./otp.server");
    return { requireEmailOtp: isQuoteEmailOtpRequired() };
  },
);

export const sendQuoteOtpServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: { email: string; companyName?: string | undefined; productName?: string | undefined }) =>
      data,
  )
  .handler(async ({ data }) => {
    const { sendQuoteOtpCore } = await import("./otp.server");
    return await sendQuoteOtpCore(data);
  });

export const verifyQuoteOtpAndSubmitServerFn = createServerFn({ method: "POST" })
  .validator((data: CreateQuoteInput & { otp: string }) => data)
  .handler(async ({ data }) => {
    const { verifyQuoteOtpAndCreateCore } = await import("./otp.server");
    return await verifyQuoteOtpAndCreateCore({ ...data, verifiedViaOtp: true });
  });

export const createQuoteServerFn = createServerFn({ method: "POST" })
  .validator((data: CreateQuoteInput) => data)
  .handler(async ({ data }) => {
    const { isQuoteEmailOtpRequired } = await import("./otp.server");
    if (isQuoteEmailOtpRequired()) {
      throw new Error("Email OTP verification is required to submit quotations.");
    }
    const { createQuoteCore } = await import("./data.server");
    return await createQuoteCore({ ...data, verifiedViaOtp: false });
  });

export const listQuotesServerFn = createServerFn({ method: "GET" })
  .validator((data?: { status?: string | undefined; search?: string | undefined }) => data || {})
  .handler(async ({ data }) => {
    const { listQuotesCore } = await import("./data.server");
    return await listQuotesCore(data);
  });

export const updateQuoteServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      status?: string | undefined;
      reply?: string | undefined;
      quotedPrice?: number | undefined;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { updateQuoteCore } = await import("./data.server");
    return await updateQuoteCore(data);
  });

export const deleteQuoteServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { deleteQuoteCore } = await import("./data.server");
    return await deleteQuoteCore(data.id);
  });

// =============================================================================
// 2. BOOKINGS RPC FUNCTIONS
// =============================================================================

export const createBookingServerFn = createServerFn({ method: "POST" })
  .validator((data: CreateBookingInput) => data)
  .handler(async ({ data }) => {
    const { createBookingCore } = await import("./data.server");
    return await createBookingCore(data);
  });

export const listBookingsServerFn = createServerFn({ method: "GET" })
  .validator((data?: { status?: string | undefined }) => data || {})
  .handler(async ({ data }) => {
    const { listBookingsCore } = await import("./data.server");
    return await listBookingsCore(data);
  });

export const updateBookingServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: { id: string; status?: string | undefined; adminNotes?: string | undefined }) => data,
  )
  .handler(async ({ data }) => {
    const { updateBookingCore } = await import("./data.server");
    return await updateBookingCore(data);
  });

export const deleteBookingServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { deleteBookingCore } = await import("./data.server");
    return await deleteBookingCore(data.id);
  });

// =============================================================================
// 3. ORDERS RPC FUNCTIONS
// =============================================================================

export const createOrderServerFn = createServerFn({ method: "POST" })
  .validator((data: CreateOrderInput) => data)
  .handler(async ({ data }) => {
    const { createOrderCore } = await import("./data.server");
    return (await createOrderCore(data)) as any;
  });

export const listOrdersServerFn = createServerFn({ method: "GET" })
  .validator((data?: { status?: string | undefined }) => data || {})
  .handler(async ({ data }) => {
    const { listOrdersCore } = await import("./data.server");
    return (await listOrdersCore(data)) as any;
  });

export const updateOrderStatusServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      status?: string | undefined;
      paymentStatus?: string | undefined;
      notes?: string | undefined;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { updateOrderStatusCore } = await import("./data.server");
    return (await updateOrderStatusCore(data)) as any;
  });

// =============================================================================
// 4. INVENTORY & PUBLIC CATALOG RPC FUNCTIONS
// =============================================================================

export const listCatalogProductsServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const { listCatalogProductsCore } = await import("./data.server");
  return await listCatalogProductsCore();
});

export const getProductBySlugServerFn = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { getProductBySlugCore } = await import("./data.server");
    return await getProductBySlugCore(data.slug);
  });

export const listInventoryServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const { listInventoryCore } = await import("./data.server");
  return await listInventoryCore();
});

export const updateInventoryItemServerFn = createServerFn({ method: "POST" })
  .validator((data: UpdateInventoryItemInput) => data)
  .handler(async ({ data }) => {
    const { updateInventoryItemCore } = await import("./data.server");
    return await updateInventoryItemCore(data);
  });

export const createInventoryItemServerFn = createServerFn({ method: "POST" })
  .validator((data: CreateInventoryItemInput) => data)
  .handler(async ({ data }) => {
    const { createInventoryItemCore } = await import("./data.server");
    return await createInventoryItemCore(data);
  });

export const deleteInventoryItemServerFn = createServerFn({ method: "POST" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { deleteInventoryItemCore } = await import("./data.server");
    return await deleteInventoryItemCore(data.slug);
  });

// =============================================================================
// 5. BANNERS RPC FUNCTIONS
// =============================================================================

export const listBannersServerFn = createServerFn({ method: "GET" })
  .validator((data?: { onlyActive?: boolean | undefined }) => data || {})
  .handler(async ({ data }) => {
    const { listBannersCore } = await import("./data.server");
    return await listBannersCore(data?.onlyActive);
  });

export const saveBannerServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id?: string | undefined;
      title: string;
      subtitle?: string | undefined;
      imageUrl: string;
      badge?: string | undefined;
      category?: string | undefined;
      link?: string | undefined;
      isActive?: boolean | undefined;
      sortOrder?: number | undefined;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { saveBannerCore } = await import("./data.server");
    return await saveBannerCore(data);
  });

export const deleteBannerServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { deleteBannerCore } = await import("./data.server");
    return await deleteBannerCore(data.id);
  });

export const reorderBannersServerFn = createServerFn({ method: "POST" })
  .validator((data: { orderedIds: string[] }) => data)
  .handler(async ({ data }) => {
    const { reorderBannersCore } = await import("./data.server");
    return await reorderBannersCore(data.orderedIds);
  });

// =============================================================================
// 6. UPDATES RPC FUNCTIONS
// =============================================================================

export const listUpdatesServerFn = createServerFn({ method: "GET" })
  .validator((data?: { onlyPublished?: boolean | undefined }) => data || {})
  .handler(async ({ data }) => {
    const { listUpdatesCore } = await import("./data.server");
    return await listUpdatesCore(data?.onlyPublished);
  });

export const getUpdateBySlugServerFn = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { getUpdateBySlugCore } = await import("./data.server");
    return await getUpdateBySlugCore(data.slug);
  });

export const saveUpdateServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id?: string | undefined;
      title: string;
      slug: string;
      content: string;
      excerpt?: string | undefined;
      coverImage?: string | undefined;
      category?: string | undefined;
      isPublished?: boolean | undefined;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { saveUpdateCore } = await import("./data.server");
    return await saveUpdateCore(data);
  });

export const deleteUpdateServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { deleteUpdateCore } = await import("./data.server");
    return await deleteUpdateCore(data.id);
  });

// =============================================================================
// 7. USERS RPC FUNCTIONS
// =============================================================================

export const listAdminUsersServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const { listAdminUsersCore } = await import("./data.server");
  return await listAdminUsersCore();
});

export const updateUserRoleServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: { id: string; role?: string | undefined; isActive?: boolean | undefined }) => data,
  )
  .handler(async ({ data }) => {
    const { updateUserRoleCore } = await import("./data.server");
    return await updateUserRoleCore(data);
  });

export const deleteUserServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { deleteUserCore } = await import("./data.server");
    return await deleteUserCore(data.id);
  });

// =============================================================================
// 8. SETTINGS RPC FUNCTIONS
// =============================================================================

export const getSettingsServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getSettingsCore } = await import("./data.server");
  return (await getSettingsCore()) as Record<string, any>;
});

export const updateSettingsServerFn = createServerFn({ method: "POST" })
  .validator((data: { settings: Record<string, any> }) => data)
  .handler(async ({ data }) => {
    const { updateSettingsCore } = await import("./data.server");
    return (await updateSettingsCore(data.settings)) as any;
  });

// =============================================================================
// 9. DASHBOARD STATS RPC
// =============================================================================

export const getAdminStatsServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getAdminStatsCore } = await import("./data.server");
  return (await getAdminStatsCore()) as any;
});
