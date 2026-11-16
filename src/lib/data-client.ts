import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getQuoteSubmissionConfigServerFn,
  sendQuoteOtpServerFn,
  verifyQuoteOtpAndSubmitServerFn,
  createQuoteServerFn,
  listQuotesServerFn,
  updateQuoteServerFn,
  deleteQuoteServerFn,
  createBookingServerFn,
  listBookingsServerFn,
  updateBookingServerFn,
  deleteBookingServerFn,
  createOrderServerFn,
  listOrdersServerFn,
  updateOrderStatusServerFn,
  listInventoryServerFn,
  listCatalogProductsServerFn,
  getProductBySlugServerFn,
  updateInventoryItemServerFn,
  createInventoryItemServerFn,
  deleteInventoryItemServerFn,
  listBannersServerFn,
  saveBannerServerFn,
  deleteBannerServerFn,
  reorderBannersServerFn,
  getShopBannerVideoPublicServerFn,
  getShopBannerVideoAdminServerFn,
  saveShopBannerVideoServerFn,
  listUpdatesServerFn,
  getUpdateBySlugServerFn,
  saveUpdateServerFn,
  deleteUpdateServerFn,
  listAdminUsersServerFn,
  updateUserRoleServerFn,
  deleteUserServerFn,
  getSettingsServerFn,
  updateSettingsServerFn,
  getAdminStatsServerFn,
  getAdminDatabaseOverviewServerFn,
  getAdminDatabaseTableRowsServerFn,
  listReviewsServerFn,
  listAdminReviewsServerFn,
  submitPublicReviewServerFn,
  saveReviewAdminServerFn,
  toggleReviewPublishAdminServerFn,
  deleteReviewAdminServerFn,
  seedDefaultReviewsServerFn,
} from "./server-functions";
import type { Review } from "./reviews";
import type {
  CreateQuoteInput,
  CreateBookingInput,
  CreateOrderInput,
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
} from "./data.server";
import type { Product } from "./data";
import type { ShopBannerVideoConfig, ShopBannerVideoItem } from "./shop-banner-video";
export type { ShopBannerVideoConfig, ShopBannerVideoItem } from "./shop-banner-video";

// =============================================================================
// 1. DASHBOARD STATS HOOK
// =============================================================================

export interface AdminStats {
  totalQuotes: number;
  pendingQuotes: number;
  totalBookings: number;
  pendingBookings: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockCount: number;
  activeBanners: number;
  totalReviews: number;
  pendingReviews: number;
  totalUsers: number;
  customerCount: number;
  recentQuotes: any[];
  recentBookings: any[];
  recentOrders: any[];
  lowStockItems: any[];
  categoryDistribution: { name: string; count: number }[];
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      return (await getAdminStatsServerFn()) as AdminStats;
    },
    refetchInterval: 15000, // Auto-refresh every 15s for live dashboard
  });
}

// =============================================================================
// 2. QUOTATIONS HOOKS
// =============================================================================

export function useQuoteSubmissionConfig() {
  return useQuery({
    queryKey: ["quote-submission-config"],
    queryFn: async () => {
      return await getQuoteSubmissionConfigServerFn();
    },
    staleTime: 60_000,
  });
}

export function useQuotes(filter?: { status?: string | undefined; search?: string | undefined }) {
  return useQuery({
    queryKey: ["quotes", filter?.status, filter?.search],
    queryFn: async () => {
      return await listQuotesServerFn({ data: filter || {} });
    },
    refetchInterval: 15000, // Keep quotations queue live alongside admin stats
  });
}

export function useSendQuoteOtp() {
  return useMutation({
    mutationFn: async (data: {
      email: string;
      companyName?: string | undefined;
      productName?: string | undefined;
    }) => {
      return await sendQuoteOtpServerFn({ data });
    },
  });
}

