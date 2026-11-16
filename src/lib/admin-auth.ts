import { redirect } from "@tanstack/react-router";
import { getCurrentUserServerFn } from "./auth-functions";

/**
 * Route-level guard for TanStack Router `beforeLoad`.
 * Runs before any component renders or child data hooks fire.
 * Immediately redirects unauthenticated users or non-admins to `/admin/login`.
 */
export async function requireAdminBeforeLoad() {
  const user = await getCurrentUserServerFn();
  if (!user || user.role !== "admin") {
    throw redirect({
      to: "/admin/login",
    });
  }
  return { adminUser: user };
}

