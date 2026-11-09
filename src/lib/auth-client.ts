import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUserServerFn,
  loginServerFn,
  registerServerFn,
  logoutServerFn,
  requestPasswordResetServerFn,
  resetPasswordWithTokenServerFn,
  changePasswordServerFn,
  type SanitizedUser,
} from "./auth-functions";

export type { SanitizedUser };

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      return (await getCurrentUserServerFn()) as SanitizedUser | null;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string; honeypot?: string }) => {
      const res = await loginServerFn({ data: credentials });
      return res;
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      }
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      phone: string;
      companyName: string;
      businessType: string;
      city: string;
      password: string;
      honeypot?: string;
    }) => {
      const res = await registerServerFn({ data: payload });
      return res;
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return await logoutServerFn();
    },
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      queryClient.invalidateQueries();
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (data: { email: string; honeypot?: string }) => {
      return await requestPasswordResetServerFn({ data });
    },
  });
}

export function useResetPasswordWithToken() {
  return useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      return await resetPasswordWithTokenServerFn({ data });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await changePasswordServerFn({ data });
    },
  });
}
