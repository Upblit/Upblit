import { jwtDecode } from "jwt-decode"

import { AUTH_TOKEN_KEY, LEGACY_TOKEN_KEY } from "@/lib/auth-storage"

export function isTokenValid(token: string) {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token)
    return !decoded.exp || decoded.exp > Date.now() / 1000
  } catch {
    return false
  }
}

export function getStoredValidToken() {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem(AUTH_TOKEN_KEY) ?? localStorage.getItem(LEGACY_TOKEN_KEY)
  if (!token) return null

  return isTokenValid(token) ? token : null
}