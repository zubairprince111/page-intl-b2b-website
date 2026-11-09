import {
  db,
  users,
  sessions,
  passwordResetTokens,
  auditLog,
  emailLog,
  quotes,
  bookings,
  orders,
  orderItems,
} from "@/db";
import { eq, and, gt, isNull, or, desc } from "drizzle-orm";
import { getCookie, setCookie, deleteCookie, getRequestIP } from "@tanstack/react-start/server";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { checkRateLimit } from "./rate-limiter";
import { sendTransactionalEmail, renderPasswordResetEmail } from "./email.server";

export const SESSION_COOKIE_NAME = "page_session";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface SanitizedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  businessType: string;
  city: string;
  role: string;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
}

export function getClientIp(): string {
  try {
    return getRequestIP() || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

export async function getSessionUserCore(): Promise<SanitizedUser | null> {
  let token: string | undefined;
  try {
    token = getCookie(SESSION_COOKIE_NAME);
  } catch {
    return null;
  }

  if (!token || token.trim().length === 0) {
    return null;
  }

  const now = new Date();
  const sessionRows = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, now)))
    .limit(1);

  const matched = sessionRows[0];
  if (!matched) {
    try {
      deleteCookie(SESSION_COOKIE_NAME, { path: "/" });
    } catch {
      // ignore
    }
    return null;
  }

  const { user } = matched;
  if (!user.isActive) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    companyName: user.companyName,
    businessType: user.businessType,
    city: user.city,
    role: user.role,
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  };
}

export async function loginUserCore(data: {
  email: string;
  password: string;
  honeypot?: string | undefined;
}) {
  const ip = getClientIp();

  if (data.honeypot && data.honeypot.trim().length > 0) {
    await new Promise((r) => setTimeout(r, 800));
    return { success: false, error: "Invalid credentials" };
  }

  const rateCheck = checkRateLimit(`login:${ip}`, 5, 60);
  if (!rateCheck.allowed) {
    throw new Error(`Too many login attempts. Please wait ${rateCheck.resetInSeconds} seconds.`);
  }

  const userRows = await db.select().from(users).where(eq(users.email, data.email)).limit(1);

  const user = userRows[0];
  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }

  if (!user.isActive) {
    return { success: false, error: "This account has been suspended. Please contact support." };
  }

  if (!user.passwordHash) {
    return { success: false, error: "Password login not configured for this account." };
  }

  const isMatch = await bcrypt.compare(data.password, user.passwordHash);
  if (!isMatch) {
    return { success: false, error: "Invalid email or password." };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.insert(sessions).values({
    id: `sess-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    userId: user.id,
    token,
    expiresAt,
  });

  await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));

  setCookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  try {
    await db.insert(auditLog).values({
      id: `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      actorId: user.id,
      actorEmail: user.email,
      action: "user.login",
      entityType: "user",
      entityId: user.id,
      ipAddress: ip,
      metadata: { role: user.role },
    });
  } catch {
    // Non-blocking
  }

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      companyName: user.companyName,
      businessType: user.businessType,
      city: user.city,
      role: user.role,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
  };
}

