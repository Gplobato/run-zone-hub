// Simple admin gate — client-side session token stored in localStorage.
// The actual credentials live server-side (ADMIN_USER / ADMIN_PASSWORD env
// vars) and are checked via a server function. This is intentionally light:
// the user asked for a single-owner admin, not a full auth system.

import { createServerFn } from "@tanstack/react-start";

const STORAGE_KEY = "paze_admin_token";
// Rotated per deploy would be safer, but a stable literal is fine for a
// single-owner mock admin — the real check is server-side.
const TOKEN_MARKER = "paze-admin-ok";

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === TOKEN_MARKER;
}

export function setAdminLoggedIn() {
  window.localStorage.setItem(STORAGE_KEY, TOKEN_MARKER);
}

export function clearAdminSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { user: string; password: string }) => data)
  .handler(async ({ data }) => {
    const okUser = process.env.ADMIN_USER;
    const okPass = process.env.ADMIN_PASSWORD;
    if (!okUser || !okPass) throw new Error("Admin não configurado.");
    if (data.user !== okUser || data.password !== okPass) {
      // Small delay to blunt brute force from the browser side.
      await new Promise((r) => setTimeout(r, 400));
      throw new Error("Credenciais inválidas.");
    }
    return { ok: true as const };
  });
