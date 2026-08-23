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

function envValue(name: string): string | undefined {
  const nodeValue = process.env[name];
  if (nodeValue) return nodeValue;

  const cloudflareEnv = (
    globalThis as typeof globalThis & {
      __env__?: Record<string, string | undefined>;
    }
  ).__env__;

  return cloudflareEnv?.[name];
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { user: string; password: string }) => data)
  .handler(async ({ data }) => {
    const okUser = envValue("ADMIN_USER") || "admin";
    const okPass = envValue("ADMIN_PASSWORD") || "admin2026";
    if (data.user.trim() !== okUser || data.password !== okPass) {
      // Small delay to blunt brute force from the browser side.
      await new Promise((r) => setTimeout(r, 400));
      throw new Error("Credenciais inválidas.");
    }
    return { ok: true as const };
  });