export async function registerUserCore(data: {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  businessType: string;
  city: string;
  password: string;
  honeypot?: string | undefined;
}) {
  const ip = getClientIp();

  if (data.honeypot && data.honeypot.trim().length > 0) {
    await new Promise((r) => setTimeout(r, 800));
    return { success: false, error: "Registration failed." };
  }

  const rateCheck = checkRateLimit(`register:${ip}`, 3, 300);
  if (!rateCheck.allowed) {
    throw new Error(
      `Too many registrations from this IP. Please wait ${rateCheck.resetInSeconds} seconds.`,
    );
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: "An account with this email address already exists." };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const userId = `usr-reg-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  await db.insert(users).values({
    id: userId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    passwordHash,
    companyName: data.companyName,
    businessType: data.businessType,
    city: data.city,
    role: "customer",
    emailVerified: false,
    isActive: true,
    lastLogin: new Date(),
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.insert(sessions).values({
    id: `sess-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    userId,
    token,
    expiresAt,
  });

  setCookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  try {
    await db.insert(auditLog).values({
      id: `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      actorId: userId,
      actorEmail: data.email,
      action: "user.register",
      entityType: "user",
      entityId: userId,
      ipAddress: ip,
    });
  } catch {
    // Non-blocking
  }

  return {
    success: true,
    user: {
      id: userId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName,
      businessType: data.businessType,
      city: data.city,
      role: "customer",
      emailVerified: false,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
    },
  };
}

export async function logoutUserCore() {
  let token: string | undefined;
  try {
    token = getCookie(SESSION_COOKIE_NAME);
  } catch {
    // ignore
  }

  if (token) {
    try {
      await db.delete(sessions).where(eq(sessions.token, token));
    } catch {
      // ignore
    }
  }

  try {
    deleteCookie(SESSION_COOKIE_NAME, { path: "/" });
  } catch {
    // ignore
  }

  return { success: true };
}

export async function requestPasswordResetCore(data: {
  email: string;
  honeypot?: string | undefined;
}) {
  const ip = getClientIp();

  if (data.honeypot && data.honeypot.trim().length > 0) {
    await new Promise((r) => setTimeout(r, 600));
    return { success: true, message: "If an account exists, a reset link was generated." };
  }

  const rateCheck = checkRateLimit(`reset:${ip}`, 3, 300);
  if (!rateCheck.allowed) {
    throw new Error(`Too many reset requests. Please wait ${rateCheck.resetInSeconds} seconds.`);
  }

  const userRows = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  const user = userRows[0];
  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResetTokens).values({
      id: `pwreset-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const resetLink = `${process.env["APP_URL"] || "http://localhost:8080"}/reset-password?token=${rawToken}`;
    const emailData = renderPasswordResetEmail({
      name: user.name || "Customer",
      resetLink,
      expiresInMinutes: 60,
    });

    sendTransactionalEmail({
      to: user.email,
      subject: "PAGE International — Password Reset Request",
      template: "PASSWORD_RESET",
      html: emailData.html,
      text: emailData.text,
    }).catch(() => {});

    console.log(`[AUTH] Password reset token generated for ${user.email}: ${rawToken}`);
  }

  return {
    success: true,
    message:
      "If an account is associated with this email, password reset instructions have been dispatched.",
  };
}

export async function resetPasswordWithTokenCore(data: { token: string; newPassword: string }) {
  const tokenHash = crypto.createHash("sha256").update(data.token).digest("hex");
  const now = new Date();

  const tokenRows = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now),
      ),
    )
    .limit(1);

  const resetRow = tokenRows[0];
  if (!resetRow) {
    return { success: false, error: "Reset token is invalid or has expired." };
  }

  const newHash = await bcrypt.hash(data.newPassword, 12);

  await db
    .update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, resetRow.userId));

  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, resetRow.id));

  await db.delete(sessions).where(eq(sessions.userId, resetRow.userId));

  return { success: true, message: "Password updated successfully. You may now log in." };
}

export async function changePasswordCore(data: { currentPassword: string; newPassword: string }) {
  const user = await getSessionUserCore();
  if (!user) {
    throw new Error("Unauthorized. Please log in.");
  }

  const userRows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  const userRow = userRows[0];
  if (!userRow || !userRow.passwordHash) {
    throw new Error("User record not found.");
  }

  const isMatch = await bcrypt.compare(data.currentPassword, userRow.passwordHash);
  if (!isMatch) {
    return { success: false, error: "Current password does not match our records." };
  }

  const newHash = await bcrypt.hash(data.newPassword, 12);
  await db
    .update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  return { success: true, message: "Password changed successfully." };
}

export async function getUserDashboardDataCore() {
  const user = await getSessionUserCore();
  if (!user) {
    throw new Error("Unauthorized. Please log in.");
  }

  const [userQuotes, userBookings, userOrders] = await Promise.all([
    db
      .select()
      .from(quotes)
      .where(or(eq(quotes.userId, user.id), eq(quotes.email, user.email)))
      .orderBy(desc(quotes.createdAt)),
    db
      .select()
      .from(bookings)
      .where(or(eq(bookings.userId, user.id), eq(bookings.email, user.email)))
      .orderBy(desc(bookings.createdAt)),
    db
      .select()
      .from(orders)
      .where(or(eq(orders.userId, user.id), eq(orders.customerEmail, user.email)))
      .orderBy(desc(orders.createdAt)),
  ]);

  const orderIds = userOrders.map((o) => o.id);
  let items: Array<typeof orderItems.$inferSelect> = [];
  if (orderIds.length > 0) {
    items = await db.select().from(orderItems);
  }

  const ordersWithItems = userOrders.map((order) => {
    const { metadata, ...rest } = order;
    return {
      ...rest,
      metadata: (metadata || {}) as Record<string, string | number | boolean>,
      items: items.filter((item) => item.orderId === order.id),
    };
  });

  return {
    quotes: userQuotes,
    bookings: userBookings,
    orders: ordersWithItems,
  };
}