export function useVerifyAndSubmitQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateQuoteInput & { otp: string }) => {
      return await verifyQuoteOtpAndSubmitServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateQuoteInput) => {
      return await createQuoteServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      status?: string | undefined;
      reply?: string | undefined;
      quotedPrice?: number | undefined;
      notes?: string | undefined;
      itemsJson?:
        | { productSlug: string; productName: string; qty: number; unitPrice?: number }[]
        | undefined;
      companyName?: string | undefined;
      contactName?: string | undefined;
      phone?: string | undefined;
      email?: string | undefined;
      qty?: number | undefined;
      productName?: string | undefined;
      productSlug?: string | undefined;
    }) => {
      return await updateQuoteServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteQuoteServerFn({ data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// =============================================================================
// 3. BOOKINGS HOOKS
// =============================================================================

export function useBookings(filter?: { status?: string | undefined }) {
  return useQuery({
    queryKey: ["bookings", filter?.status],
    queryFn: async () => {
      return await listBookingsServerFn({ data: filter || {} });
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBookingInput) => {
      return await createBookingServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      status?: string | undefined;
      adminNotes?: string | undefined;
      notes?: string | undefined;
      bookingDate?: string | undefined;
      timeSlot?: string | undefined;
      centerName?: string | undefined;
      serviceType?: string | undefined;
    }) => {
      return await updateBookingServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteBookingServerFn({ data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// =============================================================================
// 4. ORDERS HOOKS
// =============================================================================

export function useOrders(filter?: { status?: string | undefined }) {
  return useQuery({
    queryKey: ["orders", filter?.status],
    queryFn: async () => {
      return await listOrdersServerFn({ data: filter || {} });
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      return await createOrderServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      status?: string | undefined;
      paymentStatus?: string | undefined;
      notes?: string | undefined;
    }) => {
      return await updateOrderStatusServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// =============================================================================
// 5. INVENTORY & STOREFRONT CATALOG HOOKS
// =============================================================================

export function useCatalogProducts(initialData?: Product[]) {
  return useQuery({
    queryKey: ["catalog", "products"],
    queryFn: async () => {
      return await listCatalogProductsServerFn();
    },
    ...(initialData ? { initialData } : {}),
  });
}

export function useProductBySlug(slug: string, initialData?: Product) {
  return useQuery({
    queryKey: ["catalog", "product", slug],
    queryFn: async () => {
      return await getProductBySlugServerFn({ data: { slug } });
    },
    enabled: Boolean(slug),
    ...(initialData ? { initialData } : {}),
  });
}

export function useInventory() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      return await listInventoryServerFn();
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateInventoryItemInput) => {
      return await updateInventoryItemServerFn({ data });
    },
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      queryClient.invalidateQueries({ queryKey: ["catalog", "product", variables.slug] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateInventoryItemInput) => {
      return await createInventoryItemServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      return await deleteInventoryItemServerFn({ data: { slug } });
    },
    onSuccess: (_res, slug) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      queryClient.invalidateQueries({ queryKey: ["catalog", "product", slug] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// =============================================================================
// 6. BANNERS HOOKS
// =============================================================================

export function useBanners(onlyActive = false) {
  return useQuery({
    queryKey: ["banners", onlyActive],
    queryFn: async () => {
      return await listBannersServerFn({ data: { onlyActive } });
    },
  });
}

export function useSaveBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id?: string | undefined;
      title: string;
      subtitle?: string | undefined;
      imageUrl: string;
      badge?: string | undefined;
      category?: string | undefined;
      link?: string | undefined;
      isActive?: boolean | undefined;
      sortOrder?: number | undefined;
    }) => {
      return await saveBannerServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteBannerServerFn({ data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}

export function useReorderBanners() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      return await reorderBannersServerFn({ data: { orderedIds } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}

export function useShopBannerVideo(initialData?: { activeVideoUrl: string }) {
  return useQuery({
    queryKey: ["shop-banner-video"],
    queryFn: async () => {
      return await getShopBannerVideoPublicServerFn();
    },
    ...(initialData ? { initialData } : {}),
  });
}

export function useAdminShopBannerVideo() {
  return useQuery<ShopBannerVideoConfig>({
    queryKey: ["shop-banner-video", "admin"],
    queryFn: async () => {
      return await getShopBannerVideoAdminServerFn();
    },
  });
}

export function useSaveShopBannerVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      activeVideoUrl: string;
      videos?: ShopBannerVideoItem[] | undefined;
    }) => {
      return await saveShopBannerVideoServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-banner-video"] });
      queryClient.invalidateQueries({ queryKey: ["shop-banner-video", "admin"] });
    },
  });
}

// =============================================================================
// 7. UPDATES HOOKS
// =============================================================================

export function useUpdates(onlyPublished = false) {
  return useQuery({
    queryKey: ["updates", onlyPublished],
    queryFn: async () => {
      return await listUpdatesServerFn({ data: { onlyPublished } });
    },
  });
}

export function useUpdateBySlug(slug: string) {
  return useQuery({
    queryKey: ["update", slug],
    queryFn: async () => {
      return await getUpdateBySlugServerFn({ data: { slug } });
    },
    enabled: Boolean(slug),
  });
}

export function useSaveUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id?: string | undefined;
      title: string;
      slug: string;
      content: string;
      excerpt?: string | undefined;
      coverImage?: string | undefined;
      category?: string | undefined;
      isPublished?: boolean | undefined;
    }) => {
      return await saveUpdateServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["updates"] });
    },
  });
}

export function useDeleteUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteUpdateServerFn({ data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["updates"] });
    },
  });
}

