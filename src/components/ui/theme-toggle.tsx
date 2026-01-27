"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-9 h-9" /> // Placeholder to prevent layout shift
    }

    return (
        <button
            onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            title="Toggle Theme"
        >
            {resolvedTheme === 'dark' ? (
                <Moon className="h-5 w-5 text-blue-500 transition-all" />
            ) : (
                <Sun className="h-5 w-5 text-orange-500 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
