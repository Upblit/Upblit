"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { getStoredValidToken } from "@/lib/auth-session"
import { useUserData } from "@/hooks/use-userData"
import { AUTH_TOKEN_KEY, LEGACY_TOKEN_KEY } from "@/lib/auth-storage"

export function AuthRedirectGate() {
  const router = useRouter()
  const setToken = useUserData((state) => state.setToken)

  useEffect(() => {
    const token = getStoredValidToken()
    if (!token) return

    setToken(token)
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(LEGACY_TOKEN_KEY, token)
    router.replace("/dashboard")
  }, [router, setToken])

  return null
}