// =============================================================================
// 8. ADMIN USERS HOOKS
// =============================================================================

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      return await listAdminUsersServerFn();
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      role?: string | undefined;
      isActive?: boolean | undefined;
    }) => {
      return await updateUserRoleServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteUserServerFn({ data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// =============================================================================
// 9. SETTINGS HOOKS
// =============================================================================

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      return await getSettingsServerFn();
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Record<string, unknown>) => {
      return await updateSettingsServerFn({ data: { settings } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

// =============================================================================
// 10. ADMIN DATABASE TABLE INSPECTOR HOOKS
// =============================================================================

export function useAdminDatabaseOverview() {
  return useQuery({
    queryKey: ["admin", "database", "overview"],
    queryFn: async () => {
      return await getAdminDatabaseOverviewServerFn();
    },
  });
}

export function useAdminDatabaseTableRows(
  tableName: string,
  limit = 50,
  offset = 0,
  enabled = true,
) {
  return useQuery({
    queryKey: ["admin", "database", "rows", tableName, limit, offset],
    queryFn: async () => {
      return await getAdminDatabaseTableRowsServerFn({
        data: { tableName, limit, offset },
      });
    },
    enabled: enabled && Boolean(tableName),
  });
}

// =============================================================================
// REVIEWS & TESTIMONIALS HOOKS
// =============================================================================

export function useReviews(onlyPublished = false, initialData?: Review[]) {
  return useQuery({
    queryKey: ["reviews", onlyPublished],
    queryFn: async () => {
      return (await listReviewsServerFn({
        data: { onlyPublished },
      })) as Review[];
    },
    initialData,
  });
}

export function useAdminReviews() {
  return useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => {
      return await listAdminReviewsServerFn();
    },
  });
}

export function useSubmitPublicReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      role?: string | undefined;
      workshop: string;
      equipment?: string | undefined;
      comment: string;
      title?: string | undefined;
      rating?: number | undefined;
    }) => {
      return await submitPublicReviewServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useSaveReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id?: string | undefined;
      name: string;
      role: string;
      workshop: string;
      equipment: string;
      comment: string;
      title?: string | undefined;
      rating?: number | undefined;
      isPublished?: boolean | undefined;
    }) => {
      return await saveReviewAdminServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useToggleReviewPublish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; isPublished: boolean }) => {
      return await toggleReviewPublishAdminServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string }) => {
      return await deleteReviewAdminServerFn({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useSeedDefaultReviews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return await seedDefaultReviewsServerFn();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}
