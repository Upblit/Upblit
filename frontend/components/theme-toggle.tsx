"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Laptop } from "lucide-react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        queueMicrotask(() => setMounted(true));
    }, []);
    if (!mounted) return null;

    return (
        <>
            <DropdownMenuLabel>Theme</DropdownMenuLabel>

            <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="flex items-center justify-between"
            >
                <span className="flex items-center gap-2">
                    <Sun className="size-4" />
                    Light
                </span>
                {theme === "light" && "✓"}
            </DropdownMenuItem>

            <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="flex items-center justify-between"
            >
                <span className="flex items-center gap-2">
                    <Moon className="size-4" />
                    Dark
                </span>
                {theme === "dark" && "✓"}
            </DropdownMenuItem>

            <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="flex items-center justify-between"
            >
                <span className="flex items-center gap-2">
                    <Laptop className="size-4" />
                    System
                </span>
                {theme === "system" && "✓"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />
        </>
    );
}
