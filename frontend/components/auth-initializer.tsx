"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useUserData } from "@/hooks/use-userData";
import { AUTH_TOKEN_KEY, LEGACY_TOKEN_KEY } from "@/lib/auth-storage";

function isTokenValid(token: string) {
    try {
        const decoded = jwtDecode<{ exp?: number }>(token);
        return !decoded.exp || decoded.exp > Date.now() / 1000;
    } catch {
        return false;
    }
}

export function AuthInitializer() {
    const setToken = useUserData((state) => state.setToken);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
        const tokenFromUrl = new URLSearchParams(window.location.search).get("token");

        if (tokenFromUrl && isTokenValid(tokenFromUrl)) {
            setToken(tokenFromUrl);
            localStorage.setItem(AUTH_TOKEN_KEY, tokenFromUrl);
            localStorage.setItem(LEGACY_TOKEN_KEY, tokenFromUrl);
            router.replace(pathname === "/" ? "/dashboard" : pathname || "/dashboard");
            return;
        }

        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY) ?? localStorage.getItem(LEGACY_TOKEN_KEY);

        if (storedToken && isTokenValid(storedToken)) {
            setToken(storedToken);
            localStorage.setItem(AUTH_TOKEN_KEY, storedToken);
            return;
        }

        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(LEGACY_TOKEN_KEY);
        if (isDashboardRoute) {
            router.replace("/");
        }
    }, [pathname, router, setToken]);

    return null;
}
