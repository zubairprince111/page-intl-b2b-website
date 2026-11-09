import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    // Public users request quotes with frictionless Email OTP verification.
    // Client account creation is not needed; administrative staff use /admin/login.
    throw redirect({ to: "/admin/login" });
  },
  component: () => null,
});
