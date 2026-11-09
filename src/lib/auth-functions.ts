import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SanitizedUser } from "./auth.server";

export type { SanitizedUser };

// -----------------------------------------------------------------------------
// 1. GET CURRENT USER
// -----------------------------------------------------------------------------
export const getCurrentUserServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getSessionUserCore } = await import("./auth.server");
  return await getSessionUserCore();
});

// -----------------------------------------------------------------------------
// 2. LOGIN USER
// -----------------------------------------------------------------------------
const LoginSchema = z.object({
  email: z.string().email("Please provide a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
  honeypot: z.string().optional(),
});

export const loginServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => LoginSchema.parse(data))
  .handler(async ({ data }) => {
    const { loginUserCore } = await import("./auth.server");
    return await loginUserCore(data);
  });

// -----------------------------------------------------------------------------
// 3. REGISTER WORKSHOP / CUSTOMER ACCOUNT
// -----------------------------------------------------------------------------
const RegisterSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  phone: z.string().min(8, "Valid phone number is required").trim(),
  companyName: z.string().min(2, "Company or Workshop name is required").trim(),
  businessType: z.string().default("Workshop / Garage"),
  city: z.string().default("Dhaka"),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .regex(/[A-Za-z]/, "Password must contain letters")
    .regex(/[0-9]/, "Password must contain numbers"),
  honeypot: z.string().optional(),
});

export const registerServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => RegisterSchema.parse(data))
  .handler(async ({ data }) => {
    const { registerUserCore } = await import("./auth.server");
    return await registerUserCore(data);
  });

// -----------------------------------------------------------------------------
// 4. LOGOUT USER
// -----------------------------------------------------------------------------
export const logoutServerFn = createServerFn({ method: "POST" }).handler(async () => {
  const { logoutUserCore } = await import("./auth.server");
  return await logoutUserCore();
});

// -----------------------------------------------------------------------------
// 5. REQUEST PASSWORD RESET
// -----------------------------------------------------------------------------
const RequestResetSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  honeypot: z.string().optional(),
});

export const requestPasswordResetServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => RequestResetSchema.parse(data))
  .handler(async ({ data }) => {
    const { requestPasswordResetCore } = await import("./auth.server");
    return await requestPasswordResetCore(data);
  });

// -----------------------------------------------------------------------------
// 6. RESET PASSWORD WITH TOKEN
// -----------------------------------------------------------------------------
const ResetWithTokenSchema = z.object({
  token: z.string().min(10, "Invalid reset token"),
  newPassword: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .regex(/[A-Za-z]/, "Password must contain letters")
    .regex(/[0-9]/, "Password must contain numbers"),
});

export const resetPasswordWithTokenServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ResetWithTokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { resetPasswordWithTokenCore } = await import("./auth.server");
    return await resetPasswordWithTokenCore(data);
  });

// -----------------------------------------------------------------------------
// 7. CHANGE PASSWORD
// -----------------------------------------------------------------------------
const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .regex(/[A-Za-z]/, "Password must contain letters")
    .regex(/[0-9]/, "Password must contain numbers"),
});

export const changePasswordServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ChangePasswordSchema.parse(data))
  .handler(async ({ data }) => {
    const { changePasswordCore } = await import("./auth.server");
    return await changePasswordCore(data);
  });
